"""Scan public/demo/*/tbm-pin.json and write public/drive-sites.json.

Storefront demos only. Service-area businesses have no pin file.

Usage (from repo root):

    python scripts/collect-drive-sites.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEMO_ROOT = ROOT / "public" / "demo"
OUT = ROOT / "public" / "drive-sites.json"
KEEP = (
    "id",
    "name",
    "type",
    "schemaType",
    "phone",
    "street",
    "city",
    "region",
    "zip",
    "lat",
    "lng",
    "demoUrl",
    "spanish",
)


def main() -> None:
    pins = []
    seen = set()
    for path in sorted(DEMO_ROOT.glob("*/tbm-pin.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            print("skip", path, exc)
            continue
        if not isinstance(data, dict):
            continue
        pid = data.get("id") or path.parent.name
        if pid in seen:
            print("duplicate id", pid, path)
            continue
        if data.get("lat") in (None, "") or data.get("lng") in (None, ""):
            print("no coords", path)
            continue
        row = {k: data[k] for k in KEEP if k in data}
        row["id"] = pid
        row["region"] = row.get("region") or "TX"
        row["lat"] = float(row["lat"])
        row["lng"] = float(row["lng"])
        pins.append(row)
        seen.add(pid)

    pins.sort(key=lambda p: ((p.get("city") or ""), (p.get("name") or "")))
    blob = json.dumps(pins, indent=2) + "\n"
    OUT.write_text(blob, encoding="utf-8")
    print("wrote", OUT, "pins=", len(pins))


if __name__ == "__main__":
    main()
