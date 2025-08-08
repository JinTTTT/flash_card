class FlashCardApp {
    constructor() {
        this.storage = new Storage();
        this.algorithm = new EbbinghausAlgorithm();
        this.review = new ReviewSession(this.storage, this.algorithm);
        this.ui = new UI();
        this.events = new EventHandler(this);
        
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
            this.ui.showMessage('请填写所有字段', 'error');
            return;
        }
        
        const exists = this.storage.words.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (exists) {
            this.ui.showMessage('该单词已存在', 'error');
            return;
        }
        
        this.storage.addWord(word, definition, examples);
        document.getElementById('word-form').reset();
        this.ui.showMessage('单词添加成功！');
        this.updateUI();
    }

    async importCSV(file) {
        try {
            const count = await this.storage.importCSV(file);
            this.ui.showMessage(`成功导入 ${count} 个单词！`);
            this.updateUI();
        } catch (error) {
            this.ui.showMessage('导入失败：' + error.message, 'error');
        }
    }

    deleteWord(wordId) {
        if (!confirm('确定要删除这个单词吗？')) return;
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
        this.showCurrentCard();
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

    clearAllData() {
        this.storage.words = [];
        this.storage.progress = { wordProgress: {}, statistics: {}, settings: {} };
        localStorage.clear();
        this.ui.showMessage('所有数据已清空');
        this.updateUI();
    }
}

function showSection(section) {
    window.app.showSection(section);
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlashCardApp();
});