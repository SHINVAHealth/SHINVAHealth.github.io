import struct
import numpy as np
from PIL import Image

CUR_DIR = 'C:/Users/Administrator/WorkBuddy/2026-07-14-09-19-47/webapp/assets/cursors'

def png_to_cur(png_path, cur_path, hotspot):
    im = Image.open(png_path).convert('RGBA')
    w, h = im.size
    arr = np.array(im)                 # H x W x 4 (RGBA)
    bgra = arr[:, :, [2, 1, 0, 3]].copy()
    bgra = bgra[::-1, :, :]            # BMP bottom-up
    xor = bgra.tobytes()
    # AND mask: all zeros (rely on 32-bit BGRA alpha)
    and_row_bytes = ((w + 31) // 32) * 4
    and_mask = b'\x00' * (and_row_bytes * h)
    image = struct.pack('<IiiHHIIiiII', 40, w, h * 2, 1, 32, 0,
                        len(xor) + len(and_mask), 0, 0, 0, 0) + xor + and_mask
    entry = struct.pack('<BBBBHHII',
                        w if w < 256 else 0, h if h < 256 else 0,
                        0, 0, hotspot[0], hotspot[1], len(image), 22)
    header = struct.pack('<HHH', 0, 2, 1)   # type=2 cursor
    with open(cur_path, 'wb') as f:
        f.write(header + entry + image)
    print(f'wrote {cur_path}  {w}x{h}  hotspot={hotspot}  bytes={22+len(image)}')

# 手掌模型不变：金手套，悬停张开手 / 按住攥拳
# 直接用已裁好、校准过热点的 26x24 部署版 PNG，保证模型/尺寸/热点一致
png_to_cur(f'{CUR_DIR}/LoLGrab.png',     f'{CUR_DIR}/LoLGrab.cur',     (12, 8))
png_to_cur(f'{CUR_DIR}/LoGGrabbing.png', f'{CUR_DIR}/LoGGrabbing.cur', (12, 8))

# 顺带把箭头也生成 .cur 作为统一稳妥方案（保留 PNG 兜底）
png_to_cur(f'{CUR_DIR}/LoLNormal.png', f'{CUR_DIR}/LoLNormal.cur',   (3, 2))
png_to_cur(f'{CUR_DIR}/LoLHover.png', f'{CUR_DIR}/LoLHover.cur',   (1, 2))
print('done')
