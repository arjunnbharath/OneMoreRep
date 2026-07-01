#!/usr/bin/env python3
"""
Prepare workout demo videos for OneMoreRep.

1. Tries Kaggle dataset (hasyimabdillah/workoutfitness-video) if credentials exist
2. Falls back to Mixkit free stock clips so the app works without Kaggle

Setup Kaggle (optional):
  - Create token at https://www.kaggle.com/settings
  - Add to .env: KAGGLE_USERNAME=... and KAGGLE_KEY=...
  - Or place kaggle.json in ~/.kaggle/

Usage:
  npm run prepare:videos
"""

from __future__ import annotations

import json
import os
import re
import shutil
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "workoutfitness-video"
OUT_DIR = ROOT / "public" / "videos" / "workouts"
MANIFEST_PATH = ROOT / "public" / "workout-videos-manifest.json"
ENV_PATH = ROOT / ".env"

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

# Mixkit free-license clips (720p) — used when Kaggle is unavailable
FALLBACK_VIDEO_URLS: dict[str, str] = {
    "barbell-biceps-curl": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "bench-press": "https://assets.mixkit.co/active_storage/video_items/100543/1725384976/100543-video-720.mp4",
    "chest-fly-machine": "https://assets.mixkit.co/active_storage/video_items/100543/1725384976/100543-video-720.mp4",
    "deadlift": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "decline-bench-press": "https://assets.mixkit.co/active_storage/video_items/100543/1725384976/100543-video-720.mp4",
    "hammer-curl": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "hip-thrust": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "incline-bench-press": "https://assets.mixkit.co/active_storage/video_items/100543/1725384976/100543-video-720.mp4",
    "lat-pulldown": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "lateral-raise": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "leg-extension": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "leg-raises": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "plank": "https://assets.mixkit.co/videos/24434/24434-720.mp4",
    "pull-up": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "push-up": "https://assets.mixkit.co/videos/24434/24434-720.mp4",
    "romanian-deadlift": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "russian-twist": "https://assets.mixkit.co/videos/24434/24434-720.mp4",
    "shoulder-press": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "squat": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
    "tricep-dips": "https://assets.mixkit.co/videos/24434/24434-720.mp4",
    "tricep-pushdown": "https://assets.mixkit.co/videos/24434/24434-720.mp4",
    "row": "https://assets.mixkit.co/videos/52082/52082-720.mp4",
}

CATEGORY_META = [
    ("barbell-biceps-curl", "barbell biceps curl", "Barbell Biceps Curl"),
    ("bench-press", "bench press", "Bench Press"),
    ("chest-fly-machine", "chest fly machine", "Chest Fly Machine"),
    ("deadlift", "deadlift", "Deadlift"),
    ("decline-bench-press", "decline bench press", "Decline Bench Press"),
    ("hammer-curl", "hammer curl", "Hammer Curl"),
    ("hip-thrust", "hip thrust", "Hip Thrust"),
    ("incline-bench-press", "incline bench press", "Incline Bench Press"),
    ("lat-pulldown", "lat pulldown", "Lat Pulldown"),
    ("lateral-raise", "lateral raise", "Lateral Raise"),
    ("leg-extension", "leg extension", "Leg Extension"),
    ("leg-raises", "leg raises", "Leg Raises"),
    ("plank", "plank", "Plank"),
    ("pull-up", "pull up", "Pull Up"),
    ("push-up", "push up", "Push Up"),
    ("romanian-deadlift", "romanian deadlift", "Romanian Deadlift"),
    ("russian-twist", "russian twist", "Russian Twist"),
    ("shoulder-press", "shoulder press", "Shoulder Press"),
    ("squat", "squat", "Squat"),
    ("tricep-dips", "tricep dips", "Tricep Dips"),
    ("tricep-pushdown", "tricep pushdown", "Tricep Pushdown"),
    ("row", "row", "Row"),
]


