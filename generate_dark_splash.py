import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_splash(width, height, icon_path):
    # Base dark cosmic background
    base = Image.new("RGBA", (width, height), (8, 9, 16, 255))
    draw = ImageDraw.Draw(base)

    cx = width // 2
    cy = height // 2

    # Draw soft cosmic radial glow
    glow_radius = min(width, height) // 2
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    # Cyan aura on left, Magenta aura on right
    for r in range(glow_radius, 0, -12):
        alpha_cyan = int(35 * (1 - r / glow_radius))
        alpha_mag = int(35 * (1 - r / glow_radius))
        glow_draw.ellipse(
            [cx - 80 - r, cy - r, cx - 80 + r, cy + r],
            fill=(0, 243, 255, alpha_cyan)
        )
        glow_draw.ellipse(
            [cx + 80 - r, cy - r, cx + 80 + r, cy + r],
            fill=(255, 0, 127, alpha_mag)
        )

    base = Image.alpha_composite(base, glow_layer)
    draw = ImageDraw.Draw(base)

    # Load and process icon
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        icon_dim = int(min(width, height) * 0.32)
        icon = icon.resize((icon_dim, icon_dim), Image.Resampling.LANCZOS)

        # Rounded mask with smooth anti-aliased corners
        mask = Image.new("L", (icon_dim, icon_dim), 0)
        mask_draw = ImageDraw.Draw(mask)
        corner_r = int(icon_dim * 0.22)
        mask_draw.rounded_rectangle([0, 0, icon_dim, icon_dim], radius=corner_r, fill=255)

        # Outer glowing neon border
        border_pad = 6
        border_layer = Image.new("RGBA", (icon_dim + border_pad*2, icon_dim + border_pad*2), (0, 0, 0, 0))
        border_draw = ImageDraw.Draw(border_layer)
        border_draw.rounded_rectangle(
            [0, 0, icon_dim + border_pad*2, icon_dim + border_pad*2],
            radius=corner_r + border_pad,
            outline=(0, 243, 255, 180),
            width=border_pad
        )

        icon_x = cx - icon_dim // 2
        icon_y = cy - icon_dim // 2 - int(min(width, height) * 0.05)

        base.paste(border_layer, (icon_x - border_pad, icon_y - border_pad), border_layer)
        base.paste(icon, (icon_x, icon_y), mask)

    # Title typography
    try:
        font_title = ImageFont.truetype("arialbd.ttf", int(min(width, height) * 0.045))
        font_sub = ImageFont.truetype("arial.ttf", int(min(width, height) * 0.024))
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    title_text = "ROYA & ARYA"
    sub_text = "NEON RICOCHET"

    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    tw = t_bbox[2] - t_bbox[0]
    th = t_bbox[3] - t_bbox[1]
    title_y = cy + int(min(width, height) * 0.16)

    # Title shadow / glow
    draw.text((cx - tw // 2, title_y + 2), title_text, font=font_title, fill=(0, 0, 0, 200))
    draw.text((cx - tw // 2, title_y), title_text, font=font_title, fill=(255, 255, 255, 255))

    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = s_bbox[2] - s_bbox[0]
    draw.text((cx - sw // 2, title_y + th + 18), sub_text, font=font_sub, fill=(0, 243, 255, 240))

    return base.convert("RGB")

def main():
    icon_path = "icon.jpg"

    # iOS Assets
    ios_splash_dir = r"ios\App\App\Assets.xcassets\Splash.imageset"
    if os.path.exists(ios_splash_dir):
        print("Generating iOS 2732x2732 dark cosmic splash...")
        splash_ios = create_splash(2732, 2732, icon_path)
        for name in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]:
            p = os.path.join(ios_splash_dir, name)
            splash_ios.save(p, "PNG")
            print(f"Saved {p}")

    # Android Drawables
    android_res = r"android\app\src\main\res"
    if os.path.exists(android_res):
        configs = [
            ("drawable", (480, 800)),
            ("drawable-port-mdpi", (320, 480)),
            ("drawable-port-hdpi", (480, 800)),
            ("drawable-port-xhdpi", (720, 1280)),
            ("drawable-port-xxhdpi", (960, 1600)),
            ("drawable-port-xxxhdpi", (1280, 1920)),
            ("drawable-land-mdpi", (480, 320)),
            ("drawable-land-hdpi", (800, 480)),
            ("drawable-land-xhdpi", (1280, 720)),
            ("drawable-land-xxhdpi", (1600, 960)),
            ("drawable-land-xxxhdpi", (1920, 1280)),
        ]
        for folder, (w, h) in configs:
            target_dir = os.path.join(android_res, folder)
            os.makedirs(target_dir, exist_ok=True)
            sp = create_splash(w, h, icon_path)
            out_file = os.path.join(target_dir, "splash.png")
            sp.save(out_file, "PNG")
            print(f"Saved Android {folder}/splash.png ({w}x{h})")

    print("All dark cosmic splash screen assets generated successfully!")

if __name__ == "__main__":
    main()
