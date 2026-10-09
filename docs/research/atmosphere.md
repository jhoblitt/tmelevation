# Atmosphere model for the elevation app

Research deliverable (read-only research; no product code). Started 2026-10-08.
Verified facts carry a primary-source citation; claims backed only by a
secondary source are marked "secondary", and unverified judgement is marked
as such.

## 1. Elevation <-> pressure (standard atmosphere)

### Source and status

Primary source, read directly: *U.S. Standard Atmosphere, 1976* (NOAA-S/T 76-1562,
NASA-TM-X-74335), NASA NTRS 19770009539. The scanned PDF has no usable text
layer, so every value below was read from rendered page images. Its foreword
(p. xiii) states that the 1962 and 1976 U.S. Standard Atmospheres are identical
to the ICAO Standard Atmosphere (Doc 7488, 1964 revision) up to 32 km, and that
the lowest 50 km were adopted as ISO 2533 (1973). One troposphere formula
therefore covers USSA 1976, ICAO ISA and ISO 2533 everywhere a golf course can
be. ICAO Doc 7488 itself is paywalled and was not read; its equivalence rests on
the USSA 1976 foreword.

### Constants (USSA 1976 Table 2 and the text on pp. 3-4)

| Symbol | Value | Where | Note |
|---|---|---|---|
| g0 | 9.80665 m/s^2 | Table 2B; p.3 | also g0' = 9.80665 m^2/(s^2 m'), which defines the geopotential metre |
| R* | 8314.32 J/(kmol K) | p.3 text | **Table 2A misprints this as 8.31432e-3.** The NTRS PDF's appended errata sheet says to use the p.3 value. P.3 calls it "the value used in the 1962 Standard", "not exactly consistent with the cited values of k and N_A"; it is not the CODATA value |
| M0 | 28.9644 kg/kmol | p.9, eq. (21) | mean molar mass of dry air, from Table 3 composition |
| P0 | 101325.0 Pa (1013.250 mb) | Table 2B; p.12 | equivalent to 760 mmHg at rho_Hg = 13595.1 kg/m^3, g = 9.80665 (p.4) |
| T0 | 288.15 K (15 C) | Table 2B; p.4 | |
| L0 (L_M,0) | -6.5 K/km' (geopotential) | Table 4 | layer 0 runs from H = 0 to 11 km' |
| r0 | 6356.766 km | p.4 | Table 2B misprints this as "6.356766 x 10^6 km" (errata: too large by 1000) |
| R = R*/M0 | 287.0531 J/(kg K) | derived | |
| exponent g0 M0/(R* abs(L0)) | 5.255876 | derived | |

### Equations (layer b = 0: 0 to 11 km', and valid down to -5 km')

- Geopotential from geometric height, eq. (18): `H = r0 Z / (r0 + Z)`.
  Inverse, eq. (19): `Z = r0 H / (r0 - H)`. Both use Gamma = g0/g0' = 1 m'/m.
- Temperature, eq. (23) for layer 0: `T = T0 + L0 H`. T equals T_M below 80 km
  because M = M0 there.
- Pressure, eq. (33a), doc p.12:
  `P = P0 * [T0 / (T0 + L0 H)]^(g0 M0 / (R* L0))`. Because L0 < 0 this is the
  familiar `P = P0 (1 - 2.25577e-5 H)^5.255876` with H in metres.
  The text says eq. (33a) also gives pressure "for H from 0 to -5 km'", which
  covers Death Valley.
- Inverse (pressure to elevation), by algebra on eq. (33a):
  `H = (T0 / L0) * [ (P/P0)^(-R* L0/(g0 M0)) - 1 ]` with exponent
  `-R* L0/(g0 M0) = 0.190263`, then `Z = r0 H/(r0 - H)`.
  Round trip (probe): 70121 Pa gives H = 2998.60 m' and Z = 3000.02 m.
- Density, eq. (42), doc p.15: `rho = P M0 / (R* T)`.

### Geopotential vs geometric altitude

Golf elevations are geometric heights above mean sea level. The two differ by
Z - H = Z^2/(r0 + Z): 0.16 m at 1 km, 1.42 m at 3 km, 3.18 m at 4.5 km and
3.93 m at 5 km. Feeding Z straight into eq. (33a) as though it were H
under-reads pressure by 0.002 % at 1 km, 0.042 % at 4.5 km and 0.053 % at 5 km
(0.28 hPa). The tables show the same thing: geometric Z = 4500 m gives
577.52 mb and geopotential H = 4500 m' gives 577.28 mb. The error is far below
anything that matters for ball flight. Still, the conversion costs one line, so
apply eq. (18) and match the tables exactly.

### Check values from the primary tables (geometric altitude)

Read from USSA 1976 Table I (metric, 50 m steps, pp. 53 and 55) and Table IV
(English, 100 ft steps, p. 121). A throwaway probe using the constants above
reproduces every entry.

