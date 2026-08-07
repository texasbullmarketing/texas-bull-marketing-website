"""Crossed wrenches (crossbones style) logo for Mendoza's Auto Repair."""
from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = r"C:\Users\Admin\Desktop\projects\texas-bull-marketing-website\public\demo\MendozasAutoRepair\assets\images"


def wrench(draw: ImageDraw.ImageDraw, cx: float, cy: float, angle: float) -> None:
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)

    def R(x: float, y: float):
        return (cx + x * ca - y * sa, cy + x * sa + y * ca)

    shaft = [R(-300, -28), R(180, -28), R(180, 28), R(-300, 28)]
    draw.polygon(shaft, fill=(197, 202, 211, 255))
    for gx in (-260, -220, -180):
        draw.line([R(gx, -30), R(gx, 30)], fill=(111, 118, 132, 200), width=8)
    head = [
        R(170, -78),
        R(290, -78),
        R(320, -42),
        R(320, -18),
        R(250, -18),
        R(250, 18),
        R(320, 18),
        R(320, 42),
        R(290, 78),
        R(170, 78),
    ]
    draw.polygon(head, fill=(175, 181, 192, 255))
    cut = [
        R(258, -28),
        R(312, -28),
        R(312, 28),
        R(258, 28),
        R(258, 14),
        R(288, 14),
        R(288, -14),
        R(258, -14),
    ]
    draw.polygon(cut, fill=(18, 9, 26, 255))
    draw.line([R(-290, -16), R(160, -16)], fill=(255, 255, 255, 90), width=6)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((20, 20, size - 20, size - 20), fill=(18, 9, 26, 255))
    d.ellipse((20, 20, size - 20, size - 20), outline=(155, 93, 229, 255), width=18)
    d.ellipse((44, 44, size - 44, size - 44), outline=(123, 63, 184, 140), width=6)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((200, 200, size - 200, size - 200), fill=(123, 63, 184, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    cx = cy = size / 2
    wrench(d, cx, cy, -42)
    wrench(d, cx, cy, 42)

    d.ellipse(
        (cx - 145, cy - 145, cx + 145, cy + 145),
        fill=(30, 15, 48, 255),
        outline=(196, 161, 240, 255),
        width=10,
    )
    try:
        font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 180)
    except OSError:
        font = ImageFont.load_default()
    bb = d.textbbox((0, 0), "M", font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text((cx - tw / 2, cy - th / 2 - 14), "M", fill=(244, 238, 248, 255), font=font)

    img.save(os.path.join(OUT, "logo-mark.png"), "PNG")
    img.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(OUT, "favicon.png"), "PNG")

    w, h = 720, 160
    wm = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sm = img.resize((128, 128), Image.Resampling.LANCZOS)
    wm.paste(sm, (6, 16), sm)
    dw = ImageDraw.Draw(wm)
    try:
        f1 = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 44)
        f2 = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 16)
    except OSError:
        f1 = f2 = ImageFont.load_default()
    dw.text((150, 36), "MENDOZA'S", fill=(244, 238, 248, 255), font=f1)
    dw.text((152, 92), "AUTO REPAIR  |  PAINT + BODY", fill=(196, 161, 240, 255), font=f2)
    wm.save(os.path.join(OUT, "logo-nav.png"), "PNG")
    print("logo ok")


if __name__ == "__main__":
    main()
