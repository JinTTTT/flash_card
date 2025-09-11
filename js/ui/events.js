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


        // Initial stage buttons
        document.getElementById('remember-btn').addEventListener('click', () => {
            this.app.handleRememberClick();
        });

        document.getElementById('dont-remember-btn').addEventListener('click', () => {
            this.app.handleDontRememberClick();
        });

        // Middle stage buttons
        document.getElementById('recalled-btn').addEventListener('click', () => {
            this.app.handleRecalledClick();
        });

        document.getElementById('still-dont-know-btn').addEventListener('click', () => {
            this.app.handleStillDontKnowClick();
        });

        // Next button (final stage)
        document.getElementById('next-btn').addEventListener('click', () => {
            this.app.handleNextClick();
        });


        document.getElementById('json-import').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.app.importJSON(e.target.files[0]);
            }
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.app.exportJSON();
        });

        document.getElementById('progress-import').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.app.importProgress(e.target.files[0]);
            }
        });

        document.getElementById('export-progress').addEventListener('click', () => {
            this.app.exportProgress();
        });
    }

}