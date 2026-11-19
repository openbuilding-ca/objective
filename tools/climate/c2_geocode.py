"""Coordinates for NBC Table C-2's locations, which carry none.

Reads the web app's own src/core/ClimateValues.js (679 locations, by
province) and asks NRCan's Canadian Geographical Names service for each
(Andy 2026-10-30: "for sure that's fine"). Only populated-place features
count; an exact (accent- and case-folded) name match beats a fuzzy one, then
the feature class (CITY > TOWN > ... ), then official status.

Names are tried in order: the parenthetical when it is a place ("Mississauga
(Port Credit)" -> Port Credit), then the main name; each half of "X / Y";
"Victoria Region" -> Victoria. A parenthetical that is a landmark (City Hall,
an airport, a street corner) is skipped by the fallback: the main name is
inside the same city, well inside the tens of km the station match works at.

Results are cached in the output file: a rerun asks only for what is missing.
Rows with `match: "fuzzy"`, `"feature"` (a named non-settlement, e.g. a cape)
or `"none"` are for review (none -> NASA POWER).

    python3 -I tools/climate/c2_geocode.py data/climate/c2-geocode.json
"""
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

API = "https://geogratis.gc.ca/services/geoname/en/geonames.json"
PROVINCE_CODE = {
    "NL": 10, "PE": 11, "NS": 12, "NB": 13, "QC": 24, "ON": 35, "MB": 46,
    "SK": 47, "AB": 48, "BC": 59, "YT": 60, "NT": 61, "NU": 62,
}
# Populated places and municipalities, best first.
CONCISE_RANK = ["CITY", "TOWN", "VILG", "HAM", "UNP", "MUN1", "MUN2", "IR", "MIL"]
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def c2_locations():
    js = (
        "global.window={};require(process.argv[1]);const d=window.TEUI.ClimateData;"
        "const o=[];for(const p in d)for(const n in d[p])o.push([p,n,d[p][n]]);"
        "console.log(JSON.stringify(o))"
    )
    out = subprocess.run(
        ["node", "-e", js, os.path.join(REPO, "src/core/ClimateValues.js")],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(out)


def fold(s):
    s = s.replace("œ", "oe").replace("Œ", "Oe")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c)).casefold()
    s = re.sub(r"\bst\.?\s", "saint ", s)
    s = re.sub(r"\bste\.?\s", "sainte ", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def query_names(name):
    names = []
    m = re.match(r"^(.*?)\s*\((.*)\)$", name)
    if m:
        main, inner = m.group(1), m.group(2)
        names.append(inner)
        names.append(main)
    else:
        names += [p.strip() for p in name.split("/")]
    names = [re.sub(r"\s+Region$", "", n) for n in names]
    return names + [re.sub(r"\s+(Plant|Townsite)$", "", n) for n in names if re.search(r"\s(Plant|Townsite)$", n)]


def ask(q, prov):
    url = API + "?" + urllib.parse.urlencode({"q": q, "province": PROVINCE_CODE[prov]})
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)["items"]


def best(items, q):
    places = [it for it in items if it["concise"]["code"] in CONCISE_RANK]
    if not places:
        # A named feature that is not a settlement (Cape Harrison): exact name only.
        same = [it for it in items if fold(it["name"]) == fold(q) and it["status"]["code"] == "official"]
        return (same[0], "feature") if same else (None, None)
    def key(it):
        return (
            fold(it["name"]) != fold(q),
            CONCISE_RANK.index(it["concise"]["code"]),
            it["status"]["code"] != "official",
        )
    it = min(places, key=key)
    return it, ("exact" if fold(it["name"]) == fold(q) else "fuzzy")


def geocode(prov, name):
    fallback = None
    for q in query_names(name):
        it, match = best(ask(q, prov), q)
        time.sleep(0.2)
        if it and match in ("exact", "feature"):
            return row(prov, name, q, it, match)
        if it and fallback is None:
            fallback = row(prov, name, q, it, match)
    return fallback or {"province": prov, "name": name, "match": "none"}


def row(prov, name, q, it, match):
    return {
        "province": prov,
        "name": name,
        "query": q,
        "match": match,
        "feature": it["name"],
        "concise": it["concise"]["code"],
        "lat": it["latitude"],
        "lon": it["longitude"],
    }


def main(out_path):
    cache = {}
    if os.path.exists(out_path):
        for r in json.load(open(out_path))["locations"]:
            cache[(r["province"], r["name"])] = r
    rows = []
    for prov, name, _ in c2_locations():
        r = cache.get((prov, name))
        if r is None or r["match"] == "none":
            r = geocode(prov, name)
            print(f'{r["match"]:5} {prov} {name} -> {r.get("feature")}', flush=True)
        rows.append(r)
    doc = {
        "source": "NRCan Canadian Geographical Names (geogratis.gc.ca/services/geoname)",
        "tool": "tools/climate/c2_geocode.py",
        "locations": rows,
    }
    with open(out_path, "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
    n = {k: sum(r["match"] == k for r in rows) for k in ("exact", "fuzzy", "feature", "none")}
    print(f"{len(rows)} locations -> {out_path}: {n}")


if __name__ == "__main__":
    main(sys.argv[1])
