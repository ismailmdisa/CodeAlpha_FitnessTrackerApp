import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = "/home/md-ismail-hossen/Desktop/app development...3/assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

# Brand Colors
BG_COLOR = (18, 19, 16, 255)         # #121310 deep graphite obsidian
CHARTREUSE = (200, 224, 30, 255)     # #c8e01e electric solar chartreuse
CHARTREUSE_GLOW = (200, 224, 30, 60) # glow
WHITE = (255, 255, 255, 255)
MUTED = (160, 165, 140, 255)

def draw_logo_mark(draw, cx, cy, size):
    """Draws a stylized, aggressive athletic geometric K with an integrated pulse bolt."""
    s = size / 200.0  # reference size 200
    
    # Outer subtle glowing hex/circle ring
    ring_radius = int(85 * s)
    draw.ellipse(
        [cx - ring_radius, cy - ring_radius, cx + ring_radius, cy + ring_radius],
        outline=(200, 224, 30, 70),
        width=int(6 * s)
    )
    
    # Vertical spine of 'K' (thick rounded athletic pill)
    spine_x = cx - int(40 * s)
    spine_top = cy - int(55 * s)
    spine_bottom = cy + int(55 * s)
    spine_w = int(22 * s)
    draw.rounded_rectangle(
        [spine_x - spine_w//2, spine_top, spine_x + spine_w//2, spine_bottom],
        radius=int(10 * s),
        fill=WHITE
    )
    
    # Upper energetic diagonal arm of 'K'
    # From spine mid-top to top-right
    p1 = (spine_x + int(8 * s), cy - int(6 * s))
    p2 = (cx + int(46 * s), cy - int(55 * s))
    draw.line([p1, p2], fill=CHARTREUSE, width=int(22 * s))
    # Cap the end
    draw.ellipse([p2[0] - int(10*s), p2[1] - int(10*s), p2[0] + int(10*s), p2[1] + int(10*s)], fill=CHARTREUSE)

    # Lower pulse bolt arm of 'K' (dynamic zig-zag pulse)
    # Starts from diagonal joint, zigs down-right, zags, then shoots down-right
    z0 = (spine_x + int(10 * s), cy - int(2 * s))
    z1 = (cx + int(18 * s), cy + int(18 * s))
    z2 = (cx + int(6 * s), cy + int(24 * s))
    z3 = (cx + int(48 * s), cy + int(55 * s))
    
    draw.line([z0, z1], fill=CHARTREUSE, width=int(20 * s))
    draw.line([z1, z2], fill=CHARTREUSE, width=int(16 * s))
    draw.line([z2, z3], fill=CHARTREUSE, width=int(20 * s))
    draw.ellipse([z3[0] - int(9*s), z3[1] - int(9*s), z3[0] + int(9*s), z3[1] + int(9*s)], fill=CHARTREUSE)
    
    # Core energy dot in the junction
    draw.ellipse([cx - int(10*s), cy - int(10*s), cx + int(10*s), cy + int(10*s)], fill=WHITE)

# 1. Generate 1024x1024 App Icon
icon = Image.new("RGBA", (1024, 1024), BG_COLOR)
draw = ImageDraw.Draw(icon)

# Concentric subtle halo
for r in [460, 410, 360, 310]:
    draw.ellipse([512 - r, 512 - r, 512 + r, 512 + r], outline=(200, 224, 30, 20), width=3)

# Radial corner border
draw.rounded_rectangle([24, 24, 1000, 1000], radius=220, outline=(200, 224, 30, 90), width=14)

draw_logo_mark(draw, 512, 512, size=520)
icon.save(os.path.join(ASSETS_DIR, "icon.png"), "PNG")
print("✅ Saved assets/icon.png (1024x1024)")

# 2. Generate 1024x1024 Android Adaptive Icon (Foreground with transparent/safe zone)
adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
draw_ad = ImageDraw.Draw(adaptive)
draw_logo_mark(draw_ad, 512, 512, size=400)
adaptive.save(os.path.join(ASSETS_DIR, "adaptive-icon.png"), "PNG")
print("✅ Saved assets/adaptive-icon.png (1024x1024)")

# 3. Generate 2048x2048 Splash Screen
splash = Image.new("RGBA", (2048, 2048), BG_COLOR)
draw_sp = ImageDraw.Draw(splash)

# Ambient halos
for r in [650, 580, 500]:
    draw_sp.ellipse([1024 - r, 900 - r, 1024 + r, 900 + r], outline=(200, 224, 30, 25), width=4)

draw_logo_mark(draw_sp, 1024, 900, size=600)

# Branding text below logo
# Draw clean custom typography using PIL geometric primitives if custom TTF is absent
title = "K I N E T I C"
# Subtitle
draw_sp.rectangle([824, 1340, 1224, 1344], fill=CHARTREUSE)

splash.save(os.path.join(ASSETS_DIR, "splash.png"), "PNG")
print("✅ Saved assets/splash.png (2048x2048)")

# 4. Generate 64x64 Favicon
favicon = icon.resize((64, 64), Image.Resampling.LANCZOS)
favicon.save(os.path.join(ASSETS_DIR, "favicon.png"), "PNG")
print("✅ Saved assets/favicon.png (64x64)")
