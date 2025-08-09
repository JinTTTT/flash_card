class EventHandler {
    constructor(app) {
        this.app = app;
    }

    bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.app.showSection(section);
            });
        });

        document.getElementById('word-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.app.addWord();
        });


        // Front card buttons
        document.getElementById('hard-btn').addEventListener('click', () => {
            this.app.showAnswerAndContinue(-1);
        });

        document.getElementById('medium-btn').addEventListener('click', () => {
            this.app.showAnswerAndContinue(0);
        });

        document.getElementById('easy-btn').addEventListener('click', () => {
            this.app.reviewAnswer(1); // Remember - jump to next word directly
        });

        // Next button (after viewing answer)
        document.getElementById('next-btn').addEventListener('click', () => {
            this.app.reviewAnswer(this.app.pendingDifficulty);
        });

        document.getElementById('pronounce-btn').addEventListener('click', () => {
            const currentWord = document.getElementById('current-word').textContent;
            if (currentWord && this.app.pronunciation) {
                this.app.pronunciation.speak(currentWord);
            }
        });

        document.getElementById('json-import').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.app.importJSON(e.target.files[0]);
            }
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.app.exportJSON();
        });
    }

}