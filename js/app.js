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

    async importData(file) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            const count = this.storage.mergeWords(importedData);
            this.ui.showMessage(`Successfully imported ${count} words with all progress data!`);
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
        // 重置待处理的难度值
        this.pendingDifficulty = null;
    }

    // 新的复习交互方法
    handleRememberClick() {
        const word = this.review.getCurrentWord();
        if (!word) return;
        
        // 记得：直接显示完整答案，difficulty = 1
        this.pendingDifficulty = 1;
        this.ui.showFinalState(word);
    }
    
    handleDontRememberClick() {
        const word = this.review.getCurrentWord();
        if (!word) return;
        
        // 不记得：显示例句和中间选择按钮
        this.ui.showMiddleState(word);
    }
    
    handleRecalledClick() {
        const word = this.review.getCurrentWord();
        if (!word) return;
        
        // 想起来了：显示完整答案，difficulty = 0（阶段-1，放队尾）
        this.pendingDifficulty = 0;
        this.ui.showFinalState(word);
    }
    
    handleStillDontKnowClick() {
        const word = this.review.getCurrentWord();
        if (!word) return;
        
        // 没有想起：显示完整答案，difficulty = -1（阶段归零，放队尾）
        this.pendingDifficulty = -1;
        this.ui.showFinalState(word);
    }
    
    handleNextClick() {
        // 使用存储的difficulty继续复习
        this.reviewAnswer(this.pendingDifficulty);
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

    // 从单词列表中编辑单词
    editWordFromList(wordId) {
        const word = this.storage.words.find(w => w.id == wordId);
        if (!word) {
            this.ui.showMessage('Word not found', 'error');
            return;
        }
        
        // 显示编辑模态框
        this.ui.showEditWordModal(word);
    }

    // 更新单词信息
    updateWord(wordId, updatedData) {
        // 检查是否与其他单词重复（排除自身）
        const existingWord = this.storage.words.find(w => 
            w.id != wordId && w.word.toLowerCase() === updatedData.word.toLowerCase()
        );
        
        if (existingWord) {
            this.ui.showMessage('A word with this name already exists', 'error');
            return;
        }
        
        // 更新单词
        const success = this.storage.updateWord(wordId, updatedData);
        if (success) {
            this.ui.showMessage('Word updated successfully!', 'success');
            // 刷新单词列表
            this.initWordList();
        } else {
            this.ui.showMessage('Failed to update word', 'error');
        }
    }

    // 重置单词到阶段0
    resetWordFromList(wordId) {
        const word = this.storage.words.find(w => w.id == wordId);
        if (!word) {
            this.ui.showMessage('Word not found', 'error');
            return;
        }
        
        const confirmReset = confirm(`Are you sure you want to reset "${word.word}" to phase 0?`);
        if (!confirmReset) return;
        
        // 重置单词进度到初始状态
        const resetData = {
            lastReviewed: new Date().toISOString(),
            phase: 0,
            difficulty: -1,
            nextReview: new Date().toISOString(), // 立即可复习
            reviewCount: 0,
            completed: false
        };
        
        this.storage.updateWordProgress(wordId, resetData);
        this.ui.showMessage(`Word "${word.word}" reset to phase 0!`, 'success');
        
        // 刷新单词列表
        this.initWordList();
    }

    // Export all data (vocabulary + progress) to JSON file for backup
    async exportData() {
        try {
            const exportData = this.storage.exportData();
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // 尝试使用File System Access API保存到data文件夹
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        startIn: 'documents',
                        suggestedName: `flashcard-backup-${new Date().toISOString().slice(0, 10)}.json`,
                        types: [{
                            description: 'JSON files',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                    
                    const writable = await fileHandle.createWritable();
                    await writable.write(jsonData);
                    await writable.close();
                    
                    this.ui.showMessage('Data exported successfully!', 'success');
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
            link.download = `flashcard-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
            
            this.ui.showMessage('Data exported successfully! Please save to your data folder manually.', 'success');
        } catch (error) {
            console.error('Export data error:', error);
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