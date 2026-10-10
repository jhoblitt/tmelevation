"""THROWAWAY SPIKE CODE (land-angle spike, coordinator, 2026-10-10).

Shipped lift and drag laws against Aoki 2011's supercritical points
(Re >= 7.5e4), as the app evaluates them at each point's Re.
Usage: python3 -I aoki-agreement.py ../literature-data.csv
"""
import csv
import sys

K_RE = 0.0135 / 1e5


def cd0(s):
    if s <= 0.22:
        return 0.22 - 0.27 * s + 3.0 * s * s
    return (0.22 - 0.27 * 0.22 + 3.0 * 0.22**2) + 0.38 * (min(s, 0.64) - 0.22)


def cd(s, re_):
    return cd0(s) + K_RE * (max(re_, 1e5) - 1.5e5)


def cl(s):
    if s < 0.04:
        return (0.065 + 0.85 * 0.04) * s / 0.04
    return 0.065 + 0.85 * s if s <= 0.3 else min(0.45, 0.32 + 0.25 * (s - 0.3))


rows = []
for r in csv.DictReader(open(sys.argv[1])):
    if r["source"].startswith("Aoki2011") and "Bearman" not in r["source"] and float(r["Re"]) >= 7.5e4:
        rows.append(r)
for band in ((0.0, 0.36), (0.36, 0.64), (0.64, 1.01)):
    sel = [r for r in rows if band[0] <= float(r["S"]) < band[1]]
    d = [float(r["CD"]) - cd(float(r["S"]), float(r["Re"])) for r in sel if r["CD"]]
    l = [float(r["CL"]) - cl(float(r["S"])) for r in sel if r["CL"]]
    print(f"S {band[0]:.2f}-{band[1]:.2f}: drag n={len(d)} meas-law {min(d):+.3f}..{max(d):+.3f}" + (f"; lift n={len(l)} meas-law {min(l):+.3f}..{max(l):+.3f}" if l else "; lift n=0"))
for r in sorted(rows, key=lambda r: (float(r["S"]), float(r["Re"]))):
    s, re_ = float(r["S"]), float(r["Re"])
    print(f"  S {s:.2f} Re {re_:.0f}: CD {r['CD']} vs {cd(s, re_):.3f}   CL {r['CL'] or '—'} vs {cl(s):.3f}")
