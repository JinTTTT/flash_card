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
}