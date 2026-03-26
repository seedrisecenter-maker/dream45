# -*- coding: utf-8 -*-
"""
FFmpeg-based Shorts video generator.
Creates motivational quote videos with text overlay and background.
Usage: python scripts/create_shorts.py --quote 11
       python scripts/create_shorts.py --range 11-20
"""

import io
import sys
import os
import json
import subprocess
import math
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent.parent
QUOTES_FILE = BASE_DIR / 'data' / 'quotes.json'
OUTPUT_DIR = BASE_DIR / 'videos' / 'final'
FONT_DIR = BASE_DIR / 'scripts' / 'fonts'

# Brand colors
THEMES = {
    'dream':     {'bg1': '1B1464', 'bg2': '0D1B2A', 'accent': 'C5B4E3'},
    'challenge': {'bg1': 'E8590C', 'bg2': '0D1B2A', 'accent': 'FFD97D'},
    'hope':      {'bg1': '2D6A4F', 'bg2': '0D1B2A', 'accent': '95D5B2'},
    'courage':   {'bg1': '9B2226', 'bg2': '0D1B2A', 'accent': 'F4A261'},
}

# Video settings
WIDTH = 1080
HEIGHT = 1920
FPS = 30
DURATION = 45  # seconds


def load_quotes():
    """Load quotes from JSON file."""
    with open(QUOTES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_font_path():
    """Find a suitable font for Korean text."""
    font_candidates = [
        r'C\:/Windows/Fonts/malgunbd.ttf',
        r'C\:/Windows/Fonts/malgun.ttf',
        r'C\:/Windows/Fonts/NanumGothicBold.ttf',
    ]
    for fp in font_candidates:
        real = fp.replace('C\\:', 'C:')
        if os.path.exists(real):
            return fp
    return 'Arial'


def escape_ffmpeg_text(text: str) -> str:
    """Escape special characters for FFmpeg drawtext filter."""
    text = text.replace("'", u"\u2019")
    text = text.replace('"', u"\u201C")
    text = text.replace(':', u"\uFF1A")
    text = text.replace('%', '%%')
    text = text.replace('\\', '/')
    return text


def create_short(quote: dict, output_num: int):
    """Create a single Shorts video from a quote."""
    theme_name = quote.get('theme', 'dream')
    theme = THEMES.get(theme_name, THEMES['dream'])
    bg1 = theme['bg1']
    bg2 = theme['bg2']
    accent = theme['accent']

    ko_text = quote['ko']
    en_text = quote['en']
    author = quote['author']
    num_str = f'{output_num:02d}'
    output_file = OUTPUT_DIR / f'short-{num_str}.mp4'

    print(f'\n  Creating short-{num_str}: "{ko_text[:30]}..." -- {author}')

    font = get_font_path()

    # Split Korean text into lines (max ~12 chars per line)
    ko_words = ko_text
    lines = []
    current = ''
    for char in ko_words:
        current += char
        if len(current) >= 12 and char in '을를이가은는에서도의 ,.' or char == ' ':
            lines.append(current.strip())
            current = ''
    if current.strip():
        lines.append(current.strip())
    ko_display = '\\n'.join(lines) if lines else ko_text

    # Escape texts for FFmpeg
    ko_escaped = escape_ffmpeg_text(ko_display)
    en_escaped = escape_ffmpeg_text(en_text)
    author_escaped = escape_ffmpeg_text(f'-- {author}')
    num_escaped = escape_ffmpeg_text(f'#{num_str}')

    # Build FFmpeg filter complex
    filter_parts = []

    # 1. Gradient background
    filter_parts.append(
        f"color=c=0x{bg2}:s={WIDTH}x{HEIGHT}:d={DURATION}:r={FPS}[bg0]"
    )
    # Overlay gradient effect
    filter_parts.append(
        f"color=c=0x{bg1}:s={WIDTH}x{int(HEIGHT*0.6)}:d={DURATION}[grad]"
    )
    filter_parts.append(
        f"[grad]format=rgba,colorchannelmixer=aa=0.4[grad_a]"
    )
    filter_parts.append(
        f"[bg0][grad_a]overlay=0:0[bg]"
    )

    # 2. Stars (small white dots)
    import random
    random.seed(output_num)
    star_bg = '[bg]'
    for si in range(15):
        sx = random.randint(50, WIDTH - 50)
        sy = random.randint(50, HEIGHT - 200)
        sr = random.randint(2, 4)
        sa = random.uniform(0.3, 0.8)
        opacity_val = int(sa * 255)
        star_name = f'star{si}'
        filter_parts.append(
            f"color=c=white:s={sr*2}x{sr*2}:d={DURATION}[{star_name}c]"
        )
        filter_parts.append(
            f"[{star_name}c]format=rgba,colorchannelmixer=aa={sa:.1f}[{star_name}a]"
        )
        filter_parts.append(
            f"{star_bg}[{star_name}a]overlay={sx}:{sy}[bg{si+1}]"
        )
        star_bg = f'[bg{si+1}]'

    final_bg = star_bg

    # 3. Number label (top left)
    filter_parts.append(
        f"{final_bg}drawtext=text='{num_escaped}':"
        f"fontfile='{font}':fontsize=36:fontcolor=0x{accent}@0.4:"
        f"x=60:y=120:enable='gte(t,0.5)'[bg_num]"
    )

    # 4. Main quote text (Korean) - fade in
    filter_parts.append(
        f"[bg_num]drawtext=text='{ko_escaped}':"
        f"fontfile='{font}':fontsize=64:fontcolor=white:"
        f"x=(w-text_w)/2:y=(h-text_h)/2-100:"
        f"line_spacing=24:"
        f"enable='gte(t,2)':alpha='if(lt(t,3),(t-2),1)'[bg_ko]"
    )

    # 5. Author - fade in later
    filter_parts.append(
        f"[bg_ko]drawtext=text='{author_escaped}':"
        f"fontfile='{font}':fontsize=32:fontcolor=0x{accent}:"
        f"x=(w-text_w)/2:y=(h/2)+120:"
        f"enable='gte(t,4)':alpha='if(lt(t,5),(t-4),1)'[bg_author]"
    )

    # 6. English quote - smaller, below
    filter_parts.append(
        f"[bg_author]drawtext=text='{en_escaped}':"
        f"fontfile='{font}':fontsize=28:fontcolor=white@0.6:"
        f"x=(w-text_w)/2:y=(h/2)+200:"
        f"enable='gte(t,5)':alpha='if(lt(t,6),(t-5),1)'[bg_en]"
    )

    # 7. Brand watermark (bottom)
    brand_text = escape_ffmpeg_text('Dreaming 45')
    filter_parts.append(
        f"[bg_en]drawtext=text='{brand_text}':"
        f"fontfile='{font}':fontsize=24:fontcolor=0x{accent}@0.5:"
        f"x=(w-text_w)/2:y=h-120:"
        f"enable='gte(t,1)'[final]"
    )

    filter_str = ';'.join(filter_parts)

    # Build FFmpeg command
    cmd = [
        'ffmpeg', '-y',
        '-f', 'lavfi', '-i', f'anullsrc=r=44100:cl=stereo:d={DURATION}',
        '-filter_complex', filter_str,
        '-map', '[final]',
        '-map', '0:a',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-r', str(FPS),
        '-t', str(DURATION),
        '-shortest',
        str(output_file)
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=120
        )
        if result.returncode == 0:
            size_mb = output_file.stat().st_size / (1024 * 1024)
            print(f'  [OK] Created: short-{num_str}.mp4 ({size_mb:.1f} MB)')
            return True
        else:
            print(f'  [X] FFmpeg error: {result.stderr[-300:]}')
            return False
    except subprocess.TimeoutExpired:
        print(f'  [X] FFmpeg timed out')
        return False
    except Exception as e:
        print(f'  [X] Error: {e}')
        return False


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Dream45 Shorts Video Generator')
    parser.add_argument('--quote', type=int, help='Generate video for quote number (e.g., 11)')
    parser.add_argument('--range', type=str, help='Generate range of quotes (e.g., 11-20)')
    parser.add_argument('--list', action='store_true', help='List available quotes')
    args = parser.parse_args()

    quotes = load_quotes()

    if args.list:
        print(f'\nAvailable quotes: {len(quotes)}\n')
        for i, q in enumerate(quotes, 1):
            print(f'  {i:3d}. [{q.get("theme", "?")}] {q["ko"][:40]} -- {q["author"]}')
        return

    if not args.quote and not args.range:
        parser.print_help()
        print('\nExamples:')
        print('  python scripts/create_shorts.py --list           # List all quotes')
        print('  python scripts/create_shorts.py --quote 11       # Create short for quote #11')
        print('  python scripts/create_shorts.py --range 11-20    # Create shorts #11 to #20')
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print('\n' + '=' * 50)
    print('  Dream 45 -- Shorts Video Generator')
    print('=' * 50)

    if args.quote:
        idx = args.quote - 1
        if idx < 0 or idx >= len(quotes):
            print(f'Quote {args.quote} not found (max: {len(quotes)})')
            return
        create_short(quotes[idx], args.quote)

    elif args.range:
        start, end = map(int, args.range.split('-'))
        created = 0
        for num in range(start, end + 1):
            idx = num - 1
            if idx < 0 or idx >= len(quotes):
                print(f'  [!] Quote {num} not found, skipping')
                continue
            if create_short(quotes[idx], num):
                created += 1

        print(f'\n  Done! Created {created}/{end - start + 1} videos')

    print()


if __name__ == '__main__':
    main()
