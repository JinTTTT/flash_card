class UI {
    constructor() {
        this.currentSection = 'add';
    }

    // 统一的phase显示样式
    renderPhaseDisplay(phase) {
        // 定义彩虹颜色：红橙黄绿蓝靛紫
        const phaseColors = [
            '#FF0000', // 阶段0 - 红色
            '#FF8000', // 阶段1 - 橙色
            '#FFFF00', // 阶段2 - 黄色
            '#00FF00', // 阶段3 - 绿色
            '#00BFFF', // 阶段4 - 蓝色
            '#4B0082', // 阶段5 - 靛色
            '#8B00FF'  // 阶段6 - 紫色
        ];
        
        const phaseColor = phaseColors[Math.min(phase, phaseColors.length - 1)];
        
        return `
            <div style="font-size: 0.5em; font-style: italic; color: #666; display: flex; align-items: center; gap: 4px;">
                <span>Phase ${phase}</span>
                <div style="width: 0.8em; height: 0.8em; background-color: ${phaseColor}; border-radius: 50%;"></div>
            </div>
        `;
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



    updateReviewUI(session, currentIndex = 0, totalWords = 0) {
        if (!session || totalWords === 0) {
            document.getElementById('review-progress').textContent = '0/0';
            return;
        }
        
        // 计算当前位置
        const currentPosition = Math.min(currentIndex + 1, totalWords);
        
        // 简单显示：当前位置/总数
        const progressText = `${currentPosition}/${totalWords}`;
        
        document.getElementById('review-progress').textContent = progressText;
    }

    showFlashCard(word) {
        if (!word) {
            document.getElementById('no-review').style.display = 'block';
            document.getElementById('flashcard').style.display = 'none';
            return;
        }

        document.getElementById('no-review').style.display = 'none';
        document.getElementById('flashcard').style.display = 'block';
        
        // 获取单词阶段
        const progress = window.app?.storage?.progress?.wordProgress?.[word.id];
        const phase = window.app?.algorithm?.getWordPhase(progress) || 0;
        
        // 显示阶段和单词
        const wordElement = document.getElementById('current-word');
        wordElement.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 8px; display: flex; justify-content: center;">
                    ${this.renderPhaseDisplay(phase)}
                </div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <span>${word.word}</span>
                    <button class="btn secondary" id="pronounce-btn-inline" onclick="window.app.pronunciation.speak('${word.word}')" style="padding: 4px 8px; font-size: 0.8em;">🔊</button>
                </div>
            </div>
        `;
        
        document.getElementById('current-definition').textContent = word.definition;
        document.getElementById('current-examples').textContent = word.examples;
        
        document.querySelector('.card-front').style.display = 'flex';
        document.querySelector('.card-back').style.display = 'none';

        // 自动发音 - 只读单词文本
        if (window.app && window.app.pronunciation) {
            // 延迟200ms发音，确保UI更新完成
            setTimeout(() => {
                window.app.pronunciation.speak(word.word);
            }, 200);
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
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h3 class="word-title">${word.word}</h3>
                        ${this.renderPhaseDisplay(word.phase)}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn secondary" onclick="window.app.editWordFromList('${word.id}')" style="padding: 4px 8px; font-size: 0.8em;">Edit</button>
                        <button class="btn danger" onclick="window.app.deleteWordFromList('${word.id}')" style="padding: 4px 8px; font-size: 0.8em;">Delete</button>
                    </div>
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

    // HTML转义函数
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示编辑单词模态框
    showEditWordModal(word) {
        // 转义HTML以防止注入
        const escapedWord = this.escapeHtml(word.word || '');
        const escapedDefinition = this.escapeHtml(word.definition || '');
        const escapedExamples = this.escapeHtml(word.examples || '');
        
        // 创建模态框HTML
        const modalHTML = `
            <div id="edit-word-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <h3 style="margin-top: 0; margin-bottom: 20px;">Edit Word</h3>
                    <form id="edit-word-form">
                        <div class="form-group">
                            <label for="edit-word">Word/Phrase:</label>
                            <input type="text" id="edit-word" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-definition">Definition:</label>
                            <input type="text" id="edit-definition" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-examples">Example:</label>
                            <textarea id="edit-examples" required></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                            <button type="button" class="btn secondary" onclick="window.app.ui.closeEditWordModal()">Cancel</button>
                            <button type="submit" class="btn primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 添加模态框到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 安全地设置值
        document.getElementById('edit-word').value = word.word || '';
        document.getElementById('edit-definition').value = word.definition || '';
        document.getElementById('edit-examples').value = word.examples || '';
        
        // 绑定表单提交事件
        document.getElementById('edit-word-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditWordSubmit(word.id);
        });
        
        // 点击模态框外部关闭
        document.getElementById('edit-word-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-word-modal') {
                this.closeEditWordModal();
            }
        });
    }

    // 处理编辑表单提交
    handleEditWordSubmit(wordId) {
        const wordInput = document.getElementById('edit-word').value.trim();
        const definitionInput = document.getElementById('edit-definition').value.trim();
        const examplesInput = document.getElementById('edit-examples').value.trim();
        
        if (!wordInput || !definitionInput || !examplesInput) {
            alert('Please fill in all fields');
            return;
        }
        
        // 调用app的更新方法
        window.app.updateWord(wordId, {
            word: wordInput,
            definition: definitionInput,
            examples: examplesInput
        });
        
        this.closeEditWordModal();
    }

    // 关闭编辑模态框
    closeEditWordModal() {
        const modal = document.getElementById('edit-word-modal');
        if (modal) {
            modal.remove();
        }
    }
}