# Flash Card Learning

A minimalist English vocabulary learning application based on the Ebbinghaus forgetting curve algorithm.

## ✨ Features

- **Smart Review**: Ebbinghaus forgetting curve algorithm with 7-phase learning system
- **Flash Cards**: Card-based learning with instant feedback and rainbow phase indicators
- **Auto Pronunciation**: Automatic word pronunciation using Web Speech API
- **Progress Tracking**: Real-time progress display and phase visualization
- **Intelligent Scheduling**: Don't Know words cycle back immediately, Vague words step back one phase
- **Data Management**: JSON import/export for vocabulary and separate progress backup
- **Word Management**: Easy word deletion from word list interface
- **Offline Ready**: Works completely offline, no server required

## 🚀 Quick Start

**Super Simple - No Installation Required!**

1. **Download** or clone this repository
2. **Double-click** `index.html` to open in your browser
3. **Start learning** immediately!

```bash
# Clone the repository
git clone <repository-url>
cd flash_card

# Simply open the HTML file
open index.html  # Mac
# or double-click index.html in file explorer
```

## 🎯 How to Use

### Adding Words
- Click **"Add Word"** tab
- Fill in: Word/Phrase, Definition, Example
- Click **"Save Word"**

### Review Session
- Click **"Review"** tab
- Words appear as flash cards with **colorful phase indicators**
- **Auto pronunciation** plays when word is shown
- Click 🔊 for manual pronunciation
- Rate your memory:
  - **Don't Know**: Word goes back to Phase 0, appears at end of current session
  - **Vague**: Word drops back one phase (shorter interval)
  - **Remember**: Word advances to next phase (longer interval)

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

### Data Management
- **Import Vocabulary**: Load vocabulary from JSON backup file
- **Export Vocabulary**: Save all words to JSON file
- **Import Progress**: Load learning progress from backup
- **Export Progress**: Save learning progress and phases separately
- **Word List Management**: Delete words directly from the word list
- **Local Storage**: All data saved in browser automatically

## 🎨 Design Features

- **Minimalist Theme**: Clean black and white design
- **Responsive**: Works on desktop, tablet, and mobile
- **Modern UI**: Card-based layout with smooth animations
- **English Interface**: Complete English localization

## 📊 Learning Statistics

Track your progress with:
- Total words added
- Words mastered
- Daily review count
- Learning streak days

## 💾 Data Storage

- **Primary**: Browser localStorage (supports 15,000+ words)
- **Backup**: JSON import/export functionality
- **No Server Required**: Everything runs locally
- **Cross-Platform**: Works on Windows, Mac, Linux

## 🔧 Technical Details

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (modern versions)
- Requires Web Speech API support for pronunciation
- localStorage support required

### File Structure
```
├── index.html              # Main application
├── css/                    # Stylesheets
│   ├── base.css           # Base theme and typography
│   ├── components.css     # UI components
│   └── layout.css         # Layout and responsive design
├── js/                     # JavaScript modules
│   ├── core/              # Core functionality
│   │   ├── storage.js     # Data storage management
│   │   ├── algorithm.js   # Ebbinghaus algorithm
│   │   ├── review.js      # Review session logic
│   │   └── pronunciation.js # Speech synthesis
│   ├── ui/                # User interface
│   │   ├── components.js  # UI components
│   │   └── events.js      # Event handlers
│   └── app.js             # Main application class
```

## 🚀 No Server Required

This application runs entirely in the browser:
- ✅ **File uploads/downloads work**
- ✅ **Browser cache utilized**
- ✅ **Offline functionality**
- ✅ **No installation needed**

## 📱 Mobile Support

Fully responsive design works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces supported

## 🔄 Algorithm Details

**Ebbinghaus Forgetting Curve Implementation v2.0:**
- **7-Phase System**: 1 → 3 → 7 → 14 → 30 → 60 → 120 days
- **Intelligent Feedback**:
  - **Don't Know**: Reset to Phase 0, immediate re-queue in session
  - **Vague**: Step back one phase (shorter interval)
  - **Remember**: Advance to next phase (longer interval)
- **Automatic Migration**: Legacy data automatically updated to new system

## 🎯 Perfect For

- English language learners
- Vocabulary building
- Test preparation (TOEFL, IELTS, GRE)
- Academic study
- Professional development

## 🔐 Privacy

- **100% Local**: All data stays on your device
- **No Tracking**: No analytics or data collection
- **No Internet Required**: Works completely offline
- **Your Control**: Export/import your data anytime

---

**Ready to start learning? Just open `index.html` and begin!** 🚀