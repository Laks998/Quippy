// background.js - Handles API requests and commands

// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-quippy') {
        console.log('Toggle command received');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle-widget' });
            }
        });
    }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetch-word-meaning') {
        fetchWordMeaning(request.word)
            .then(data => sendResponse(data))
            .catch(error => {
                sendResponse({ success: false, error: error.message || 'Unknown error' });
            });
        return true;
    }
    
    if (request.action === 'fetch-wikipedia') {
        fetchWikipedia(request.query)
            .then(data => sendResponse(data))
            .catch(error => {
                sendResponse({ success: false, error: error.message || 'Unknown error' });
            });
        return true;
    }
    
    if (request.action === 'fetch-synonyms') {
        fetchSynonyms(request.word)
            .then(data => sendResponse(data))
            .catch(error => {
                sendResponse({ success: false, error: error.message || 'Unknown error' });
            });
        return true;
    }
    
    if (request.action === 'fetch-currency-rates') {
        fetchCurrencyRates(request.from, request.to, request.amount)
            .then(data => sendResponse(data))
            .catch(error => {
                sendResponse({ success: false, error: error.message || 'Unknown error' });
            });
        return true;
    }
    
    if (request.action === 'fetch-timezone') {
        fetchTimezone(request.timezone)
            .then(data => sendResponse(data))
            .catch(error => {
                sendResponse({ success: false, error: error.message || 'Unknown error' });
            });
        return true;
    }
    
    if (request.action === 'translate-text') {
        fetchTranslation(request.text, request.targetLanguage)
            .then(data => sendResponse(data))
            .catch(error => {
                sendResponse({ success: false, error: error.message || 'Unknown error' });
            });
        return true;
    }
});

async function fetchWordMeaning(word) {
    try {
        if (!word || typeof word !== 'string' || word.trim().length === 0) {
            return { success: false, error: 'Invalid word provided' };
        }

        const cleanWord = word.trim().toLowerCase();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Word not found in dictionary' };
            }
            return { success: false, error: `API error: ${response.status}` };
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { success: false, error: 'No data returned from dictionary' };
        }
        
        const entry = data[0];
        const definitions = [];
        
        entry.meanings.forEach(meaning => {
            if (meaning.definitions && Array.isArray(meaning.definitions)) {
                meaning.definitions.forEach(def => {
                    definitions.push({
                        partOfSpeech: meaning.partOfSpeech || 'unknown',
                        definition: def.definition || '',
                        example: def.example || '',
                        synonyms: def.synonyms || []
                    });
                });
            }
        });
        
        if (definitions.length === 0) {
            return { success: false, error: 'No definitions found' };
        }
        
        return {
            success: true,
            data: {
                word: entry.word || cleanWord,
                phonetic: entry.phonetic || '',
                definitions: definitions
            }
        };
    } catch (error) {
        console.error('Dictionary API error:', error);
        return { success: false, error: error.message || 'Failed to fetch word meaning' };
    }
}

async function fetchWikipedia(query) {
    try {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return { success: false, error: 'Invalid query provided' };
        }

        const cleanQuery = query.trim();
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Not found on Wikipedia' };
            }
            return { success: false, error: `API error: ${response.status}` };
        }
        
        const data = await response.json();
        
        if (data.type === 'disambiguation' || data.type === 'no-extract') {
            return { success: false, error: 'Disambiguation or no extract available' };
        }
        
        return {
            success: true,
            data: {
                title: data.title || cleanQuery,
                extract: data.extract || 'No summary available',
                description: data.description || '',
                url: data.content_urls?.desktop?.page || '',
                thumbnail: data.thumbnail?.source || null
            }
        };
    } catch (error) {
        console.error('Wikipedia API error:', error);
        return { success: false, error: error.message || 'Failed to fetch from Wikipedia' };
    }
}