| Geometric Z | Table T (K) | Table P (mb = hPa) | Table rho (kg/m^3) | Computed P (hPa) | Computed rho |
|---|---|---|---|---|---|
| 0 m | 288.150 | 1013.25 | 1.2250 | 1013.250 | 1.22500 |
| -500 m | 291.400 | 1074.7 | 1.2849 | 1074.780 | 1.28489 |
| 1000 m | 281.651 | 898.76 | 1.1117 | 898.763 | 1.11166 |
| 1600 m | 277.753 | 835.27 | 1.0476 | 835.277 | 1.04764 |
| 5200 ft (1584.96 m) | 277.850 | 836.82 | 1.0492 | 836.822 | 1.04920 |
| **5280 ft (1609.344 m)** | not tabulated | between 836.82 and 833.69 | | **834.318** | **1.04666** |
| 5300 ft (1615.44 m) | 277.652 | 833.69 | 1.0460 | 833.692 | 1.04603 |
| 2000 m | 275.154 | 795.01 | 1.0066 | 795.014 | 1.00655 |
| 3000 m | 268.659 | 701.21 | 0.90925 | 701.212 | 0.90925 |
| 4500 m | 258.921 | 577.52 | 0.77704 | 577.526 | 0.77704 |
| 5000 m | 255.676 | 540.48 | 0.73643 | 540.483 | 0.73643 |

Geopotential-table entries (pp. 52 and 54), for an implementation that takes H
directly: H = 1000 m' gives 898.74 mb; 3000 m' gives 701.08 mb; 4500 m' gives
577.28 mb.

**Test-tolerance finding.** In every entry checked (11 altitudes from -1000 m
to 4500 m), computed minus table pressure falls in [0, 1) units of the fifth
significant figure. Examples: Z = 50 m computes to 1007.258 against a table
1007.2; Z = -500 m computes to 1074.780 against 1074.7. The printed P(mb)
column is therefore **truncated** to 5 significant figures, not rounded. The
density column agrees with rounding. Unit tests should assert
`table <= computed < table + 1 unit of the last printed digit` for pressure, or
use a relative tolerance of 1e-4.

## 2. Air density, humidity, viscosity

### Dry air (ideal gas)

USSA 1976 eq. (42), doc p.15: `rho = P M0 / (R* T)`, with M0 = 28.9644 kg/kmol
and R* = 8314.32 J/(kmol K), which gives R = 287.0531 J/(kg K). At P0 and T0 this
yields 1.2250 kg/m^3, which is Table I's sea-level density.

### Humid air: CIPM-2007 (primary source read)

Picard, Davis, Glaser and Fujii, "Revised formula for the density of moist air
(CIPM-2007)", *Metrologia* 45 (2008) 149-155 (NIST-hosted copy, read in full).

- Eq. (1): `rho = (p Ma / (Z R T)) * [1 - x_v (1 - Mv/Ma)]`, with
  R = 8.314472 J/(mol K), Ma = 28.96546e-3 kg/mol (at x_CO2 = 400 umol/mol),
  Mv = 18.01528e-3 kg/mol, and 1 - Mv/Ma = 0.3780.
  Eq. (5b) is the same thing with the constants folded in:
  `rho/(g m^-3) = 3.483740 * p/(Z T) * (1 - 0.3780 x_v)` (p in Pa, T in K).
- Water-vapour mole fraction (App. A.1):
  `x_v = h * f(p,t) * p_sv(t) / p`, where h is the relative humidity in [0, 1].
  - `p_sv = exp(A T^2 + B T + C + D/T)` Pa, with A = 1.2378847e-5 K^-2,
    B = -1.9121316e-2 K^-1, C = 33.93711047 and D = -6.3431645e3 K.
  - `f = 1.00062 + 3.14e-8 p + 5.6e-7 t^2`, with t in Celsius.
- Compressibility (App. A.2):
  `Z = 1 - (p/T)[a0 + a1 t + a2 t^2 + (b0 + b1 t) x_v + (c0 + c1 t) x_v^2] + (p/T)^2 (d + e x_v^2)`.
  The constants are a0 = 1.58123e-6, a1 = -2.9331e-8, a2 = 1.1043e-10,
  b0 = 5.707e-6, b1 = -2.051e-8, c0 = 1.9898e-4, c1 = -2.376e-6, d = 1.83e-11
  and e = -0.765e-8 (SI units as given in the paper). Z is about 0.9996 at sea
  level, so it moves density by 0.04 %.
- Stated validity (App. A.3) is 600-1100 hPa and 15-27 C. Golf goes outside that
  range at about 4,000 m and above, and in cold or very hot weather. Outside the
  range the interpolating formulas for p_sv and Z lose metrological accuracy,
  but Z itself moves density by only about 0.04 %, and p_sv matters only
  through the humidity term. Any extrapolation error is therefore small
  next to the ball-flight effects (judgement, not tested against reference
  data). For scale, the paper's Table 2 gives a combined relative standard
  uncertainty of 22e-6 inside the range.

**A simpler equivalent that is good enough.** Use partial pressures with Z = 1
and f = 1: `rho = (p - p_v)/(R_d T) + p_v/(R_v T)`, with `p_v = h * p_sv(T)`,
R_d = 287.05 and R_v = 461.5 J/(kg K). In the probe this lands within 0.06 % of
the full CIPM-2007 result at every condition tried (0-40 C, 50 % RH, sea
level). Almost all of the gap is the omitted Z. Any standard saturation
vapour-pressure fit can stand in for p_sv: the CIPM A-D formula above, or a
Magnus/Buck form.

### How much humidity matters

These are the probe's CIPM-2007 results: the density change from going dry to
humid at the same pressure and temperature.

