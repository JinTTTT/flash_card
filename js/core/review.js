class ReviewSession {
    constructor(storage, algorithm) {
        this.storage = storage;
        this.algorithm = algorithm;
        this.currentWords = [];
        this.currentIndex = 0;
        this.session = { total: 0, completed: 0, correct: 0 };
    }

    startReview() {
        this.currentWords = this.algorithm.getWordsForReview(
            this.storage.words, 
            this.storage.progress.wordProgress
        );
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