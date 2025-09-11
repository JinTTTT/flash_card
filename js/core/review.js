class ReviewSession {
    constructor(storage, algorithm) {
        this.storage = storage;
        this.algorithm = algorithm;
        this.currentWords = [];
        this.currentIndex = 0;
        this.session = { total: 0, completed: 0, correct: 0 };
    }

    startReview() {
        this.currentWords = this.algorithm.getWordsForReview(this.storage.words);
        this.currentWords = this.currentWords.sort(() => Math.random() - 0.5);
        
        this.session = {
            total: this.currentWords.length,
            completed: 0,
            correct: 0
        };
        this.currentIndex = 0;
        
        return this.session;
    }

    getCurrentWord() {
        if (this.currentIndex >= this.currentWords.length) return null;
        return this.currentWords[this.currentIndex];
    }

    submitAnswer(difficulty) {
        const currentWord = this.getCurrentWord();
        if (!currentWord) return false;

        // 特殊情况：需要放到队尾的情况（不记得和想起来了）
        if (difficulty === -1 || difficulty === 0) {
            // 从当前位置移除单词
            const wordToMove = this.currentWords.splice(this.currentIndex, 1)[0];
            // 添加到队列末尾
            this.currentWords.push(wordToMove);
            // 不增加currentIndex，这样下一个单词自动成为当前单词
            
            // 更新单词进度
            this.algorithm.updateReview(currentWord.id, difficulty, this.storage);
            
            // 如果队列中没有更多单词了，完成复习
            return this.currentIndex >= this.currentWords.length;
        }
        
        // Remember 的正常处理：直接下一个
        this.algorithm.updateReview(currentWord.id, difficulty, this.storage);
        
        if (difficulty === 1) this.session.correct++;
        this.session.completed++;
        this.currentIndex++;
        
        return this.session.completed >= this.session.total;
    }

    getProgress() {
        return {
            current: this.session.completed,
            total: this.session.total,
            accuracy: this.session.total > 0 ? 
                Math.round((this.session.correct / this.session.total) * 100) : 0
        };
    }

    isComplete() {
        return this.currentIndex >= this.currentWords.length;
    }
}