"""Ajoute à une police de titres les lettres accentuées du français, en glyphes
composites (lettre de base + accent dessiné en biseau, façon capitales lombardes).
Usage : patch_deroos.py <pylib> <entrée.ttf> <sortie.ttf> [nom] [échelle] [plancher_cap] [plancher_min]"""
import sys
sys.path.insert(0, sys.argv[1])
FAMILY = sys.argv[4] if len(sys.argv) > 4 else 'DeRoos'
SCALE = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
FLOOR_UP = int(sys.argv[6]) if len(sys.argv) > 6 else 800
FLOOR_LOW = int(sys.argv[7]) if len(sys.argv) > 7 else 770
sys.stdout.reconfigure(encoding='utf-8')
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent

f = TTFont(sys.argv[2])
glyf, hmtx = f['glyf'], f['hmtx']
cmap = f.getBestCmap()
order = f.getGlyphOrder()

def gname(ch):
    return cmap[ord(ch)]

def bbox(name):
    g = glyf[name]
    g.recalcBounds(glyf)
    return g.xMin, g.yMin, g.xMax, g.yMax


def comp(name, x, y, sx=1.0, sy=1.0):
    c = GlyphComponent()
    c.glyphName, c.x, c.y, c.flags = name, int(round(x)), int(round(y)), 0
    if sx != 1.0 or sy != 1.0:
        c.transform = [[sx, 0], [0, sy]]
    return c

S = 0.75   # échelle des accents
def part_bbox(name, sx, sy):
    x0, y0, x1, y1 = bbox(name)
    xs, ys = sorted((x0 * sx, x1 * sx)), sorted((y0 * sy, y1 * sy))
    return xs[0], ys[0], xs[1], ys[1]

# Accents dessinés (biseaux façon capitales lombardes), en unités de la police (1000/em)
from fontTools.pens.ttGlyphPen import TTGlyphPen
SHAPES = {
    'vda.acute':   [[(30, 0), (100, 0), (250, 175), (160, 195)]],
    'vda.grave':   [[(250, 0), (180, 0), (30, 175), (120, 195)]],
    'vda.circ':    [[(0, 0), (75, 0), (160, 110), (245, 0), (320, 0), (200, 185), (120, 185)]],
    'vda.diamond': [[(70, 0), (140, 70), (70, 140), (0, 70)]],
    'vda.cedil':   [[(105, 40), (165, 40), (160, -25), (205, -70), (180, -150), (70, -175), (55, -135), (125, -118), (130, -75), (100, -35)]],
}
for name, contours in SHAPES.items():
    pen = TTGlyphPen(None)
    for pts in contours:
        pts = [(int(round(x * SCALE)), int(round(y * SCALE))) for x, y in pts]
        pen.moveTo(pts[0])
        for p in pts[1:]:
            pen.lineTo(p)
        pen.closePath()
    g = pen.glyph()
    glyf.glyphs[name] = g
    order.append(name)
    g.recalcBounds(glyf)
    hmtx.metrics[name] = (g.xMax + 20, g.xMin)

# Chaque accent = liste de (glyphe, sx, sy, décalage x relatif)
def accent_parts(kind):
    if kind == 'grave':
        return [('vda.grave', 1, 1, 0)]
    if kind == 'acute':
        return [('vda.acute', 1, 1, 0)]
    if kind == 'circ':
        return [('vda.circ', 1, 1, 0)]
    if kind == 'dot2':
        return [('vda.diamond', 1, 1, 0), ('vda.diamond', 1, 1, int(200 * SCALE))]
    raise ValueError(kind)

def place(parts, cx, bottom):
    """Positionne un accent composé : centré sur cx, bas à `bottom`."""
    boxes = []
    for g, sx, sy, off in parts:
        x0, y0, x1, y1 = part_bbox(g, sx, sy)
        boxes.append((x0 + off, y0, x1 + off, y1))
    X0 = min(b[0] for b in boxes); X1 = max(b[2] for b in boxes); Y0 = min(b[1] for b in boxes)
    dx, dy = cx - (X0 + X1) / 2, bottom - Y0
    return [comp(g, off + dx, dy, sx, sy) for g, sx, sy, off in parts]

def add_glyph(newname, components, advance, lsb_from):
    g = Glyph()
    g.numberOfContours = -1
    g.components = components
    glyf.glyphs[newname] = g
    order.append(newname)
    g.recalcBounds(glyf)
    hmtx.metrics[newname] = (advance, g.xMin if hasattr(g, 'xMin') else hmtx[lsb_from][1])

