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