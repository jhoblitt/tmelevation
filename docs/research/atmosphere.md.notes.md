# atmosphere.md — verified findings log

Each entry: claim | source (URL + page/table/eq) | accessed. Appended as verified.

## Q1 — USSA 1976 primary document

Source document: U.S. Standard Atmosphere, 1976 (NOAA-S/T 76-1562; NASA-TM-X-74335),
NASA NTRS 19770009539, https://ntrs.nasa.gov/api/citations/19770009539/downloads/19770009539.pdf
(243-page scanned PDF; text layer unusable, read from rendered page images). Doc page N = PDF page N+16.
Accessed 2026-10-08.

- Table 2 (doc p.2), Category II constants: g0 = 9.80665 m/s^2; g0' = 9.80665 m^2/(s^2 m');
  P0 = 1.013250e5 Pa; r0 printed "6.356766 x 10^6 km" [misprint, too large by 1000 per errata; p.4 text: 6356.766 km];
  T0 = 288.15 K; S printed 110 K; beta = 1.458e-6 kg/(s m K^1/2); gamma = 1.40.
  Category I: R* printed "8.31432 x 10^-3" in table 2 — misprint; see next line.
- Doc p.3 text: "The gas constant, R* = 8.31432 x 10^3 N.m/(kmol.K) ... value used in the 1962 Standard.
  This value is not exactly consistent with the cited values of k and N_A."  -> R* = 8314.32 J/(kmol K).
- Doc p.3 Table 4: layer 0, H_b = 0 km', L_M,b = -6.5 K/km'; layer 1 H_b = 11 km', L = 0.0. (Troposphere = 0-11 km').
- Doc p.3 Table 3: dry-air composition (N2 0.78084, O2 0.209476, Ar 0.00934, CO2 0.000314, ...).
- Doc p.4: P0 corresponds to 0.760 m Hg column, rho_Hg = 1.35951e4 kg/m^3, g = 9.80665 (CIPM 1948).
  r0 = 6356.766 km; T0 = 288.15 K (15 C, ICAN 1924); S "= 110 K" (Hilsenrath 1955); beta "= 1.458 x 10^6" [sign typo, eq 51 text gives 10^-6]; gamma = 1.400.
