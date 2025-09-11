class DictionaryAPI {
    constructor() {
        this.baseURL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
        this.cache = new Map(); // 简单缓存避免重复请求
    }

    async searchWord(word) {
        if (!word || !word.trim()) {
            throw new Error('Please enter a word to search');
        }

        const cleanWord = word.trim().toLowerCase();
        
        // 检查缓存
        if (this.cache.has(cleanWord)) {
            return this.cache.get(cleanWord);
        }

        try {
            const response = await fetch(`${this.baseURL}/${encodeURIComponent(cleanWord)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Word "${word}" not found in dictionary`);
                } else {
                    throw new Error(`API error: ${response.status}`);
                }
            }

            const data = await response.json();
            const result = this.parseAPIResponse(data);
            
            // 缓存结果
            this.cache.set(cleanWord, result);
            
            return result;
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    parseAPIResponse(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid response from dictionary API');
        }

        const wordData = data[0];
        
        // 提取最佳定义和例句
        const bestDefinition = this.getBestDefinition(wordData.meanings);
        const bestExample = this.getBestExample(wordData.meanings);
        const phonetic = this.getPhonetic(wordData.phonetics);
        const audio = this.getAudioURL(wordData.phonetics);

        return {
            word: wordData.word,
            definition: bestDefinition.definition,
            example: bestExample,
            phonetic: phonetic,
            audio: audio,
            partOfSpeech: bestDefinition.partOfSpeech,
            allMeanings: wordData.meanings, // 保留完整数据供高级用户使用
            source: 'dictionary'
        };
    }

    getBestDefinition(meanings) {
        // 优先顺序：noun > verb > adjective > adverb > interjection
        const priority = ['noun', 'verb', 'adjective', 'adverb', 'interjection'];
        
        for (const pos of priority) {
            const meaning = meanings.find(m => m.partOfSpeech === pos);
            if (meaning && meaning.definitions.length > 0) {
                return {
                    definition: meaning.definitions[0].definition,
                    partOfSpeech: pos
                };
            }
        }
        
        // 如果没找到优先级中的，返回第一个
        const firstMeaning = meanings[0];
        return {
            definition: firstMeaning.definitions[0].definition,
            partOfSpeech: firstMeaning.partOfSpeech
        };
    }

    getBestExample(meanings) {
        // 寻找第一个包含例句的定义
        for (const meaning of meanings) {
            for (const def of meaning.definitions) {
                if (def.example) {
                    return def.example;
                }
            }
        }
        return null;
    }

    getPhonetic(phonetics) {
        if (!phonetics || phonetics.length === 0) return null;
        
        // 优先返回有文本的音标
        const withText = phonetics.find(p => p.text);
        if (withText) return withText.text;
        
        return null;
    }

    getAudioURL(phonetics) {
        if (!phonetics || phonetics.length === 0) return null;
        
        // 优先返回有音频的URL
        const withAudio = phonetics.find(p => p.audio);
        if (withAudio) return withAudio.audio;
        
        return null;
    }

    // 清理缓存（可选的内存管理）
    clearCache() {
        this.cache.clear();
    }

    // 获取缓存统计
    getCacheStats() {
        return {
            size: this.cache.size,
            words: Array.from(this.cache.keys())
        };
    }
}
