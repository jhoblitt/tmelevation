export const M_PER_FT = 0.3048;
export const M_PER_YD = 0.9144;
export const MPS_PER_MPH = 0.44704;

export const PA_PER = { inHg: 3386.389, kPa: 1000, mbar: 100 };
export const M_PER = { ft: M_PER_FT, m: 1 };

export function rpmToRadPerS(rpm) {
  return (rpm * 2 * Math.PI) / 60;
}

export function degToRad(d) {
  return (d * Math.PI) / 180;
}

export function radToDeg(r) {
  return (r * 180) / Math.PI;
}
