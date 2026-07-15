export const defaultBirthdayName = "병준";

function hasBatchim(name: string) {
  const lastCharacter = name.at(-1);

  if (!lastCharacter) return false;

  const codePoint = lastCharacter.charCodeAt(0);
  const hangulStart = 0xac00;
  const hangulEnd = 0xd7a3;

  return codePoint >= hangulStart && codePoint <= hangulEnd
    ? (codePoint - hangulStart) % 28 !== 0
    : false;
}

export function getBirthdayNameForms(name: string) {
  const nameHasBatchim = hasBatchim(name);

  return {
    plain: name,
    friendly: nameHasBatchim ? `${name}이` : name,
    subject: nameHasBatchim ? `${name}이` : `${name}가`,
    vocative: `${name}${nameHasBatchim ? "아" : "야"}`,
  } as const;
}
