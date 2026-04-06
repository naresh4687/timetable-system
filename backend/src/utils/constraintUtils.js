/**
 * Utility function to check if assigning a staff to a particular day and period
 * violates their defined constraints.
 * 
 * @param {Object} staff - Staff object (must include .hours to track assigned hours)
 * @param {String} day - Day of the week (e.g., 'Monday')
 * @param {Number} period - Period number (e.g., 1, 2)
 * @param {Object} constraints - Staff's constraint object
 * @returns {Boolean} true if constraint is satisfied, false if violated
 */
export function checkConstraints(staff, day, period, constraints) {
  if (!constraints) return true; // No constraints defined

  if (constraints.avoidDays?.includes(day)) return false;

  if (constraints.avoidPeriods?.includes(period)) return false;

  const blocked = constraints.avoidSlots?.some(
    s => s.day === day && s.period === period
  );

  if (blocked) return false;

  const maxH = constraints.maxHours || 17;
  if (staff.hours >= maxH) return false;

  return true;
}
