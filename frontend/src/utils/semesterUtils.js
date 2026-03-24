/**
 * Converts a semester number to the academic year it belongs to.
 * 2 semesters per year: Sem 1-2 = Year 1, Sem 3-4 = Year 2, etc.
 *
 * @param {number} sem  Semester number (1–8)
 * @returns {number}    Year (1–4)
 */
export const semToYear = (sem) => Math.ceil(sem / 2);

/**
 * Returns a label like "Year 2 – Semester 3"
 */
export const semLabel = (sem) => `Year ${semToYear(sem)} – Semester ${sem}`;

/**
 * Short label like "Yr 2 Sem 3"
 */
export const semShortLabel = (sem) => `Yr ${semToYear(sem)} Sem ${sem}`;
