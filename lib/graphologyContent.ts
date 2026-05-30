// Per-section explainers shared between the reading screen and the Learn
// page. Each section in the streaming report gets a deeper "what does
// this measurement actually mean?" block that the user can expand inline.
// Keeping the strings in one file means the two surfaces never drift.

import type { SectionKey } from './graphologyAnalyzer'

export interface SectionExplainer {
  // The empirical thing being measured (what your eyes are reading).
  whatIsMeasured: string
  // What graphological tradition says the measurement reveals.
  whatItReveals: string
  // How a careful reader uses the result (caveats included).
  howToReadIt: string
}

export const SECTION_EXPLAIN: Record<SectionKey, SectionExplainer> = {
  baseline: {
    whatIsMeasured:
      'The imaginary horizontal line on which the writing rests — rising, falling, straight, or wavering as the eye follows it across a row.',
    whatItReveals:
      'Tradition reads the baseline as a real-time mood barometer. A rising line is associated with optimism, ambition, and energy; a falling line with fatigue, sadness, or discouragement; a steady line with self-control; a wandering line with emotional volatility.',
    howToReadIt:
      'Baseline reflects the moment more than the person — a tired writer at the end of a long day will sag where their morning would not. Always interpret with the date/context of the sample in mind.',
  },
  slant: {
    whatIsMeasured:
      'The angle the vertical strokes of letters make against the baseline — leaning right, leaning left, or standing upright.',
    whatItReveals:
      'Slant is the classical indicator of social orientation. Rightward slant is associated with extroversion, warmth, and emotional expressiveness; leftward slant with privacy, self-containment, and reserve; vertical strokes with logic, control, and independence.',
    howToReadIt:
      'Slant is heavily influenced by which hand writes (left-handers often write more vertical or leftward for purely mechanical reasons). Cross-check with other markers before reading personality into slant alone.',
  },
  letterSize: {
    whatIsMeasured:
      'The height and width of the middle-zone letters — the lowercase a, e, m, n, o, c, x. Measured against a baseline and the loops above/below.',
    whatItReveals:
      'Large middle-zone letters traditionally suggest a need for recognition, social confidence, and visibility. Small letters suggest concentration, modesty, scholarship, or detail-orientation. Wildly variable size suggests inconsistent self-image or strong emotion.',
    howToReadIt:
      'Size is calibrated to the page and pen size, not the absolute millimeter measurement. A small letter on a Post-it reads differently than the same height on legal paper.',
  },
  pressure: {
    whatIsMeasured:
      'How hard the writer pressed the pen into the paper — heavy enough to leave a tactile groove on the back of the page, or light enough to barely mark.',
    whatItReveals:
      'Pressure is read as a proxy for vital energy and emotional intensity. Heavy pressure is associated with vigor, determination, and strong feelings; light pressure with sensitivity, gentleness, and a more inward life; uneven pressure with emotional turbulence.',
    howToReadIt:
      'Pen type matters: a ballpoint records pressure faithfully; a gel pen or fountain pen smooths it out. The most diagnostic samples come from felt-tip or ballpoint on regular paper.',
  },
  spacing: {
    whatIsMeasured:
      'Three different spacings, each meaningful: between letters within a word, between words, and between lines down the page.',
    whatItReveals:
      'Wide word spacing reads as a need for distance and independence; narrow as a craving for closeness or social comfort. Wide line spacing suggests clear, organized thought; cramped lines suggest crowded thinking or poor judgment of social distance. Spacing between letters within a word tracks fluency.',
    howToReadIt:
      'Spacing reflects how the writer arranges the inner world spatially — proximity preferences, organizational style. Less mood-dependent than baseline or pressure; more trait-stable.',
  },
  specificLetters: {
    whatIsMeasured:
      'Individual letter forms with traditional diagnostic weight: the bar on a "t", the dot above an "i", the loops on "g/y/j" descenders, the form of the personal pronoun "I".',
    whatItReveals:
      'These are the high-information letters in classical graphology. A high t-bar reads as ambition and idealism; a low one as caution or low confidence. A precisely-placed i-dot reads as detail-orientation; a flying one as imagination. Heavy g/y loops read as material focus or sexual energy; missing loops as detachment from those layers.',
    howToReadIt:
      'These are the most actionable markers in a quick read because they tend to be consistent across samples. Triangulate across several specific letters before drawing a conclusion.',
  },
  signature: {
    whatIsMeasured:
      'The gap (or absence of gap) between how the writer signs their name and how they write the body text just above the signature.',
    whatItReveals:
      'The signature is the public self; the body text is the private working self. A signature far larger, more flourished, or stylistically different from the body suggests a curated public persona. A signature that matches the body suggests congruence between inner and outer self.',
    howToReadIt:
      'This is one of the most psychologically dense observations in graphology. It is also the most useful in forensic work — a signature that abruptly stops matching a person\'s body text over time can flag stress, intoxication, or impersonation.',
  },
  overallProfile: {
    whatIsMeasured:
      'A synthesis: not a single measurement but the integrated reading of all the prior observations into a coherent psychological picture.',
    whatItReveals:
      'The whole report is the answer. Graphology is supposed to converge — multiple independent indicators all pointing the same way is stronger evidence than any single dramatic feature. The Overall Profile is where the convergence is written down.',
    howToReadIt:
      'Read this as a hypothesis to test against your own knowledge of the writer, not as a verdict. The strength of the reading is in the patterns it points out, not in its certainty.',
  },
  topTraits: {
    whatIsMeasured:
      'The five most observable characteristics — the markers strong enough that another careful reader would also notice them.',
    whatItReveals:
      'A distilled trait list lets you fact-check the report. If the top five sound like the writer, the synthesis above is probably tracking; if they sound off, the synthesis is suspect too.',
    howToReadIt:
      'Use these as the headline. If you want one sentence to remember from the analysis, it lives here.',
  },
  forensicNote: {
    whatIsMeasured:
      'A short caveat about scope and confidence — what the analysis can and cannot claim, and the conditions of the sample that limit the reading.',
    whatItReveals:
      'Good graphological practice — like good clinical practice — includes the limits of what was measured. A note about sample size, paper, pen, possible duress.',
    howToReadIt:
      'Read this last but take it seriously. The forensic note is where the analysis tells you which parts to trust and which to weight lightly.',
  },
}

