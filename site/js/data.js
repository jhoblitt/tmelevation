// The figures below are TrackMan's 2023 Tour Averages, reproduced with
// attribution from https://www.trackman.com/blog/introducing-updated-tour-averages
// They are not covered by this repository's Apache-2.0 licence.
//
// Both units are stored as published and never derived from each other:
// TrackMan rounded each from unrounded values (PGA 4 Iron carries 209 yd / 192 m).

export const SOURCE_URL = 'https://www.trackman.com/blog/introducing-updated-tour-averages';

export const TOURS = [
  {
    id: 'pga',
    label: 'PGA TOUR',
    title: 'PGA TOUR AVERAGES',
    year: 2023,
    rows: [
      { club: 'Driver', clubSpeed: 115, attack: -0.9, ballSpeed: 171, smash: 1.49, launch: 10.4, spin: 2545, maxHeight: { yd: 35, m: 32 }, land: 39, carry: { yd: 282, m: 258 } },
      { club: '3-wood', clubSpeed: 110, attack: -2.3, ballSpeed: 162, smash: 1.47, launch: 9.3, spin: 3663, maxHeight: { yd: 32, m: 29 }, land: 44, carry: { yd: 249, m: 228 } },
      { club: '5-wood', clubSpeed: 106, attack: -2.5, ballSpeed: 156, smash: 1.47, launch: 9.7, spin: 4322, maxHeight: { yd: 33, m: 30 }, land: 48, carry: { yd: 236, m: 216 } },
      { club: 'Hybrid', clubSpeed: 102, attack: -2.4, ballSpeed: 149, smash: 1.47, launch: 10.2, spin: 4587, maxHeight: { yd: 31, m: 28 }, land: 49, carry: { yd: 231, m: 211 } },
      { club: '3 Iron', clubSpeed: 100, attack: -2.5, ballSpeed: 145, smash: 1.46, launch: 10.3, spin: 4404, maxHeight: { yd: 30, m: 27 }, land: 48, carry: { yd: 218, m: 199 } },
      { club: '4 Iron', clubSpeed: 98, attack: -2.9, ballSpeed: 140, smash: 1.44, launch: 10.8, spin: 4782, maxHeight: { yd: 31, m: 28 }, land: 49, carry: { yd: 209, m: 192 } },
      { club: '5 Iron', clubSpeed: 96, attack: -3.4, ballSpeed: 135, smash: 1.41, launch: 11.9, spin: 5280, maxHeight: { yd: 33, m: 30 }, land: 50, carry: { yd: 199, m: 182 } },
      { club: '6 Iron', clubSpeed: 94, attack: -3.7, ballSpeed: 130, smash: 1.39, launch: 14.0, spin: 6204, maxHeight: { yd: 32, m: 29 }, land: 50, carry: { yd: 188, m: 172 } },
      { club: '7 Iron', clubSpeed: 92, attack: -3.9, ballSpeed: 123, smash: 1.34, launch: 16.1, spin: 7124, maxHeight: { yd: 34, m: 31 }, land: 51, carry: { yd: 176, m: 161 } },
      { club: '8 Iron', clubSpeed: 89, attack: -4.2, ballSpeed: 118, smash: 1.33, launch: 17.8, spin: 8078, maxHeight: { yd: 33, m: 30 }, land: 51, carry: { yd: 164, m: 150 } },
      { club: '9 Iron', clubSpeed: 87, attack: -4.3, ballSpeed: 112, smash: 1.29, launch: 20.0, spin: 8793, maxHeight: { yd: 32, m: 29 }, land: 52, carry: { yd: 152, m: 139 } },
      { club: 'PW', clubSpeed: 84, attack: -4.7, ballSpeed: 104, smash: 1.24, launch: 23.7, spin: 9316, maxHeight: { yd: 32, m: 29 }, land: 52, carry: { yd: 142, m: 130 } },
    ],
  },
  {
    id: 'lpga',
    label: 'LPGA TOUR',
    title: 'LPGA TOUR AVERAGES',
    year: 2023,
    rows: [
      { club: 'Driver', clubSpeed: 96, attack: 2.8, ballSpeed: 143, smash: 1.49, launch: 12.6, spin: 2506, maxHeight: { yd: 26, m: 24 }, land: 36, carry: { yd: 223, m: 204 } },
      { club: '3-wood', clubSpeed: 92, attack: -0.8, ballSpeed: 135, smash: 1.47, launch: 11.6, spin: 2595, maxHeight: { yd: 25, m: 23 }, land: 38, carry: { yd: 200, m: 183 } },
      { club: '5-wood', clubSpeed: 90, attack: -1.6, ballSpeed: 130, smash: 1.46, launch: 12.3, spin: 4320, maxHeight: { yd: 25, m: 23 }, land: 43, carry: { yd: 189, m: 173 } },
      { club: 'Hybrid', clubSpeed: 87, attack: -1.9, ballSpeed: 125, smash: 1.44, launch: 13.9, spin: 4504, maxHeight: { yd: 25, m: 23 }, land: 45, carry: { yd: 178, m: 163 } },
      { club: '4 Iron', clubSpeed: 82, attack: -1.7, ballSpeed: 118, smash: 1.43, launch: 13.9, spin: 4608, maxHeight: { yd: 25, m: 23 }, land: 43, carry: { yd: 175, m: 160 } },
      { club: '5 Iron', clubSpeed: 81, attack: -2.0, ballSpeed: 114, smash: 1.42, launch: 14.6, spin: 4966, maxHeight: { yd: 25, m: 23 }, land: 45, carry: { yd: 166, m: 152 } },
      { club: '6 Iron', clubSpeed: 80, attack: -2.3, ballSpeed: 111, smash: 1.41, launch: 16.7, spin: 5904, maxHeight: { yd: 25, m: 23 }, land: 46, carry: { yd: 155, m: 142 } },
      { club: '7 Iron', clubSpeed: 78, attack: -2.5, ballSpeed: 106, smash: 1.38, launch: 18.5, spin: 6630, maxHeight: { yd: 26, m: 24 }, land: 47, carry: { yd: 143, m: 131 } },
      { club: '8 Iron', clubSpeed: 76, attack: -2.8, ballSpeed: 102, smash: 1.36, launch: 20.8, spin: 7413, maxHeight: { yd: 27, m: 25 }, land: 47, carry: { yd: 133, m: 122 } },
      { club: '9 Iron', clubSpeed: 74, attack: -3.2, ballSpeed: 95, smash: 1.30, launch: 23.5, spin: 7605, maxHeight: { yd: 27, m: 25 }, land: 48, carry: { yd: 123, m: 112 } },
      { club: 'PW', clubSpeed: 72, attack: -3.2, ballSpeed: 88, smash: 1.25, launch: 25.2, spin: 8465, maxHeight: { yd: 27, m: 25 }, land: 48, carry: { yd: 111, m: 101 } },
    ],
  },
];
