const LOW_PATTERN = /\b(reply|replies|respond|check|update|email|e-mail|send|schedule|book|confirm|follow[\s-]?up|slack|ping|review|approve|sign|file|rsvp|remind|notify|sync|log|post)\b/i;
const HIGH_PATTERN = /\b(write|design|refactor|plan|strategy|spec|prd|architect|analy[sz]e|analysis|research|draft|prototype|roadmap|brainstorm|decide|define|scope|prioriti[sz]e)\b/i;

/** Lightweight title → energy hint for admin vs deep-focus work. */
export function inferEnergyFromTitle(title) {
  const text = String(title || '').trim();
  if (!text) return null;
  if (HIGH_PATTERN.test(text)) return 'high';
  if (LOW_PATTERN.test(text)) return 'low';
  return null;
}

export function resolveEnergyLevel({ title, explicit, filterDefault = 'medium' }) {
  if (explicit) return explicit;
  const inferred = inferEnergyFromTitle(title);
  if (inferred) return inferred;
  return filterDefault;
}
