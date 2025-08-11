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
        if (section === 'wordlist') this.initWordList();
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
            
            // Refresh current section if needed
            if (this.ui.currentSection === 'review') {
                this.initReview();
            } else if (this.ui.currentSection === 'wordlist') {
                this.initWordList();
            }
        } catch (error) {
            this.ui.showMessage('Import failed: ' + error.message, 'error');
        }
    }


    initReview() {
        const session = this.review.startReview();
        this.updateReviewProgress();
        
        if (session.total > 0) {
            this.showCurrentCard();
        } else {
            this.ui.showFlashCard(null);
        }
    }

    initWordList() {
        const sortedWords = this.storage.getWordsSortedByPhase(this.algorithm);
        this.ui.showWordList(sortedWords);
    }

    updateReviewProgress() {
        const session = this.review.session;
        const currentIndex = this.review.currentIndex;
        const totalWords = this.review.currentWords.length;
        
        this.ui.updateReviewUI(session, currentIndex, totalWords);
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
            this.updateReviewProgress();
            this.showCurrentCard();
        }
        
    }

    updateUI() {
        if (this.ui.currentSection === 'review') this.updateReviewProgress();
        if (this.ui.currentSection === 'wordlist') this.initWordList();
    }

    // 从单词列表中删除单词
    deleteWordFromList(wordId) {
        // 确认删除
        const word = this.storage.words.find(w => w.id == wordId);
        if (!word) return;
        
        const confirmDelete = confirm(`Are you sure you want to delete "${word.word}"?`);
        if (!confirmDelete) return;
        
        // 执行删除
        this.storage.deleteWord(wordId);
        this.ui.showMessage(`Word "${word.word}" deleted successfully!`, 'success');
        
        // 刷新单词列表
        this.initWordList();
    }

    // Export all words to JSON file for backup
    async exportJSON() {
        try {
            const jsonData = JSON.stringify(this.storage.words, null, 2);
            
            // 尝试使用File System Access API保存到data文件夹
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        startIn: 'documents',
                        suggestedName: `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`,
                        types: [{
                            description: 'JSON files',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                    
                    const writable = await fileHandle.createWritable();
                    await writable.write(jsonData);
                    await writable.close();
                    
                    this.ui.showMessage('Vocabulary exported successfully!', 'success');
                    return;
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.warn('File System Access API failed:', err);
                    }
                }
            }
            
            // 降级到传统下载方式
            const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
            
            this.ui.showMessage('Vocabulary exported successfully! Please save to your data folder manually.', 'success');
        } catch (error) {
            console.error('Export JSON error:', error);
            this.ui.showMessage('Export failed: ' + error.message, 'error');
        }
    }

    // Export progress data to JSON file for backup
    async exportProgress() {
        try {
            const progressData = {
                progress: this.storage.progress,
                exportedAt: new Date().toISOString(),
                version: '2.0'
            };
            const jsonData = JSON.stringify(progressData, null, 2);
            
            // 尝试使用File System Access API保存到data文件夹
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        startIn: 'documents',
                        suggestedName: `progress-backup-${new Date().toISOString().slice(0, 10)}.json`,
                        types: [{
                            description: 'JSON files',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                    
                    const writable = await fileHandle.createWritable();
                    await writable.write(jsonData);
                    await writable.close();
                    
                    this.ui.showMessage('Progress exported successfully!', 'success');
                    return;
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.warn('File System Access API failed:', err);
                    }
                }
            }
            
            // 降级到传统下载方式
            const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `progress-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
            
            this.ui.showMessage('Progress exported successfully! Please save to your data folder manually.', 'success');
        } catch (error) {
            console.error('Export progress error:', error);
            this.ui.showMessage('Export progress failed: ' + error.message, 'error');
        }
    }

    // Import progress data from JSON file
    async importProgress(file) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            if (importedData.progress) {
                this.storage.progress = importedData.progress;
                this.storage.saveProgress();
                this.ui.showMessage('Progress imported successfully!', 'success');
                this.updateUI();
                
                // Refresh current section if needed
                if (this.ui.currentSection === 'review') {
                    this.initReview();
                } else if (this.ui.currentSection === 'wordlist') {
                    this.initWordList();
                }
            } else {
                this.ui.showMessage('Invalid progress file format', 'error');
            }
        } catch (error) {
            this.ui.showMessage('Import progress failed: ' + error.message, 'error');
        }
    }
}

function showSection(section) {
    window.app.showSection(section);
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new FlashCardApp();
});