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

        const cleanText = text.trim();
        
        // Detect source language based on character ranges
        let sourceLanguage = 'auto'; // Use auto-detection
        
        // Map common language codes to Google Translate format
        const langMap = {
            'zh': 'zh-CN',
            'zh-cn': 'zh-CN',
            'zh-tw': 'zh-TW'
        };
        
        const targetLang = langMap[targetLanguage.toLowerCase()] || targetLanguage.toLowerCase();
        
        console.log('🌐 Translation request:', {
            text: cleanText,
            targetLang: targetLang
        });

        // Using Google Translate's public API endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        console.log('📥 Translation response status:', response.status);
        
        if (!response.ok) {
            console.error('❌ Translation API error:', response.status, response.statusText);
            return { success: false, error: `Translation API returned ${response.status}` };
        }
        
        const data = await response.json();
        console.log('📥 Translation raw data:', data);
        
        // Google Translate API returns data in format: [[[translated_text, original_text, null, null, score], ...], ...]
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error('❌ Invalid translation response format');
            return { success: false, error: 'Invalid translation response' };
        }
        
        // Extract translated text from the response
        let translatedText = '';
        
        if (data[0] && Array.isArray(data[0])) {
            // Concatenate all translation segments
            translatedText = data[0]
                .filter(segment => segment && segment[0])
                .map(segment => segment[0])
                .join('');
        }
        
        if (!translatedText || translatedText.trim().length === 0) {
            console.error('❌ No translation text extracted');
            return { success: false, error: 'No translation returned' };
        }
        
        console.log('✅ Translation successful:', translatedText);
        
        // Check if translation actually changed the text
        if (translatedText.toLowerCase().trim() === cleanText.toLowerCase().trim()) {
            return { success: false, error: 'Text is already in target language or translation unavailable' };
        }
        
        return {
            success: true,
            translatedText: translatedText.trim()
        };
        
    } catch (error) {
        console.error('❌ Translation error:', error);
        console.error('Error stack:', error.stack);
        return { 
            success: false, 
            error: error.message || 'Failed to translate text' 
        };
    }
}