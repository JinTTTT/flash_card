class FlashCardApp {
    constructor() {
        this.storage = new Storage();
        this.algorithm = new EbbinghausAlgorithm();
        this.review = new ReviewSession(this.storage, this.algorithm);
        this.ui = new UI();
        this.events = new EventHandler(this);
        this.pronunciation = new PronunciationService();
        
        this.init();
    }

    async init() {
        this.events.bindEvents();
        await this.loadInitialData();
        this.updateUI();
        this.checkDailyReset();
    }

    async loadInitialData() {
        // 显示加载结果
        if (this.storage.words.length > 0) {
            console.log(`Total words available: ${this.storage.words.length}`);
        } else {
            console.log('No words found. Please import a JSON file to get started.');
        }
    }


    checkDailyReset() {
        const lastReset = localStorage.getItem('flashcard-last-reset');
        const today = new Date().toDateString();
        
        if (!lastReset || new Date(lastReset).toDateString() !== today) {
            localStorage.setItem('flashcard-last-reset', new Date().toISOString());
            localStorage.setItem('flashcard-daily-reviewed', '0');
        }
    }

    showSection(section) {
        this.ui.showSection(section);
        
        if (section === 'review') this.initReview();
    }

    addWord() {
        const word = document.getElementById('word').value.trim();
        const definition = document.getElementById('definition').value.trim();
        const examples = document.getElementById('examples').value.trim();
        
        if (!word || !definition || !examples) {
            this.ui.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        const exists = this.storage.words.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (exists) {
            this.ui.showMessage('This word already exists', 'error');
            return;
        }
        
        const newWord = this.storage.addWord(word, definition, examples);
        document.getElementById('word-form').reset();
        
        this.ui.showMessage('Word added successfully!');
        this.updateUI();
    }

    async importJSON(file) {
        try {
            const text = await file.text();
            const importedWords = JSON.parse(text);
            const count = this.storage.mergeWords(importedWords);
            this.ui.showMessage(`Successfully imported ${count} words!`);
            this.updateUI();
            
            // If we're on the review section, reinitialize the review session
            if (this.ui.currentSection === 'review') {
                this.initReview();
            }
        } catch (error) {
            this.ui.showMessage('Import failed: ' + error.message, 'error');
        }
    }


    initReview() {
        const session = this.review.startReview();
        this.ui.updateReviewUI(session);
        
        if (session.total > 0) {
            this.showCurrentCard();
        } else {
            this.ui.showFlashCard(null);
        }
    }

    showCurrentCard() {
        const word = this.review.getCurrentWord();
        this.ui.showFlashCard(word);
    }

    showAnswerAndContinue(difficulty) {
        // Show answer first for Don't Know and Vague
        this.ui.showAnswer();
        // Store the difficulty for later use
        this.pendingDifficulty = difficulty;
    }

    reviewAnswer(difficulty) {
        const isComplete = this.review.submitAnswer(difficulty);
        
        const dailyReviewed = parseInt(localStorage.getItem('flashcard-daily-reviewed') || '0');
        localStorage.setItem('flashcard-daily-reviewed', String(dailyReviewed + 1));
        
        if (isComplete) {
            this.ui.showReviewComplete(this.review.session);
        } else {
            this.ui.updateReviewUI(this.review.session);
            this.showCurrentCard();
        }
        
    }

    updateUI() {
        if (this.ui.currentSection === 'review') this.ui.updateReviewUI(this.review.session);
    }

    // Export all words to JSON file for backup
    exportJSON() {
        try {
            const jsonData = JSON.stringify(this.storage.words, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
            
            this.ui.showMessage('Vocabulary exported successfully!', 'success');
        } catch (error) {
            console.error('Export JSON error:', error);
            this.ui.showMessage('Export failed: ' + error.message, 'error');
        }
    }
}

function showSection(section) {
    window.app.showSection(section);
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new FlashCardApp();
});