- Doc p.8 eq (18): H = (g0/g0') * r0 Z/(r0+Z) = Gamma * r0 Z/(r0+Z); eq (19): Z = r0 H/(Gamma r0 - H); Gamma = g0/g0' = 1 m'/m.
- Doc p.9 eq (21)/text: M0 = 28.9644 kg/kmol (from Table 3).
- Doc p.12 eq (33a): P = P_b [T_M,b/(T_M,b + L_M,b (H - H_b))]^(g0' M0/(R* L_M,b)); eq (33b) isothermal:
  P = P_b exp[-g0' M0 (H-H_b)/(R* T_M,b)]. P0 = 101325.0 N/m^2 (1013.250 mb).
  Text: "Pressures for H from 0 to -5 km' may also be computed from eq (33a) when subscript b is zero."
- Doc p.15 eq (42): rho = P M0/(R* T_M) = P M/(R* T).
- Doc p.19 eq (51): mu = beta T^(3/2)/(T+S); text: "beta is a constant equal to 1.458 x 10^-6 kg/(s m K^1/2) and S is Sutherland's constant, equal to 110.4 K, both defined in table 2B."
- Errata sheet appended to the NTRS PDF (Gursel to NASA STI, 2015-01-08): table 2 R* off by 1e6 (use p.3 value);
  r0 in table 2 off by 1000; S should be 110.4 K; sigma off by 1e9.

- USSA1976 Table I (metric; 50 m steps; alternating "Geometric Altitude" pages (Z first) and "Geopotential Altitude" pages (H first)),
  read from page images 2026-10-08:
  - doc p.53 geometric: Z=0: T=288.150 K, P=1.01325e3 mb, rho=1.2250. Z=1000 (H=1000): T=281.651, P=898.76 mb, rho=1.1117.
    Z=1500: P=845.59; Z=1600: T=277.753, P=835.27, rho=1.0476; Z=1650: P=830.15. Z=2000 (H=1999): P=795.01, rho=1.0066.
    Z=-500: P=1074.7 mb, rho=1.2849.
  - doc p.52 geopotential: H=1000 (Z=1000): T=281.650, P=898.74 mb, rho=1.1116. H=1600: P=835.23. H=2000 (Z=2001): P=794.95.
  - doc p.55 geometric: Z=3000 (H=2999): T=268.659 K, P=701.21 mb, rho=0.90925. Z=4500 (H=4497): T=258.921, P=577.52 mb, rho=0.77704.
    Z=5000 (H=4996): P=540.48 mb, rho=0.73643.
  - doc p.54 geopotential: H=3000 (Z=3001): T=268.650, P=701.08 mb, rho=0.90912. H=4500 (Z=4503): T=258.900, P=577.28, rho=0.77677.
- USSA1976 Table IV (English altitudes, 100 ft steps), doc p.121 geometric: Z=5000 ft: T=278.246, P=843.11 mb, rho=1.0556;
  Z=5200 ft (H=5199): T=277.850, P=836.82 mb, rho=1.0492; Z=5300 ft (H=5299): T=277.652, P=833.69 mb, rho=1.0460;
  Z=-200 ft: P=1020.5 mb; Z=6000 ft: P=812.04 mb.
  (5280 ft not tabulated; bracketed by 5200/5300.)

- Throwaway probe (/tmp/claude-1000/atmos-probe/q1/main.go) with g0=9.80665, R*=8314.32, M0=28.9644, P0=101325, T0=288.15,
  L=-0.0065 K/m', r0=6356766 m reproduces every Table I/IV value read above. Exponent g0 M0/(R* |L|) = 5.255876; R*/M0 = 287.0531 J/(kg K).
  Pressure column: computed - table is always in [0, 1 unit of 5th significant figure) (e.g. Z=50 m computed 1007.258, table 1.0072e3;
  Z=-500 m computed 1074.780, table 1.0747e3) => the printed P(mb) column is TRUNCATED, not rounded, to 5 sig figs. Density column agrees with rounding.
- Geometric vs geopotential (computed): Z-H = 0.16 m at 1 km, 1.42 m at 3 km, 3.18 m at 4.5 km, 3.93 m at 5 km; treating Z as H
  under-reads pressure by 0.017 hPa (0.002%) at 1 km, 0.243 hPa (0.042%) at 4.5 km, 0.284 hPa (0.053%) at 5 km. Confirmed by
  table: Z=4500 m 577.52 vs H=4500 m' 577.28 mb.
- Dynamic viscosity eq (51) with beta=1.458e-6, S=110.4: mu(288.15 K)=1.78938e-5 Pa s; mu(273.15)=1.71608e-5; mu(303.15)=1.86087e-5.
- Foreword (doc p.xiii, PDF p.14): "That portion of the 1962 and 1976 U.S. Standard Atmospheres up to 32 km is identical with the
  ICAO 'Manual of the ICAO Standard Atmosphere,' as revised in 1964". Lowest 50 km = ISO 2533 (1973).

- USSA1976 Table III, doc p.101 (geometric, metric): Z=0: sound speed 340.29 m/s, mu = 1.7894e-5 N s/m^2, eta = 1.4607e-5 m^2/s;
  Z=-1000: mu=1.8206e-5; Z=500: mu=1.7737e-5. Matches eq (51) with S=110.4 (computed 1.78938e-5).

## Q2 — CIPM-2007 moist-air density

Source: Picard, Davis, Glaser, Fujii, "Revised formula for the density of moist air (CIPM-2007)", Metrologia 45 (2008) 149-155,
doi:10.1088/0026-1394/45/2/004; NIST-hosted copy https://www.nist.gov/sites/default/files/documents/calibrations/CIPM-2007.pdf
(6 pages, text layer good). Accessed 2026-10-08.
- Eq (1): rho_a = (p Ma/(Z R T)) [1 - x_v (1 - Mv/Ma)]; R = 8.314472 J/(mol K) (CODATA 2006), eq (4) area p.150.
- Ma = 28.96546e-3 kg/mol (x_CO2 = 0.0004); eq (4): Ma = [28.96546 + 12.011 (x_CO2 - 0.0004)]e-3. Mv = 18.01528e-3. 1 - Mv/Ma = 0.3780.
- Eq (5b): rho_a/(1e-3 kg m^-3) = [3.483740 + 1.4446 (x_CO2 - 0.0004)] (p/(Z T)) (1 - 0.3780 x_v), p in Pa.
- App. A.1 (p.153): p_sv = 1 Pa * exp(A T^2 + B T + C + D/T), A=1.2378847e-5 K^-2, B=-1.9121316e-2 K^-1, C=33.93711047, D=-6.3431645e3 K.
  Enhancement f = alpha + beta p + gamma t^2, alpha=1.00062, beta=3.14e-8 Pa^-1, gamma=5.6e-7 K^-2 (t in C).
  x_v = h f(p,t) p_sv(t)/p = f(p,td) p_sv(td)/p.
- App. A.2: Z = 1 - (p/T)[a0 + a1 t + a2 t^2 + (b0 + b1 t) x_v + (c0 + c1 t) x_v^2] + (p^2/T^2)(d + e x_v^2);
  a0=1.58123e-6 K/Pa, a1=-2.9331e-8 /Pa, a2=1.1043e-10 /(K Pa), b0=5.707e-6 K/Pa, b1=-2.051e-8 /Pa, c0=1.9898e-4 K/Pa,
  c1=-2.376e-6 /Pa, d=1.83e-11 K^2/Pa^2, e=-0.765e-8 K^2/Pa^2.
- App. A.3: recommended validity 600 hPa <= p <= 1100 hPa, 15 C <= t <= 27 C (unchanged from CIPM-81).

- Probe (/tmp/claude-1000/atmos-probe/q2/main.go), CIPM-2007 implemented from the paper: psv(20 C)=2339.16 Pa, psv(0 C)=611.21 Pa;
  Z(101325 Pa, 20 C, dry)=0.999643. Dry CIPM rho(101325, 15 C)=1.22552 vs USSA ideal 1.22500 (-0.043%).
  Humidity reduction of density vs dry at same p,T (sea level): 15 C: -0.32% (50% RH), -0.63% (100%); 25 C: -0.59%/-1.18%;
  35 C: -1.05%/-2.09%; 40 C: -1.37%/-2.74%. At 1609 m (834 hPa): 25 C -0.72%/-1.43%; 35 C -1.27%/-2.54%.
  At 4000 m (617 hPa) 35 C: -1.72%/-3.43%. Effect grows with altitude at fixed t because p_v/p rises.
- 5000 ft (843.11 hPa): (a) T held 15 C: rho=1.01930 (0.8321 of SL); (b) T=ISA 278.246 K (5.10 C): rho=1.05558 (0.8617 of SL);
  (b)/(a) = +3.56%. At 1609 m +3.77%, 2000 m +4.72%, 3000 m +7.25%, 4500 m +11.29%.
- Temperature sensitivity at SL, 15 C: -0.346% density per +1 C.

## Q3 — pressure units

- NIST SP 811 (2008 ed.) Appendix B.8 / B.9, https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
  and .../nist-guide-si-appendix-b9 (accessed 2026-10-08; via WebFetch summary, values quoted): "Factors in boldface are exact".
  atm -> Pa 1.013 25 E+05 (bold, exact); bar -> Pa 1.0 E+05 (bold); millibar -> Pa 1.0 E+02 (bold);
  inch of mercury, conventional (inHg) -> Pa 3.386 389 E+03 (not bold); inch of mercury (32 F) 3.386 38 E+03; (60 F) 3.376 85 E+03;
  millimeter of mercury, conventional (mmHg) -> Pa 1.333 224 E+02; torr -> Pa 1.333 224 E+02; psi -> Pa 6.894 757 E+03 (not bold).
- NIST SP 811 footnote 12 (https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes, raw HTML read):
  "Conversion factors for mercury manometer pressure units are calculated using the standard value for the acceleration of
  gravity and the density of mercury at the stated temperature. Additional digits are not justified ... Conversion factors for
  conventional mercury and water manometer pressure units are based on Ref. [4: ISO 80000-3]." [sic]
- NIST SP 811 footnote 23 (WebFetch): with g_n = 9.806 65 m/s^2, exact factor 4.448 221 615 260 5 E+00 (lbf -> N).
- USSA1976 doc p.4: P0 corresponds to 0.760 m Hg column at rho_Hg = 1.35951e4 kg/m^3 and g = 9.80665 m/s^2.
  => conventional mmHg = 13595.1 * 9.80665 * 0.001 = 133.322387415 Pa (derived). torr = 101325/760 = 133.322368421 Pa (atm/760).

## Q3/Q4 — NWS

- NWS current conditions, https://forecast.weather.gov/MapClick.php?lat=39.7392&lon=-104.9903 (accessed 2026-10-08, WebFetch):
  station Buckley Space Force Base (KBKF), "Elev: 5577ft.", "Barometer 30.11 in (1013.1 mb)". -> NWS consumer display is inHg first
  (mb in parentheses), and the value is a sea-level-reduced figure (~1013 hPa) at a station whose actual pressure is ~830 hPa.
- NWS El Paso (EPZ) wxcalc PDFs, https://www.weather.gov/media/epz/wxcalc/{stationPressure,altimeterSetting,pressureAltitude,pressureConversion}.pdf
  (downloaded 2026-10-08, pdftotext):
  - stationPressure.pdf: "From the user, a station elevation (h) and an altimeter setting (P a) are given." h_m = 0.3048 h_ft;
    P_stn = P_a * ((288 - 0.0065 h_m)/288)^5.2561 (altimeter setting in inHg; result same units).
  - altimeterSetting.pdf: Alt = (P_mb - 0.3) * (1 + ((1013.25^0.190284 * 0.0065/288) * (h_m/(P_mb - 0.3)^0.190284)))^(1/0.190284); station pressure in mb, h in m.
  - pressureAltitude.pdf: h_alt[ft] = (1 - (P_sta/1013.25)^0.190284) * 145366.45.
  - pressureConversion.pdf: P_mb = 33.8639 P_inHg; P_inHg = 0.0295300 P_mb; P_mb = 1.333224 P_mmHg; P_psi = 0.0145038 P_mb;
    P_mb = 68.9476 P_psi; P_mmHg = 25.4 P_inHg; P_inHg = 29.9213 P_atm; P_mb = 1013.250 P_atm.
    ERROR in that PDF: it gives "P_mb = P_kPa/10" and "P_kPa = 10 x P_mb" (both inverted; correct is P_kPa = P_mb/10). Do not copy.
  - Derived (algebra): altimeter formula inverts exactly: P_stn = (Alt^n - k h)^(1/n) + 0.3 hPa, n = 0.190284, k = 1013.25^n * 0.0065/288.

- ASOS User's Guide (NOAA/DOD/FAA/USN, March 1998), https://www.weather.gov/media/asos/aum-toc.pdf (downloaded 2026-10-08):
  sec 2.2 outputs: "Pressure: Altimeter Setting in inches of mercury (Hg), and Sea-level Pressure (SLP) in Hectopascals (hPa) in Remarks";
  footnote 4: "A Hectopascal (hPa) value is equivalent to a millibar (mb), i.e., 1012 hPa = 1012 mb."
  Example METAR (sec 2.5): "KDEN 281950Z AUTO 11006KT 6SM HZ SCT080 15/12 A3013 RMK AO2 SLP123" (Denver: altimeter 30.13 inHg, SLP 1012.3 hPa).
- NWS Training Center "ASOS Algorithm Tutorial — Pressure Algorithms" (archived copy of meted.ucar.edu/export/asos/Pressure.HTML at
  https://wahiduddin.net/calc/refs/ASOS_Pressure.pdf — third-party host of an NWS document):
  Station pressure fallback: PS = [AS^0.1903 - (1.313e-5) Hp]^5.255 (inHg, ft). Altimeter: AS = [Pa^0.1903 + (1.313e-5) Ha]^5.255.
  SLP: uses 12-hour average temperature and a pressure reduction ratio. Pressure altitude PA = 44331 [1 - (Pa/29.92)^0.1903] (sic, units in that doc).
  Altimeter setting defined: "the pressure value to which an aircraft altimeter scale is set, so it will indicate the altitude above
  mean sea level of the aircraft on the ground at the location for which the pressure value was determined."
  Consistency check (computed): 1.313e-5 inHg^n/ft * 33.8639^0.1903 / 0.3048 = 8.4207e-5 hPa^n/m vs EPZ form 1013.25^0.190284*0.0065/288 = 8.4226e-5 (0.02% apart).
- NWS glossary (forecast.weather.gov/glossary.php, accessed 2026-10-08, WebFetch):
  Altimeter Setting: "A correction of the station pressure to sea level used by aviation. This correction takes into account the standard
  variation of pressure with height and the influence of temperature variation with height on the pressure. The temperatures used
  correspond to the standard atmosphere temperatures between the surface and sea level."
  Station Pressure: "The absolute air pressure at a given reporting station. ..."
  Sea Level Pressure: "... When observed at a reporting station that is not at sea level (nearly all stations), it is a correction of the
  station pressure to sea level. ... The temperature used in the sea level correction is a twelve hour mean, eliminating diurnal effects."
  Barometric Pressure: "The pressure of the atmosphere as indicated by a barometer."

- WMO-No. 8 (CIMO Guide), Vol I ch.3 "Measurement of atmospheric pressure", 2018 prelim ed.,
  https://old.wmo.int/extranet/pages/prog/www/IMOP/publications/CIMO-Guide/Prelim_2018_ed/8_I_3_en_MR_clean.pdf (downloaded 2026-10-08):
  3.1.2: hPa preferred ("one hectopascal equals one millibar"); "mm Hg", "in Hg" or "mbar" "are not defined within SI and may not be used
  for the international exchange of data". 3.7.1: observed pressure "should be reduced to mean sea level ... for all stations where this
  can be done with reasonable accuracy". 3.7.2 eq (3.1)/(3.2): reduction uses station temperature T_s, lapse a = 0.0065 K/gpm, vapour
  pressure e_s, C_h = 0.12 K/hPa, R = 287.05 J/(kg K); "feasible for stations below 750 m".
  Annex 3.A: "760 (mm Hg)n exerts a pressure of 1 013.250 hPa"; 1 (mm Hg)n = 1.333 224 hPa; 1 (in Hg)n = 33.863 9 hPa (1 in = 25.4 mm);
  standard conditions 0 C and g = 9.806 65 m/s^2.

- aviationweather.gov METAR API (accessed 2026-10-08 ~01Z Oct 9): "METAR KBKF 090058Z 05003KT ... 22/M01 A3011 RMK AO2A SLP131 ...".
  Same-time NWS MapClick for KBKF ("Last update 8 Oct 6:58 pm MDT"): "Barometer 30.11 in (1013.1 mb)".
  => NWS "Barometer" line pairs the METAR ALTIMETER setting (A3011 -> 30.11 in) with the SEA-LEVEL PRESSURE (SLP131 -> 1013.1 mb):
  two different reductions, not a unit conversion (30.11 inHg = 1019.6 hPa). Neither is station pressure.
- Probe (/tmp/claude-1000/atmos-probe/q4/main.go): exact derived factors: conventional mmHg = 133.322387415 Pa; conventional inHg =
  3386.388640341 Pa; psi = 6894.757293168 Pa (0.45359237 kg * 9.80665 / 0.0254^2); torr = 133.322368421 Pa; 1 atm = 29.92126 inHg = 14.69595 psi.
  KBKF A3011 at 5577 ft -> station 830.67 hPa (24.53 inHg) via exact inverse of NWS altimeter formula; EPZ approx 830.13; ASOS approx 830.51.
  Altimeter 1013.25 hPa at 5280 ft -> 834.51 hPa; USSA at 5280 ft = 834.32 (diff 0.19 hPa; the 0.3 hPa offset in the NWS formula).
- Secondary only: QNH = altimeter sub-scale setting to obtain elevation when on the ground (ICAO Doc 8168 per code7700.com and SKYbrary);
  QFE = atmospheric pressure at aerodrome elevation (or runway threshold). Not read in ICAO primary.

## Q5 — reference conditions (TrackMan)

- TrackMan blog "Understanding Trackman's Golf Normalization Feature" / "The Normalization feature explained" (Trackman Editorial Team,
  July 9, 2014), https://www.trackman.com/blog/golf/normalization-feature-explained (raw HTML read 2026-10-08):
  "Normalization will always calculate the ball flight based on the launch data, initial trajectory, calm conditions, and the altitude
  and temperature listed in TPS. Default values are 77°F and sea level (0 feet altitude)."
  "Normalization assumes the golfer is using a “premium” golf ball. If “non-premium” golf balls are used, Trackman’s Ball Conversion
  feature will convert the launch data to a premium ball before applying Normalization."
  Humidity: not mentioned anywhere in the article (keyword grep).
- TrackMan support "General | Normalization & Optimizer Feature in TPS" (created 2022-06-30, updated 2026-07-08),
  https://support.trackmangolf.com/hc/en-us/articles/6976656064283 : "The normalization feature allows you to counteract the effects of
  wind, altitude and temperature and gives you "normalized" data. You can edit and change the altitude and temperature numbers to suit your environment."
- TrackMan support "Portal (Player) | How to De-Normalise Dynamic Reports" (created 2026-08-06),
  https://support.trackmangolf.com/hc/en-us/articles/29414570963868 : "In the Player portal, all dynamic reports have all the distances
  normalized to 25°C, and sea-level altitude." Report footer text: “All distances have been normalized to 25°C, and sea level altitude".
- TrackMan "Introducing updated tour averages" (raw HTML read 2026-10-08): no occurrence of normaliz/normalis/altitude/temperature/sea level/calm.
  Methodology bullets: "Male data is captured across 40+ different events and 200+ different players. Data is captured at both PGA TOUR and
  DP World Tour events with majority coming from PGA TOUR events." "Female data is captured across 30+ different events and 150+ different
  players ... LPGA and LET events" "Averages are based on data from competition as well as on the range." "Official stat holes are picked
  going in opposite directions to reduce any effects from wind."
  => TrackMan does NOT state the tour averages are normalized; the wind-cancellation note implies measured (actual) flight averaged over venues.

## Q5 — other launch monitors (accessed 2026-10-08 via WebFetch summaries unless noted)

- Foresight help "GCQuad Barometer Settings", https://help.foresightsports.com/hc/en-us/articles/4402110253331 : GCQuad "can make Carry
  Distance adjustments based on Barometric Pressure, Temperature, and Estimated Altitude measured directly through the GCQ"; can instead use
  REAL-TIME weather or manual conditions in FSX. No defaults, no humidity stated. (Forum claim that FSX ignores humidity: secondary, 2020.)
- FlightScope blog "Understanding FlightScope's Environmental Optimizer" (Cody Hansen, 2024-06-21),
  https://flightscope.com/blogs/blogs/understanding-flightscopes-environmental-optimizer : inputs "air temperature, altitude (actual and density),
  humidity, wind speed, wind direction, and relative landing height"; "FS Normalized" "uses FlightScope standard sea level conditions" — no numbers given;
  Custom mode can "base calculations on altitude or air pressure".
- Garmin Approach R10 Owner's Manual, "Setting the Weather Conditions",
  https://www8.garmin.com/manuals/webhelp/GUID-E2BBF6BE-4276-436F-B697-59ABEFD61933/EN-GB/GUID-736C9132-11E5-4B2A-9EDA-0F6105456006.html :
  "It is important to set weather conditions that match where you typically play." Options Course Location (Home Tee Hero only), Your Location, Custom.
  No condition list or defaults on that page. (Forum: app fills temp and altitude from phone location — secondary.)
- Rapsodo MLM product FAQ, https://rapsodo.com/products/mobile-launch-monitor : "The MLM1 normalizes data. This means the MLM does not take wind,
  weather, slope or elevation into consideration." "Since the MLM1 assumes you are at sea level, if you are located in an area with high
  altitude/elevation, you may see shorter distances appear on your MLM1." (MLM2PRO not documented in what I read.)
- Full Swing blog "Full Swing KIT Now Includes Normalized Data in Addition to Actual Measurements" (2022-12-01),
  https://www.fullswinggolf.com/blog/full-swing-kit-now-includes-normalized-data : normalized option lets users "customize what elevation, whether
  sea level or a custom elevation of a course they are headed to play and to see if there was no wind". Temperature/humidity defaults not stated.

- Probe (q2/extra_test.go): baseline SL 25 C: dry ideal (USSA consts) 1.18391; CIPM dry 1.18430; CIPM 50% RH 1.17732 kg/m^3.
  mu(25 C)=1.83723e-5, mu(15 C)=1.78938e-5 Pa s.
  Density ratio rho(z)/rho(SL) at 5000 ft with T,RH held equal at both: RH 0/50/100% @25 C = 0.83204/0.83104/0.83004;
  T 15/25/35 C @50% = 0.83149/0.83104/0.83027 -> baseline T/RH choice moves the ratio by <=0.2%.
  Lapse from 25 C baseline (T = 25 - 6.5 K/km * H): ratio 0.8625 at 5000 ft (+3.78% vs const-T), 0.7394 at 10000 ft (+7.80%), 0.6299 at 15000 ft (+12.10%).

## Q6 — course elevations (accessed 2026-10-08)

- Furnace Creek GC: course operator page https://oasisatdeathvalley.com/furnace-creek-golf-course : "At 214 feet below sea level, this 18-hole,
  par 70 course is also the world’s lowest-elevation golf course." (-214 ft = -65.2 m). [operator claim; no survey]
  Golf News Net lowest-courses list: next lowest named = PGA West Norman course "40 feet below sea level" [secondary]; "Devil's Golf Course"
  (-282 ft) is a salt pan, not a golf course.
- Guinness World Records "Highest golf course", https://www.guinnessworldrecords.com/world-records/highest-golf-course :
  "Yak GC", "Kupup, East Sikkim, India", "13,025 feet (3,970m)", dated "10 October 2006".
- Tuctu Golf Club (Morococha, Peru): Wikipedia https://en.wikipedia.org/wiki/Tuctu_Golf_Club : "located at an elevation of 14,335 feet
  (4,369 m) at its lowest point"; "abandoned in the mid-1990s"; single ref worldgolf.com (Penner 2003). [secondary only; defunct]
- La Paz Golf Club (Mallasilla, Bolivia): top100golfcourses.com: "10,650 feet highest point" (3,246 m); search summary cites La Razon/AFP ~3,300 m,
  travel blog 3,319 m. [secondary only; figures vary 3,250-3,320 m]

- PGA TOUR "Elevated expectations" (2017-02-28), https://www.pgatour.com/article/news/long-form/2017/02/28/elevated-expectations-wgc-mexico-championship-altitude :
  Club de Golf Chapultepec "at its highest point is 7,835 feet above sea level" and "at its lowest part is 7,603 feet above sea level" (ShotLink);
  Montreux G&CC Reno "ranges between 5,476 – 5,952 feet above sea level"; Bogota "pushes around the 8,000-feet mark".
- Castle Pines GC: The Fried Egg BMW Championship preview (Joseph LaMagna, 2024-08-21): "Average altitude of 6,200 feet" [secondary; other
  outlets 6,400 ft high point, ~1,890 m]. No primary (club/PGA TOUR) figure read.
- DP World Tour "A numbers game: players tackle altitude at Omega European Masters" (dated 2 Sep 2026 on legacy.europeantour.com):
  "Crans-sur-Sierre Golf Club is notable for being 1,500m above sea level." Penge: irons "Seven-and-a-half per cent", woods "five per cent".
- PGA TOUR release "Barracuda Networks extends Barracuda Championship sponsorship through 2025" (2023-02-13):
  Tahoe Mountain Club's Old Greenwood GC, Truckee CA, "Located at nearly 6,000 feet above sea level".

- Probe: USSA P at Z=-500 m 1074.78 hPa; -100 m 1025.32 (30.28 inHg); -65.2 m 1021.11; 4369 m 587.56; 4500 m 577.53 (17.05 inHg);
  6000 m 472.18; 600 hPa <-> Z = 4209 m.

## Corrections / additions (2026-10-08, review pass)

- Re-read Table 2B at 300 dpi: r0 printed "6.356766 x 10^6 km"; S "110 K"; beta "1.458 x 10^-6" (table correct; p.4 text has 10^6).
- CIPM-2007 Table 2 (p.151): combined relative standard uncertainty (u(rho_a)/rho_a) = 22e-6 (CO2 assumed 400 umol/mol).
- TrackMan article dates from page HTML: normalization article first_published_at 2014-07-09 ("July 9, 2014");
  tour averages article "May 2, 2024" (first_published_at 2024-05-02T13:06:12).

