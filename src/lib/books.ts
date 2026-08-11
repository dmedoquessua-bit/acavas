export const BOOK_CATEGORIES = [
  "Romance",
  "Ficção Científica",
  "Terror/Horror",
  "Suspense e Mistério",
  "Aventura",
  "Fantasia",
  "Biografia e Autobiografia",
  "Autoajuda e Motivacional",
  "Didáticos e Técnicos",
  "Religiosos/Espiritual",
  "Poesia",
  "Narrativa",
  "Dramático",
];

/** Deterministic pick that rotates once per day. */
export const freeBookOfTheDay = <T,>(items: T[]): T | undefined => {
  if (items.length === 0) return undefined;
  const day = Math.floor(Date.now() / 86400000);
  return items[day % items.length];
};
