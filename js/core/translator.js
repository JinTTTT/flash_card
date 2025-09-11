/**
 * 微软翻译API服务类
 * 用于获取单词的中文翻译/定义
 */
class MicrosoftTranslator {
    constructor() {
        // API配置从api-keys.txt文件获取
        this.config = {
            key: null, // 需要在使用前设置API密钥
            region: 'westeurope',
            endpoint: 'https://api.cognitive.microsofttranslator.com'
        };
        this.cache = {}; // 简单缓存
    }

    /**
     * 翻译单词到中文
     * @param {string} word - 要翻译的英文单词
     * @returns {Promise<Object>} 翻译结果
     */
    async translateWord(word) {
        // 检查API密钥
        if (!this.config.key) {
            throw new Error('Microsoft Translator API key not configured');
        }

        // 检查缓存
        const cacheKey = word.toLowerCase();
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }

        try {
            const url = `${this.config.endpoint}/translate?api-version=3.0&from=en&to=zh-Hans`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.config.key,
                    'Ocp-Apim-Subscription-Region': this.config.region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ text: word }])
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            const result = {
                word: word,
                translation: data[0].translations[0].text,
                detectedLanguage: data[0].detectedLanguage?.language || 'en',
                confidence: data[0].detectedLanguage?.score || 1
            };

            // 缓存结果
            this.cache[cacheKey] = result;
            return result;

        } catch (error) {
            console.error('Microsoft Translator error:', error);
            throw new Error(`翻译失败: ${error.message}`);
        }
    }

    /**
     * 批量翻译多个文本
     * @param {string[]} texts - 要翻译的文本数组
     * @returns {Promise<Object[]>} 翻译结果数组
     */
    async translateTexts(texts) {
        // 检查API密钥
        if (!this.config.key) {
            throw new Error('Microsoft Translator API key not configured');
        }

        try {
            const url = `${this.config.endpoint}/translate?api-version=3.0&from=en&to=zh-Hans`;
            
            const requestBody = texts.map(text => ({ text: text }));
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.config.key,
                    'Ocp-Apim-Subscription-Region': this.config.region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            return data.map((item, index) => ({
                original: texts[index],
                translation: item.translations[0].text
            }));

        } catch (error) {
            console.error('Batch translation error:', error);
            throw new Error(`批量翻译失败: ${error.message}`);
        }
    }

    /**
     * 设置API密钥
     * @param {string} apiKey - 微软翻译API密钥
     */
    setApiKey(apiKey) {
        this.config.key = apiKey;
        // 保存到localStorage供下次使用
        localStorage.setItem('microsoft-translator-api-key', apiKey);
    }
}

/**
 * 组合词典API服务
 * 结合Free Dictionary API和微软翻译API
 */
class CombinedDictionaryAPI {
    constructor() {
        this.dictionaryAPI = new DictionaryAPI(); // Free Dictionary API
        this.translator = new MicrosoftTranslator(); // 微软翻译API
        this.cache = {}; // 组合结果缓存
    }

    /**
     * 综合查词功能
     * @param {string} word - 要查询的单词
     * @returns {Promise<Object>} 完整的词典信息
     */
    async searchWord(word) {
        const cacheKey = word.toLowerCase();
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }

        try {
            // 同时调用两个API
            const [dictionaryResult, translationResult] = await Promise.all([
                this.dictionaryAPI.searchWord(word),
                this.translator.translateWord(word)
            ]);

            // 组合结果
            const combinedResult = {
                word: word,
                // 从Free Dictionary API获取
                phonetic: dictionaryResult.phonetic,
                audio: dictionaryResult.audio,
                partOfSpeech: dictionaryResult.partOfSpeech,
                definition: dictionaryResult.definition,
                example: dictionaryResult.example,
                // 从微软翻译API获取
                chineseTranslation: translationResult.translation,
                // 元数据
                timestamp: new Date().toISOString(),
                sources: {
                    dictionary: 'Free Dictionary API',
                    translation: 'Microsoft Translator'
                }
            };

            // 如果有定义，也翻译定义
            if (dictionaryResult.definition) {
                try {
                    const definitionTranslation = await this.translator.translateTexts([dictionaryResult.definition]);
                    combinedResult.chineseDefinition = definitionTranslation[0].translation;
                } catch (error) {
                    console.warn('定义翻译失败:', error);
                    combinedResult.chineseDefinition = null;
                }
            }

            // 如果有例句，也翻译例句
            if (dictionaryResult.example) {
                try {
                    const exampleTranslation = await this.translator.translateTexts([dictionaryResult.example]);
                    combinedResult.chineseExample = exampleTranslation[0].translation;
                } catch (error) {
                    console.warn('例句翻译失败:', error);
                    combinedResult.chineseExample = null;
                }
            }

            // 缓存结果
            this.cache[cacheKey] = combinedResult;
            return combinedResult;

        } catch (error) {
            console.error('Combined search error:', error);
            
            // 如果组合查询失败，尝试只使用Free Dictionary API
            try {
                const fallbackResult = await this.dictionaryAPI.searchWord(word);
                fallbackResult.chineseTranslation = '翻译服务暂不可用';
                fallbackResult.chineseDefinition = null;
                fallbackResult.chineseExample = null;
                fallbackResult.sources = { dictionary: 'Free Dictionary API', translation: 'Fallback' };
                return fallbackResult;
            } catch (fallbackError) {
                throw new Error(`查词失败: ${error.message}`);
            }
        }
    }

    /**
     * 设置微软翻译API密钥
     * @param {string} apiKey - API密钥
     */
    setApiKey(apiKey) {
        this.translator.setApiKey(apiKey);
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache = {};
        this.dictionaryAPI.cache = {};
        this.translator.cache = {};
    }
}
