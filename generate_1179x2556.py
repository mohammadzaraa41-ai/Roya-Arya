import os
from PIL import Image

TARGET_W = 1179
TARGET_H = 2556

OUT_DIR = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\app_store_screenshots\iphone_medium_1179x2556"
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
    resized = img.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    
    # Save with new clear filename reflecting 1179x2556
    out_name = f.replace("1290x2796", "1179x2556")
    out_path = os.path.join(OUT_DIR, out_name)
    resized.save(out_path, format="PNG", optimize=True)
    print(f"Generated: {out_name} -> {resized.size}")

print("\nAll 1179x2556 screenshots ready!")
