#!/usr/bin/env python3
"""Génère les icônes launcher Android depuis assets/logo_aanid.png."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "frontend" / "assets" / "logo_aanid.png"
RES = ROOT / "frontend" / "android" / "app" / "src" / "main" / "res"
BG = (249, 241, 229, 255)  # #F9F1E5 — thème sable

SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

ADAPTIVE_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}


def compose_icon(size: int, padding_ratio: float = 0.14) -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), BG)
    inner = int(size * (1 - 2 * padding_ratio))
    logo.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    canvas.paste(logo, (x, y), logo)
    return canvas.convert("RGB")


def main() -> None:
    if not LOGO.exists():
        raise SystemExit(f"Logo introuvable: {LOGO}")

    for folder, size in SIZES.items():
        out_dir = RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        icon = compose_icon(size)
        icon.save(out_dir / "ic_launcher.png", "PNG")
        icon.save(out_dir / "ic_launcher_round.png", "PNG")

    for folder, size in ADAPTIVE_SIZES.items():
        out_dir = RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        fg = compose_icon(size, padding_ratio=0.18)
        fg.save(out_dir / "ic_launcher_foreground.png", "PNG")

    anydpi = RES / "mipmap-anydpi-v26"
    anydpi.mkdir(parents=True, exist_ok=True)

    (anydpi / "ic_launcher.xml").write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
""",
        encoding="utf-8",
    )
    (anydpi / "ic_launcher_round.xml").write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
""",
        encoding="utf-8",
    )

    values = RES / "values"
    values.mkdir(parents=True, exist_ok=True)
    colors_file = values / "ic_launcher_background.xml"
    colors_file.write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#F9F1E5</color>
</resources>
""",
        encoding="utf-8",
    )

    print(f"✅ Icônes générées depuis {LOGO.name}")


if __name__ == "__main__":
    main()
