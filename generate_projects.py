import json
import os
import re

PROJECTS_DIR = "projects"
OUTPUT_FILE = "projects.json"

CATEGORY_MAP = {
    "URBAN": "Urban Computation",
    "PI": "Planetary Computation",
    "FABRICATION": "Fabrication",
    "ARCH": "Architecture",
    "AEC_AI": "AEC AI",
    "AEC_AUTOMATION": "AEC Automation"
}

def detect_category(folder):
    for key in CATEGORY_MAP:
        if folder.startswith(key):
            return CATEGORY_MAP[key]
    return "Uncategorized"

def extract_order(folder):
    # FIXED REGEX ✅
    match = re.search(r"_(\d+)_", folder)
    return int(match.group(1)) if match else 999

def extract_title(folder):
    name = folder

    # Remove category prefix
    for key in CATEGORY_MAP:
        if name.startswith(key + "_"):
            name = name[len(key) + 1:]
            break

    # Remove leading number (01_, 02_, etc.)
    name = re.sub(r"^\d+_", "", name)

    # Replace underscores
    name = name.replace("_", " ")

    return name.title()

def ordered_files(files):
    def order_key(name):
        match = re.match(r"(\d+)", name)
        return int(match.group(1)) if match else 999
    return sorted(files, key=order_key)

projects = []

for folder in os.listdir(PROJECTS_DIR):
    path = os.path.join(PROJECTS_DIR, folder)
    if not os.path.isdir(path):
        continue

    meta_path = os.path.join(path, "meta.json")
    if not os.path.exists(meta_path):
        continue

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    category = detect_category(folder)
    order = extract_order(folder)
    title = extract_title(folder)

    media = []
    quote = None

    files = ordered_files(os.listdir(path))

    for file in files:
        full_path = f"{path}/{file}"

        if file.lower().endswith((".jpg", ".png")) and file != "cover.jpg":
            media.append({"type": "image", "src": full_path})

        elif file.lower().endswith(".pdf"):
            media.append({"type": "pdf", "src": full_path})

        elif file == "video.txt":
            with open(os.path.join(path, file)) as v:
                media.append({"type": "video", "src": v.read().strip()})

        elif file == "link.txt":
            with open(os.path.join(path, file)) as l:
                media.append({"type": "link", "src": l.read().strip()})

        elif file == "quote.txt":
            with open(os.path.join(path, file)) as q:
                quote = q.read().strip()

    projects.append({
        "id": folder.lower().replace(" ", "-"),
        "title": title,
        "year": meta.get("year"),
        "category": category,
        "order": order,
        "coverImage": f"{path}/cover.jpg",
        "quote": quote,
        "media": media
    })

# SORT: category → order
projects.sort(key=lambda p: (p["category"], p["order"]))

with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
    json.dump(projects, out, indent=2)

print("✅ projects.json generated correctly (ordering fixed)")