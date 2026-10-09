const G0 = 9.80665;
const MOLAR_MASS = 28.9644;
const GAS_CONSTANT = 8314.32;
const LAPSE_RATE = 0.0065;
const T0_ISA_K = 288.15;
const EARTH_RADIUS_M = 6356766;

export const P0_PA = 101325;
export const T_REF_K = 298.15;
export const MAX_ELEVATION_M = 4572;

// The exponent and lapse factor are derived once and used in both directions;
// the rounded figures printed in the spec would break the round trip.
const PRESSURE_EXPONENT = (G0 * MOLAR_MASS) / (GAS_CONSTANT * LAPSE_RATE);
const LAPSE_PER_T0 = LAPSE_RATE / T0_ISA_K;

// The reference temperature, not the ISA one: air is held at 25 degrees C at
// every elevation, so density tracks pressure alone.
export const RHO0 = (P0_PA * MOLAR_MASS) / (GAS_CONSTANT * T_REF_K);

export function pressureAtElevation(zMeters) {
  const h = (EARTH_RADIUS_M * zMeters) / (EARTH_RADIUS_M + zMeters);
  return P0_PA * (1 - LAPSE_PER_T0 * h) ** PRESSURE_EXPONENT;
}

export function elevationAtPressure(pa) {
  const h = (1 - (pa / P0_PA) ** (1 / PRESSURE_EXPONENT)) / LAPSE_PER_T0;
  return (EARTH_RADIUS_M * h) / (EARTH_RADIUS_M - h);
}

export const MIN_PRESSURE_PA = pressureAtElevation(MAX_ELEVATION_M);

export function densityRatio(pa) {
  return pa / P0_PA;
}
