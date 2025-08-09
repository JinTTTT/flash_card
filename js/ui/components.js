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



    updateReviewUI(session) {
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

    // 显示单词列表
    showWordList(words) {
        const totalWords = document.getElementById('total-words');
        const wordListContent = document.getElementById('word-list-content');
        const emptyState = document.getElementById('empty-word-list');

        totalWords.textContent = `Total words: ${words.length}`;

        if (words.length === 0) {
            wordListContent.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        wordListContent.style.display = 'block';
        emptyState.style.display = 'none';

        wordListContent.innerHTML = words.map(word => this.renderWordListItem(word)).join('');
    }

    // 渲染单个单词列表项
    renderWordListItem(word) {
        const lastReviewed = word.progress?.lastReviewed 
            ? this.formatDate(new Date(word.progress.lastReviewed))
            : 'Never';
        
        const nextReview = word.progress?.nextReview 
            ? this.formatDate(new Date(word.progress.nextReview))
            : 'Today';

        const reviewCount = word.progress?.reviewCount || 0;

        return `
            <div class="word-list-item">
                <div class="word-header">
                    <h3 class="word-title">${word.word}</h3>
                    <span class="phase-badge phase-${word.phase}">Phase ${word.phase}</span>
                </div>
                
                <div class="word-definition">${word.definition}</div>
                
                ${word.examples ? `<div class="word-examples">${word.examples}</div>` : ''}
                
                <div class="word-progress-info">
                    <div class="progress-detail">
                        <span>Reviewed: ${reviewCount} times</span>
                        <span>Last: ${lastReviewed}</span>
                        <span>Next: ${nextReview}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 格式化日期
    formatDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1) return `In ${diffDays} days`;
        if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
        
        return date.toLocaleDateString();
    }
}