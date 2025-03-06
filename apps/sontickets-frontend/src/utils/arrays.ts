export const dublicateItems = (arr: any[], numberOfRepetitions: number): string[] =>
  arr.flatMap((i) => Array.from<string>({ length: numberOfRepetitions }).fill(i));
