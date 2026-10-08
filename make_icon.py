"""Draw build/icon.png (512 px) for the installer and window: the Backlit sonar scope in miniature."""
import math, os
from PIL import Image, ImageDraw, ImageFilter

S = 1024                      # drawn at 2x, downsampled for clean edges
BG, RIM = (14, 15, 18), (48, 51, 59)
UNLIT, SONAR, PEN, CORE = (56, 59, 67), (43, 194, 155), (91, 141, 239), (232, 233, 236)
cx = cy = S / 2
R = S * 0.40
sweep = math.radians(-50)     # arm points up-right; the lit dots trail behind it (counter-clockwise)

img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rounded_rectangle([24, 24, S - 24, S - 24], radius=210, fill=BG, outline=RIM, width=10)

def dot(x, y, r, col):
    d.ellipse([x - r, y - r, x + r, y + r], fill=col)

# dot lattice: rings of dots, lit by how recently the sweep passed them
ring_r = 70
while ring_r <= R:
    n = max(10, int(2 * math.pi * ring_r / 34))
    for i in range(n):
        a = 2 * math.pi * i / n
        behind = (sweep - a) % (2 * math.pi)
        lit = math.exp(-behind * 1.9)
        x, y = cx + math.cos(a) * ring_r, cy + math.sin(a) * ring_r
        if lit > 0.08:
            col = tuple(int(u + (s - u) * lit) for u, s in zip(UNLIT, SONAR))
            dot(x, y, 6 + 5 * lit, col)
        else:
            dot(x, y, 5, UNLIT)
    ring_r += 46

# bezel
d.ellipse([cx - R - 26, cy - R - 26, cx + R + 26, cy + R + 26], outline=RIM, width=6)

# glow layer: sweep arm, tracer and core
glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
g = ImageDraw.Draw(glow)
ex, ey = cx + math.cos(sweep) * R, cy + math.sin(sweep) * R
g.line([cx, cy, ex, ey], fill=SONAR + (255,), width=14)
# tracer: quadratic curve from the core to a contact down-left
tx, ty = cx - R * 0.55, cy + R * 0.42
kx, ky = cx - R * 0.05, cy + R * 0.62
pts = []
for i in range(41):
    t = i / 40
    u = 1 - t
    pts.append((u * u * cx + 2 * u * t * kx + t * t * tx, u * u * cy + 2 * u * t * ky + t * t * ty))
g.line(pts[8:], fill=PEN + (255,), width=16, joint='curve')
g.ellipse([tx - 22, ty - 22, tx + 22, ty + 22], fill=PEN + (255,))
g.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], fill=SONAR + (255,))
blur = glow.filter(ImageFilter.GaussianBlur(22))
img = Image.alpha_composite(img, blur)
img = Image.alpha_composite(img, glow)

d = ImageDraw.Draw(img)
d.ellipse([cx - 36, cy - 36, cx + 36, cy + 36], fill=CORE)
d.ellipse([tx - 13, ty - 13, tx + 13, ty + 13], fill=(255, 255, 255))
# shield ring of dots round the core
for i in range(24):
    a = 2 * math.pi * i / 24
    dot(cx + math.cos(a) * 82, cy + math.sin(a) * 82, 7, CORE if i % 8 != 7 else UNLIT)

os.makedirs('build', exist_ok=True)
img.resize((512, 512), Image.LANCZOS).save('build/icon.png')
img.resize((64, 64), Image.LANCZOS).save('build/icon-64-preview.png')
print('wrote build/icon.png')
