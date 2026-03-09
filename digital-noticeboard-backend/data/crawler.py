import requests
from bs4 import BeautifulSoup
import time
import subprocess
import json

BASE_URL = "https://www.knowafest.com/explore/events"

def fetch_event_list(page=1):
    url = f"{BASE_URL}?page={page}"
    res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(res.text, "html.parser")

    events = []
    for card in soup.select("a.card"):  
        link = "https://www.knowafest.com/" + card["href"].lstrip("/")
        link = link.replace("/events/", "/explore/events/")

        img_tag = card.select_one("img.card-img")
        poster = None
        if img_tag:
            poster = img_tag["src"].replace("/thumbs/", "/uploads/")

        title_tag = card.select_one("p.card-text")
        title = title_tag.get_text(strip=True) if title_tag else None

        badge = card.select_one("span.badge")
        event_type = badge.get_text(strip=True) if badge else None

        body_p = card.select_one(".card-body p")
        location, date = None, None
        if body_p:
            txt = body_p.get_text(" ", strip=True)
            if " - " in txt:
                parts = txt.split(" - ", 1)
                location, date = parts[0].strip(), parts[1].strip()

        events.append({
            "title": title,
            "poster": poster,
            "type": event_type,
            "location": location,
            "date": date,
            "link": link 
        })

    return events


def crawl_knowafest(pages=None, delay=1):
    all_events = []
    seen_links = set()

    page = 1
    while True:
        if pages is not None and page > pages:
            break

        print(f"🔎 Fetching page {page}...")
        event_list = fetch_event_list(page)
        print(f"   ➡️ Found {len(event_list)} events")

        if not event_list:
            break

        for event in event_list:
            link = event.get("link")
            if link and link in seen_links:
                continue
            if link:
                seen_links.add(link)
            all_events.append(event)

        page += 1
        time.sleep(delay)

    return all_events



if __name__ == "__main__":
    run_interval_days = 2
    run_interval_seconds = run_interval_days * 24 * 60 * 60

    while True:
        events = crawl_knowafest(pages=None)
        print(f"\n✅ Crawled total {len(events)} events")

        with open("knowafest_events.json", "w", encoding="utf-8") as f:
            json.dump(events, f, indent=4, ensure_ascii=False)

        print("📂 Events saved to knowafest_events.json")

        print("\n⚡ Generating descriptions using knowafest_des_generator.py ...")
        subprocess.run(["python3", "knowafest_des_generator.py"], check=True)
        print("✅ All done!")

        print(f"\n⏳ Sleeping for {run_interval_days} days before next run...")
        time.sleep(run_interval_seconds)