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

        document.getElementById('csv-import').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.app.importCSV(e.target.files[0]);
            }
        });

        document.getElementById('export-csv').addEventListener('click', () => {
            this.app.storage.downloadCSV();
            this.app.ui.showMessage('CSV文件导出成功！');
        });

        document.getElementById('download-template').addEventListener('click', () => {
            this.downloadTemplate();
        });

        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
                this.app.clearAllData();
            }
        });
    }

    downloadTemplate() {
        const template = [
            ['ID', '单词/短语', '解释', '例句', '分类', '添加时间'],
            ['1', 'nail down', 'successfully complete', 'We need to nail down the details', '动词短语', '2024/8/8'],
            ['2', 'meticulous', 'very careful and precise', 'She is meticulous about her work', '形容词', '2024/8/8'],
            ['3', 'procrastinate', 'delay or postpone', 'Stop procrastinating and start studying', '动词', '2024/8/8']
        ];
        
        const csvContent = template.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'vocabulary-template.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }
}