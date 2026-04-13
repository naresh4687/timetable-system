/**
 * Formats a 24-hour time string (HH:mm) into a 12-hour format (h:mm AM/PM).
 * @param {string} time24 - The 24-hour time string (e.g., "13:45").
 * @returns {string} The formatted 12-hour time string (e.g., "1:45 PM").
 */
export const formatTimeTo12H = (time24) => {
  if (!time24) return '';
  
  // Split the time into hours and minutes
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;

  if (isNaN(hours)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // if hours is 0, make it 12

  return `${hours}:${minutes} ${period}`;
};
