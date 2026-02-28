#!/usr/bin/env python3
"""
Generate assets for The Ritual macOS app.
Creates: icon.png (1024x1024), dmg-bg.png
Then converts to icon.icns using iconutil.
"""
import struct, zlib, os, math

def write_png(path, width, height, pixel_fn):
    """Write a PNG file using pixel_fn(x, y) -> (r, g, b, a)."""
    def pack_chunk(name, data):
        c = zlib.crc32(name + data) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type none
        for x in range(width):
            r, g, b, a = pixel_fn(x, y)
            raw.extend([r, g, b, a])

    compressed = zlib.compress(bytes(raw), 9)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # RGB, no alpha
    # Use RGBA
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # RGBA

    png = b'\x89PNG\r\n\x1a\n'
    png += pack_chunk(b'IHDR', ihdr)
    png += pack_chunk(b'IDAT', compressed)
    png += pack_chunk(b'IEND', b'')

    with open(path, 'wb') as f:
        f.write(png)

def clamp(v): return max(0, min(255, int(v)))

def icon_pixel(x, y, size=1024):
    cx, cy = size / 2, size / 2
    nx = (x - cx) / (size / 2)
    ny = (y - cy) / (size / 2)
    dist = math.sqrt(nx*nx + ny*ny)

    # Background: deep ink circle
    bg_r, bg_g, bg_b = 0x1a, 0x12, 0x09
    # Amber glow from center
    glow = max(0, 1 - dist * 1.3)
    glow2 = glow ** 2.5

    r = clamp(bg_r + glow2 * (0xc9 - bg_r) * 0.9)
    g = clamp(bg_g + glow2 * (0x7d - bg_g) * 0.7)
    b = clamp(bg_b + glow2 * (0x2e - bg_b) * 0.4)

    # Outer ring
    ring = abs(dist - 0.88)
    if ring < 0.015:
        ring_v = (1 - ring / 0.015) * 0.6
        r = clamp(r + ring_v * 0xe8)
        g = clamp(g + ring_v * 0xb8)
        b = clamp(b + ring_v * 0x4b)

    # Alpha: circular mask with soft edge
    a = clamp(255 * max(0, 1 - max(0, dist - 0.92) / 0.08))

    return r, g, b, a

def dmg_bg_pixel(x, y, w=540, h=380):
    # Dark parchment / ink gradient
    nx = x / w
    ny = y / h
    r = clamp(0x1a + nx * 8)
    g = clamp(0x12 + ny * 4)
    b = clamp(0x09 + nx * 3)
    # Subtle amber line at top
    if y < 2:
        r, g, b = 0x8a, 0x55, 0x20
    return r, g, b, 255

os.makedirs('assets', exist_ok=True)

print('Generating icon.png...')
write_png('assets/icon.png', 1024, 1024, icon_pixel)
print('Generating dmg-bg.png...')
write_png('assets/dmg-bg.png', 540, 380, dmg_bg_pixel)
print('Assets generated.')
