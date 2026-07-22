from PIL import Image
import numpy as np

h1 = Image.open('hand1.png').convert('RGBA')  # Golden open hand (base palette)
h2 = Image.open('hand2.png').convert('RGBA')  # Teal fist (shape source)
a1 = np.array(h1, dtype=np.float32)
a2 = np.array(h2, dtype=np.float32)

# Extract opaque pixel palettes
m1 = a1[:,:,3] > 128
m2 = a2[:,:,3] > 128

def get_hsv(rgb_pixels):
    """rgb_pixels: (N,3) float32 array -> h,s,v each shape (N,)"""
    r = rgb_pixels[:,0]/255.
    g = rgb_pixels[:,1]/255.
    b = rgb_pixels[:,2]/255.
    mx = np.maximum(np.maximum(r,g), b)
    mn = np.minimum(np.minimum(r,g), b)
    delta = mx - mn
    v = mx
    s = np.where(mx > 0, delta/mx, 0.)
    h = np.zeros_like(mx)
    dd = delta > 0
    rc = np.where(dd, (mx-r)/delta, 0)
    gc = np.where(dd, (mx-g)/delta, 0)
    bc = np.where(dd, (mx-b)/delta, 0)
    h = np.where(dd & (mx==r), (bc-gc) % 6., h)
    h = np.where(dd & (mx==g), 2. + rc - bc, h)
    h = np.where(dd & (mx==b), 4. + gc - rc, h)
    return h, s, v

print("Analyzing hand1 golden palette...")
rgb1 = a1[m1][:,:3]
h1_h, h1_s, h1_v = get_hsv(rgb1)

print("Analyzing hand2 teal palette...")
rgb2 = a2[m2][:,:3]
# h2_h, h2_s, h2_v = get_hsv(rgb2)  # Not needed for mapping

# Build luminance-sorted lookup from hand1's golden palette
idx1 = np.argsort(h1_v)
v1_sorted = h1_v[idx1]
target_h = h1_h[idx1]
target_s = h1_s[idx1]

def map_to_golden(v_val):
    """Find golden hue/sat for given luminance"""
    if v_val < 0.05:
        return 0.08, 0.15  # dark brown
    i = min(int(np.searchsorted(v1_sorted, v_val)), len(v1_sorted)-1)
    return target_h[i], target_s[i]

# Apply color transfer: hand2 shape -> hand1 golden colors
print("Applying color transfer...")
res = a2.copy()
H, W = res.shape[:2]

for y in range(H):
    for x in range(W):
        if res[y,x,3] <= 10:
            continue
        r,g,b_val = res[y,x,:3] / 255.
        mx = max(r,g,b_val)
        mn = min(r,g,b_val)
        d = mx - mn
        v = mx
        if mx > 0:
            s = d / mx
        else:
            s = 0
        
        # Get target golden hue/sat based on original luminance
        nh, ns_target = map_to_golden(v)
        s_blend = 0.4 * s + 0.6 * ns_target  # blend: keep some detail, adopt golden tone
        
        # HSV -> RGB
        c = v * s_blend  # use blended sat
        m_ = v - c
        xv = c * (1. - abs(nh % 2. - 1.))
        
        if nh < 1:
            cr,cg,cb = c, xv, 0
        elif nh < 2:
            cr,cg,cb = xv, c, 0
        elif nh < 3:
            cr,cg,cb = 0, c, xv
        elif nh < 4:
            cr,cg,cb = 0, xv, c
        elif nh < 5:
            cr,cg,cb = xv, 0, c
        else:
            cr,cg,cb = c, 0, xv
        
        res[y,x,0] = (cr + m_) * 255
        res[y,x,1] = (cg + m_) * 255
        res[y,x,2] = (cb + m_) * 255

out = np.clip(res, 0, 255).astype(np.uint8)
fist = Image.fromarray(out, 'RGBA')
fist.save('fist_recolored.png')
print(f"Done! Saved fist_recolored.png ({fist.size})")

# Also save open hand for reference
h1.save('open_hand.png')
print(f"Saved open_hand.png ({h1.size})")
