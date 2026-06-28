import urllib.request
import xml.etree.ElementTree as ET
import re

feeds = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.theverge.com/rss/artificial-intelligence/index.xml",
    "https://www.artificialintelligence-news.com/feed/"
]

priority_keywords = ["collab", "partner", "join", "team up", "world", "global", "acquire", "merge", "invest", "launch"]

news = []
for feed in feeds:
    try:
        req = urllib.request.Request(feed, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            xml_data = response.read()
            
            xml_str = xml_data.decode('utf-8')
            xml_str = re.sub(r'\sxmlns="[^"]+"', '', xml_str, count=1)
            root = ET.fromstring(xml_str)
            
            items = root.findall('./channel/item')
            if not items:
                items = root.findall('./entry')
                
            print(f"Feed {feed} found {len(items)} items")
            for item in items[:12]:
                title_el = item.find('title')
                desc_el = item.find('description')
                if desc_el is None:
                    desc_el = item.find('summary') 
                    if desc_el is None:
                        desc_el = item.find('content')
                    
                title = title_el.text if title_el is not None else ""
                desc = desc_el.text if desc_el is not None else ""
                
                desc = re.sub('<[^<]+?>', '', desc).strip()
                
                if title:
                    title_lower = title.lower()
                    score = 0
                    for pk in priority_keywords:
                        if pk in title_lower:
                            score += 2
                    news.append({"title": title, "score": score, "feed": feed})
    except Exception as e:
        print(f"Failed to parse feed {feed}: {e}")

news.sort(key=lambda x: x["score"], reverse=True)
print("TOP 5:")
for n in news[:5]:
    print(f"[{n['score']}] {n['title'][:50]}... from {n['feed']}")
