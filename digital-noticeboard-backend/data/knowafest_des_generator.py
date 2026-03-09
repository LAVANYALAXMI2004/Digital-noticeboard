import os
import json
from datetime import datetime
from huggingface_hub import InferenceClient

# --- Hugging Face API details ---
HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    raise ValueError("HF_TOKEN environment variable is not set. Please set it before running this script.")
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"  # ✅ works with chat.completions

client = InferenceClient(api_key=HF_TOKEN)

# Files
input_file = "knowafest_events.json"
output_file = "knowafest_events_with_desc.json"
notices_file = "notices.json"

print(f"📂 Loading events from {input_file}...")
with open(input_file, "r", encoding="utf-8") as f:
    events = json.load(f)
print(f"✅ Loaded {len(events)} events.")

# Generate description for each event
for idx, event in enumerate(events, start=1):
    print(f"\n🔹 Generating description for event {idx}/{len(events)}: {event['title']}")

    prompt = (
        f"Write a short and engaging description for this event:\n\n"
        f"Title: {event['title']}\n"
        f"Type: {event['type']}\n"
        f"Location: {event['location']}\n"
        f"Date: {event['date']}\n"
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )

        description = completion.choices[0].message["content"].strip()
        event["description"] = description
        print(f"✅ Description generated: {description[:60]}...")

    except Exception as e:
        print(f"❌ Failed to generate description for {event['title']}: {e}")
        event["description"] = ""

# Save updated events
print(f"\n💾 Saving events with descriptions to {output_file}...")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(events, f, indent=4, ensure_ascii=False)
print("✅ Events saved!")

# --- Append to notices.json ---
print(f"\n📂 Updating {notices_file} with new notices...")

# Load existing notices if file exists
try:
    with open(notices_file, "r", encoding="utf-8") as f:
        notices = json.load(f)
except FileNotFoundError:
    notices = []

# Find the next ID number
if notices:
    last_id_num = max(int(n["id"].replace("NGPDNB", "")) for n in notices)
else:
    last_id_num = 0

# Append new events as notices
for i, event in enumerate(events, start=1):
    notice_id = f"NGPDNB{last_id_num + i:05d}"
    notice = {
        "id": notice_id,
        "title": event["title"],
        "content": event["description"],
        "type": "external",
        "image": event["poster"],
        "link": event["link"],
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    notices.append(notice)
    print(f"➕ Added notice {notice_id}: {event['title']}")

# Save updated notices.json
with open(notices_file, "w", encoding="utf-8") as f:
    json.dump(notices, f, indent=4, ensure_ascii=False)

print(f"✅ All notices updated and saved to {notices_file}")
