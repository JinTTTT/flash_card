class Storage {
    constructor() {
        this.words = [];
        this.progress = this.loadProgress();
        this.loadCachedWords(); // 加载缓存的单词
        this.loadLegacyData(); // 加载旧数据作为兼容
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('flashcard-progress');
            return saved ? JSON.parse(saved) : {
                wordProgress: {},
                statistics: { totalReviewed: 0, streakDays: 0 },
                settings: { dailyTarget: 20 }
            };
        } catch (error) {
            console.error('Error loading progress:', error);
            return { wordProgress: {}, statistics: {}, settings: {} };
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('flashcard-progress', JSON.stringify(this.progress));
            // Also save words data to localStorage
            localStorage.setItem('flashcard-words-cache', JSON.stringify(this.words));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    loadCachedWords() {
        try {
            const cached = localStorage.getItem('flashcard-words-cache');
            if (cached) {
                this.words = JSON.parse(cached);
                console.log(`Loaded ${this.words.length} words from cache`);
                // Hide import hint if we have cached words
                setTimeout(() => {
                    const hint = document.getElementById('import-hint');
                    if (hint && this.words.length > 0) hint.style.display = 'none';
                }, 100);
            } else {
                // Show import hint if no cached words found
                setTimeout(() => {
                    const hint = document.getElementById('import-hint');
                    if (hint) hint.style.display = 'block';
                }, 100);
            }
        } catch (error) {
            console.error('Error loading cached words:', error);
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        const words = [];
        
        for (let i = 1; i < lines.length; i++) {
            const cols = this.parseCSVLine(lines[i]);
            if (cols.length >= 3 && cols[1] && cols[2]) {
                words.push({
                    id: cols[0] || `csv_${Date.now()}_${i}`,
                    word: cols[1].trim(),
                    definition: cols[2].trim(),
                    examples: cols[3] ? cols[3].trim() : '',
                    category: cols[4] ? cols[4].trim() : '',
                    createdAt: cols[5] ? new Date(cols[5]).toISOString() : new Date().toISOString()
                });
            }
        }
        return words;
    }

    parseCSVLine(line) {
        const cols = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                cols.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        cols.push(current);
        return cols;
    }

    async importCSV(file) {
        const text = await file.text();
        const newWords = this.parseCSV(text);
        this.mergeWords(newWords);
        return newWords.length;
    }

    mergeWords(newWords) {
        let added = 0;
        newWords.forEach(newWord => {
            const exists = this.words.find(w => w.word.toLowerCase() === newWord.word.toLowerCase());
            if (!exists) {
                this.words.push(newWord);
                this.progress.wordProgress[newWord.id] = {
                    reviewCount: 0,
                    lastReviewed: null,
                    nextReview: new Date().toISOString(),
                    difficulty: 0,
                    mastered: false
                };
                added++;
            }
        });
        this.saveProgress();
        return added;
    }


    addWord(word, definition, examples) {
        const newWord = {
            id: Date.now() + Math.random(),
            word: word.trim(),
            definition: definition.trim(),
            examples: examples.trim(),
            category: '',
            createdAt: new Date().toISOString()
        };
        
        this.words.push(newWord);
        this.progress.wordProgress[newWord.id] = {
            reviewCount: 0,
            lastReviewed: null,
            nextReview: new Date().toISOString(),
            difficulty: 0,
            mastered: false
        };
        
        this.saveProgress();
        return newWord;
    }

    loadLegacyData() {
        try {
            const saved = localStorage.getItem('flashcard-words');
            if (saved && this.words.length === 0) {
                const legacyWords = JSON.parse(saved);
                this.convertLegacyData(legacyWords);
            }
        } catch (error) {
            console.error('Error loading legacy data:', error);
        }
    }

    convertLegacyData(legacyWords) {
        legacyWords.forEach(word => {
            const basicWord = {
                id: word.id,
                word: word.word,
                definition: word.definition,
                examples: word.examples,
                category: word.category || '',
                createdAt: word.createdAt
            };
            this.words.push(basicWord);

            // 为每个单词创建进度记录
            this.progress.wordProgress[word.id] = {
                reviewCount: word.reviewCount || 0,
                lastReviewed: word.lastReviewed || null,
                nextReview: word.nextReview || new Date().toISOString(),
                difficulty: word.difficulty || 0,
                mastered: word.mastered || false
            };
        });
        
        this.saveProgress();
    }

    deleteWord(wordId) {
        this.words = this.words.filter(w => w.id !== wordId);
        delete this.progress.wordProgress[wordId];
        this.saveProgress();
    }

    // 删除单词的别名方法
    removeWord(wordId) {
        return this.deleteWord(wordId);
    }

    updateWordProgress(wordId, reviewData) {
        if (!this.progress.wordProgress[wordId]) {
            this.progress.wordProgress[wordId] = {
                reviewCount: 0, lastReviewed: null, 
                nextReview: new Date().toISOString(), difficulty: 0, mastered: false
            };
        }
        
        Object.assign(this.progress.wordProgress[wordId], reviewData);
        this.progress.statistics.totalReviewed = (this.progress.statistics.totalReviewed || 0) + 1;
        this.saveProgress();
    }

    // 获取所有单词及其阶段信息
    getWordsWithPhases(algorithm) {
        return this.words.map(word => {
            const progress = this.progress.wordProgress[word.id];
            const phase = algorithm.getWordPhase(progress);
            return {
                ...word,
                phase: phase,
                progress: progress
            };
        });
    }

    // 按阶段排序单词（阶段越靠前的放在前面）
    getWordsSortedByPhase(algorithm) {
        const wordsWithPhases = this.getWordsWithPhases(algorithm);
        return wordsWithPhases.sort((a, b) => a.phase - b.phase);
    }

}