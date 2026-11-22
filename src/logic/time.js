// Conversion between "HH:MM" strings and integer minutes after midnight.
function pad2(n) {
  return String(n).padStart(2, "0");
}

export function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${pad2(h)}:${pad2(min)}`;
}

export function timeToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}
