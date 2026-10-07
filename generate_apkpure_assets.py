import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\apkpure_screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Generate 1080x1920 Screenshots (16:9 ratio, max dimension is 1.77x min dimension, strictly < 2x)
RAW_IMAGES = [
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_1_home_1791373143495.png", "01_Main_Menu_1080x1920.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_2_aiming_1791373185046.png", "02_Precision_Aiming_1080x1920.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_3_action_1791373212026.png", "03_Shatter_Crystals_1080x1920.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_4_levels_1791373244387.png", "04_Cosmic_Stages_1080x1920.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_5_skins_1791373264474.png", "05_Celestial_Skins_1080x1920.png"),
]

for src, out_name in RAW_IMAGES:
    if not os.path.exists(src):
        continue
    img = Image.open(src)
    
    # Crop borders if browser frame
    w, h = img.size
    crop_x = int(w * 0.02)
    img = img.crop((crop_x, 0, w - crop_x, h))
    
    # Flatten to RGB (no alpha)
    bg = Image.new("RGB", (1080, 1920), (8, 9, 16))
    resized_img = img.convert("RGB").resize((1080, 1920), Image.Resampling.LANCZOS)
    bg.paste(resized_img, (0, 0))
    
    out_path = os.path.join(OUT_DIR, out_name)
    bg.save(out_path, format="PNG", optimize=True)
    print(f"Saved Screenshot: {out_name} (1080x1920, RGB)")

# 2. Generate 1024x500 Feature Graphic (Promo Banner)
banner_w, banner_h = 1024, 500
banner = Image.new("RGB", (banner_w, banner_h), (8, 9, 16))
draw = ImageDraw.Draw(banner)

# Add cosmic gradient and neon grid glow
for y in range(banner_h):
    factor = y / banner_h
    r = int(8 + factor * 18)
    g = int(9 + factor * 12)
    b = int(16 + factor * 45)
    draw.line([(0, y), (banner_w, y)], fill=(r, g, b))

# Add glowing orbs / particles
draw.ellipse([80, 120, 260, 300], fill=(0, 240, 255), outline=None)
draw.ellipse([760, 180, 940, 360], fill=(255, 0, 128), outline=None)
banner = banner.filter(ImageFilter.GaussianBlur(35))

# Reload draw on blurred background
draw = ImageDraw.Draw(banner)

# Draw central artwork / logo
icon_path = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
if not os.path.exists(icon_path):
    icon_path = "icon.jpg"

if os.path.exists(icon_path):
    icon = Image.open(icon_path).convert("RGBA")
    icon_thumb = icon.resize((240, 240), Image.Resampling.LANCZOS)
    # create round mask
    mask = Image.new("L", (240, 240), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, 240, 240], fill=255)
    
    banner.paste(icon_thumb, (120, 130), mask)
    draw.ellipse([118, 128, 362, 372], outline=(0, 240, 255), width=4)

# Draw Title & Tagline
try:
    font_main = ImageFont.truetype("arialbd.ttf", 60)
    font_sub = ImageFont.truetype("arialbd.ttf", 26)
    font_tag = ImageFont.truetype("arial.ttf", 22)
except Exception:
    font_main = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_tag = ImageFont.load_default()

# Text on right side
draw.text((400, 150), "ROYA & ARYA", fill=(255, 255, 255), font=font_main)
draw.text((400, 225), "NEON RICOCHET", fill=(0, 240, 255), font=font_sub)
draw.text((400, 275), "Precision Laser Physics - 30 Cosmic Stages", fill=(200, 210, 230), font=font_tag)

# Decorative neon line
draw.line([(400, 315), (920, 315)], fill=(255, 0, 128), width=3)
draw.text((400, 330), "Now Available on Android", fill=(160, 255, 180), font=font_tag)

banner_out = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\apkpure_featured_graphic_1024x500.png"
banner.save(banner_out, "PNG", optimize=True)
print(f"Saved Feature Graphic: {banner_out} ({banner_w}x{banner_h})")