| Conditions | 50 % RH | 100 % RH |
|---|---|---|
| sea level, 15 C | -0.32 % | -0.63 % |
| sea level, 25 C | -0.59 % | -1.18 % |
| sea level, 35 C | -1.05 % | -2.09 % |
| sea level, 40 C | -1.37 % | -2.74 % |
| 1609 m (834 hPa), 25 C | -0.72 % | -1.43 % |
| 1609 m (834 hPa), 35 C | -1.27 % | -2.54 % |
| 4000 m (617 hPa), 35 C | -1.72 % | -3.43 % |

For comparison, raising the temperature by 1 C at sea level lowers density by
0.35 %. Humid air is *less* dense than dry air, because water (18 g/mol) is
lighter than air (29 g/mol). Over realistic golf conditions (10-35 C, 20-90 %
RH) humidity is worth about 0.1-2 % of density. Going from sea level to 5,000 ft
is worth about 14-17 %. The decision rests on that ratio: holding humidity fixed
loses a second-order effect. If the app exposes temperature, a humidity input
is cheap to add with the formulas above. If it does not, fix humidity at the
reference value (see Recommendation).

### Dynamic viscosity (Sutherland's law, USSA 1976)

USSA 1976 eq. (51), doc p.19: `mu = beta T^(3/2) / (T + S)`, with
beta = 1.458e-6 kg/(s m K^1/2) and S = 110.4 K. **Use 110.4 K.** Table 2B and
the p.4 text both print "110 K", and p.4 prints beta as "1.458 x 10^6" (a sign
typo). The eq. (51) text gives 110.4 K and 1.458e-6, and so does the errata
sheet appended to the NTRS PDF. Table III (doc p.101) confirms it with
mu(0 m) = 1.7894e-5 N s/m^2 and kinematic viscosity 1.4607e-5 m^2/s; the probe
computes mu(288.15 K) = 1.78938e-5. Further probe values:
mu(273.15 K) = 1.71608e-5 and mu(303.15 K) = 1.86087e-5. The USSA text warns
that the law fails at very high and very low temperatures, but neither
condition arises in golf. Water vapour is less viscous than air, so humid air
has a slightly lower mu. I did not quantify this from a primary source, but at
golf humidities it is expected to be sub-percent (unverified estimate). The
Reynolds number is `Re = rho V D / mu`.

## 3. Pressure units

### Conversion factors to pascals

