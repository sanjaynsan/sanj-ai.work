import os
import json
import re

# ==============================
# CONFIG
# ==============================

PROJECTS_DIR = "projects"
OUTPUT_FILE = "projects.json"

CATEGORY_MAP = {
    "URBAN": "Urban Computation",
    "AI": "Planetary Computation",
    "FABRICATION": "Fabrication",
    "ARCH": "Architecture",
    "AEC_AI": "AEC AI",
    "AEC_AUTOMATION": "AEC Automation"
}

MEDIA_EXTENSIONS = {
    "image": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "video": [".mp4", ".webm"],
    "pdf": [".pdf"]
}

# ==============================
# HELPERS
# ==============================

def extract_order(folder_name):
    """
    Extracts order number from folder name:
    FABRICATION_01_CLAY_PRINTING → 1
    """
    match = re.search(r"_(\d+)_", folder_name)
    return int(match.group(1)) if match else 999


def extract_category(folder_name):
    """
    Extracts category key from folder name
    """
    prefix = folder_name.split("_")[0]
    return CATEGORY_MAP.get(prefix, "Other")


def extract_title(folder_name):
    """
    Removes PREFIX_01_ and converts to readable title
    """
    title = re.sub(r"^[A-Z_]+_\d+_", "", folder_name)
    return title.replace("_", " ").title()


def detect_media(folder_path, web_path):
    media = []

    files = sorted(os.listdir(folder_path))

    for file in files:
        if not re.match(r"\d+_", file):
            continue

        ext = os.path.splitext(file)[1].lower()

        for media_type, extensions in MEDIA_EXTENSIONS.items():
            if ext in extensions:
                media.append({
                    "type": media_type,
                    # FORCE WEB PATH
                    "src": f"{web_path}/{file}".replace("\\", "/")
                })

    return media


def detect_cover(folder_path, web_path):
    for name in ["cover.png", "cover.jpg", "cover.jpeg", "cover.webp", "cover.gif"]:
        if os.path.exists(os.path.join(folder_path, name)):
            return f"{web_path}/{name}".replace("\\", "/")
    return None


# ==============================
# MAIN
# ==============================

projects = []

for folder in sorted(os.listdir(PROJECTS_DIR)):
    folder_path = os.path.join(PROJECTS_DIR, folder)

    if not os.path.isdir(folder_path):
        continue

    web_path = f"{PROJECTS_DIR}/{folder}"

    project = {
        "id": folder.lower(),
        "title": extract_title(folder),
        "category": extract_category(folder),
        "order": extract_order(folder),
        "coverImage": detect_cover(folder_path, web_path),
        "quote": None,
        "media": detect_media(folder_path, web_path)
    }

    projects.append(project)

# Sort projects by category then order
projects.sort(key=lambda p: (p["category"], p["order"]))

# Write JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(projects, f, indent=2)

print(f"✅ Generated {OUTPUT_FILE} with {len(projects)} projects")
