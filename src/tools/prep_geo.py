"""Готовит src/geo.js из assets/maps/world_1600.geojson (aourednik/historical-basemaps).
Отбор по bbox, сглаживание Chaikin (2 итерации), отброс мелких островов, классы для раскраски."""
import json, math
SRC = 'assets/maps/world_1600.geojson'
BBOX = (-105, 12, 50, 74)
CLS = {'England and Ireland': 'england', 'Scotland': 'scotland', 'France': 'france', 'Spain': 'spain',
       'Dutch Republic': 'netherlands', 'Portugal': 'state', 'Habsburg Netherlands': 'state'}
def area(r):
    return abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1)))/2
def chaikin(r, it=2):
    pts = r[:-1] if r[0] == r[-1] else r
    for _ in range(it):
        n = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i+1) % len(pts)]
            n.append((0.75*a[0]+0.25*b[0], 0.75*a[1]+0.25*b[1]))
            n.append((0.25*a[0]+0.75*b[0], 0.25*a[1]+0.75*b[1]))
        pts = n
    return [[round(x, 3), round(y, 3)] for x, y in pts]
d = json.load(open(SRC))
out = []
for f in d['features']:
    name = f['properties'].get('NAME')
    g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        ring = poly[0]
        xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
        if max(xs) < BBOX[0] or min(xs) > BBOX[2] or max(ys) < BBOX[1] or min(ys) > BBOX[3]:
            continue
        if area(ring) < 0.08:   # мелкие острова не нужны сюжету (§7.2 п.5)
            continue
        cx, cy = sum(xs)/len(xs), sum(ys)/len(ys)
        if name in CLS: c = CLS[name]
        elif name and -25 < cx < 50 and 15 < cy < 74: c = 'state'   # Старый Свет: государства с границами
        else: c = 'land'                                              # Америка/без названия: суша без внутренних границ
        if c == 'england' and cx < -5.6: c = 'ireland'   # Королевство Ирландия под английской короной — оттенок сюзерена (§7.3)
        out.append({'c': c, 'n': name or '', 'r': chaikin(ring)})
# Суша без внутренних границ (Америка): объединение с закрытием щелей между полигонами источника (§7.2: без щелей)
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union
land = [Polygon(o['r']).buffer(0) for o in out if o['c'] == 'land']
merged = unary_union([g.buffer(0.12, join_style=1) for g in land]).buffer(-0.12, join_style=1).simplify(0.01)
others = [o for o in out if o['c'] != 'land']
geoms = merged.geoms if isinstance(merged, MultiPolygon) else [merged]
for g in geoms:
    if g.area < 0.08: continue
    others.append({'c': 'land', 'n': '', 'r': [[round(x, 3), round(y, 3)] for x, y in g.exterior.coords]})
    for hole in g.interiors:   # внутренние водоёмы (озёра) — как отдельный класс воды
        if Polygon(hole).area > 0.3 and Polygon(hole).centroid.x < -50: others.append({'c': 'lake', 'n': '', 'r': [[round(x, 3), round(y, 3)] for x, y in hole.coords]})
# Дыры в данных Старого Света (например, центральная Сахара в снимке 1600 г.) — заполняем нейтральной сушей
allu = unary_union([Polygon(o['r']).buffer(0) for o in others if o['c'] != 'lake'])
for g in (allu.geoms if isinstance(allu, MultiPolygon) else [allu]):
    for hole in g.interiors:
        hp = Polygon(hole)
        if hp.centroid.x > -30 and hp.area > 0.05:
            others.append({'c': 'land', 'n': '', 'r': [[round(x, 3), round(y, 3)] for x, y in hp.buffer(0.05).exterior.coords]})
out = others
# Береговая линия = объединение всей суши (без перекрытий) — для маски моря и внутренней тени
cu = unary_union([Polygon(o['r']).buffer(0) for o in out if o['c'] != 'lake'])
coast = []
for g in (cu.geoms if isinstance(cu, MultiPolygon) else [cu]):
    coast.append([[round(x, 3), round(y, 3)] for x, y in g.exterior.coords])
    coast += [[[round(x, 3), round(y, 3)] for x, y in h.coords] for h in g.interiors]
open('src/geo.js', 'w').write('window.GEO=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\nwindow.COAST=' + json.dumps(coast, separators=(',', ':')) + ';\n')
from collections import Counter
print(len(out), Counter(o['c'] for o in out), sum(len(o['r']) for o in out), 'pts')
