import { toPhDateString } from '../utils/time.js';

/** add createdAtPH/updatedAtPH (PHT) to a single row */
export const addPhTimes = (row, fields = ['createdAt', 'updatedAt']) => {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  for (const f of fields) {
    if (row[f]) out[`${f}PH`] = toPhDateString(row[f]);
  }
  return out;
};

/** add createdAtPH/updatedAtPH (PHT) to each item sa array */
export const addPhTimesArray = (rows, fields = ['createdAt', 'updatedAt']) =>
  Array.isArray(rows) ? rows.map((r) => addPhTimes(r, fields)) : rows;

export default addPhTimes;
