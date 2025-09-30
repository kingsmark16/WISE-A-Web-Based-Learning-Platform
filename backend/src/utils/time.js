export function toPhDateString(input) {
  // Accept Date, ISO string, number; return null if invalid
  const d = input instanceof Date ? input : (input != null ? new Date(input) : new Date());
  if (Number.isNaN(d.getTime())) return null; // <-- guard

  const parts = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
  .formatToParts(d)
  .reduce((acc, p) => (acc[p.type] = p.value, acc), {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} PHT`;
}
export default toPhDateString;
