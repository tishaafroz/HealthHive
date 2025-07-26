export function cmToFeetInches(cm) {
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainderInches = Math.round(inches % 12);
  return `${feet}ft ${remainderInches}in`;
}

export function kgToLbs(kg) {
  return (kg * 2.20462).toFixed(1);
} 