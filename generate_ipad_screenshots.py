import os
from PIL import Image

TARGET_W = 2048
TARGET_H = 2732

OUT_DIR = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\app_store_screenshots\ipad_13_inch_2048x2732"
os.makedirs(OUT_DIR, exist_ok=True)

SRC_DIR = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\app_store_screenshots\direct_gameplay"

files = [
    "01_Main_Menu_1290x2796.png",
    "02_Precision_Aiming_1290x2796.png",
    "03_Shatter_Crystals_1290x2796.png",
    "04_Cosmic_Stages_1290x2796.png",
    "05_Celestial_Skins_1290x2796.png"
]

for f in files:
    src_path = os.path.join(SRC_DIR, f)
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        continue
    
    img = Image.open(src_path).convert("RGB")
    
    # 2048x2732 iPad Pro canvas
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), (6, 8, 16))
    
    # Scale gameplay cleanly with centered fit
    # Aspect ratio of iPad is 2048/2732 = 0.7496 (wider than phone 1290/2796 = 0.4613)
    # Fit by height:
    game_h = TARGET_H
    game_w = int(img.width * (game_h / img.height))
    resized_game = img.resize((game_w, game_h), Image.Resampling.LANCZOS)
    
    paste_x = (TARGET_W - game_w) // 2
    canvas.paste(resized_game, (paste_x, 0))
    
    out_name = f.replace("1290x2796", "2048x2732_iPad")
    out_path = os.path.join(OUT_DIR, out_name)
    canvas.save(out_path, format="PNG", optimize=True)
    print(f"Generated iPad: {out_name} -> {canvas.size}")

print("\nAll 13-inch iPad screenshots ready!")
