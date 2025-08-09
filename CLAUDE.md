# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a client-side JavaScript application with no build process or testing framework. To develop and test:

- **Run the application**: Open `index.html` directly in a web browser
- **Live testing**: Use a local web server for proper file loading:
  ```bash
  python3 -m http.server 8000
  # Then open http://localhost:8000
  ```
- **No build/test commands**: This is a vanilla JavaScript application with no package.json, build tools, or test framework

## Architecture Overview

This is a modular vanilla JavaScript flash card application implementing the Ebbinghaus forgetting curve algorithm for vocabulary learning.

### Core Architecture Pattern

The application follows a layered architecture with clear separation of concerns:

- **Application Layer** (`js/app.js`): Main FlashCardApp class orchestrates all components
- **Core Logic Layer** (`js/core/`): Domain logic for storage, algorithms, and review sessions
- **UI Layer** (`js/ui/`): User interface components and event handling
- **Data Layer**: JSON file storage with localStorage for progress tracking

### Key Components

**Storage System** (`js/core/storage.js`):
- Manages vocabulary data and learning progress
- Supports both JSON file import/export and localStorage persistence
- Handles legacy data migration and CSV import/export
- Progress data is stored separately from vocabulary data

**Ebbinghaus Algorithm** (`js/core/algorithm.js`):
- Implements spaced repetition: [0, 1, 2, 4, 7, 15, 30, 60, 120] day intervals
- Adjusts intervals based on difficulty feedback (-1, 0, 1)
- Marks words as mastered after 5 consecutive correct reviews

**Data Flow**:
1. Vocabulary loaded from localStorage cache (with fallback to legacy sources)
2. New words added via UI are immediately cached in localStorage
3. Progress tracked in localStorage as separate entity
4. Export functionality saves all current vocabulary to downloadable JSON

### File Structure Significance

- `data/vocabulary.json`: Optional vocabulary file (legacy support)
- `js/core/`: Pure business logic, no UI dependencies
- `js/ui/`: UI components with no direct storage access
- CSS organized by concern: base styles, components, layout

### Development Workflow

The application uses a manual data management workflow:
1. Add words via web interface
2. Export vocabulary using "Export Backup" button
3. Words are automatically cached in localStorage for persistence
4. For sharing/backup: save exported JSON file

**Browser-based Storage**: The app primarily uses localStorage for persistence, with JSON import/export for backup/sharing. The `data/vocabulary.json` file is optional - the app works entirely with browser storage.

### Key Integration Points

- All components communicate through the main FlashCardApp instance
- Storage operations are atomic and immediately persisted
- UI updates are reactive to data changes
- Review sessions maintain state until completion or navigation

When modifying this codebase:
- Preserve the modular structure and dependency flow
- Maintain the separation between vocabulary data and progress tracking
- Ensure compatibility with the JSON import/export workflow
- Test the complete learning cycle: add → review → progress tracking