| Unit | Pa per unit | Exact? | Source |
|---|---|---|---|
| kPa | 1000 | exact (SI prefix) | SI |
| hPa | 100 | exact (SI prefix) | SI; WMO-No. 8 ch.3 sec. 3.1.2 |
| millibar (mbar, mb) | 100 | exact (bold in NIST SP 811 B.8/B.9) | NIST SP 811 App. B.8; "1 hPa = 1 mb" (ASOS User's Guide fn. 4; WMO-No. 8 sec. 3.1.2) |
| bar | 100000 | exact | NIST SP 811 B.8 |
| standard atmosphere (atm) | 101325 | exact (bold) | NIST SP 811 B.8; USSA 1976 P0 |
| inch of mercury, conventional (inHg) | 3386.389 (NIST, 7 s.f.); derived exact value 3386.388640341 | conventional definition | NIST SP 811 B.8. Derived as 25.4 mm x 13595.1 kg/m^3 x 9.80665 m/s^2 (the conventional mercury density and g_n given in USSA 1976 p.4). WMO-No. 8 Annex 3.A gives 33.8639 hPa |
| inch of mercury (32 F) | 3386.38 | measured, not exact | NIST SP 811 B.8 (do not use; the weather unit is the conventional one) |
| millimetre of mercury, conventional (mmHg) | 133.3224 (NIST); derived exact value 133.322387415 | conventional definition | NIST SP 811 B.8; WMO-No. 8 Annex 3.A: 1 (mm Hg)n = 1.333224 hPa |
| torr | 101325/760 = 133.322368421 | exact by definition | NIST SP 811 B.8 lists 1.333224 E+02 |
| psi (lbf/in^2) | 6894.757 (NIST, not bold); derived exact value 6894.757293168 | exact given lb = 0.45359237 kg and g_n | NIST SP 811 B.8; lbf = 4.4482216152605 N exactly (SP 811 fn. 23) |

Notes:
- NIST SP 811 footnote 12 bases the conventional mercury units on ISO 80000
  (standard gravity and conventional mercury density). It warns that extra
  digits are not physically meaningful. The conventional mmHg and the torr
  differ by 1.4e-7 relative, so the app can treat them as one unit.
- **Do not copy the NWS El Paso conversion sheet** (weather.gov/media/epz/wxcalc/
  pressureConversion.pdf). Its inHg/mmHg/psi factors are fine, but it states
  "P_kPa = 10 x P_mb" and "P_mb = P_kPa/10", which are inverted. The correct
  relation is 1 kPa = 10 hPa.
- Recommended unit list for the pressure dropdown: **inHg** (US default), **hPa**,
  **mbar** (numerically identical to hPa; list both because users know both
  names), **kPa**, and optionally **mmHg** and **psi**. Leave out atm and bar,
  because a golf-relevant reading such as 0.82 atm is meaningless to most users.

### Which unit US weather services and consumers use

- **inHg.** The ASOS User's Guide (NOAA/DOD/FAA/USN, 1998, sec. 2.2) lists the
  pressure outputs as "Altimeter Setting in inches of mercury (Hg), and
  Sea-level Pressure (SLP) in Hectopascals (hPa) in Remarks". The NWS public
  current-conditions page shows inHg first: KBKF on 2026-10-08 read
  "Barometer 30.11 in (1013.1 mb)". US consumer weather apps and home
  barometers follow the same inHg convention. That last point is a general
  observation, not taken from a primary source.
- Outside the US, meteorological services report hPa. WMO-No. 8 sec. 3.1.2
  calls hPa "the preferred terminology" and says inHg, mmHg and mbar "may not
  be used for the international exchange of data". mbar remains common in
  everyday usage, and mmHg survives in Russia and some other countries
  (secondary, general knowledge).

## 4. Station pressure vs sea-level pressure vs altimeter setting

### Definitions (NWS glossary, forecast.weather.gov, read 2026-10-08)

- **Station pressure**: "The absolute air pressure at a given reporting
  station." Air density depends on this value, and this is the one the app's
  pressure box represents.
- **Sea level pressure (SLP)**: "a correction of the station pressure to sea
  level ... The temperature used in the sea level correction is a twelve hour
  mean". WMO-No. 8 sec. 3.7.2 gives the international reduction (eq. 3.1/3.2).
  It uses station temperature, an assumed 0.0065 K/m lapse and vapour pressure,
  and is called "feasible for stations below 750 m".
- **Altimeter setting**: "A correction of the station pressure to sea level used
  by aviation ... The temperatures used correspond to the standard atmosphere
  temperatures". In ICAO terms this is QNH; the station pressure itself
  corresponds to QFE (secondary: SKYbrary and code7700 citing ICAO Doc 8168).
- **Barometric pressure**: "The pressure of the atmosphere as indicated by a
  barometer". The glossary does not say which reduction is meant.

### What a weather report's "barometric pressure" actually is

**US:** both numbers are reduced to sea level, by two different methods. The
NWS current-conditions line for KBKF (Buckley SFB, elevation 5577 ft) read
"Barometer 30.11 in (1013.1 mb)" at the same minute as METAR
`KBKF 090058Z ... A3011 RMK AO2A SLP131`. The inHg figure is the METAR
**altimeter setting** (A3011). The mb figure is the METAR **sea-level pressure**
(SLP131 = 1013.1 hPa). They are *not* unit conversions of each other:
30.11 inHg is 1019.6 hPa. The actual station pressure was about 830.7 hPa
(24.53 inHg), computed below.

**Elsewhere:** national met services and weather apps show the mean-sea-level
pressure in hPa (WMO-No. 8 sec. 3.7.1: pressure "should be reduced to mean sea
level"). Aviation reports carry QNH.

**Why neither can be used directly.** Both are deliberately adjusted so that a
mountain station reads about 1013 hPa on a normal day. Typing "30.11 inHg"
into an absolute-pressure field at Denver would tell the model the ball is
flying at sea level, which overstates air density there by about 23 %
(1019.6/830.7). Weather-report figures are only usable after converting back
to station pressure with the station's elevation.

### Converting altimeter setting to station pressure (NWS)

1. NWS El Paso wxcalc, `altimeterSetting.pdf` (station to altimeter, P in hPa,
   h in m):
   `A = (P - 0.3) * [1 + (1013.25^0.190284 * 0.0065/288) * h / (P - 0.3)^0.190284]^(1/0.190284)`.
   This formula inverts exactly. With n = 0.190284 and
   k = 1013.25^n * 0.0065/288 = 8.42288e-5:
   **`P_station = (A^n - k h)^(1/n) + 0.3`** (hPa, h in metres).
2. NWS El Paso wxcalc, `stationPressure.pdf` (an approximation that drops the
   0.3 hPa offset):
   `P_stn = A * ((288 - 0.0065 h)/288)^5.2561`. A can be in any unit; h is in
   metres.
3. ASOS algorithm, as given in the NWS Training Center "ASOS Algorithm Tutorial
   -- Pressure" (read from a third-party archived copy). This form is used when
   the temperature is missing: `P_S = [AS^0.1903 - 1.313e-5 * H_ft]^5.255`,
   with pressures in inHg and H in feet. The forward form is
   `AS = [P^0.1903 + 1.313e-5 H]^5.255`.

Worked results (probe):

| Input | Exact inverse (1) | EPZ approx (2) | ASOS (3) | USSA 1976 at that elevation |
|---|---|---|---|---|
| A = 30.11 inHg at 5577 ft (KBKF) | 830.67 hPa | 830.13 | 830.51 | 825.07 |
| A = 30.13 inHg at 5431 ft (KDEN example in ASOS User's Guide) | 835.81 hPa | 835.25 | 835.65 | 829.61 |
| A = 1013.25 hPa at 5280 ft | 834.51 hPa | 834.18 | 834.35 | 834.32 |

The three NWS forms agree to within 0.6 hPa, about 0.07 %, which is far
below anything that affects ball flight. With A = 1013.25 hPa the altimeter
formula returns the USSA 1976 pressure to within 0.3 hPa (the 0.3 hPa offset
term), because the altimeter setting *is* defined through the standard
atmosphere. Converting SLP back to station pressure has no clean inverse,
because it needs the 12-hour mean temperature the station used. That is a
reason to prefer the altimeter setting as the conversion input.

### Implications for the app's pressure field

- With linked elevation and pressure inputs, the pressure box is the **station
  (absolute) pressure that the standard atmosphere gives at that elevation**.
  Typing a pressure is therefore setting a *pressure altitude*. Label it
  "Air pressure (absolute, at the course)" or "Station pressure", not
  "Barometric pressure". Add helper text along the lines of: "Not the
  barometer reading in a weather report; those are corrected to sea level.
  At 5,000 ft the absolute pressure is about 843 hPa / 24.9 inHg."
- Optional extra: a "from weather report" helper that takes the altimeter
  setting (inHg or hPa) plus the course elevation and fills the pressure box
  using formula (1). That lets a user model a high- or low-pressure day.

## 5. Reference conditions (launch-monitor normalization)

### TrackMan (verified on TrackMan's own pages)

- **Normalize defaults: 77 F (25 C) and sea level.** From the TrackMan blog post
  "Understanding Trackman's Golf Normalization Feature" (Trackman Editorial
  Team, 2014-07-09): "Normalization will always calculate the ball flight based
  on the launch data, initial trajectory, calm conditions, and the altitude
  and temperature listed in TPS. Default values are 77°F and sea level (0 feet
  altitude)."
- **Ball:** "Normalization assumes the golfer is using a “premium” golf ball. If
  “non-premium” golf balls are used, Trackman’s Ball Conversion feature will
  convert the launch data to a premium ball before applying Normalization."
- **Inputs:** altitude and temperature only, with wind removed ("calm
  conditions"). The TPS support article (updated 2026-07-08) says the feature
  counteracts "wind, altitude and temperature" and that "You can edit and change
  the altitude and temperature numbers". **Neither page mentions humidity or
  pressure.** Altitude, not pressure, is the input, and temperature is set
  independently of altitude: TPS keeps 77 F at any altitude unless the user
  changes it. That last point is an inference from the documented inputs;
  no page states it outright.
- **Player Portal** (support article, 2026-08-06): "all dynamic reports have
  all the distances normalized to 25°C, and sea-level altitude." That is the
  same reference expressed in Celsius.
- **Tour averages are not stated to be normalized.** The "Introducing updated
  tour averages" article contains no mention of normalization, altitude,
  temperature or sea level (checked by keyword search of the page HTML). Its
  methodology bullets say: men's data comes from "40+ different events and 200+
  different players ... PGA TOUR and DP World Tour events"; women's data from
  "30+ different events ... LPGA and LET events"; "Averages are based on data
  from competition as well as on the range"; and "Official stat holes are picked
  going in opposite directions to reduce any effects from wind." The
  wind-cancellation step implies the figures are **measured (actual) flight**
  averaged across venues, not normalized output. Some of those venues are at
  elevation (see section 6). The project's "sea-level flight" premise is
  therefore an assumption the app should state, not something TrackMan
  documents. Treating the tables as TrackMan-normalized (25 C, sea level, calm)
  is the most defensible reading.

### Other launch monitors (manufacturer pages read; numeric defaults mostly undocumented)

| Device | What the maker documents | Numeric reference |
|---|---|---|
| Foresight GCQuad / FSX | Carry adjusted "based on Barometric Pressure, Temperature, and Estimated Altitude measured directly through the GCQ" (onboard barometer). Real-time weather or manual conditions are alternatives. | none published; humidity not mentioned |
| FlightScope (Mevo+ Pro, X3), Environmental Optimizer | Inputs: "air temperature, altitude (actual and density), humidity, wind speed, wind direction, and relative landing height". Custom mode can "base calculations on altitude or air pressure". "FS Normalized" "uses FlightScope standard sea level conditions". | sea level; temperature and humidity values not published |
| Garmin Approach R10 (and R50) | Owner's manual "Setting the Weather Conditions": "It is important to set weather conditions that match where you typically play". Options are Course Location, Your Location and Custom. | none published (secondary: forum users say the app fills temperature and altitude from the phone's location) |
| Rapsodo MLM | "The MLM1 normalizes data. This means the MLM does not take wind, weather, slope or elevation into consideration." "the MLM1 assumes you are at sea level" | sea level; no temperature stated |
| Full Swing KIT | Normalized option lets users choose the elevation, "whether sea level or a custom elevation", with no wind (2022-12-01 blog). | sea level or custom; temperature not stated |

The common denominator is sea level, calm air and a premium ball. TrackMan is
the only maker found that publishes a reference temperature (25 C / 77 F). No
maker found publishes a reference humidity. Secondary only, from a search
snippet that was not verified: the USGA/R&A distance-test protocol conditions
its balls at 75 +/- 1 F and runs its Indoor Test Range at 75 +/- 3 F.

### Recommended sea-level baseline for the app

- **Pressure: 101325 Pa** (sea level in USSA 1976 / ISA).
- **Temperature: 25 C (77 F)**, to match TrackMan's Normalize and Portal
  reference. ISA's 15 C would not match TrackMan's documented reference.
- **Relative humidity: 50 %, held fixed.** It is a neutral mid value, and
  neither TrackMan nor ISA specifies one. ISA is dry. The choice barely matters,
  because with temperature and RH equal at both ends the density *ratio* at
  5,000 ft is 0.8320 (0 % RH), 0.8310 (50 %) and 0.8300 (100 %) at 25 C. For
  15/25/35 C at 50 % RH it is 0.8315/0.8310/0.8303. Absolute baseline densities:
  1.1773 kg/m^3 (CIPM-2007, 25 C, 50 % RH), 1.1843 (CIPM, dry) and 1.1839 (ideal
  gas with USSA constants, dry). If simplicity wins, dry air at 25 C
  (1.1839 kg/m^3) is equally defensible and costs 0.1 % in the ratio.
- **Viscosity at the baseline:** mu(25 C) = 1.8372e-5 Pa s (Sutherland,
  USSA 1976 constants).

### Holding temperature constant vs following the ISA lapse rate

At elevation the app must decide which temperature to use. Probe results,
geometric altitude, pressure from USSA 1976, density relative to the sea-level
baseline at the same humidity:

| Elevation | Pressure | (a) T held at baseline | (b1) ISA lapse from 15 C | (b2) 6.5 K/km lapse from 25 C | (b) vs (a) |
|---|---|---|---|---|---|
| 1,000 ft (305 m) | 977.17 hPa / 28.86 inHg | 0.964 | 0.971 | 0.971 | +0.7 % |
| 5,000 ft (1524 m) | 843.11 hPa / 24.90 inHg | **0.832** (dry, any T) | **0.862** (T = 5.1 C) | 0.863 (T = 15.1 C) | **+3.6 % (b1), +3.8 % (b2)** |
| 5,280 ft (1609 m) | 834.32 hPa / 24.64 inHg | 0.823 | 0.854 | 0.855 | +3.8 % / +4.0 % |
| 8,000 ft (2438 m) | 752.71 hPa / 22.23 inHg | 0.743 (dry) / 0.741 (50 % RH) | 0.786 | 0.787 | +5.8 to 6.2 % |
| 10,000 ft (3048 m) | 696.95 hPa / 20.58 inHg | 0.688 (dry) / 0.686 (50 % RH) | 0.739 | 0.739 | +7.4 to 7.8 % |
| 15,000 ft (4572 m) | 572.07 hPa / 16.89 inHg | 0.565 (dry) / 0.562 (50 % RH) | 0.630 | 0.630 | +11.5 to 12 % |

Holding temperature constant makes the density ratio equal to the pressure
ratio, which is the conventional "the air is thinner up there" effect. Letting
temperature fall with the lapse rate cools the air and gives back about
one-sixth of that thinning at 5,000 ft: the density loss shrinks from 16.8 %
to 13.8 %. At 15,000 ft the loss shrinks from 43.5 % to 37 %.

Recommendation: **hold temperature constant (25 C) by default**, for three
reasons. TrackMan's Normalize treats altitude and temperature as independent
inputs and keeps 77 F at any altitude. Golf at high-altitude venues is played
in warm weather, not at the ISA's 5 C at 5,000 ft: Denver's summer afternoons
run near 30 C (general knowledge, not looked up). And the constant-temperature
case isolates the elevation effect the app is about. If the app later adds a
temperature control, use the same CIPM/ideal-gas density with the
user-entered temperature at elevation.

## 6. Elevation range (lowest / highest courses, pro venues)

| Course | Elevation | Status of the figure |
|---|---|---|
| Furnace Creek GC, Death Valley, CA (lowest in the world) | **-214 ft (-65 m)** | Operator page (Oasis at Death Valley): "At 214 feet below sea level ... the world’s lowest-elevation golf course". No survey document found |
| PGA West, Greg Norman course, La Quinta, CA | -40 ft (-12 m) | secondary (Golf News Net) |
| Club de Golf Chapultepec, Mexico City (WGC-Mexico from 2017; its 2017-2020 run and later LIV events are general knowledge / secondary) | **7,603-7,835 ft (2,317-2,388 m)** | PGA TOUR article citing ShotLink, 2017-02-28 |
| Castle Pines GC, CO (The International; BMW Championship 2024) | **about 6,200 ft (1,890 m) average**; other outlets give 6,400 ft at the high point | secondary (The Fried Egg, 2024-08-21) |
| Old Greenwood (Tahoe Mountain Club), Truckee, CA (Barracuda Championship) | **"nearly 6,000 feet" (about 1,830 m)** | PGA TOUR release, 2023-02-13 |
| Montreux G&CC, Reno, NV (earlier Barracuda venue) | 5,476-5,952 ft (1,669-1,814 m) | PGA TOUR article, 2017 |
| Crans-sur-Sierre GC, Crans-Montana (Omega European Masters, DP World Tour) | **1,500 m (4,921 ft)** | DP World Tour article |
| La Paz GC, Mallasilla, Bolivia (often called the highest 18-hole course in play) | **about 3,250-3,320 m (10,650-10,900 ft)**; sources disagree | secondary only: Top 100 Golf Courses gives "10,650 feet highest point"; AFP/La Razon gives ~3,300 m |
| Yak GC, Kupup, East Sikkim, India (Guinness record holder) | **13,025 ft (3,970 m)** | Guinness World Records, record dated 2006-10-10 |
| Tuctu GC, Morococha, Peru (abandoned mid-1990s) | **14,335 ft (4,369 m)** at its lowest point | secondary only: Wikipedia, citing worldgolf.com (2003) |

Context for the data: the TrackMan tour-averages article (dated 2024-05-02,
tables labelled 2023) draws on 40+ men's events (PGA TOUR and DP World Tour)
and 30+ women's events. TrackMan does not state the collection window. Elevated
venues on those tours around then include Old Greenwood (about 1,830 m), the
Barracuda Championship venue per the PGA TOUR's February 2023 release, and
Crans-sur-Sierre (1,500 m). Crans has long hosted the European Masters;
that history is general knowledge, and the DP World Tour article confirms
only the current venue. Chapultepec (WGC-Mexico 2017-2020) and Castle Pines
(BMW Championship 2024) fall outside that window; both date ranges are
secondary. Some elevated-venue data is therefore plausibly in the
averages, but TrackMan does not say how much.

### Slider range

- The data supports **-100 m to 4,500 m (about -330 ft to 14,800 ft)**. That
  covers Furnace Creek (-65 m) through Tuctu (4,369 m), with Yak (3,970 m) and
  La Paz (about 3,300 m) inside. With ft selected, round it to
  **-300 ft to 15,000 ft**. The matching pressure-box bounds are
  1025.32 hPa / 30.28 inHg at -100 m and 577.53 hPa / 17.05 inHg at 4,500 m.
  Furnace Creek (-65.2 m) gives 1021.11 hPa and Tuctu (4,369 m) gives
  587.56 hPa.
- Formula validity is not the constraint. USSA 1976 eq. (33a) is valid from
  -5 km' to 11 km'. CIPM-2007's stated pressure floor of 600 hPa is reached at
  about 4,200 m; above that the formula still behaves, just outside its
  certified range.
- The text boxes can accept wider values than the slider, for example -500 m to
  6,000 m, without any formula change. Pressure boxes then span about 1,074 hPa
  (-500 m) to 472 hPa (6,000 m) (probe/USSA).

## Recommendation

1. **Elevation to pressure.** Use the USSA 1976 / ICAO ISA troposphere,
   eq. (33a), with g0 = 9.80665, R* = 8314.32 J/(kmol K) (not CODATA),
   M0 = 28.9644 kg/kmol, P0 = 101325 Pa, T0 = 288.15 K and L = -0.0065 K/m'.
   Convert geometric to geopotential height first with
   H = r0 Z/(r0 + Z), r0 = 6356766 m.
   - Forward: `P = 101325 * (288.15/(288.15 - 0.0065 H))^(-5.255876)`, which
     is the same as `101325 (1 - 2.25577e-5 H)^5.255876`.
   - Inverse: `H = (288.15/0.0065) * (1 - (P/101325)^0.190263)`, then
     `Z = r0 H/(r0 - H)`.
   - Unit-test against the section 1 table. The pressure column is truncated,
     so assert `table <= computed < table + 1 in the last digit`.
2. **Density.** Hold temperature and humidity at the reference values at every
   elevation, so that rho(z)/rho(0) is essentially P(z)/P0.
   - Compute absolute density with CIPM-2007, or with the partial-pressure
     simplification (within 0.06 %). Dry ideal gas, `rho = P*28.9644/(8314.32*T)`,
     is also acceptable: it changes the ratio by 0.1 %.
   - Viscosity: Sutherland with beta = 1.458e-6 and **S = 110.4 K** (not the
     misprinted 110 K).
3. **Reference conditions.** Sea level at 101325 Pa, **25 C / 77 F**
   (TrackMan Normalize and Portal default), RH 50 % held fixed, calm air,
   premium ball. The baseline density is 1.1773 kg/m^3 (CIPM-2007), or
   1.1839 kg/m^3 for dry ideal gas. Present the "TrackMan averages =
   sea-level, 25 C" mapping as the app's assumption. TrackMan does not state
   that its tour averages are normalized; its methodology suggests measured
   flight across 40+ events.
4. **Temperature at altitude.** Hold it constant by default. Following the ISA
   lapse instead would add 3.6-3.8 % to density at 5,000 ft and about 12 % at
   15,000 ft, understating the elevation effect for warm-season golf. If a
   temperature control is added later, make it independent of elevation, as
   TrackMan does.
5. **Units.**
   - Elevation: ft and m (1 ft = 0.3048 m exactly).
   - Pressure: **inHg (US default)**, **hPa**, **mbar**, **kPa**, plus
     optionally mmHg and psi. Factors in Pa: inHg 3386.389 (conventional);
     hPa = mbar 100; kPa 1000; mmHg 133.3224; psi 6894.757.
   - Suggested display precision (design suggestion): inHg to 0.01, hPa/mbar to
     0.1, kPa to 0.01, mmHg to 0.1, psi to 0.01.
6. **Labelling.** Call the pressure field "Air pressure at the course
   (absolute / station pressure)". Include a note that weather-report
   "barometer" values are reduced to sea level and cannot be entered directly.
   NWS shows the altimeter setting in inHg next to the SLP in mb, and the two
   differ. Optionally add a helper that converts an altimeter setting plus the
   course elevation into station pressure:
   `P_stn = (A^0.190284 - 8.42288e-5 * h_m)^(1/0.190284) + 0.3` (hPa).
7. **Slider.** -100 m to 4,500 m (-300 ft to 15,000 ft). The boxes can accept
   -500 m to 6,000 m.

## Sources

Primary sources were read directly; "secondary" marks claims resting on a
third-party page. Access date for all: 2026-10-08.

Primary:

- U.S. Standard Atmosphere, 1976 (NOAA-S/T 76-1562 / NASA-TM-X-74335). NASA NTRS
  19770009539, https://ntrs.nasa.gov/api/citations/19770009539/downloads/19770009539.pdf.
  Read: foreword p. xiii; Tables 2-4 (pp. 2-3); text pp. 3-4, 9, 10, 12, 15, 19;
  Table I pp. 51-55; Table III p. 101; Table IV p. 121; appended errata sheet.
- Picard, Davis, Glaser and Fujii, "Revised formula for the density of moist air
  (CIPM-2007)", *Metrologia* 45 (2008) 149-155, doi:10.1088/0026-1394/45/2/004.
  NIST copy: https://www.nist.gov/sites/default/files/documents/calibrations/CIPM-2007.pdf
- NIST SP 811 (2008), App. B.8/B.9 and footnotes:
  https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8,
  .../nist-guide-si-appendix-b9 and https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes
- WMO-No. 8, Vol. I, Ch. 3 "Measurement of atmospheric pressure" (2018 prelim. ed.):
  https://old.wmo.int/extranet/pages/prog/www/IMOP/publications/CIMO-Guide/Prelim_2018_ed/8_I_3_en_MR_clean.pdf
- ASOS User's Guide (NOAA/DOD/FAA/USN, March 1998): https://www.weather.gov/media/asos/aum-toc.pdf
- NWS El Paso wxcalc formulas:
  https://www.weather.gov/media/epz/wxcalc/stationPressure.pdf, altimeterSetting.pdf,
  pressureAltitude.pdf and pressureConversion.pdf (the last contains an inverted kPa/mb
  formula).
- NWS glossary: https://forecast.weather.gov/glossary.php (letters a, b, s).
- NWS current conditions, KBKF: https://forecast.weather.gov/MapClick.php?lat=39.7392&lon=-104.9903;
  METAR via https://aviationweather.gov/api/data/metar?ids=KBKF,KDEN&format=raw&hours=2
- TrackMan, "Understanding Trackman's Golf Normalization Feature" (2014-07-09):
  https://www.trackman.com/blog/golf/normalization-feature-explained
- TrackMan support, "Normalization & Optimizer Feature in TPS":
  https://support.trackmangolf.com/hc/en-us/articles/6976656064283
- TrackMan support, "Portal (Player) | How to De-Normalise Dynamic Reports":
  https://support.trackmangolf.com/hc/en-us/articles/29414570963868
- TrackMan, "Introducing updated tour averages": https://www.trackman.com/blog/introducing-updated-tour-averages
- Foresight, "GCQuad Barometer Settings":
  https://help.foresightsports.com/hc/en-us/articles/4402110253331-GCQuad-Barometer-Settings
- FlightScope, "Understanding FlightScope's Environmental Optimizer" (2024-06-21):
  https://flightscope.com/blogs/blogs/understanding-flightscopes-environmental-optimizer
- Garmin Approach R10 Owner's Manual, "Setting the Weather Conditions":
  https://www8.garmin.com/manuals/webhelp/GUID-E2BBF6BE-4276-436F-B697-59ABEFD61933/EN-GB/GUID-736C9132-11E5-4B2A-9EDA-0F6105456006.html
- Rapsodo MLM FAQ: https://rapsodo.com/products/mobile-launch-monitor
- Full Swing, "Full Swing KIT Now Includes Normalized Data" (2022-12-01):
  https://www.fullswinggolf.com/blog/full-swing-kit-now-includes-normalized-data
- Oasis at Death Valley, Furnace Creek GC: https://oasisatdeathvalley.com/furnace-creek-golf-course
- Guinness World Records, "Highest golf course": https://www.guinnessworldrecords.com/world-records/highest-golf-course
- PGA TOUR, "Elevated expectations" (2017-02-28):
  https://www.pgatour.com/article/news/long-form/2017/02/28/elevated-expectations-wgc-mexico-championship-altitude
- PGA TOUR, Barracuda sponsorship release (2023-02-13):
  https://www.pgatour.com/article/news/company/2023/02/13/barracuda-networks-extends-barracuda-championship-sponsorship-through-2025
- DP World Tour, "A numbers game: players tackle altitude at Omega European Masters":
  https://legacy.europeantour.com/dpworld-tour/news/articles/detail/a-numbers-game-players-tackle-altitude-at-omega-european-masters/

Secondary only:

- ASOS Algorithm Tutorial, "Pressure" (NWS Training Center; third-party archive):
  https://wahiduddin.net/calc/refs/ASOS_Pressure.pdf
- QNH/QFE definitions (ICAO Doc 8168 as quoted by SKYbrary and code7700.com):
  https://skybrary.aero/articles/altimeter-pressure-settings
- Tuctu GC: https://en.wikipedia.org/wiki/Tuctu_Golf_Club
- La Paz GC: https://www.top100golfcourses.com/golf-course/la-paz
- Castle Pines: https://www.thefriedegg.com/articles/bmw-championship-preview
- Lowest courses list: https://thegolfnewsnet.com/ryan_ballengee/2018/12/28/what-are-the-lowest-elevation-golf-courses-in-the-world-111854/
- USGA ITR test temperature 75 +/- 3 F (search snippet of USGA TPX3006; the PDF could not be retrieved).

Not read (paywalled or unreachable): ICAO Doc 7488/3; ISO 2533; ISO 80000-4;
USGA TPX3006 / ITR documents.

Throwaway probes (not in the project): /tmp/claude-1000/atmos-probe/q1, q2 and q4
(Go, standard library only).
