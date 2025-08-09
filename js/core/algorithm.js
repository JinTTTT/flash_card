class EbbinghausAlgorithm {
    constructor() {
        this.intervals = [0, 1, 3, 7, 14, 30, 60]; // 7个复习阶段
    }

    calculateNextReview(reviewCount, difficulty) {
        // 确保不超过最大阶段数
        if (reviewCount >= this.intervals.length) {
            return null; // 表示该单词应该被删除
        }
        
        let interval = this.intervals[reviewCount] || 1;
        
        // 只有在非最后阶段时才调整间隔
        if (reviewCount < this.intervals.length - 1) {
            switch (difficulty) {
                case -1: interval = Math.max(1, Math.floor(interval * 0.3)); break;
                case 0:  interval = Math.max(1, Math.floor(interval * 0.7)); break;
                case 1:  interval = Math.ceil(interval * 1.2); break;
            }
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
            return nextReview <= now && !progress.completed;
        });
    }

    updateReview(wordId, difficulty, storage) {
        const progress = storage.progress.wordProgress[wordId];
        const reviewCount = (progress?.reviewCount || 0) + 1;
        const nextReview = this.calculateNextReview(reviewCount, difficulty);
        
        const reviewData = {
            lastReviewed: new Date().toISOString(),
            reviewCount: reviewCount,
            difficulty: difficulty,
            nextReview: nextReview,
            completed: nextReview === null // 标记为完成，准备删除
        };
        
        storage.updateWordProgress(wordId, reviewData);
        
        // 如果单词已完成，从词汇列表中删除
        if (reviewData.completed) {
            storage.removeWord(wordId);
        }
        
        return reviewData;
    }

    // 获取单词的当前阶段 (1-7)
    getWordPhase(wordProgress) {
        if (!wordProgress) return 1;
        return Math.min(wordProgress.reviewCount + 1, this.intervals.length);
    }
}