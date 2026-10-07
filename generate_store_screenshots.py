import os
from PIL import Image

TARGET_WIDTH = 1290
TARGET_HEIGHT = 2796
OUT_DIR = r"c:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\app_store_screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

RAW_IMAGES = [
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_1_home_1791373143495.png", "01_Main_Menu_1290x2796.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_2_aiming_1791373185046.png", "02_Aim_And_Trajectory_1290x2796.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_3_action_1791373212026.png", "03_Ricochet_Action_1290x2796.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_4_levels_1791373244387.png", "04_Cosmic_Worlds_1290x2796.png"),
    (r"C:\Users\lenovo\.gemini\antigravity-ide\brain\5a085565-c5fb-4c93-9e6f-c1d5fddeed67\store_raw_5_skins_1791373264474.png", "05_Spirit_Skins_1290x2796.png"),
]

for src, out_name in RAW_IMAGES:
    if not os.path.exists(src):
        print(f"File not found: {src}")
        continue
    
    img = Image.open(src)
    print(f"Original size of {out_name}: {img.size}, mode: {img.mode}")
    
    # Convert RGBA to RGB (Apple App Store does not allow alpha channel)
    if img.mode != "RGB":
        # Create solid black background for clean RGB flattening
        bg = Image.new("RGB", img.size, (8, 9, 16))
        if img.mode == "RGBA":
            bg.paste(img, mask=img.split()[3])
        else:
            bg.paste(img)
        img = bg
        
    # Resize directly with high-quality Lanczos resampling
    final_img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(OUT_DIR, out_name)
    final_img.save(out_path, format="PNG", optimize=True)
    print(f"Saved: {out_path} ({final_img.size})")

print("\nAll 5 App Store screenshots processed successfully!")
