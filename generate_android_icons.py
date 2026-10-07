import os
from PIL import Image

src_img_path = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
if not os.path.exists(src_img_path):
    src_img_path = "icon.jpg"

print(f"Loading master icon from: {src_img_path}")
img = Image.open(src_img_path).convert("RGBA")

# Generate 512x512 for APKPure Store Listing
apkpure_icon = img.resize((512, 512), Image.Resampling.LANCZOS)
apkpure_icon.save("apkpure_icon_512.png", "PNG")
print("Saved apkpure_icon_512.png")

# Android mipmap densities
densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

base_res = "android/app/src/main/res"

for folder, size in densities.items():
    target_dir = os.path.join(base_res, folder)
    if os.path.exists(target_dir):
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
        resized.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
        resized.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")
        print(f"Updated {folder} ({size}x{size})")

print("All Android icons generated successfully!")
