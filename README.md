# 🚀 TheSpinity: AI Shorts Generator

**TheSpinity** is a high-performance, automated AI Shorts generation pipeline. It transforms trending AI news into viral, caption-synchronized, and visually rich YouTube Shorts in a single click.

![TheSpinity Banner](https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

- **📰 Auto-News Curation**: Fetches the freshest AI news from globally recognized sources using a robust backend scraper.
- **✍️ Gemini-Powered Scripting**: Leverages **Google Gemini 2.5 Flash** to transform dry news into high-retention, engaging Hinglish scripts.
- **🎙️ Human-Like Voice Synthesis**: Features the custom 'Rahul' (Fenrir) persona for authoritative and natural voiceovers.
- **🎬 Intelligent Visual Search**: Analyzes scripts to find contextually relevant stock footage from Pexels in high-quality 9:16 format.
- **📝 Proportional Captioning**: Perfectly synchronized, high-impact yellow captions that move to the beat of the voice.
- **⚡ Run-All Automation**: One-click orchestration from script to final rendered MP4.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, React, TailwindCSS, Lucide Icons |
| **Backend** | FastAPI, Python 3.10+ |
| **AI Models** | Google Gemini 2.5 Flash |
| **Video Engine** | FFmpeg |
| **APIs** | Pexels API, NewsAPI |

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **FFmpeg** installed and added to your system PATH.

### 2. Installation

#### Backend
```bash
cd Beckend
pip install -r requirements.txt
```

#### Frontend
```bash
cd Frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the root and add your keys:
```env
GEMINI_API_KEY=your_gemini_key
PEXELS_API_KEY=your_pexels_key
NEWS_API_KEY=your_newsapi_key
```

### 4. Running the App
**Start Backend:**
```bash
uvicorn main:app --reload
```
**Start Frontend:**
```bash
npm run dev
```

## 🎙️ AI Captions Studio – Product Description

**AI Captions Studio** is an intelligent video captioning platform that automatically generates stylish, animated subtitles for short-form videos like Instagram Reels, YouTube Shorts, and TikTok.

Creators simply upload a video, and the AI transcribes speech with high accuracy, synchronizes captions word-by-word, and applies engaging animations that keep viewers watching. With multiple caption styles, customizable fonts, colors, emojis, and templates, users can create professional-looking videos in minutes—without any video editing experience.

### Key Features

* **AI Speech-to-Text**
  * Fast and accurate transcription for multiple languages and accents.
  * Automatic punctuation and capitalization.

* **Word-by-Word Animated Captions**
  * Karaoke-style highlighting.
  * Smooth pop, bounce, fade, zoom, and slide animations.
  * Perfect timing synced with speech.

* **Custom Caption Styles**
  * Modern creator-inspired templates.
  * Custom fonts, colors, outlines, shadows, and backgrounds.
  * Brand presets for consistent content.

* **Emoji & Keyword Highlighting**
  * Automatically add relevant emojis.
  * Highlight important words with different colors or animations.

* **Multiple Aspect Ratios**
  * 9:16 (Reels, Shorts, TikTok)
  * 16:9 (YouTube)
  * 1:1 (Instagram Feed)

* **Easy Editing**
  * Edit transcript text.
  * Adjust caption timing.
  * Split or merge caption segments.
  * Drag-and-drop timeline editor.

* **High-Quality Export**
  * Export videos in up to 4K resolution.
  * Burned-in captions for universal compatibility.
  * Optimized for social media platforms.

* **Multi-Language Support**
  * Automatic language detection.
  * Translation into multiple languages.
  * Bilingual subtitle support.

* **Cloud-Based Processing**
  * No software installation required.
  * Process videos directly in the browser.
  * Secure cloud storage and project management.

### Ideal Users
* Content Creators
* Influencers
* Coaches & Educators
* Podcasters
* Marketing Agencies
* Social Media Managers
* Small Businesses
* Video Editors

### Benefits
* Save hours of manual subtitle editing.
* Increase viewer engagement with dynamic captions.
* Improve accessibility for viewers watching without sound.
* Create professional, viral-ready videos in minutes.
* Maintain consistent branding across all content.

### Workflow
1. Upload your video.
2. AI automatically transcribes the audio.
3. Choose a caption style or template.
4. Customize fonts, colors, and animations.
5. Edit text if needed.
6. Export and publish directly to social media.

### Future Enhancements
* AI-generated B-roll suggestions
* Auto zoom and punch-in effects
* Background noise removal
* AI voice enhancement
* Auto-generated hooks and titles
* Brand kit synchronization
* Team collaboration
* Direct publishing to Instagram, TikTok, and YouTube
* Trending caption templates
* AI-powered content repurposing

## 📂 Project Structure

```text
├── Beckend
│   ├── main.py            # FastAPI Endpoints
│   ├── video_assembler.py # FFmpeg & Logic engine
│   └── requirements.txt    # Python dependencies
├── Frontend
│   ├── src/app/shorts     # Dashboard UI
│   └── package.json       # Node dependencies
└── README.md
```

## 📜 License
Personal use - Developed for high-retention content creation.

---
Developed with ❤️ by [deveshgoyal1000](https://github.com/deveshgoyal1000)