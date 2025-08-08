class PronunciationService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;
        this.voice = null;
        this.initVoice();
    }

    initVoice() {
        if (!this.isSupported) return;

        const setVoice = () => {
            const voices = this.synthesis.getVoices();
            // 优先选择英语语音，偏好美式英语
            this.voice = voices.find(voice => voice.lang.startsWith('en-US')) ||
                        voices.find(voice => voice.lang.startsWith('en')) ||
                        voices[0];
        };

        // 语音可能需要异步加载
        if (this.synthesis.getVoices().length > 0) {
            setVoice();
        } else {
            this.synthesis.addEventListener('voiceschanged', setVoice, { once: true });
        }
    }

    speak(text) {
        if (!this.isSupported || !text) {
            console.warn('语音合成不支持或文本为空');
            return;
        }

        // 停止当前播放的语音
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        if (this.voice) {
            utterance.voice = this.voice;
        }
        
        // 设置语音参数
        utterance.rate = 0.8;  // 语速稍慢，便于学习
        utterance.pitch = 1;   // 正常音调
        utterance.volume = 1;  // 最大音量

        // 错误处理
        utterance.onerror = (event) => {
            console.error('语音合成错误:', event.error);
        };

        this.synthesis.speak(utterance);
    }

    // 停止当前播放
    stop() {
        if (this.isSupported) {
            this.synthesis.cancel();
        }
    }

    // 检查是否支持语音合成
    isAvailable() {
        return this.isSupported && this.synthesis.getVoices().length > 0;
    }
}