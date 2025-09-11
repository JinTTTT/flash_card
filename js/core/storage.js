class Storage {
    constructor() {
        this.words = [];
        this.globalSettings = {
            statistics: { totalReviewed: 0, streakDays: 0 },
            settings: { dailyTarget: 20, reviewReminder: true },
            algorithmVersion: '2.0'
        };
        this.loadData();
    }

    // 加载数据：优先从localStorage，然后从JSON文件
    loadData() {
        try {
            // 尝试从localStorage加载
            const cached = localStorage.getItem('flashcard-data');
            if (cached) {
                const data = JSON.parse(cached);
                this.words = data.vocabulary || [];
                this.globalSettings = { ...this.globalSettings, ...data.globalSettings };
                console.log(`Loaded ${this.words.length} words from localStorage cache`);
                this.hideImportHint();
                return;
            }

            // 如果没有缓存，显示导入提示
            this.showImportHint();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showImportHint();
        }
    }

    // 保存数据到localStorage
    saveData() {
        try {
            const data = {
                vocabulary: this.words,
                globalSettings: {
                    ...this.globalSettings,
                    exportedAt: new Date().toISOString()
                }
            };
            localStorage.setItem('flashcard-data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // 显示/隐藏导入提示
    showImportHint() {
        setTimeout(() => {
            const hint = document.getElementById('import-hint');
            if (hint) hint.style.display = 'block';
        }, 100);
    }

    hideImportHint() {
        setTimeout(() => {
            const hint = document.getElementById('import-hint');
            if (hint && this.words.length > 0) hint.style.display = 'none';
        }, 100);
    }

    // 添加新单词
    addWord(word, definition, examples) {
        const newWord = {
            id: Date.now() + Math.random(),
            word: word.trim(),
            definition: definition.trim(),
            examples: examples.trim(),
            createdAt: new Date().toISOString(),
            // 学习进度信息
            phase: 0,
            reviewCount: 0,
            lastReviewed: null,
            nextReview: new Date().toISOString(),
            difficulty: 0,
            completed: false
        };
        
        this.words.push(newWord);
        this.saveData();
        return newWord;
    }

    // 导入词汇数据
    mergeWords(importedData) {
        let added = 0;
        
        // 处理新格式数据
        if (importedData.vocabulary && Array.isArray(importedData.vocabulary)) {
            // 新格式：包含vocabulary数组
            const newWords = importedData.vocabulary;
            
            newWords.forEach(newWord => {
                const exists = this.words.find(w => w.word.toLowerCase() === newWord.word.toLowerCase());
                if (!exists) {
                    // 确保包含所有必要字段
                    const completeWord = {
                        id: newWord.id || (Date.now() + Math.random()),
                        word: newWord.word,
                        definition: newWord.definition,
                        examples: newWord.examples,
                        createdAt: newWord.createdAt || new Date().toISOString(),
                        // 学习进度
                        phase: newWord.phase || 0,
                        reviewCount: newWord.reviewCount || 0,
                        lastReviewed: newWord.lastReviewed || null,
                        nextReview: newWord.nextReview || new Date().toISOString(),
                        difficulty: newWord.difficulty || 0,
                        completed: newWord.completed || false
                    };
                    this.words.push(completeWord);
                    added++;
                }
            });

            // 合并全局设置
            if (importedData.globalSettings) {
                this.globalSettings = { ...this.globalSettings, ...importedData.globalSettings };
            }
        } else if (Array.isArray(importedData)) {
            // 旧格式：直接是词汇数组（向后兼容）
            importedData.forEach(newWord => {
                const exists = this.words.find(w => w.word.toLowerCase() === newWord.word.toLowerCase());
                if (!exists) {
                    const completeWord = {
                        id: newWord.id || (Date.now() + Math.random()),
                        word: newWord.word,
                        definition: newWord.definition,
                        examples: newWord.examples,
                        createdAt: newWord.createdAt || new Date().toISOString(),
                        // 默认学习进度
                        phase: 0,
                        reviewCount: 0,
                        lastReviewed: null,
                        nextReview: new Date().toISOString(),
                        difficulty: 0,
                        completed: false
                    };
                    this.words.push(completeWord);
                    added++;
                }
            });
        }

        this.saveData();
        this.hideImportHint();
        return added;
    }

    // 删除单词
    deleteWord(wordId) {
        this.words = this.words.filter(w => w.id != wordId);
        this.saveData();
    }

    // 别名方法
    removeWord(wordId) {
        return this.deleteWord(wordId);
    }

    // 更新单词信息
    updateWord(wordId, updatedData) {
        const wordIndex = this.words.findIndex(w => w.id == wordId);
        if (wordIndex === -1) {
            console.error('Word not found:', wordId);
            return false;
        }
        
        // 更新单词数据，保留原有的id和学习进度
        this.words[wordIndex] = {
            ...this.words[wordIndex],
            ...updatedData,
            id: wordId, // 确保ID不被覆盖
            // 保留学习进度字段
            phase: this.words[wordIndex].phase,
            reviewCount: this.words[wordIndex].reviewCount,
            lastReviewed: this.words[wordIndex].lastReviewed,
            nextReview: this.words[wordIndex].nextReview,
            difficulty: this.words[wordIndex].difficulty,
            completed: this.words[wordIndex].completed
        };
        
        this.saveData();
        return true;
    }

    // 更新单词学习进度
    updateWordProgress(wordId, reviewData) {
        const wordIndex = this.words.findIndex(w => w.id == wordId);
        if (wordIndex === -1) {
            console.error('Word not found for progress update:', wordId);
            return;
        }
        
        // 更新学习进度
        Object.assign(this.words[wordIndex], reviewData);
        
        // 更新全局统计
        this.globalSettings.statistics.totalReviewed = (this.globalSettings.statistics.totalReviewed || 0) + 1;
        
        this.saveData();
    }

    // 获取所有单词及其阶段信息
    getWordsWithPhases(algorithm) {
        return this.words.map(word => ({
            ...word,
            phase: word.phase || 0,
            progress: {
                phase: word.phase || 0,
                reviewCount: word.reviewCount || 0,
                lastReviewed: word.lastReviewed,
                nextReview: word.nextReview,
                difficulty: word.difficulty || 0,
                completed: word.completed || false
            }
        }));
    }

    // 按阶段排序单词
    getWordsSortedByPhase(algorithm) {
        const wordsWithPhases = this.getWordsWithPhases(algorithm);
        return wordsWithPhases.sort((a, b) => a.phase - b.phase);
    }

    // 导出完整数据
    exportData() {
        return {
            vocabulary: this.words,
            globalSettings: {
                ...this.globalSettings,
                exportedAt: new Date().toISOString()
            }
        };
    }

    // 重置所有学习进度
    resetAllProgress() {
        this.words.forEach(word => {
            word.phase = 0;
            word.reviewCount = 0;
            word.lastReviewed = null;
            word.nextReview = new Date().toISOString();
            word.difficulty = 0;
            word.completed = false;
        });
        
        this.globalSettings.statistics = { totalReviewed: 0, streakDays: 0 };
        this.saveData();
    }

    // 向后兼容：加载旧格式数据的方法（已废弃，保留用于兼容）
    loadLegacyData() {
        // 此方法已不需要，新版本统一使用localStorage
    }

    // 向后兼容：旧的progress相关方法（已废弃，保留用于兼容）
    loadProgress() {
        return this.globalSettings;
    }

    saveProgress() {
        this.saveData();
    }

    // 迁移方法（已不需要，保留用于兼容）
    migrateToNewAlgorithm() {
        // 新版本数据结构已统一，无需迁移
    }
}