def slugify(name: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", name.lower().strip()))


def load_dotenv() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def configure_kaggle_auth() -> None:
    load_dotenv()
    token = os.environ.get("KAGGLE_API_TOKEN")
    if token and not os.environ.get("KAGGLE_KEY"):
        os.environ["KAGGLE_KEY"] = token


def has_kaggle_credentials() -> bool:
    configure_kaggle_auth()
    if os.environ.get("KAGGLE_API_TOKEN"):
        return True
    if os.environ.get("KAGGLE_USERNAME") and os.environ.get("KAGGLE_KEY"):
        return True
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    return kaggle_json.exists()


def download_kaggle_dataset() -> Path | None:
    if not has_kaggle_credentials():
        print("No Kaggle credentials — skipping Kaggle download.")
        print("  Add KAGGLE_USERNAME + KAGGLE_API_TOKEN to .env")
        return None

    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
    except ImportError:
        print("Kaggle package not installed. Run: pip install -r scripts/requirements.txt")
        return None

    if DATA_DIR.exists():
        shutil.rmtree(DATA_DIR)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("Downloading from Kaggle (hasyimabdillah/workoutfitness-video)...")
    api = KaggleApi()
    api.authenticate()
    api.dataset_download_files(
        "hasyimabdillah/workoutfitness-video",
        path=str(DATA_DIR),
        unzip=True,
        quiet=False,
    )
    print(f"Kaggle data saved to {DATA_DIR}")
    return find_dataset_root(DATA_DIR)


def find_dataset_root(path: Path) -> Path:
    if not path.exists():
        return path
    dirs = [p for p in path.iterdir() if p.is_dir()]
    if len(dirs) == 1 and not any(p.suffix.lower() in VIDEO_EXTENSIONS for p in path.iterdir()):
        return dirs[0]
    return path


def pick_sample_video(folder: Path) -> Path | None:
    videos = [p for p in folder.rglob("*") if p.suffix.lower() in VIDEO_EXTENSIONS]
    if not videos:
        return None
    return min(videos, key=lambda p: p.stat().st_size)


def download_url(url: str, dest: Path) -> None:
    print(f"  downloading {dest.name}...")
    req = urllib.request.Request(url, headers={"User-Agent": "OneMoreRep/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        dest.write_bytes(response.read())


def build_from_kaggle(source_path: Path) -> list[dict]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    categories: list[dict] = []

    for folder in sorted(source_path.iterdir()):
        if not folder.is_dir():
            continue

        folder_name = folder.name
        category_id = slugify(folder_name)
        sample = pick_sample_video(folder)
        available = False
        video_path = f"/videos/workouts/{category_id}.mp4"

        if sample:
            dest = OUT_DIR / f"{category_id}{sample.suffix.lower()}"
            shutil.copy2(sample, dest)
            video_path = f"/videos/workouts/{dest.name}"
            available = True
            print(f"  + Kaggle: {folder_name} -> {dest.name}")

        categories.append(
            {
                "id": category_id,
                "folderName": folder_name,
                "label": folder_name.title(),
                "videoPath": video_path,
                "available": available,
                "source": "kaggle",
            }
        )

    return categories


def build_from_fallback() -> list[dict]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    categories: list[dict] = []

    for category_id, folder_name, label in CATEGORY_META:
        url = FALLBACK_VIDEO_URLS.get(category_id)
        dest = OUT_DIR / f"{category_id}.mp4"
        available = False
        video_path = f"/videos/workouts/{category_id}.mp4"

        if url:
            try:
                download_url(url, dest)
                available = dest.exists() and dest.stat().st_size > 0
            except Exception as err:  # noqa: BLE001
                print(f"  ! failed {category_id}: {err}")

        if available:
            print(f"  + Fallback: {label}")

        categories.append(
            {
                "id": category_id,
                "folderName": folder_name,
                "label": label,
                "videoPath": video_path,
                "available": available,
                "source": "mixkit-fallback",
            }
        )

    return categories


def merge_kaggle_with_fallback(kaggle_categories: list[dict]) -> list[dict]:
    """Fill missing Kaggle categories with fallback downloads."""
    by_id = {c["id"]: c for c in kaggle_categories}
    fallback = build_from_fallback()
    for item in fallback:
        existing = by_id.get(item["id"])
        if existing and existing.get("available"):
            continue
        if item["available"]:
            by_id[item["id"]] = item
    return list(by_id.values())


def main() -> None:
    configure_kaggle_auth()
    kaggle_source = None

    if has_kaggle_credentials():
        kaggle_source = download_kaggle_dataset()
    elif DATA_DIR.exists() and any(DATA_DIR.iterdir()):
        kaggle_source = find_dataset_root(DATA_DIR)
        print(f"Using cached Kaggle data at {kaggle_source}")

    if kaggle_source and kaggle_source.exists():
        print("Preparing videos from Kaggle dataset...")
        categories = build_from_kaggle(kaggle_source)
        ready = sum(1 for c in categories if c["available"])
        if ready < len(CATEGORY_META) // 2:
            print("Kaggle copy incomplete — filling gaps with fallback clips...")
            categories = merge_kaggle_with_fallback(categories)
    else:
        print("Preparing fallback demo videos (Mixkit)...")
        categories = build_from_fallback()

    manifest = {
        "source": "hasyimabdillah/workoutfitness-video",
        "sourceUrl": "https://www.kaggle.com/datasets/hasyimabdillah/workoutfitness-video",
        "categoryCount": len(categories),
        "categories": sorted(categories, key=lambda c: c["label"]),
    }

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    ready = sum(1 for c in categories if c["available"])
    print(f"\nDone: {ready}/{len(categories)} exercise videos ready")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Videos:   {OUT_DIR}")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:  # noqa: BLE001
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)
