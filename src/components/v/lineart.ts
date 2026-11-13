// Line-art glyphs for Version 4. Each is SVG markup drawn in a 64×64 box, stroke only.
// Styled by the parent's CSS (stroke: currentColor; fill: none).
export const icon: Record<string, string> = {
  // eras
  steel: `<path d="M14 22 L32 12 L50 22 L32 32 Z"/><path d="M14 22 L14 26 L32 36 L50 26 L50 22"/><path d="M26 30 L26 44 M38 30 L38 44"/><path d="M14 42 L32 32 M32 52 L50 42"/><path d="M14 42 L32 52 L50 42 L50 46 L32 56 L14 46 Z"/>`,
  aluminum: `<path d="M12 30 L32 20 L52 30 L32 40 Z"/><path d="M12 30 L16 44 L32 52 L48 44 L52 30"/><path d="M32 40 L32 52"/><path d="M20 26 L40 36 M24 24 L44 34"/>`,
  nylon: `<ellipse cx="32" cy="16" rx="14" ry="5"/><path d="M18 16 L18 48 M46 16 L46 48"/><ellipse cx="32" cy="48" rx="14" ry="5"/><path d="M22 22 Q32 26 42 22 M22 28 Q32 32 42 28 M22 34 Q32 38 42 34 M22 40 Q32 44 42 40"/><path d="M46 30 C54 32 56 40 60 44"/>`,
  fiberglass: `<path d="M10 30 L32 18 L54 30 L32 42 Z"/><path d="M16 27 L38 39 M22 24 L44 36 M28 21 L50 33 M16 33 L38 21 M22 36 L44 24 M28 39 L50 27"/><path d="M10 30 L10 34 L32 46 L54 34 L54 30"/>`,
  transistor: `<path d="M22 14 L42 14 L42 34 Q42 40 32 40 Q22 40 22 34 Z"/><path d="M22 20 L42 20"/><path d="M26 40 L26 56 M32 40 L32 56 M38 40 L38 56"/>`,
  fiber: `<path d="M32 32 m-4 0 a4 4 0 1 0 8 0 a8 8 0 1 0 -16 0 a12 12 0 1 0 24 0 a16 16 0 1 0 -32 0 a20 20 0 1 0 40 0"/><path d="M52 32 L60 32"/><circle cx="61" cy="32" r="1.6" class="fill"/>`,
  // deep history
  bronze: `<path d="M20 14 L44 14 L48 22 Q50 34 40 44 L36 54 L28 54 L24 44 Q14 34 16 22 Z"/><path d="M26 54 L26 60 L38 60 L38 54"/><path d="M22 22 L42 22"/><path d="M24 30 Q32 34 40 30"/>`,
  iron: `<path d="M10 22 L50 22 Q58 22 58 28 L44 30 L40 38 L46 46 L18 46 L24 38 L20 30 L10 30 Z"/><path d="M14 54 L50 54 L46 46 M18 46 L14 54"/>`,
  porcelain: `<path d="M26 8 L38 8 L36 14 Q46 18 46 30 Q46 46 38 52 L40 56 L24 56 L26 52 Q18 46 18 30 Q18 18 28 14 Z"/><path d="M22 26 Q32 30 42 26 M20 36 Q32 40 44 36"/><path d="M28 31 Q30 28 32 31 Q34 34 36 31"/>`,
  cokeiron: `<path d="M22 56 L18 24 L26 10 L38 10 L46 24 L42 56 Z"/><path d="M20 34 L44 34 M19 44 L45 44"/><path d="M28 10 Q26 4 30 2 M36 10 Q38 5 34 2"/><path d="M42 50 L54 50 L56 56"/><path d="M8 56 L58 56"/>`,
  cement: `<path d="M14 18 L32 10 L50 18 L32 26 Z"/><path d="M14 18 L14 46 L32 54 L50 46 L50 18"/><path d="M32 26 L32 54"/><path d="M14 32 L32 40 L50 32"/>`,
  // story
  flask: `<path d="M26 10 L38 10 M28 10 L28 26 L16 50 Q14 54 18 54 L46 54 Q50 54 48 50 L36 26 L36 10"/><path d="M20 42 L44 42"/><circle cx="28" cy="47" r="1.6"/><circle cx="36" cy="48" r="1.2"/>`,
  factory: `<path d="M8 54 L8 30 L20 22 L20 30 L32 22 L32 30 L44 22 L44 54 Z"/><path d="M44 54 L56 54 L56 12 L50 12 L50 54"/><path d="M14 40 L20 40 M26 40 L32 40 M14 46 L20 46 M26 46 L32 46 M36 40 L40 40"/><path d="M8 54 L58 54"/>`,
  ship: `<path d="M6 40 L58 40 L52 52 L12 52 Z"/><path d="M14 40 L14 30 L26 30 L26 40 M26 34 L38 34 L38 40 M38 28 L48 28 L48 40"/><path d="M42 28 L42 20 L46 20 L46 28"/><path d="M4 58 Q12 54 20 58 Q28 62 36 58 Q44 54 52 58 Q58 61 62 58"/>`,
  shelf: `<path d="M6 54 L58 54 M6 34 L58 34 M8 54 L8 14 M56 54 L56 14"/><rect x="12" y="22" width="10" height="12"/><rect x="24" y="26" width="9" height="8"/><rect x="36" y="20" width="12" height="14"/><rect x="12" y="44" width="14" height="10"/><rect x="30" y="42" width="8" height="12"/><rect x="42" y="46" width="10" height="8"/>`,
  // process
  kiln: `<path d="M12 56 L12 26 Q12 12 32 12 Q52 12 52 26 L52 56 Z"/><path d="M20 56 L20 34 Q20 26 32 26 Q44 26 44 34 L44 56"/><path d="M26 56 Q24 50 28 46 Q30 50 30 44 Q34 48 34 52 Q36 48 38 50 Q40 54 38 56" class="flame"/><path d="M6 56 L58 56"/><path d="M28 8 L28 12 M36 8 L36 12"/>`,
  chamber: `<rect x="10" y="18" width="44" height="36" rx="2"/><path d="M10 26 L54 26"/><path d="M16 34 L32 34 L32 46 L16 46 Z M36 34 L48 34 L48 46 L36 46 Z"/><circle cx="48" cy="22" r="1.6"/><path d="M14 22 L24 22"/><path d="M6 54 L58 54"/>`,
  powder: `<path d="M10 50 Q32 20 54 50 Z"/><circle cx="20" cy="40" r="0.9" class="fill"/><circle cx="26" cy="34" r="0.9" class="fill"/><circle cx="32" cy="30" r="0.9" class="fill"/><circle cx="38" cy="36" r="0.9" class="fill"/><circle cx="44" cy="42" r="0.9" class="fill"/><circle cx="30" cy="44" r="0.9" class="fill"/><circle cx="36" cy="46" r="0.9" class="fill"/><circle cx="24" cy="46" r="0.9" class="fill"/><circle cx="32" cy="18" r="0.9" class="fill"/><circle cx="30" cy="12" r="0.9" class="fill"/><circle cx="33" cy="7" r="0.9" class="fill"/>`,
  pellets: `<ellipse cx="22" cy="40" rx="6" ry="4"/><ellipse cx="36" cy="44" rx="6" ry="4"/><ellipse cx="44" cy="34" rx="6" ry="4"/><ellipse cx="28" cy="30" rx="6" ry="4"/><ellipse cx="36" cy="24" rx="6" ry="4"/>`,
  // parts
  panel: `<path d="M6 34 L36 18 L58 30 L28 46 Z"/><path d="M6 34 L6 38 L28 50 L58 34 L58 30"/><path d="M28 46 L28 50"/>`,
  bracket: `<path d="M14 24 L26 18 L26 40 L50 52 L38 58 L14 46 Z"/><path d="M26 18 L30 20 L30 40 M30 40 L54 50 L50 52"/><circle cx="20" cy="32" r="2"/><circle cx="36" cy="50" r="2"/>`,
  insulator: `<ellipse cx="32" cy="12" rx="6" ry="2.5"/><path d="M26 12 L26 52 M38 12 L38 52"/><ellipse cx="32" cy="22" rx="16" ry="5"/><ellipse cx="32" cy="32" rx="16" ry="5"/><ellipse cx="32" cy="42" rx="16" ry="5"/><ellipse cx="32" cy="52" rx="6" ry="2.5"/>`,
  machined: `<path d="M8 32 L34 18 L56 30 L30 44 Z"/><path d="M8 32 L8 40 L30 52 L56 38 L56 30"/><path d="M30 44 L30 52"/><ellipse cx="26" cy="30" rx="5" ry="2.5"/><ellipse cx="38" cy="32" rx="5" ry="2.5"/><path d="M16 34 L28 40 L44 32"/>`,
  // markets
  energy: `<path d="M10 54 L10 22 L24 14 L24 46 Z M24 14 L54 30 L54 62"/><path d="M10 22 L40 38 L54 30 M10 30 L24 38 M10 38 L24 46 M40 38 L40 62"/><path d="M33 34 L28 44 L34 44 L30 52" class="accent"/>`,
  defense: `<path d="M4 44 L60 44 L54 54 L14 54 Z"/><path d="M16 44 L18 34 L30 34 L32 28 L40 28 L42 34 L48 34 L50 44"/><path d="M36 28 L36 16 M30 20 L42 20"/><path d="M2 58 Q10 55 18 58 Q26 61 34 58 Q42 55 50 58 Q56 60 62 58"/>`,
  aero: `<path d="M32 4 Q42 14 42 30 L42 48 L22 48 L22 30 Q22 14 32 4 Z"/><path d="M22 36 L14 50 L22 48 M42 36 L50 50 L42 48"/><circle cx="32" cy="24" r="4"/><path d="M26 48 L24 58 M32 48 L32 60 M38 48 L40 58"/>`,
  infra: `<path d="M8 32 L32 14 L56 32"/><path d="M14 28 L14 54 L50 54 L50 28"/><rect x="22" y="38" width="10" height="16"/><rect x="38" y="36" width="8" height="8"/><path d="M4 58 Q20 52 32 58 Q44 64 60 56"/>`,
};

export const glyph = (name: string, cls = "") =>
  `<svg viewBox="0 0 64 64" class="g ${cls}" aria-hidden="true">${icon[name]}</svg>`;
