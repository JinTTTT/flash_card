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


        document.getElementById('data-import').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.app.importData(e.target.files[0]);
            }
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.app.exportData();
        });

        // Search functionality events
        document.getElementById('search-btn').addEventListener('click', () => {
            this.app.searchWord();
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.app.searchWord();
            }
        });

        document.getElementById('add-to-words').addEventListener('click', () => {
            this.app.addSearchResultToWords();
        });

        document.getElementById('search-another').addEventListener('click', () => {
            this.app.searchAnother();
        });

        // Settings page events - 使用事件委托，避免元素不存在的问题
        document.addEventListener('click', (e) => {
            if (e.target.id === 'save-api-key') {
                this.app.saveApiKey();
            } else if (e.target.id === 'show-api-key') {
                this.app.toggleApiKeyVisibility();
            } else if (e.target.id === 'clear-cache') {
                this.app.clearAllCache();
            }
        });
    }

}