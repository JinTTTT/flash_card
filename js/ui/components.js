class UI {
    constructor() {
        this.currentSection = 'add';
    }

    showSection(sectionName) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        this.currentSection = sectionName;
    }

    showMessage(text, type = 'success') {
        const messageEl = document.getElementById('add-message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => messageEl.style.display = 'none', 3000);
    }

    renderWordList(words, progressData, sortBy = 'recent') {
        const container = document.getElementById('word-list');
        
        if (words.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>还没有添加任何单词</p>
                    <button class="btn primary" onclick="app.showSection('add')">添加第一个单词</button>
                </div>
            `;
            return;
        }
        
        let sortedWords = [...words];
        if (sortBy === 'recent') {
            sortedWords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'review') {
            sortedWords.sort((a, b) => {
                const aProgress = progressData[a.id];
                const bProgress = progressData[b.id];
                const now = new Date();
                
                const aNeedsReview = aProgress ? new Date(aProgress.nextReview) <= now : true;
                const bNeedsReview = bProgress ? new Date(bProgress.nextReview) <= now : true;
                
                if (aNeedsReview && !bNeedsReview) return -1;
                if (!aNeedsReview && bNeedsReview) return 1;
                
                const aNext = aProgress ? new Date(aProgress.nextReview) : new Date();
                const bNext = bProgress ? new Date(bProgress.nextReview) : new Date();
                return aNext - bNext;
            });
        }
        
        container.innerHTML = sortedWords.map(word => this.createWordItem(word, progressData)).join('');
    }

    createWordItem(word, progressData) {
        const progress = progressData[word.id] || {};
        const createdDate = new Date(word.createdAt).toLocaleDateString('zh-CN');
        const nextReview = progress.nextReview ? new Date(progress.nextReview) : new Date();
        const needsReview = nextReview <= new Date();
        
        const reviewStatus = progress.mastered ? '已掌握' : 
                           needsReview ? '需要复习' : 
                           `下次复习: ${nextReview.toLocaleDateString('zh-CN')}`;
        const reviewClass = progress.mastered ? 'success' : needsReview ? 'warning' : 'secondary';
        
        return `
            <div class="word-item" data-id="${word.id}">
                <div class="word">${word.word}</div>
                <div class="definition">${word.definition}</div>
                <div class="examples">${word.examples}</div>
                <div class="meta">
                    <div class="word-info">
                        <span>添加: ${createdDate}</span>
                        <span>复习: ${progress.reviewCount || 0}次</span>
                        ${word.category ? `<span>分类: ${word.category}</span>` : ''}
                    </div>
                    <div class="word-status">
                        <span class="btn ${reviewClass}" style="font-size: 12px; padding: 4px 8px;">
                            ${reviewStatus}
                        </span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn danger" onclick="app.deleteWord('${word.id}')">删除</button>
                </div>
            </div>
        `;
    }

    updateStats(words, progressData) {
        const totalWords = words.length;
        const masteredWords = Object.values(progressData).filter(p => p.mastered).length;
        const dailyReviewed = parseInt(localStorage.getItem('flashcard-daily-reviewed') || '0');
        
        document.getElementById('total-words').textContent = totalWords;
        document.getElementById('mastered-words').textContent = masteredWords;
        document.getElementById('review-today').textContent = dailyReviewed;
        document.getElementById('streak-days').textContent = '0';
    }

    updateReviewUI(session) {
        document.getElementById('review-count').textContent = `今日需复习：${session.total}`;
        document.getElementById('review-progress').textContent = 
            `进度：${session.completed}/${session.total}`;
    }

    showFlashCard(word) {
        if (!word) {
            document.getElementById('no-review').style.display = 'block';
            document.getElementById('flashcard').style.display = 'none';
            return;
        }

        document.getElementById('no-review').style.display = 'none';
        document.getElementById('flashcard').style.display = 'block';
        document.getElementById('current-word').textContent = word.word;
        document.getElementById('current-definition').textContent = word.definition;
        document.getElementById('current-examples').textContent = word.examples;
        
        document.querySelector('.card-front').style.display = 'flex';
        document.querySelector('.card-back').style.display = 'none';
    }

    showAnswer() {
        document.querySelector('.card-front').style.display = 'none';
        document.querySelector('.card-back').style.display = 'flex';
    }

    showReviewComplete(session) {
        const accuracy = session.total > 0 ? 
            Math.round((session.correct / session.total) * 100) : 0;
            
        document.getElementById('flashcard-container').innerHTML = `
            <div class="empty-state">
                <h3>复习完成！</h3>
                <p>今日复习了 ${session.total} 个单词</p>
                <p>正确率：${accuracy}%</p>
                <button class="btn primary" onclick="app.showSection('add')">添加更多单词</button>
                <button class="btn secondary" onclick="app.initReview()">重新开始复习</button>
            </div>
        `;
    }
}