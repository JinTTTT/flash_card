# Flash Card Learning

A minimalist English vocabulary learning application based on the Ebbinghaus forgetting curve algorithm.

## ✨ Features

- **Smart Review System**: Enhanced 3-stage review process for precise memory assessment
  - Stage 1: Remember/Don't Remember initial judgment
  - Stage 2: Example-based recall verification for forgotten words
  - Stage 3: Complete answer display with progress tracking
- **Ebbinghaus Algorithm**: 7-phase learning system with intelligent difficulty adjustment
- **Advanced Flash Cards**: Multi-stage card interface with auto pronunciation
- **Progress Management**: Rainbow phase indicators (Red→Orange→Yellow→Green→Blue→Indigo→Purple)
- **Intelligent Queue**: Forgotten words cycle back immediately with phase adjustment
- **Complete Word Management**: Add, edit, reset to phase 0, and delete words
- **Data Persistence**: JSON import/export for vocabulary and progress backup
- **Browser Storage**: Automatic localStorage caching for seamless experience
- **Offline Ready**: Pure frontend application, no server required

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

### Enhanced 3-Stage Review Process

**Stage 1: Initial Assessment**
- Click **"Review"** tab to start
- See word with **colorful phase indicator** and **auto pronunciation**
- Choose: **Remember** or **Don't Remember**
- **Remember** → Jump to Stage 3 (full answer), word advances to next phase
- **Don't Remember** → Continue to Stage 2

**Stage 2: Recall Verification** (for forgotten words)
- View word with example sentence only (no definition shown)
- Try to recall the meaning, then choose:
- **Now I Remember** → Word drops back one phase, appears at end of current session
- **Still Don't Know** → Word resets to Phase 0, appears at end of current session

**Stage 3: Complete Answer Review**
- See word, definition, and example together
- Click **Next** to continue reviewing

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

### Word List Management
- **View All Words**: Click "Word List" tab to see all vocabulary
- **Edit Words**: Click "Edit" button to modify word, definition, or examples
- **Reset to Phase 0**: Click "Reset" button to restart learning from beginning
- **Delete Words**: Click "Delete" button to permanently remove words

### Data Management
- **Import Vocabulary**: Load vocabulary from JSON backup file
- **Export Vocabulary**: Save all words to JSON file for backup
- **Import Progress**: Load learning progress from backup
- **Export Progress**: Save learning progress and phases separately
- **Automatic Caching**: All data saved in browser localStorage automatically

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