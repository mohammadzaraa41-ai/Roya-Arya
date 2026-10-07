import os
from PIL import Image, ImageDraw, ImageFont

TARGET_W = 1290
TARGET_H = 2796

OUT_DIRECT = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\app_store_screenshots\direct_gameplay"
OUT_CARDS = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\app_store_screenshots\presentation_cards"
os.makedirs(OUT_DIRECT, exist_ok=True)
os.makedirs(OUT_CARDS, exist_ok=True)

RAW_ITEMS = [
    {
        "src": r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_1_home_1791373143495.png",
        "file": "01_Main_Menu_1290x2796.png",
        "title_en": "ROYA & ARYA: HARMONIC SPIRITS",
        "sub_en": "Cosmic Neon Ricochet Adventure"
    },
    {
        "src": r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_2_aiming_1791373185046.png",
        "file": "02_Precision_Aiming_1290x2796.png",
        "title_en": "PRECISION RICOCHET PHYSICS",
        "sub_en": "Laser Trajectory & Predictive Bounces"
    },
    {
        "src": r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_3_action_1791373212026.png",
        "file": "03_Shatter_Crystals_1290x2796.png",
        "title_en": "SHATTER DARK CRYSTALS",
        "sub_en": "Fluid Comet Trails & Twin Resonance"
    },
    {
        "src": r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_4_levels_1791373244387.png",
        "file": "04_Cosmic_Stages_1290x2796.png",
        "title_en": "30 STAGES ACROSS 3 WORLDS",
        "sub_en": "Prisms, Wormholes & Kinetic Spinners"
    },
    {
        "src": r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_5_skins_1791373264474.png",
        "file": "05_Celestial_Skins_1290x2796.png",
        "title_en": "CELESTIAL SPIRIT SKINS",
        "sub_en": "Customize Ethereal Neon Auras"
    }
]

# Try to load Arial or default system font
def get_fonts():
    try:
        f_title = ImageFont.truetype("arialbd.ttf", 64)
        f_sub = ImageFont.truetype("arial.ttf", 40)
        return f_title, f_sub
    except Exception:
        f_default = ImageFont.load_default()
        return f_default, f_default

font_title, font_sub = get_fonts()

for item in RAW_ITEMS:
    src = item["src"]
    if not os.path.exists(src):
        print("Missing:", src)
        continue
    
    raw = Image.open(src).convert("RGB")
    W, H = raw.size
    
    # 1. Clean crop to remove outer desktop browser margins (crop to #app bounds 480w)
    # The browser window was 500w x 837h, #app is centered with 10px on each side
    crop_x1 = 10
    crop_x2 = W - 10
    game_cropped = raw.crop((crop_x1, 0, crop_x2, H))
    
    # ----------------------------------------------------
    # SET A: Direct Full-Bleed 1290x2796
    # ----------------------------------------------------
    direct_img = game_cropped.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    direct_path = os.path.join(OUT_DIRECT, item["file"])
    direct_img.save(direct_path, format="PNG", optimize=True)
    print("Saved direct:", direct_path, direct_img.size)
    
    # ----------------------------------------------------
    # SET B: Premium App Store Showcase Card 1290x2796
    # ----------------------------------------------------
    card = Image.new("RGB", (TARGET_W, TARGET_H), (6, 8, 16))
    draw = ImageDraw.Draw(card)
    
    # Top ambient neon glow
    for r in range(220, 0, -10):
        alpha_color = int(24 * (r / 220))
        draw.ellipse([(TARGET_W//2 - r*2.5, 120 - r), (TARGET_W//2 + r*2.5, 120 + r*2)],
                     fill=(0, int(alpha_color * 1.5), int(alpha_color * 2.2)))
    
    # Title text
    title_text = item["title_en"]
    sub_text = item["sub_en"]
    
    # Draw Title
    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    draw.text(((TARGET_W - t_w)//2, 140), title_text, fill=(255, 255, 255), font=font_title)
    
    # Draw Subtitle with cyan tint
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text(((TARGET_W - s_w)//2, 230), sub_text, fill=(0, 243, 255), font=font_sub)
    
    # Divider jewel line
    draw.line([(TARGET_W//2 - 120, 310), (TARGET_W//2 + 120, 310)], fill=(0, 243, 255), width=3)
    
    # Resize game screen to fit below the header with clean proportions
    # Available height from Y=350 to 2750 (~2400px)
    target_game_w = 1140
    aspect = game_cropped.height / game_cropped.width
    target_game_h = int(target_game_w * aspect)
    
    # If height exceeds available vertical space, clamp by height
    max_game_h = TARGET_H - 380 - 40
    if target_game_h > max_game_h:
        target_game_h = max_game_h
        target_game_w = int(target_game_h / aspect)
        
    scaled_game = game_cropped.resize((target_game_w, target_game_h), Image.Resampling.LANCZOS)
    
    # Create framed mask with rounded corners
    paste_x = (TARGET_W - target_game_w) // 2
    paste_y = 360 + (max_game_h - target_game_h) // 2
    
    # Draw card backplate frame with neon border
    frame_pad = 6
    draw.rounded_rectangle(
        [(paste_x - frame_pad, paste_y - frame_pad), (paste_x + target_game_w + frame_pad, paste_y + target_game_h + frame_pad)],
        radius=36,
        fill=(14, 18, 30),
        outline=(0, 243, 255),
        width=3
    )
    
    # Rounded mask for game image
    mask = Image.new("L", (target_game_w, target_game_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (target_game_w, target_game_h)], radius=32, fill=255)
    
    card.paste(scaled_game, (paste_x, paste_y), mask)
    
    card_path = os.path.join(OUT_CARDS, item["file"])
    card.save(card_path, format="PNG", optimize=True)
    print("Saved showcase card:", card_path, card.size)

print("\nAll formats ready at exact 1290x2796 pixels!")
