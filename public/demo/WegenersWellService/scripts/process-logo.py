"""Process Wageners logo -> transparent PNGs (full, mark, nav, favicon)."""
from __future__ import annotations

import os
from collections import deque

from PIL import Image, ImageFilter

SRC = r"C:\Users\Admin\Downloads\grok-image-3b61990e-2d7d-4036-a99e-9e95199a0db2.jpg"
OUT = r"C:\Users\Admin\Desktop\projects\texas-bull-marketing-website\public\demo\WegenersWellService\assets"


def is_light(r: int, g: int, b: int, thr: int = 240) -> bool:
    return r >= thr and g >= thr and b >= thr and abs(r - g) <= 12 and abs(g - b) <= 12


def is_logo_body(r: int, g: int, b: int) -> bool:
    if is_light(r, g, b, thr=235):
        return False
    # blues
    if b > r + 8 and b > 55:
        return True
    # bronze / tan
    if r > 90 and 50 < g < 175 and b < 130 and r >= b - 10:
        return True
    # navy text
    if r < 55 and g < 70 and b < 120:
        return True
    # other non-white logo pixels
    if (r + g + b) < 620 and max(r, g, b) - min(r, g, b) > 12:
        return True
    return False


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    orig = Image.open(SRC).convert("RGBA")
    w, h = orig.size
    data = list(orig.getdata())

    body = Image.new("L", (w, h), 0)
    bp = body.load()
    for i, (r, g, b, a) in enumerate(data):
        if is_logo_body(r, g, b):
            bp[i % w, i // w] = 255

    body_thin = body
    for _ in range(2):
        body_thin = body_thin.filter(ImageFilter.MaxFilter(3))
    body_wide = body
    for _ in range(10):
        body_wide = body_wide.filter(ImageFilter.MaxFilter(5))
    bt = body_thin.load()
    bw = body_wide.load()

    out = bytearray(w * h * 4)
    for i, (r, g, b, a) in enumerate(data):
        out[i * 4 : i * 4 + 4] = bytes((r, g, b, a))

    def get(x: int, y: int):
        i = (y * w + x) * 4
        return out[i], out[i + 1], out[i + 2], out[i + 3]

    def set_(x: int, y: int, r: int, g: int, b: int, a: int) -> None:
        i = (y * w + x) * 4
        out[i], out[i + 1], out[i + 2], out[i + 3] = r, g, b, a

    # Flood-fill exterior white; do not cross thin body
    visited = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        vi = y * w + x
        if visited[vi]:
            continue
        visited[vi] = 1
        if bt[x, y] > 0:
            continue
        r, g, b, a = get(x, y)
        if not is_light(r, g, b, thr=238):
            continue
        set_(x, y, 255, 255, 255, 0)
        q.append((x + 1, y))
        q.append((x - 1, y))
        q.append((x, y + 1))
        q.append((x, y - 1))

    # Restore interior whites (droplet ring) under wide body mask
    restored = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = get(x, y)
            if a != 0:
                continue
            or_, og, ob, _ = data[y * w + x]
            if not is_light(or_, og, ob, thr=220):
                continue
            if bw[x, y] == 0:
                continue
            # prefer pockets near actual body
            near = 0
            for dy in (-8, -4, 0, 4, 8):
                for dx in (-8, -4, 0, 4, 8):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and body.getpixel((nx, ny)) > 0:
                        near += 1
            if near < 2 and bt[x, y] == 0:
                continue
            set_(x, y, or_, og, ob, 255)
            restored += 1
    print("restored white", restored)

    # Strip outer white halo not on thin body
    for y in range(h):
        for x in range(w):
            r, g, b, a = get(x, y)
            if a == 0 or not is_light(r, g, b, thr=242):
                continue
            if bt[x, y] > 0:
                continue
            t = 0
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or get(nx, ny)[3] == 0:
                    t += 1
            if t >= 2:
                set_(x, y, 255, 255, 255, 0)

    # Letter counters transparent in lower half
    for y in range(int(h * 0.62), h):
        for x in range(w):
            r, g, b, a = get(x, y)
            if a == 0 or r < 230 or g < 230 or b < 230:
                continue
            navy = 0
            for dy in range(-3, 4):
                for dx in range(-3, 4):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        rr, gg, bb, aa = get(nx, ny)
                        if aa > 200 and rr < 55 and gg < 65 and bb < 100:
                            navy += 1
            if navy >= 8:
                set_(x, y, 255, 255, 255, 0)

    img = Image.frombytes("RGBA", (w, h), bytes(out))
    bbox = img.getbbox()
    print("bbox", bbox)
    cropped = img.crop(bbox)
    pad = 28
    full = Image.new("RGBA", (cropped.width + pad * 2, cropped.height + pad * 2), (0, 0, 0, 0))
    full.paste(cropped, (pad, pad), cropped)
    full.save(os.path.join(OUT, "logo.png"), "PNG")
    print("full", full.size)

    # Mark = icon only (cut before wordmark). Use ~72% height for W monogram.
    aw, ah = full.size
    fp = full.load()
    row_navy = [0] * ah
    for y in range(ah):
        n = 0
        for x in range(aw):
            r, g, b, a = fp[x, y]
            if a > 200 and r < 50 and g < 60 and b < 95:
                n += 1
        row_navy[y] = n

    # Wordmark is dense flat navy in lower band — find first strong band after mid
    text_top = None
    for y in range(int(ah * 0.58), ah):
        if row_navy[y] > aw * 0.14:
            # confirm it's a text row (wide horizontal span of navy)
            text_top = y - 18
            break
    # Fallback: 74% of height keeps full W + droplet
    cut = text_top if text_top and text_top > ah * 0.55 else int(ah * 0.74)
    # Ensure we don't cut through W: scan upward for gap (low navy, low blue body)
    print("text_top", text_top, "cut", cut)

    mark = full.crop((0, 0, aw, cut))
    mb = mark.getbbox()
    if mb:
        mark = mark.crop(mb)
    padm = 24
    mp = Image.new("RGBA", (mark.width + padm * 2, mark.height + padm * 2), (0, 0, 0, 0))
    mp.paste(mark, (padm, padm), mark)
    mark = mp
    mark.save(os.path.join(OUT, "logo-mark.png"), "PNG")
    print("mark", mark.size)

    side = max(mark.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2), mark)
    sq.save(os.path.join(OUT, "logo-nav.png"), "PNG")
    print("nav", sq.size)

    icon = mark.copy()
    icon.thumbnail((256, 256), Image.Resampling.LANCZOS)
    icon.save(os.path.join(OUT, "favicon.png"), "PNG")
    print("done")


if __name__ == "__main__":
    main()
