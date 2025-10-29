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