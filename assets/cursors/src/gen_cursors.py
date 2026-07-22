"""
Generate final LoLGrab (open 5-finger) and LoLGrabbing (fist) cursors.
Source: CommunityDragon hand1 + recolored hand2 (golden-matched).
Target: 26px compact PNGs with correct hotspots.
"""
from PIL import Image
import numpy as np

# === Load source images ===
open_hand = Image.open('open_hand.png').convert('RGBA')   # Golden open hand
fist = Image.open('fist_recolored.png').convert('RGBA')     # Golden fist

print(f"Open hand: {open_hand.size}")
print(f"Fist: {fist.size}")

def crop_to_content(img, pad=1):
    """Crop image to content bounding box with optional padding."""
    arr = np.array(img)
    alpha = arr[:,:,3]
    coords = np.argwhere(alpha > 10)
    if len(coords) == 0:
        return img
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    # Add padding
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.size[0]-1, x1 + pad)
    y1 = min(img.size[1]-1, y1 + pad)
    cropped = img.crop((x0, y0, x1+1, y1+1))
    print(f"  Cropped: ({x0},{y0})-({x1},{y1}) -> {cropped.size}")
    return cropped

def scale_cursor(img, target_size):
    """Scale cursor using LANCZOS for quality."""
    w, h = img.size
    if max(w, h) <= target_size:
        return img
    ratio = target_size / max(w, h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    print(f"  Scaled: {img.size} -> {resized.size}")
    return resized

def find_hotspot(img):
    """Find a reasonable hotspot near the "tip" of the hand.
    For open hand: center of palm area (where fingers meet wrist)
    For fist: similar position for consistency.
    """
    arr = np.array(img.convert('RGBA'))
    alpha = arr[:,:,3]
    
    # Find the top-left quadrant of visible pixels (the tip/finger area)
    H, W = arr.shape[:2]
    coords = np.argwhere(alpha > 50)
    if len(coords) == 0:
        return W//2, H//2
    
    # Hotspot should be roughly at the upper-center of the hand
    # where the fingers/wrist junction is (the natural grab point)
    y_vals = coords[:,0]
    x_vals = coords[:,1]
    
    # Use upper-middle area as hotspot
    y_median = int(np.median(y_vals))
    x_median = int(np.median(x_vals))
    
    # Bias slightly toward upper portion (grab point)
    y_hot = max(0, y_median - (H // 6))
    x_hot = x_median
    
    return x_hot, y_hot

# === Process Open Hand -> LoLGrab ===
print("\n=== Processing OPEN HAND (LoLGrab) ===")
open_cropped = crop_to_content(open_hand, pad=2)
open_scaled = scale_cursor(open_cropped, 28)
# Final resize to exact target if needed
if max(open_scaled.size) > 26:
    open_final = scale_cursor(open_scaled, 26)
else:
    open_final = open_scaled

hx_open, hy_open = find_hotspot(open_final)
print(f"  Hotspot: ({hx_open}, {hy_open}), size: {open_final.size}")
open_final.save('../LoLGrab.png')
print(f"  Saved ../LoLGrab.png")

# === Process Fist -> LoLGrabbing ===
print("\n=== Processing FIST (LoLGrabbing) ===")
fist_cropped = crop_to_content(fist, pad=2)
fist_scaled = scale_cursor(fist_cropped, 28)

if max(fist_scaled.size) > 26:
    fist_final = scale_cursor(fist_scaled, 26)
else:
    fist_final = fist_scaled

hx_fist, hy_fist = find_hotspot(fist_final)
print(f"  Hotspot: ({hx_fist}, {hy_fist}), size: {fist_final.size}")

# Ensure SAME size between both for consistency
if open_final.size != fist_final.size:
    print(f"\n  Size mismatch! Normalizing...")
    target_sz = open_final.size
    fist_final = fist_final.resize(target_sz, Image.LANCZOS)
    hx_fist = int(hx_fist * target_sz[0] / fist_scaled.size[0])
    hy_fist = int(hy_fist * target_sz[1] / fist_scaled.size[1])
    print(f"  Fist resized to {target_sz}, hotspot: ({hx_fist},{hy_fist})")

fist_final.save('../LoGGrabbing.png')  # Note: keep existing filename for compatibility
print(f"  Saved ../LoGGrabbing.png")

# === Summary ===
print(f"\n=== SUMMARY ===")
print(f"LoLGrab.png      : open 5-finger hand, {open_final.size}, hotspot({hx_open},{hy_open})")
print(f"LoGGrabbing.png  : clenched fist,     {fist_final.size}, hotspot({hx_fist},{hy_fist})")
print(f"Same palm model: YES (both golden LOL glove)")
