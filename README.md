# Flash Card Learning

A minimalist vocabulary learning app using the Ebbinghaus forgetting curve algorithm.

## ✨ Features

- **Smart Dictionary Search**: AI-powered English-Chinese translation
- **Rich Word Information**: Definitions, examples, phonetics, audio
- **Smart 3-Stage Review**: Remember → Recall → Complete Answer
- **7-Phase Spaced Repetition**: 1→3→7→14→30→60→120 days
- **Unified Data Management**: Single file for vocabulary + progress
- **Auto Pronunciation**: Web Speech API support
- **Offline Ready**: Pure frontend, no server required

## 🚀 Quick Start

**Option 1: Online (Recommended)**
- Visit: `https://jinttt.github.io/flash_card/`
- Start learning immediately!

**Option 2: Local**
```bash
git clone https://github.com/JinTTT/flash_card.git
cd flash_card
python3 -m http.server 8080
# Open http://localhost:8080
```

## 💾 Data Management

- **Import Data**: Load vocabulary with learning progress
- **Export Data**: Backup everything in one JSON file
- **Auto Sync**: Cross-device progress via localStorage

## 🎯 Learning Flow

1. **Search Words**: Enter English word → Get definition + Chinese translation
2. **Add to List**: One-click to add searched words to your vocabulary
3. **Review**: 3-stage intelligent assessment (Remember → Recall → Answer)
4. **Progress**: 7 colorful phases (Red→Purple)
5. **Mastery**: Words graduate after phase 6

## 🎨 Design

### 7-Phase Learning System
The algorithm uses a scientific 7-phase system with color-coded indicators:
- **Phase 0** 🔴: 1 day (Red)
- **Phase 1** 🟠: 3 days (Orange)
- **Phase 2** 🟡: 7 days (Yellow)
- **Phase 3** 🟢: 14 days (Green)
- **Phase 4** 🔵: 30 days (Blue)
- **Phase 5** 🟣: 60 days (Indigo)
- **Phase 6** 🟣: 120 days (Purple)
- **Mastery**: Words are removed after completing Phase 6

## 🔍 Dictionary APIs

- **Free Dictionary API**: English definitions, examples, phonetics
- **Microsoft Translator**: AI-powered Chinese translations
- **Smart Fallback**: Graceful degradation if services unavailable

## 📱 Access Anywhere

- **Desktop**: Web browser
- **Mobile**: Add to home screen
- **Sync**: Use online version for cross-device sync

---

**Ready to learn? Open the app and start building your vocabulary!** 🚀