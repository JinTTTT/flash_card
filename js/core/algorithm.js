class EbbinghausAlgorithm {
    constructor() {
        this.intervals = [1, 3, 7, 14, 30, 60, 120]; // 7个复习阶段，对应天数
    }

    calculateNextReview(currentPhase) {
        // 如果阶段超过最大值，表示单词已掌握
        if (currentPhase >= this.intervals.length) {
            return null; // 表示该单词应该被删除
        }
        
        const interval = this.intervals[currentPhase] || 1;
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        return nextReview.toISOString();
    }

    getWordsForReview(words) {
        const now = new Date();
        
        return words.filter(word => {
            // 新数据结构：进度信息直接在word对象中
            if (!word.nextReview) return true; // 新单词
            
            const nextReview = new Date(word.nextReview);
            return nextReview <= now && !word.completed;
        });
    }

    updateReview(wordId, difficulty, storage) {
        const word = storage.words.find(w => w.id == wordId);
        if (!word) {
            console.error('Word not found for review update:', wordId);
            return null;
        }
        
        const currentPhase = word.phase || 0;
        
        let newPhase;
        let shouldDelete = false;
        
        // 根据难度调整阶段
        switch (difficulty) {
            case -1: // Don't Know - 阶段归零
                newPhase = 0;
                break;
            case 0:  // Vague - 阶段减1，最小为0
                newPhase = Math.max(0, currentPhase - 1);
                break;
            case 1:  // Remember - 阶段加1
                newPhase = currentPhase + 1;
                // 如果达到阶段7，标记为删除
                if (newPhase >= this.intervals.length) {
                    shouldDelete = true;
                }
                break;
        }
        
        const nextReview = shouldDelete ? null : this.calculateNextReview(newPhase);
        
        const reviewData = {
            lastReviewed: new Date().toISOString(),
            phase: newPhase,
            difficulty: difficulty,
            nextReview: nextReview,
            reviewCount: (word.reviewCount || 0) + 1,
            completed: shouldDelete
        };
        
        storage.updateWordProgress(wordId, reviewData);
        
        // 如果单词已完成，从词汇列表中删除
        if (shouldDelete) {
            storage.removeWord(wordId);
        }
        
        return reviewData;
    }

    // 获取单词的当前阶段 (0-6)
    getWordPhase(word) {
        if (!word) return 0;
        return word.phase || 0;
    }
}