class FlashCardApp {
    constructor() {
        this.storage = new Storage();
        this.algorithm = new EbbinghausAlgorithm();
        this.review = new ReviewSession(this.storage, this.algorithm);
        this.ui = new UI();
        this.events = new EventHandler(this);
        this.pronunciation = new PronunciationService();
        this.dictionary = new CombinedDictionaryAPI(); // 使用组合词典API
        this.currentSearchResult = null; // 存储当前查词结果
        
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
        
        if (section === 'search') this.initSearch();
        if (section === 'review') this.initReview();
        if (section === 'wordlist') this.initWordList();
        if (section === 'settings') this.initSettings();
    }

    initSearch() {
        // 清除之前的搜索结果
        this.hideSearchResults();
        this.clearSearchMessage();
        
        // 聚焦搜索框
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    async searchWord() {
        const searchInput = document.getElementById('search-input');
        const word = searchInput.value.trim();
        
        if (!word) {
            this.showSearchMessage('Please enter a word to search', 'error');
            return;
        }

        try {
            this.showSearchMessage('Searching...', 'info');
            this.hideSearchResults();
            
            const result = await this.dictionary.searchWord(word);
            this.currentSearchResult = result;
            
            this.displaySearchResult(result);
            this.clearSearchMessage();
            
        } catch (error) {
            this.showSearchMessage(error.message, 'error');
            this.hideSearchResults();
        }
    }

    displaySearchResult(result) {
        // 显示结果容器
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.style.display = 'block';
        
        // 填充数据
        document.getElementById('result-word').textContent = result.word;
        
        // 显示英文定义和中文翻译
        const definitionText = result.definition;
        const chineseTranslation = result.chineseTranslation || '翻译加载中...';
        
        // 如果有详细的定义翻译，优先使用；否则使用单词翻译
        const finalChineseText = result.chineseDefinition || chineseTranslation;
        const combinedDefinition = `${definitionText}\n中文: ${finalChineseText}`;
        document.getElementById('result-definition').textContent = combinedDefinition;
        
        document.getElementById('result-pos').textContent = result.partOfSpeech;
        
        // 音标
        const phoneticSpan = document.getElementById('result-phonetic');
        if (result.phonetic) {
            phoneticSpan.textContent = result.phonetic;
            phoneticSpan.style.display = 'inline';
        } else {
            phoneticSpan.style.display = 'none';
        }
        
        // 例句（包含中文翻译）
        const exampleSection = document.getElementById('example-section');
        const exampleP = document.getElementById('result-example');
        if (result.example) {
            // 始终显示英文例句和中文翻译
            const chineseExampleText = result.chineseExample || '例句翻译加载中...';
            const exampleText = `${result.example}\n中文: ${chineseExampleText}`;
            exampleP.textContent = exampleText;
            exampleSection.style.display = 'block';
        } else {
            exampleSection.style.display = 'none';
        }
        
        // 音频按钮
        const audioBtn = document.getElementById('play-audio');
        if (result.audio) {
            audioBtn.style.display = 'inline-block';
            audioBtn.onclick = () => this.playAudio(result.audio);
        } else {
            audioBtn.style.display = 'none';
        }
        
        // 检查是否已存在于词汇列表
        this.updateAddButton();
    }

    updateAddButton() {
        const addBtn = document.getElementById('add-to-words');
        if (!this.currentSearchResult) return;
        
        const exists = this.storage.words.find(w => 
            w.word.toLowerCase() === this.currentSearchResult.word.toLowerCase()
        );
        
        if (exists) {
            addBtn.textContent = '✅ Already in Your Words';
            addBtn.disabled = true;
            addBtn.className = 'btn secondary';
        } else {
            addBtn.textContent = '➕ Add to My Words';
            addBtn.disabled = false;
            addBtn.className = 'btn success';
        }
    }

    addSearchResultToWords() {
        if (!this.currentSearchResult) return;
        
        const exists = this.storage.words.find(w => 
            w.word.toLowerCase() === this.currentSearchResult.word.toLowerCase()
        );
        
        if (exists) {
            this.showSearchMessage('This word is already in your word list', 'warning');
            return;
        }
        
        // 添加到词汇列表
        const result = this.currentSearchResult;
        this.storage.addWord(
            result.word,
            result.definition,
            result.example || `Example for "${result.word}"`
        );
        
        this.showSearchMessage(`"${result.word}" added to your word list!`, 'success');
        this.updateAddButton();
        this.updateUI();
    }

    searchAnother() {
        const searchInput = document.getElementById('search-input');
        searchInput.value = '';
        searchInput.focus();
        this.hideSearchResults();
        this.clearSearchMessage();
        this.currentSearchResult = null;
    }

    playAudio(audioUrl) {
        if (!audioUrl) return;
        
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
            console.warn('Could not play audio:', error);
            this.showSearchMessage('Audio playback failed', 'warning');
        });
    }

    showSearchMessage(message, type = 'info') {
        const messageDiv = document.getElementById('search-message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }

    clearSearchMessage() {
        const messageDiv = document.getElementById('search-message');
        messageDiv.style.display = 'none';
    }

    hideSearchResults() {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.style.display = 'none';
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

    // Settings 相关方法
    initSettings() {
        this.loadApiKeyStatus();
    }

    loadApiKeyStatus() {
        const statusDiv = document.getElementById('api-key-status');
        const apiKeyInput = document.getElementById('api-key-input');
        
        // 检查是否已保存API密钥
        const savedKey = localStorage.getItem('microsoft-translator-api-key');
        if (savedKey) {
            statusDiv.className = 'api-key-status success';
            statusDiv.innerHTML = '✅ API密钥已配置并保存';
            apiKeyInput.value = '••••••••••••••••'; // 显示掩码
        } else {
            statusDiv.className = 'api-key-status info';
            statusDiv.innerHTML = '⚠️ 未配置API密钥，翻译功能将受限';
        }
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const statusDiv = document.getElementById('api-key-status');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            statusDiv.className = 'api-key-status error';
            statusDiv.innerHTML = '❌ 请输入有效的API密钥';
            return;
        }

        if (apiKey === '••••••••••••••••') {
            statusDiv.className = 'api-key-status info';
            statusDiv.innerHTML = '⚠️ API密钥已保存，无需重复保存';
            return;
        }

        try {
            // 保存API密钥并测试
            this.dictionary.translator.setApiKey(apiKey);
            
            statusDiv.className = 'api-key-status success';
            statusDiv.innerHTML = '✅ API密钥已保存成功！';
            
            // 隐藏真实的密钥
            apiKeyInput.value = '••••••••••••••••';
            
            // 可选：测试API密钥
            this.testApiKey(apiKey);
            
        } catch (error) {
            statusDiv.className = 'api-key-status error';
            statusDiv.innerHTML = `❌ 保存失败: ${error.message}`;
        }
    }

    async testApiKey(apiKey) {
        const statusDiv = document.getElementById('api-key-status');
        
        try {
            // 测试翻译一个简单的词
            const result = await this.dictionary.translator.translateWord('test');
            
            statusDiv.className = 'api-key-status success';
            statusDiv.innerHTML = '✅ API密钥验证成功，翻译功能已启用！';
            
        } catch (error) {
            statusDiv.className = 'api-key-status error';
            statusDiv.innerHTML = `❌ API密钥测试失败: ${error.message}`;
        }
    }

    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('api-key-input');
        const showBtn = document.getElementById('show-api-key');
        
        if (apiKeyInput.type === 'password') {
            const savedKey = localStorage.getItem('microsoft-translator-api-key');
            if (savedKey) {
                apiKeyInput.type = 'text';
                apiKeyInput.value = savedKey;
                showBtn.textContent = '🙈';
            }
        } else {
            apiKeyInput.type = 'password';
            apiKeyInput.value = '••••••••••••••••';
            showBtn.textContent = '👁️';
        }
    }

    clearAllCache() {
        if (confirm('确定要清除所有缓存吗？这将清除翻译缓存和搜索结果缓存。')) {
            try {
                // 清除翻译缓存
                this.dictionary.clearCache();
                
                // 清除其他相关缓存
                localStorage.removeItem('flashcard-daily-reviewed');
                localStorage.removeItem('flashcard-last-reset');
                
                alert('✅ 缓存已清除完成！');
                
            } catch (error) {
                alert('❌ 清除缓存失败: ' + error.message);
            }
        }
    }

}

function showSection(section) {
    window.app.showSection(section);
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new FlashCardApp();
});