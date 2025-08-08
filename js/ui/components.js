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
                    <p>No words added yet</p>
                    <button class="btn primary" onclick="app.showSection('add')">Add First Word</button>
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
        
        const reviewStatus = progress.mastered ? 'Mastered' : 
                           needsReview ? 'Need Review' : 
                           `Next Review: ${nextReview.toLocaleDateString('en-US')}`;
        const reviewClass = progress.mastered ? 'success' : needsReview ? 'warning' : 'secondary';
        
        return `
            <div class="word-item" data-id="${word.id}">
                <div class="word">${word.word}</div>
                <div class="definition">${word.definition}</div>
                <div class="examples">${word.examples}</div>
                <div class="meta">
                    <div class="word-info">
                        <span>Added: ${createdDate}</span>
                        <span>Reviews: ${progress.reviewCount || 0}</span>
                        ${word.category ? `<span>Category: ${word.category}</span>` : ''}
                    </div>
                    <div class="word-status">
                        <span class="btn ${reviewClass}" style="font-size: 12px; padding: 4px 8px;">
                            ${reviewStatus}
                        </span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn danger" onclick="app.deleteWord('${word.id}')">Delete</button>
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
        document.getElementById('review-count').textContent = `Today's Review: ${session.total}`;
        document.getElementById('review-progress').textContent = 
            `Progress: ${session.completed}/${session.total}`;
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

        // 自动播放单词读音
        if (window.app && window.app.pronunciation) {
            // 稍微延迟播放，让UI先更新
            setTimeout(() => {
                window.app.pronunciation.speak(word.word);
            }, 300);
        }
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
                <h3>Review Complete!</h3>
                <p>Reviewed ${session.total} words today</p>
                <p>Accuracy: ${accuracy}%</p>
                <button class="btn primary" onclick="app.showSection('add')">Add More Words</button>
                <button class="btn secondary" onclick="app.initReview()">Start Review Again</button>
            </div>
        `;
    }
}