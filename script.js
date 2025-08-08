// 英语学习Flash Card应用
class FlashCardApp {
    constructor() {
        this.words = [];                    // 单词数据（来自Excel）
        this.progress = {};                 // 学习进度数据（JSON存储）
        this.currentReviewWords = [];
        this.currentReviewIndex = 0;
        this.reviewSession = {
            total: 0,
            completed: 0,
            correct: 0
        };
        this.excelFile = null;              // 当前Excel文件引用
        this.lastExcelModified = null;      // Excel文件最后修改时间
        
        this.init();
    }

    // 初始化应用
    init() {
        this.loadData();
        this.bindEvents();
        this.updateUI();
        this.checkDailyReset();
    }

    // ================================
    // 数据存储和管理系统
    // ================================
    
    // 加载数据（分层存储）
    loadData() {
        try {
            // 加载学习进度数据（JSON格式）
            this.loadProgress();
            
            // 尝试加载之前的单词数据作为备用
            this.loadLegacyData();
        } catch (error) {
            console.error('Error loading data:', error);
            this.words = [];
            this.progress = {};
        }
    }

    // 加载学习进度
    loadProgress() {
        try {
            const savedProgress = localStorage.getItem('flashcard-progress');
            if (savedProgress) {
                this.progress = JSON.parse(savedProgress);
            } else {
                this.progress = {
                    wordProgress: {},
                    statistics: {
                        totalReviewed: 0,
                        streakDays: 0,
                        lastActivity: null
                    },
                    settings: {
                        dailyTarget: 20,
                        reviewReminder: true
                    }
                };
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            this.progress = { wordProgress: {}, statistics: {}, settings: {} };
        }
    }

    // 加载旧版本数据作为兼容
    loadLegacyData() {
        try {
            const saved = localStorage.getItem('flashcard-words');
            if (saved && this.words.length === 0) {
                const legacyWords = JSON.parse(saved);
                // 转换旧格式数据
                this.convertLegacyData(legacyWords);
            }
        } catch (error) {
            console.error('Error loading legacy data:', error);
        }
    }

    // 转换旧格式数据
    convertLegacyData(legacyWords) {
        legacyWords.forEach(word => {
            // 提取基础单词数据
            const basicWord = {
                id: word.id,
                word: word.word,
                definition: word.definition,
                examples: word.examples,
                category: word.category || '',
                createdAt: word.createdAt
            };
            this.words.push(basicWord);

            // 提取学习进度数据
            if (word.reviewCount || word.lastReviewed) {
                this.progress.wordProgress[word.id] = {
                    reviewCount: word.reviewCount || 0,
                    lastReviewed: word.lastReviewed || null,
                    nextReview: word.nextReview || new Date().toISOString(),
                    difficulty: word.difficulty || 0,
                    mastered: word.mastered || false
                };
            }
        });
        
        // 保存转换后的数据
        this.saveProgress();
    }

    // 保存学习进度
    saveProgress() {
        try {
            localStorage.setItem('flashcard-progress', JSON.stringify(this.progress));
            localStorage.setItem('flashcard-last-save', new Date().toISOString());
        } catch (error) {
            console.error('Error saving progress:', error);
            this.showMessage('保存进度失败，请检查浏览器存储空间', 'error');
        }
    }

    // 保存单词数据到localStorage（备用）
    saveWordsBackup() {
        try {
            const backup = this.words.map(word => {
                const progress = this.progress.wordProgress[word.id] || {};
                return {
                    ...word,
                    ...progress
                };
            });
            localStorage.setItem('flashcard-words-backup', JSON.stringify(backup));
        } catch (error) {
            console.error('Error saving words backup:', error);
        }
    }

    // 检查每日重置
    checkDailyReset() {
        const lastReset = localStorage.getItem('flashcard-last-reset');
        const today = new Date().toDateString();
        
        if (!lastReset || new Date(lastReset).toDateString() !== today) {
            localStorage.setItem('flashcard-last-reset', new Date().toISOString());
            this.resetDailyProgress();
        }
    }

    // 重置每日进度
    resetDailyProgress() {
        localStorage.setItem('flashcard-daily-reviewed', '0');
        localStorage.setItem('flashcard-daily-added', '0');
    }

    // ================================
    // 艾宾浩斯遗忘曲线算法
    // ================================
    
    // 计算下次复习时间（基于艾宾浩斯遗忘曲线）
    calculateNextReview(reviewCount, difficulty) {
        // 复习间隔（天）：1, 2, 4, 7, 15, 30, 60, 120...
        const intervals = [1, 2, 4, 7, 15, 30, 60, 120];
        let interval;
        
        if (reviewCount >= intervals.length) {
            interval = intervals[intervals.length - 1] * Math.pow(2, reviewCount - intervals.length);
        } else {
            interval = intervals[reviewCount] || 1;
        }
        
        // 根据难度调整间隔
        switch (difficulty) {
            case -1: // 不记得
                interval = Math.max(1, Math.floor(interval * 0.3));
                break;
            case 0:  // 模糊
                interval = Math.max(1, Math.floor(interval * 0.7));
                break;
            case 1:  // 记得清楚
                interval = Math.ceil(interval * 1.2);
                break;
            default:
                break;
        }
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        return nextReview.toISOString();
    }

    // 获取需要复习的单词
    getWordsForReview() {
        const now = new Date();
        return this.words.filter(word => {
            const progress = this.progress.wordProgress[word.id];
            if (!progress) return true; // 新单词需要复习
            
            const nextReview = new Date(progress.nextReview);
            return nextReview <= now && !progress.mastered;
        });
    }

    // 更新单词复习状态
    updateWordReview(wordId, difficulty) {
        // 确保progress中存在该单词的记录
        if (!this.progress.wordProgress[wordId]) {
            this.progress.wordProgress[wordId] = {
                reviewCount: 0,
                lastReviewed: null,
                nextReview: new Date().toISOString(),
                difficulty: 0,
                mastered: false
            };
        }

        const progress = this.progress.wordProgress[wordId];
        progress.lastReviewed = new Date().toISOString();
        progress.reviewCount += 1;
        progress.difficulty = difficulty;
        progress.nextReview = this.calculateNextReview(progress.reviewCount, difficulty);
        
        // 如果连续5次都是"记得清楚"，标记为已掌握
        if (difficulty === 1 && progress.reviewCount >= 5) {
            progress.mastered = true;
        }
        
        // 更新统计信息
        this.progress.statistics.totalReviewed = (this.progress.statistics.totalReviewed || 0) + 1;
        this.progress.statistics.lastActivity = new Date().toISOString();
        
        this.saveProgress();
        this.saveWordsBackup();
    }

    // ================================
    // 界面控制
    // ================================
    
    // 绑定事件
    bindEvents() {
        // 导航按钮事件
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // 表单提交事件
        document.getElementById('word-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWord();
        });

        // 排序选择事件
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.renderWordList(e.target.value);
        });

        // Flash Card事件
        document.getElementById('show-answer').addEventListener('click', () => {
            this.showAnswer();
        });

        document.getElementById('hard-btn').addEventListener('click', () => {
            this.reviewAnswer(-1);
        });

        document.getElementById('medium-btn').addEventListener('click', () => {
            this.reviewAnswer(0);
        });

        document.getElementById('easy-btn').addEventListener('click', () => {
            this.reviewAnswer(1);
        });

        // 数据管理事件
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('backup-btn').addEventListener('click', () => {
            this.backupData();
        });

        document.getElementById('clear-data-btn').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Excel相关事件
        document.getElementById('excel-import').addEventListener('change', (e) => {
            this.importExcel(e.target.files[0]);
        });

        document.getElementById('download-template').addEventListener('click', () => {
            this.downloadTemplate();
        });

        document.getElementById('export-excel').addEventListener('click', () => {
            this.exportExcel();
        });

        document.getElementById('refresh-excel').addEventListener('click', () => {
            this.refreshExcelData();
        });
    }

    // 显示指定区域
    showSection(sectionName) {
        // 隐藏所有区域
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 显示指定区域
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // 更新对应区域的内容
        switch (sectionName) {
            case 'list':
                this.renderWordList();
                break;
            case 'review':
                this.initReview();
                break;
            case 'stats':
                this.updateStats();
                break;
        }
    }

    // 显示消息
    showMessage(text, type = 'success') {
        const messageEl = document.getElementById('add-message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // ================================
    // 添加单词功能
    // ================================
    
    addWord() {
        const form = document.getElementById('word-form');
        const wordInput = document.getElementById('word');
        const definitionInput = document.getElementById('definition');
        const examplesInput = document.getElementById('examples');
        
        const word = wordInput.value.trim();
        const definition = definitionInput.value.trim();
        const examples = examplesInput.value.trim();
        
        if (!word || !definition || !examples) {
            this.showMessage('请填写所有字段', 'error');
            return;
        }
        
        // 检查重复
        const exists = this.words.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (exists) {
            this.showMessage('该单词已存在', 'error');
            return;
        }
        
        const newWord = {
            id: Date.now() + Math.random(),
            word: word,
            definition: definition,
            examples: examples,
            category: '',
            createdAt: new Date().toISOString()
        };
        
        this.words.push(newWord);
        
        // 为新单词创建学习进度记录
        this.progress.wordProgress[newWord.id] = {
            reviewCount: 0,
            lastReviewed: null,
            nextReview: new Date().toISOString(),
            difficulty: 0,
            mastered: false
        };
        
        this.saveProgress();
        this.saveWordsBackup();
        
        // 更新统计
        const dailyAdded = parseInt(localStorage.getItem('flashcard-daily-added') || '0');
        localStorage.setItem('flashcard-daily-added', String(dailyAdded + 1));
        
        form.reset();
        this.showMessage('单词添加成功！');
        this.updateUI();
    }

    // ================================
    // 单词列表功能
    // ================================
    
    renderWordList(sortBy = 'recent') {
        const container = document.getElementById('word-list');
        
        if (this.words.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>还没有添加任何单词</p>
                    <button class="btn primary" onclick="app.showSection('add')">添加第一个单词</button>
                </div>
            `;
            return;
        }
        
        let sortedWords = [...this.words];
        
        switch (sortBy) {
            case 'recent':
                sortedWords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'review':
                sortedWords.sort((a, b) => {
                    const aReview = new Date(a.nextReview);
                    const bReview = new Date(b.nextReview);
                    const now = new Date();
                    
                    // 需要复习的排在前面
                    if (aReview <= now && bReview > now) return -1;
                    if (aReview > now && bReview <= now) return 1;
                    
                    // 都需要复习或都不需要复习时，按下次复习时间排序
                    return aReview - bReview;
                });
                break;
        }
        
        container.innerHTML = sortedWords.map(word => this.createWordItem(word)).join('');
    }

    createWordItem(word) {
        const createdDate = new Date(word.createdAt).toLocaleDateString('zh-CN');
        const progress = this.progress.wordProgress[word.id] || {};
        
        const nextReview = progress.nextReview ? new Date(progress.nextReview) : new Date();
        const nextReviewDate = nextReview.toLocaleDateString('zh-CN');
        const needsReview = nextReview <= new Date();
        const reviewCount = progress.reviewCount || 0;
        const mastered = progress.mastered || false;
        
        const reviewStatus = mastered ? '已掌握' : (needsReview ? '需要复习' : `下次复习: ${nextReviewDate}`);
        const reviewClass = mastered ? 'success' : (needsReview ? 'warning' : 'secondary');
        
        return `
            <div class="word-item" data-id="${word.id}">
                <div class="word">${word.word}</div>
                <div class="definition">${word.definition}</div>
                <div class="examples">${word.examples}</div>
                <div class="meta">
                    <div class="word-info">
                        <span>添加时间: ${createdDate}</span>
                        <span>复习次数: ${reviewCount}</span>
                        ${word.category ? `<span>分类: ${word.category}</span>` : ''}
                    </div>
                    <div class="word-status">
                        <span class="btn ${reviewClass}" style="font-size: 12px; padding: 4px 8px;">${reviewStatus}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn secondary" onclick="app.editWord('${word.id}')">编辑</button>
                    <button class="btn danger" onclick="app.deleteWord('${word.id}')">删除</button>
                </div>
            </div>
        `;
    }

    // 删除单词
    deleteWord(wordId) {
        if (!confirm('确定要删除这个单词吗？')) return;
        
        this.words = this.words.filter(word => word.id !== wordId);
        
        // 同时删除学习进度
        if (this.progress.wordProgress[wordId]) {
            delete this.progress.wordProgress[wordId];
        }
        
        this.saveProgress();
        this.saveWordsBackup();
        this.renderWordList();
        this.updateUI();
    }

    // 编辑单词（简单实现）
    editWord(wordId) {
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;
        
        const newWord = prompt('编辑单词:', word.word);
        const newDefinition = prompt('编辑解释:', word.definition);
        const newExamples = prompt('编辑例句:', word.examples);
        
        if (newWord && newDefinition && newExamples) {
            word.word = newWord.trim();
            word.definition = newDefinition.trim();
            word.examples = newExamples.trim();
            this.saveData();
            this.renderWordList();
        }
    }

    // ================================
    // Flash Card复习功能
    // ================================
    
    initReview() {
        this.currentReviewWords = this.getWordsForReview();
        this.currentReviewIndex = 0;
        
        // 随机打乱顺序
        this.currentReviewWords = this.currentReviewWords.sort(() => Math.random() - 0.5);
        
        this.reviewSession = {
            total: this.currentReviewWords.length,
            completed: 0,
            correct: 0
        };
        
        this.updateReviewUI();
        this.showCurrentCard();
    }

    updateReviewUI() {
        document.getElementById('review-count').textContent = `今日需复习：${this.reviewSession.total}`;
        document.getElementById('review-progress').textContent = 
            `进度：${this.reviewSession.completed}/${this.reviewSession.total}`;
    }

    showCurrentCard() {
        if (this.reviewSession.completed >= this.reviewSession.total) {
            this.completeReview();
            return;
        }
        
        const word = this.currentReviewWords[this.currentReviewIndex];
        
        document.getElementById('no-review').style.display = this.reviewSession.total === 0 ? 'block' : 'none';
        document.getElementById('flashcard').style.display = this.reviewSession.total === 0 ? 'none' : 'block';
        
        if (word) {
            document.getElementById('current-word').textContent = word.word;
            document.getElementById('current-definition').textContent = word.definition;
            document.getElementById('current-examples').textContent = word.examples;
            
            // 重置卡片状态
            document.querySelector('.card-front').style.display = 'flex';
            document.querySelector('.card-back').style.display = 'none';
        }
    }

    showAnswer() {
        document.querySelector('.card-front').style.display = 'none';
        document.querySelector('.card-back').style.display = 'flex';
    }

    reviewAnswer(difficulty) {
        const word = this.currentReviewWords[this.currentReviewIndex];
        if (!word) return;
        
        this.updateWordReview(word.id, difficulty);
        
        if (difficulty === 1) {
            this.reviewSession.correct++;
        }
        
        this.reviewSession.completed++;
        this.currentReviewIndex++;
        
        // 更新统计
        const dailyReviewed = parseInt(localStorage.getItem('flashcard-daily-reviewed') || '0');
        localStorage.setItem('flashcard-daily-reviewed', String(dailyReviewed + 1));
        
        this.updateReviewUI();
        this.showCurrentCard();
    }

    completeReview() {
        const accuracy = this.reviewSession.total > 0 ? 
            Math.round((this.reviewSession.correct / this.reviewSession.total) * 100) : 0;
            
        document.getElementById('flashcard-container').innerHTML = `
            <div class="empty-state">
                <h3>复习完成！</h3>
                <p>今日复习了 ${this.reviewSession.total} 个单词</p>
                <p>正确率：${accuracy}%</p>
                <button class="btn primary" onclick="app.showSection('add')">添加更多单词</button>
                <button class="btn secondary" onclick="app.initReview()">重新开始复习</button>
            </div>
        `;
        
        this.updateUI();
    }

    // ================================
    // 统计功能
    // ================================
    
    updateStats() {
        const totalWords = this.words.length;
        const masteredWords = Object.values(this.progress.wordProgress).filter(p => p.mastered).length;
        const dailyReviewed = parseInt(localStorage.getItem('flashcard-daily-reviewed') || '0');
        
        // 计算连续天数
        const streakDays = this.progress.statistics.streakDays || 0;
        
        document.getElementById('total-words').textContent = totalWords;
        document.getElementById('mastered-words').textContent = masteredWords;
        document.getElementById('review-today').textContent = dailyReviewed;
        document.getElementById('streak-days').textContent = streakDays;
        
        this.renderActivity();
    }

    calculateStreakDays() {
        // 简化实现：返回存储的连续天数
        return parseInt(localStorage.getItem('flashcard-streak-days') || '0');
    }

    renderActivity() {
        const container = document.getElementById('activity-list');
        const recentWords = this.words
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
            
        if (recentWords.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无活动记录</p></div>';
            return;
        }
        
        container.innerHTML = recentWords.map(word => {
            const date = new Date(word.createdAt).toLocaleDateString('zh-CN');
            return `
                <div class="activity-item">
                    <span>添加了单词「${word.word}」</span>
                    <span>${date}</span>
                </div>
            `;
        }).join('');
    }

    // ================================
    // 数据管理功能
    // ================================
    
    exportData() {
        const data = {
            words: this.words,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcard-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    backupData() {
        this.exportData();
        this.showMessage('数据备份成功！', 'success');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.words && Array.isArray(data.words)) {
                    if (confirm(`将导入 ${data.words.length} 个单词，这将覆盖现有数据。确定继续吗？`)) {
                        this.words = data.words;
                        this.saveData();
                        this.updateUI();
                        this.showMessage('数据导入成功！', 'success');
                    }
                } else {
                    this.showMessage('无效的数据格式', 'error');
                }
            } catch (error) {
                this.showMessage('导入失败：文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            if (confirm('请再次确认：这将删除所有单词和学习记录！')) {
                this.words = [];
                localStorage.clear();
                this.updateUI();
                this.showMessage('所有数据已清空', 'success');
            }
        }
    }

    // ================================
    // Excel处理功能
    // ================================
    
    // 导入Excel文件
    async importExcel(file) {
        if (!file) return;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // 解析Excel数据
            const newWords = this.parseExcelData(jsonData);
            
            if (newWords.length > 0) {
                // 合并新单词到现有数据中
                this.mergeWords(newWords);
                this.updateUI();
                this.updateFileStatus(`已导入 ${newWords.length} 个单词`, 'connected');
                this.showMessage(`成功导入 ${newWords.length} 个单词！`, 'success');
                
                // 保存Excel文件引用（如果浏览器支持）
                if (window.FileSystemFileHandle && file.handle) {
                    this.excelFile = file.handle;
                    this.startExcelMonitoring();
                }
            } else {
                this.showMessage('Excel文件中没有找到有效的单词数据', 'error');
            }
        } catch (error) {
            console.error('Error importing Excel:', error);
            this.showMessage('导入Excel文件失败：' + error.message, 'error');
            this.updateFileStatus('导入失败', 'error');
        }
    }

    // 解析Excel数据
    parseExcelData(jsonData) {
        const words = [];
        
        // 跳过表头，从第二行开始
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 3 && row[1] && row[2]) { // 至少需要单词和解释
                const word = {
                    id: row[0] || `excel_${Date.now()}_${i}`, // ID或自动生成
                    word: String(row[1]).trim(),
                    definition: String(row[2]).trim(),
                    examples: row[3] ? String(row[3]).trim() : '',
                    category: row[4] ? String(row[4]).trim() : '',
                    createdAt: row[5] ? new Date(row[5]).toISOString() : new Date().toISOString()
                };
                words.push(word);
            }
        }
        
        return words;
    }

    // 合并单词数据
    mergeWords(newWords) {
        let addedCount = 0;
        let updatedCount = 0;
        
        newWords.forEach(newWord => {
            const existingIndex = this.words.findIndex(w => w.id === newWord.id || w.word.toLowerCase() === newWord.word.toLowerCase());
            
            if (existingIndex >= 0) {
                // 更新现有单词（保留学习进度）
                this.words[existingIndex] = {
                    ...this.words[existingIndex],
                    ...newWord,
                    id: this.words[existingIndex].id // 保持原ID
                };
                updatedCount++;
            } else {
                // 添加新单词
                this.words.push(newWord);
                addedCount++;
                
                // 为新单词创建初始学习记录
                this.progress.wordProgress[newWord.id] = {
                    reviewCount: 0,
                    lastReviewed: null,
                    nextReview: new Date().toISOString(),
                    difficulty: 0,
                    mastered: false
                };
            }
        });
        
        this.saveProgress();
        this.saveWordsBackup();
        
        console.log(`合并完成：新增 ${addedCount} 个，更新 ${updatedCount} 个`);
    }

    // 导出到Excel
    exportExcel() {
        try {
            // 准备导出数据
            const exportData = [
                ['ID', '单词/短语', '解释', '例句', '分类', '添加时间', '复习次数', '掌握状态'] // 表头
            ];
            
            this.words.forEach(word => {
                const progress = this.progress.wordProgress[word.id] || {};
                exportData.push([
                    word.id,
                    word.word,
                    word.definition,
                    word.examples,
                    word.category || '',
                    new Date(word.createdAt).toLocaleDateString('zh-CN'),
                    progress.reviewCount || 0,
                    progress.mastered ? '已掌握' : '学习中'
                ]);
            });
            
            // 创建工作簿
            const worksheet = XLSX.utils.aoa_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '单词列表');
            
            // 下载文件
            const fileName = `flashcard-words-${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            this.showMessage('Excel文件导出成功！', 'success');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            this.showMessage('导出Excel失败：' + error.message, 'error');
        }
    }

    // 下载Excel模板
    downloadTemplate() {
        try {
            const templateData = [
                ['ID', '单词/短语', '解释', '例句', '分类', '添加时间'], // 表头
                ['1', 'nail down', 'successfully complete/clarify/figure out', 'We need to nail down the details of this project', '动词短语', '2024/8/8'],
                ['2', 'meticulous', 'showing great attention to detail; very careful', 'She is meticulous about her work', '形容词', '2024/8/8'],
                ['3', 'procrastinate', 'delay or postpone action', 'Stop procrastinating and start studying', '动词', '2024/8/8']
            ];
            
            const worksheet = XLSX.utils.aoa_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '单词模板');
            
            // 添加说明工作表
            const instructionData = [
                ['Excel模板使用说明'],
                [''],
                ['列说明：'],
                ['A列：ID - 可留空，系统会自动生成'],
                ['B列：单词/短语 - 必填，要学习的英文单词或短语'],
                ['C列：解释 - 必填，中文或英文解释'],
                ['D列：例句 - 可选，但建议填写，帮助理解和记忆'],
                ['E列：分类 - 可选，如"动词"、"名词"、"短语"等'],
                ['F列：添加时间 - 可留空，系统会自动设置为当前时间'],
                [''],
                ['使用步骤：'],
                ['1. 在模板中添加您要学习的单词'],
                ['2. 保存Excel文件'],
                ['3. 在应用中点击"导入Excel文件"'],
                ['4. 选择您保存的Excel文件'],
                ['5. 开始学习！']
            ];
            
            const instructionSheet = XLSX.utils.aoa_to_sheet(instructionData);
            XLSX.utils.book_append_sheet(workbook, instructionSheet, '使用说明');
            
            XLSX.writeFile(workbook, 'flashcard-template.xlsx');
            this.showMessage('Excel模板下载成功！', 'success');
        } catch (error) {
            console.error('Error downloading template:', error);
            this.showMessage('下载模板失败：' + error.message, 'error');
        }
    }

    // 更新文件状态显示
    updateFileStatus(message, status = 'normal') {
        const statusElement = document.getElementById('file-status-text');
        const refreshButton = document.getElementById('refresh-excel');
        const statusContainer = document.querySelector('.file-status');
        
        statusElement.textContent = message;
        
        // 移除之前的状态类
        statusContainer.classList.remove('connected', 'error');
        
        if (status === 'connected') {
            statusContainer.classList.add('connected');
            refreshButton.style.display = 'inline-block';
        } else if (status === 'error') {
            statusContainer.classList.add('error');
            refreshButton.style.display = 'none';
        } else {
            refreshButton.style.display = 'none';
        }
    }

    // 刷新Excel数据
    refreshExcelData() {
        if (this.excelFile) {
            // 如果有Excel文件引用，重新读取
            this.readExcelFile();
        } else {
            this.showMessage('请先导入Excel文件', 'error');
        }
    }

    // 开始Excel文件监听
    startExcelMonitoring() {
        // 注意：实际的文件监听需要特殊的API支持
        // 这里实现一个简单的定时检查
        if (this.excelMonitorInterval) {
            clearInterval(this.excelMonitorInterval);
        }
        
        this.excelMonitorInterval = setInterval(() => {
            // 这里可以实现文件变化检测逻辑
            // 由于浏览器限制，实际实现可能需要用户手动刷新
        }, 5000);
    }

    // ================================
    // UI更新
    // ================================
    
    updateUI() {
        // 更新所有需要实时更新的UI元素
        if (document.getElementById('list').classList.contains('active')) {
            this.renderWordList();
        }
        if (document.getElementById('stats').classList.contains('active')) {
            this.updateStats();
        }
        if (document.getElementById('review').classList.contains('active')) {
            this.updateReviewUI();
        }
    }
}

// 全局函数（用于HTML中的onclick事件）
function showSection(section) {
    app.showSection(section);
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FlashCardApp();
});