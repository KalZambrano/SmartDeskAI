const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%*-_+=';

/** Contraseña temporal de 20 caracteres con al menos una letra, un número y un símbolo. */
export function generateTemporaryPassword(): string {
  const all = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;
  const generated = [
    pick(UPPERCASE),
    pick(LOWERCASE),
    pick(DIGITS),
    pick(SYMBOLS),
    ...Array.from({ length: 16 }, () => pick(all)),
  ];
  for (let index = generated.length - 1; index > 0; index--) {
    const swapIndex = randomBelow(index + 1);
    [generated[index], generated[swapIndex]] = [generated[swapIndex]!, generated[index]!];
  }
  return generated.join('');
}

function pick(characters: string): string {
  return characters[randomBelow(characters.length)]!;
}

function randomBelow(maxExclusive: number): number {
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / maxExclusive) * maxExclusive;
  const sample = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(sample);
  } while (sample[0]! >= limit);
  return sample[0]! % maxExclusive;
}
