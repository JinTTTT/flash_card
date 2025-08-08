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

    init() {
        this.events.bindEvents();
        this.updateUI();
        this.checkDailyReset();
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
        
        if (section === 'list') this.renderWordList();
        if (section === 'review') this.initReview();
        if (section === 'stats') this.updateStats();
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
        
        this.storage.addWord(word, definition, examples);
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
        } catch (error) {
            this.ui.showMessage('Import failed: ' + error.message, 'error');
        }
    }

    deleteWord(wordId) {
        if (!confirm('Are you sure you want to delete this word?')) return;
        this.storage.deleteWord(wordId);
        this.renderWordList();
        this.updateStats();
    }

    renderWordList(sortBy = 'recent') {
        this.ui.renderWordList(this.storage.words, this.storage.progress.wordProgress, sortBy);
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
        
        this.updateStats();
    }

    updateStats() {
        this.ui.updateStats(this.storage.words, this.storage.progress.wordProgress);
    }

    updateUI() {
        if (this.ui.currentSection === 'list') this.renderWordList();
        if (this.ui.currentSection === 'stats') this.updateStats();
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

    clearAllData() {
        this.storage.words = [];
        this.storage.progress = { wordProgress: {}, statistics: {}, settings: {} };
        localStorage.clear();
        this.ui.showMessage('All data has been cleared');
        this.updateUI();
    }
}

function showSection(section) {
    window.app.showSection(section);
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlashCardApp();
});