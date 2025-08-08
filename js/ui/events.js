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

        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.app.renderWordList(e.target.value);
        });

        document.getElementById('show-answer').addEventListener('click', () => {
            this.app.ui.showAnswer();
        });

        document.getElementById('hard-btn').addEventListener('click', () => {
            this.app.reviewAnswer(-1);
        });

        document.getElementById('medium-btn').addEventListener('click', () => {
            this.app.reviewAnswer(0);
        });

        document.getElementById('easy-btn').addEventListener('click', () => {
            this.app.reviewAnswer(1);
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


        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
                this.app.clearAllData();
            }
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.app.exportJSON();
        });
    }

}