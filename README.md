# Flash Card Learning

A minimalist English vocabulary learning application based on the Ebbinghaus forgetting curve algorithm.

## ✨ Features

- **Smart Review**: Ebbinghaus forgetting curve algorithm for scientifically optimized review scheduling
- **Flash Cards**: Card-based learning with instant feedback
- **Auto Pronunciation**: Automatic word pronunciation using Web Speech API
- **Progress Tracking**: Learning statistics and progress visualization
- **Simple Data Management**: JSON import/export for backup
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
- Words appear as flash cards
- **Auto pronunciation** plays when word is shown
- Click 🔊 for manual pronunciation
- Rate your memory: Don't Remember / Vague / Clear

### Review Schedule
The algorithm automatically schedules reviews based on your performance:
- **Intervals**: 0 days → 1 day → 2 days → 4 days → 7 days → 15 days → 30 days → 60 days → 120 days
- **Adaptive**: Difficult words appear more frequently
- **Mastery**: Words marked as mastered after 5 consecutive correct answers

### Data Management
- **Import JSON**: Load vocabulary from backup file
- **Export Backup**: Save all words to JSON file
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

**Ebbinghaus Forgetting Curve Implementation:**
- Initial review: Same day
- Subsequent reviews: 1, 2, 4, 7, 15, 30, 60, 120 days
- Difficulty adjustment: 
  - Hard: 30% of normal interval
  - Medium: 70% of normal interval  
  - Easy: 120% of normal interval

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