GAP = int(40 * SCALE)
def above(base, kind, upper):
    bx0, by0, bx1, by1 = bbox(base)
    floor = FLOOR_UP if upper else FLOOR_LOW
    return [comp(base, 0, 0)] + place(accent_parts(kind), (bx0 + bx1) / 2, max(by1, floor) + GAP)

def below(base):
    bx0, by0, bx1, by1 = bbox(base)
    cx0, cy0, cx1, cy1 = bbox('vda.cedil')
    # sous le bas réel de la lettre (le C de DeRoos a un paraphe qui descend)
    return [comp(base, 0, 0), comp('vda.cedil', (bx0 + bx1) / 2 - (cx0 + cx1) / 2, min(0, by0 + 30))]

TABLE = {
    'À': ('A', 'grave'), 'Â': ('A', 'circ'), 'Ä': ('A', 'dot2'), 'Ç': ('C', 'cedil'),
    'É': ('E', 'acute'), 'È': ('E', 'grave'), 'Ê': ('E', 'circ'), 'Ë': ('E', 'dot2'),
    'Î': ('I', 'circ'), 'Ï': ('I', 'dot2'), 'Ô': ('O', 'circ'), 'Ö': ('O', 'dot2'),
    'Ù': ('U', 'grave'), 'Û': ('U', 'circ'), 'Ü': ('U', 'dot2'), 'Ÿ': ('Y', 'dot2'),
}
TABLE.update({k.lower(): (v[0].lower(), v[1]) for k, v in TABLE.items() if k != 'Ÿ'})
TABLE['ÿ'] = ('y', 'dot2')

new_map = {}
for ch, (b, acc) in TABLE.items():
    base = gname(b)
    if acc == 'cedil':
        comps = below(base)
    else:
        comps = above(base, acc, ch.isupper())
    name = 'uni%04X' % ord(ch)
    add_glyph(name, comps, hmtx[base][0], base)
    new_map[ord(ch)] = name

# Ligatures Œ œ Æ æ : deux lettres accolées, léger recouvrement (si absentes)
for ch, (a, b) in {'Œ': ('O', 'E'), 'œ': ('o', 'e'), 'Æ': ('A', 'E'), 'æ': ('a', 'e')}.items():
    if ord(ch) in cmap:
        continue
    ga, gb = gname(a), gname(b)
    over = int(hmtx[ga][0] * 0.12)
    name = 'uni%04X' % ord(ch)
    add_glyph(name, [comp(ga, 0, 0), comp(gb, hmtx[ga][0] - over, 0)], hmtx[ga][0] - over + hmtx[gb][0], ga)
    new_map[ord(ch)] = name

# Guillemets « » : doubles chevrons < > réduits à leur dessin d'origine, accolés
for ch, src in {'«': '<', '»': '>'}.items():
    if ord(ch) in cmap or ord(src) not in cmap:
        continue
    g = gname(src)
    w = hmtx[g][0]
    name = 'uni%04X' % ord(ch)
    add_glyph(name, [comp(g, 0, 0), comp(g, int(w * 0.55), 0)], int(w * 1.55), g)
    new_map[ord(ch)] = name

# Point médian « · » : vide ou absent dans ces polices → losange à mi-hauteur
mid = cmap.get(0x00B7)
if mid is None or bbox(mid)[2] == 0:
    dx0, dy0, dx1, dy1 = bbox('vda.diamond')
    w = dx1 - dx0
    add_glyph('uni00B7.vda', [comp('vda.diamond', 60 * SCALE - dx0, FLOOR_LOW * 0.42 - (dy1 - dy0) / 2 - dy0)],
              int(w + 120 * SCALE), 'vda.diamond')
    new_map[0x00B7] = 'uni00B7.vda'

f.setGlyphOrder(order)
for t in f['cmap'].tables:
    if t.isUnicode():
        t.cmap.update(new_map)

# Place pour les accents au-dessus des capitales (évite la coupe en haut de ligne)
top = FLOOR_UP + GAP + int(200 * SCALE)
f['hhea'].ascent = max(f['hhea'].ascent, top)
f['OS/2'].usWinAscent = max(f['OS/2'].usWinAscent, top)
f['OS/2'].sTypoAscender = max(f['OS/2'].sTypoAscender, top - 80)

# Nom distinct pour ne pas confondre avec l'original
for rec in f['name'].names:
    if rec.nameID in (1, 4, 6):
        s = rec.toUnicode()
        rec.string = s.replace(FAMILY, FAMILY + ' FR') if rec.nameID != 6 else s.replace(FAMILY, FAMILY + 'FR')
for tbl in ('hdmx', 'PCLT'):   # tables de rendu figées, invalides après ajout de glyphes
    if tbl in f:
        del f[tbl]
f.save(sys.argv[3])
print('ajoutés :', ''.join(chr(c) for c in sorted(new_map)))
