/**
 * Calculates academic year based on student batch (e.g. 2023-2027) and the current date.
 * Assumes the new academic year starts in June (month index 5, 0-indexed).
 * 
 * @param {string} batch - The batch string, e.g. "2023-2027"
 * @returns {string} - The calculated academic year, e.g. "1st Year", "4th Year"
 */
export const calculateAcademicYear = (batch) => {
  if (!batch) return '1st Year';
  const cleanBatch = batch.replace(/\s+/g, '');
  const parts = cleanBatch.split('-');
  if (parts.length !== 2) return '1st Year';
  
  const startYear = parseInt(parts[0], 10);
  const endYear = parseInt(parts[1], 10);
  
  if (isNaN(startYear) || isNaN(endYear)) return '1st Year';
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  // Assume academic year starts in June (month index 5, 0-indexed)
  const currentAcademicYear = currentDate.getMonth() >= 5 ? currentYear : currentYear - 1;
  
  const yearDiff = currentAcademicYear - startYear + 1;
  const courseDuration = endYear - startYear;
  
  if (yearDiff <= 1) {
    return '1st Year';
  } else if (yearDiff >= courseDuration) {
    const finalYear = courseDuration;
    if (finalYear <= 1) return '1st Year';
    if (finalYear === 2) return '2nd Year';
    if (finalYear === 3) return '3rd Year';
    return `${finalYear}th Year`;
  } else {
    if (yearDiff === 2) return '2nd Year';
    if (yearDiff === 3) return '3rd Year';
    return `${yearDiff}th Year`;
  }
};
