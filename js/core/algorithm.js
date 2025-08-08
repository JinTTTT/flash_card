class EbbinghausAlgorithm {
    constructor() {
        this.intervals = [1, 2, 4, 7, 15, 30, 60, 120];
    }

    calculateNextReview(reviewCount, difficulty) {
        let interval;
        
        if (reviewCount >= this.intervals.length) {
            interval = this.intervals[this.intervals.length - 1] * 
                      Math.pow(2, reviewCount - this.intervals.length);
        } else {
            interval = this.intervals[reviewCount] || 1;
        }
        
        switch (difficulty) {
            case -1: interval = Math.max(1, Math.floor(interval * 0.3)); break;
            case 0:  interval = Math.max(1, Math.floor(interval * 0.7)); break;
            case 1:  interval = Math.ceil(interval * 1.2); break;
        }
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        return nextReview.toISOString();
    }

    getWordsForReview(words, progressData) {
        const now = new Date();
        return words.filter(word => {
            const progress = progressData[word.id];
            if (!progress) return true;
            
            const nextReview = new Date(progress.nextReview);
            return nextReview <= now && !progress.mastered;
        });
    }

    updateReview(wordId, difficulty, storage) {
        const progress = storage.progress.wordProgress[wordId];
        const reviewCount = (progress?.reviewCount || 0) + 1;
        
        const reviewData = {
            lastReviewed: new Date().toISOString(),
            reviewCount: reviewCount,
            difficulty: difficulty,
            nextReview: this.calculateNextReview(reviewCount, difficulty),
            mastered: difficulty === 1 && reviewCount >= 5
        };
        
        storage.updateWordProgress(wordId, reviewData);
        return reviewData;
    }
}