// ─── For the Learn page: deeper WHY-IT-WORKS content ────────────────────

export interface PrincipleEntry {
  title: string
  body: string
}

export const PRINCIPLES: PrincipleEntry[] = [
  {
    title: 'Handwriting is brain-writing',
    body:
      'Klages\' original insight was that writing is a whole-organism expressive movement — the hand is just the visible end of a chain that runs through the nervous system, the brain, and the personality. Movement disorders (Parkinson\'s, essential tremor) visibly distort handwriting; mood disorders correlate with measurable changes (depression flattens the baseline, mania expands letter size). The brain-writing premise is empirically defensible at the gross-motor and affective levels even when subtler personality claims are contested.',
  },
  {
    title: 'The principle of redundancy',
    body:
      'A serious graphological reading does not rely on a single feature. Tradition asks the analyst to find at least three independent indicators pointing the same direction before reading a trait as real. The eight dimensions Aleph extracts (baseline, slant, size, pressure, spacing, specific letters, signature-vs-body, zonal distribution) are deliberately overlapping — they create the redundancy a single dramatic feature lacks.',
  },
  {
    title: 'Trait vs state',
    body:
      'Some features are mood-sensitive (baseline drops when you\'re tired, pressure spikes when you\'re angry); others are stable across decades (the form of your "t", the connection style between letters, the slant family). Good practice distinguishes the two: the state features tell you about today, the trait features tell you about the writer.',
  },
  {
    title: 'Forensic vs psychological',
    body:
      'Two different disciplines share the name. Forensic graphology (court use, FBI, Scotland Yard, INTERPOL) is concerned with identity and authenticity — did the same hand write these two documents, is this signature forged. Personality graphology infers psychological traits. The first has strong empirical grounding; the second is more interpretive and best treated as a projective technique, not a clinical assessment.',
  },
  {
    title: 'What graphology can and cannot claim',
    body:
      'It cannot reliably claim IQ, mental illness diagnosis, or predicted behavior. It can claim — with care — observable temperamental tendencies, energy level, social orientation, and the gap between public and private self. The reading is a hypothesis worth testing against what you know about the writer, not a verdict to be acted on alone.',
  },
]

export const VALIDITY_NOTE = {
  title: 'On scientific validity',
  body:
    'Personality graphology has a mixed empirical record. Meta-analyses (especially the 1980s–90s American meta-studies) generally fail to find strong support for fine-grained trait claims when graphologists are tested blind. European studies (particularly French and German) are more favorable, partly because the European tradition is more rigorous about training and more conservative about what it claims. Forensic graphology — the question of whether two documents share a hand — is much better supported empirically. The honest position: graphology is useful as a structured way of looking at a sample, suggestive at the trait level, robust at the identity level. Read your report with that calibration.',
}
