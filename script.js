// 英语学习Flash Card应用
class FlashCardApp {
    constructor() {
        this.words = [];
        this.currentReviewWords = [];
        this.currentReviewIndex = 0;
        this.reviewSession = {
            total: 0,
            completed: 0,
            correct: 0
        };
        
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
    
    // 加载数据
    loadData() {
        try {
            const saved = localStorage.getItem('flashcard-words');
            if (saved) {
                this.words = JSON.parse(saved);
                // 确保每个单词都有必要的属性
                this.words = this.words.map(word => ({
                    id: word.id || Date.now() + Math.random(),
                    word: word.word || '',
                    definition: word.definition || '',
                    examples: word.examples || '',
                    createdAt: word.createdAt || new Date().toISOString(),
                    reviewCount: word.reviewCount || 0,
                    lastReviewed: word.lastReviewed || null,
                    nextReview: word.nextReview || new Date().toISOString(),
                    difficulty: word.difficulty || 0,
                    mastered: word.mastered || false
                }));
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.words = [];
        }
    }

    // 保存数据
    saveData() {
        try {
            localStorage.setItem('flashcard-words', JSON.stringify(this.words));
            localStorage.setItem('flashcard-last-save', new Date().toISOString());
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('保存数据失败，请检查浏览器存储空间', 'error');
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
            const nextReview = new Date(word.nextReview);
            return nextReview <= now && !word.mastered;
        });
    }

    // 更新单词复习状态
    updateWordReview(wordId, difficulty) {
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;

        word.lastReviewed = new Date().toISOString();
        word.reviewCount += 1;
        word.difficulty = difficulty;
        word.nextReview = this.calculateNextReview(word.reviewCount, difficulty);
        
        // 如果连续5次都是"记得清楚"，标记为已掌握
        if (difficulty === 1 && word.reviewCount >= 5) {
            word.mastered = true;
        }
        
        this.saveData();
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
            createdAt: new Date().toISOString(),
            reviewCount: 0,
            lastReviewed: null,
            nextReview: new Date().toISOString(), // 立即可复习
            difficulty: 0,
            mastered: false
        };
        
        this.words.push(newWord);
        this.saveData();
        
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
        const nextReviewDate = new Date(word.nextReview).toLocaleDateString('zh-CN');
        const needsReview = new Date(word.nextReview) <= new Date();
        const reviewStatus = word.mastered ? '已掌握' : (needsReview ? '需要复习' : `下次复习: ${nextReviewDate}`);
        const reviewClass = word.mastered ? 'success' : (needsReview ? 'warning' : 'secondary');
        
        return `
            <div class="word-item" data-id="${word.id}">
                <div class="word">${word.word}</div>
                <div class="definition">${word.definition}</div>
                <div class="examples">${word.examples}</div>
                <div class="meta">
                    <div class="word-info">
                        <span>添加时间: ${createdDate}</span>
                        <span>复习次数: ${word.reviewCount}</span>
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
        this.saveData();
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
        const masteredWords = this.words.filter(w => w.mastered).length;
        const dailyReviewed = parseInt(localStorage.getItem('flashcard-daily-reviewed') || '0');
        
        // 计算连续天数（简化实现）
        const streakDays = this.calculateStreakDays();
        
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