async function fetchSynonyms(word) {
    try {
        if (!word || typeof word !== 'string' || word.trim().length === 0) {
            return { success: false, error: 'Invalid word provided' };
        }

        const cleanWord = word.trim().toLowerCase();
        const url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=15`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            return { success: false, error: `API error: ${response.status}` };
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { success: false, error: 'No synonyms found' };
        }
        
        const synonyms = data.map(item => item.word);
        
        return {
            success: true,
            synonyms: synonyms
        };
    } catch (error) {
        console.error('DataMuse API error:', error);
        return { success: false, error: error.message || 'Failed to fetch synonyms' };
    }
}

async function fetchCurrencyRates(from, to, amount) {
    try {
        if (!from || !to) {
            return { success: false, error: 'Currency codes required' };
        }
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }

        const url = `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            return { success: false, error: `Could not fetch currency rates: ${response.status}` };
        }
        
        const data = await response.json();
        
        const toUpper = to.toUpperCase();
        const rate = data.rates?.[toUpper];
        
        if (!rate) {
            return { success: false, error: `Exchange rate for ${toUpper} not found` };
        }
        
        const convertedAmount = (numAmount * rate).toFixed(2);
        
        return {
            success: true,
            data: {
                from: from.toUpperCase(),
                to: toUpper,
                rate: rate,
                amount: numAmount,
                convertedAmount: convertedAmount
            }
        };
    } catch (error) {
        console.error('Currency API error:', error);
        return { success: false, error: error.message || 'Failed to fetch currency rates' };
    }
}

async function fetchTimezone(timezone) {
    try {
        if (!timezone || typeof timezone !== 'string') {
            return { success: false, error: 'Invalid timezone provided' };
        }

        const url = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Timezone not found' };
            }
            return { success: false, error: `API error: ${response.status}` };
        }
        
        const data = await response.json();
        
        return {
            success: true,
            data: {
                timezone: data.timezone || timezone,
                datetime: data.datetime || '',
                utc_offset: data.utc_offset || ''
            }
        };
    } catch (error) {
        console.error('Timezone API error:', error);
        return { success: false, error: error.message || 'Failed to fetch timezone' };
    }
}

async function fetchTranslation(text, targetLanguage) {
    try {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return { success: false, error: 'Invalid text provided' };
        }

        if (!targetLanguage || typeof targetLanguage !== 'string') {
            return { success: false, error: 'Invalid target language provided' };
        }

        // Detect source language based on character ranges
        const cleanText = text.trim();
        let sourceLanguage = 'en'; // Default to English
        
        // Detect common languages by character ranges
        if (/[\u4e00-\u9fa5]/.test(cleanText)) {
            sourceLanguage = 'zh-CN'; // Chinese
        } else if (/[\u0600-\u06FF]/.test(cleanText)) {
            sourceLanguage = 'ar'; // Arabic
        } else if (/[\u0590-\u05FF]/.test(cleanText)) {
            sourceLanguage = 'he'; // Hebrew
        } else if (/[\u0400-\u04FF]/.test(cleanText)) {
            sourceLanguage = 'ru'; // Russian
        } else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(cleanText)) {
            sourceLanguage = 'ja'; // Japanese
        } else if (/[\uAC00-\uD7AF]/.test(cleanText)) {
            sourceLanguage = 'ko'; // Korean
        } else if (/[\u0E00-\u0E7F]/.test(cleanText)) {
            sourceLanguage = 'th'; // Thai
        } else if (/[\u0900-\u097F]/.test(cleanText)) {
            sourceLanguage = 'hi'; // Hindi
        }
        
        const encodedText = encodeURIComponent(cleanText);
        const langPair = `${sourceLanguage}|${targetLanguage}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;
        
        console.log('🌐 Translating:', cleanText, 'from', sourceLanguage, 'to', targetLanguage);
        
        const response = await fetch(url);
        
        console.log('📥 Translation response status:', response.status);
        
        if (!response.ok) {
            return { success: false, error: `API returned ${response.status}` };
        }
        
        const data = await response.json();
        console.log('✅ Translation data:', data);
        
        if (!data || !data.responseData || !data.responseData.translatedText) {
            return { success: false, error: 'No translation returned' };
        }
        
        // Check if translation actually worked
        if (data.responseData.translatedText === cleanText) {
            // Translation didn't change the text, might be wrong source language
            return { success: false, error: 'Translation unavailable for this language pair' };
        }
        
        return {
            success: true,
            translatedText: data.responseData.translatedText
        };
    } catch (error) {
        console.error('Translation API error:', error);
        return { success: false, error: error.message || 'Failed to translate text' };
    }
}