import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const CLAUDE_MODEL = 'claude-opus-4-5'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `You are a certified graphologist trained in both European (Ludwig Klages school) and American forensic graphology traditions. You have 30 years of experience analyzing handwriting for psychological insights, forensic document examination, and career counseling.

Analyze the handwriting sample image and provide a detailed graphological report. Structure your response with EXACTLY these section headers, in this order:

## BASELINE ANALYSIS
Analyze the writing baseline direction (ascending/descending/straight/variable). Describe what you actually observe — the exact angle, consistency, variations. State what it reveals psychologically. Be specific to THIS sample.

## SLANT ANALYSIS
Measure the letter slant angle. Right, left, or vertical? Variable or consistent? Describe the degree. Include what emotional and social traits this indicates. Reference what you actually see.

## LETTER SIZE
Describe the actual size of the middle-zone letters. Large, small, medium, or variable? Describe proportions between zones. Connect to specific personality traits.

## PRESSURE
Assess pen pressure: heavy, light, medium, variable? Describe texture and depth of strokes as observable from the image. Connect to vitality, emotional intensity, or sensitivity.

## SPACING
Analyze letter spacing, word spacing, and line spacing. Are they cramped, generous, even, irregular? What does each pattern reveal about boundaries, social orientation, and clarity of thought?

## SPECIFIC LETTERS
Analyze at least 5-7 specific letter forms. Look for:
- l loops (idealism, physical goals)
- g and y lower loops (sexual/material drives, past ties)
- t-bar placement and pressure (ambition, self-confidence, will)
- i-dots (attention to detail, imagination, memory)
- Capital I (ego, self-image)
- Letter connections (garlands, arcades, angles, threads)

For each, note: what you see, then what it means.

## SIGNATURE VS BODY
If a signature is present, compare it to the body text. Note any differences in size, slant, pressure, legibility, or style. Explain what discrepancies reveal about the public persona vs private self. If no signature is visible, state that explicitly.

## OVERALL PERSONALITY PROFILE
Write 4-5 substantive paragraphs covering:
- Core personality and fundamental drives
- Professional strengths and working style
- Emotional life and relationship patterns
- Interpersonal style and social orientation
- Areas for personal growth

This is the synthesis. Be specific, not generic. Ground every claim in what you saw in the handwriting. Avoid cold-reading platitudes like "you are sometimes shy but can be outgoing."

## NOTABLE TRAITS
List exactly 5 bullet points, each a specific, observable personality trait derived from this analysis:
- [Trait 1]
- [Trait 2]
- [Trait 3]
- [Trait 4]
- [Trait 5]

## FORENSIC NOTE
This analysis is based on graphological traditions used by forensic document examiners in Europe and employed by the FBI in document examination. Personality graphology is recognized as a projective technique akin to Rorschach or TAT — it reveals patterns worth reflecting upon. For entertainment and self-reflection purposes. Not a clinical diagnosis.

CRITICAL REQUIREMENTS:
- Be specific about what you ACTUALLY SEE in this sample — not generic descriptions
- Reference actual observed features (e.g., "the t-bars are placed in the upper third of the stem" not "t-bars reveal ambition")
- If the image quality is poor, note what you can and cannot determine
- Every interpretive claim must be grounded in a specific visible feature
- Avoid generic personality descriptions that could apply to anyone`

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Validate base64 is plausible (not obviously wrong)
    if (typeof imageBase64 !== 'string' || imageBase64.length < 1000) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 appears invalid — too short' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[graphology-oracle] Starting analysis, image size: ${imageBase64.length} chars`)

    // Call Claude Vision with streaming
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Please provide a comprehensive graphological analysis of this handwriting sample. Follow the exact structure specified in your instructions. Be specific about what you observe in THIS sample — ground every claim in actual visible features.',
              },
            ],
          },
        ],
      }),
    })

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text()
      console.error(`[graphology-oracle] Claude API error: ${claudeResponse.status} ${errText}`)
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeResponse.status}` }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Stream Claude's response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = claudeResponse.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            // Parse SSE lines from Claude's streaming response
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  // Extract text delta from Claude's streaming format
                  if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                    const text = parsed.delta.text
                    controller.enqueue(new TextEncoder().encode(text))
                  }
                } catch {
                  // Non-JSON SSE line (event: type, etc.) — skip
                }
              }
            }
          }
        } catch (streamErr) {
          console.error('[graphology-oracle] Stream error:', streamErr)
          controller.error(streamErr)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[graphology-oracle] Unexpected error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
