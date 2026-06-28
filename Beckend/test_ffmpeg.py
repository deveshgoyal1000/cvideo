import urllib.request, json
req = urllib.request.Request("https://api.pexels.com/v1/videos/search?query=coding&per_page=1", headers={"Authorization": "ufT87Od2wn9oSHnZ8Sb92cZwPjSpqrHYJp2mkmYcikcIFAM0zVseeWWb", "User-Agent": "Mozilla/5.0"})
u = urllib.request.urlopen(req)
url = json.loads(u.read())["videos"][0]["video_files"][0]["link"]
print("URL:", url)
req2 = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req2) as resp, open("test_pexels.mp4", "wb") as f:
    f.write(resp.read())
print("Saved test_pexels.mp4")
