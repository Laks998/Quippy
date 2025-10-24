// background.js - Handles API requests for the extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Dictionary API lookup
    if (request.action === 'fetch-word-meaning') {
        fetchWordMeaning(request.word)
            .then(data => sendResponse(data))
            .catch(error => {
                console.error('Error in fetch-word-meaning:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'Unknown error occurred' 
                });
            });
        return true; // Keep channel open for async response
    }
    
    // Wikipedia API lookup
    if (request.action === 'fetch-wikipedia') {
        fetchWikipedia(request.query)
            .then(data => sendResponse(data))
            .catch(error => {
                console.error('Error in fetch-wikipedia:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'Unknown error occurred' 
                });
            });
        return true;
    }
    
    // DataMuse API for synonyms (NEW!)
    if (request.action === 'fetch-synonyms') {
        fetchSynonyms(request.word)
            .then(data => sendResponse(data))
            .catch(error => {
                console.error('Error in fetch-synonyms:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'Unknown error occurred' 
                });
            });
        return true;
    }
    
    // Currency conversion API
    if (request.action === 'fetch-currency-rates') {
        fetchCurrencyRates(request.from, request.to, request.amount)
            .then(data => sendResponse(data))
            .catch(error => {
                console.error('Error in fetch-currency-rates:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'Unknown error occurred' 
                });
            });
        return true;
    }
    
    // Timezone API (keeping for compatibility, though now unused)
    if (request.action === 'fetch-timezone') {
        fetchTimezone(request.timezone)
            .then(data => sendResponse(data))
            .catch(error => {
                console.error('Error in fetch-timezone:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message || 'Unknown error occurred' 
                });
            });
        return true;
    }
});

// Fetch word meaning from Dictionary API
async function fetchWordMeaning(word) {
    try {
        // Validate input
        if (!word || typeof word !== 'string' || word.trim().length === 0) {
            return { success: false, error: 'Invalid word provided' };
        }

        const cleanWord = word.trim().toLowerCase();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`;
        
        console.log('Fetching word meaning for:', cleanWord);
        console.log('API URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Word not found in dictionary' };
            }
            return { 
                success: false, 
                error: `API error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        // Check if data is valid
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { success: false, error: 'No data returned from dictionary' };
        }
        
        const entry = data[0];
        
        // Validate entry structure
        if (!entry.meanings || !Array.isArray(entry.meanings)) {
            return { success: false, error: 'Invalid data structure from dictionary' };
        }
        
        // Extract definitions, examples, and synonyms
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
        
        // Provide more specific error messages
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { 
                success: false, 
                error: 'Network error - please check your internet connection' 
            };
        }
        
        return { 
            success: false, 
            error: error.message || 'Failed to fetch word meaning' 
        };
    }
}

// Fetch information from Wikipedia API
async function fetchWikipedia(query) {
    try {
        // Validate input
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return { success: false, error: 'Invalid query provided' };
        }

        const cleanQuery = query.trim();
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
        
        console.log('Fetching Wikipedia for:', cleanQuery);
        console.log('API URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Not found on Wikipedia' };
            }
            return { 
                success: false, 
                error: `API error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log('Wikipedia API response:', data);
        
        // Check if it's a valid page (not a disambiguation or error)
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
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { 
                success: false, 
                error: 'Network error - please check your internet connection' 
            };
        }
        
        return { 
            success: false, 
            error: error.message || 'Failed to fetch from Wikipedia' 
        };
    }
}

// NEW: Fetch synonyms from DataMuse API
async function fetchSynonyms(word) {
    try {
        // Validate input
        if (!word || typeof word !== 'string' || word.trim().length === 0) {
            return { success: false, error: 'Invalid word provided' };
        }

        const cleanWord = word.trim().toLowerCase();
        const url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(cleanWord)}&max=15`;
        
        console.log('Fetching synonyms for:', cleanWord);
        console.log('API URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            return { 
                success: false, 
                error: `API error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log('DataMuse API response:', data);
        
        // Check if we got any synonyms
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { success: false, error: 'No synonyms found' };
        }
        
        // Extract just the words from the response
        const synonyms = data.map(item => item.word);
        
        return {
            success: true,
            synonyms: synonyms
        };
    } catch (error) {
        console.error('DataMuse API error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { 
                success: false, 
                error: 'Network error - please check your internet connection' 
            };
        }
        
        return { 
            success: false, 
            error: error.message || 'Failed to fetch synonyms' 
        };
    }
}

// Fetch currency conversion rates
async function fetchCurrencyRates(from, to, amount) {
    try {
        // Validate inputs
        if (!from || !to) {
            return { success: false, error: 'Currency codes required' };
        }
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }

        const url = `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`;
        
        console.log('Fetching currency rates:', from, 'to', to);
        console.log('API URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            return { 
                success: false, 
                error: `Could not fetch currency rates: ${response.status}` 
            };
        }
        
        const data = await response.json();
        console.log('Currency API response:', data);
        
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
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { 
                success: false, 
                error: 'Network error - please check your internet connection' 
            };
        }
        
        return { 
            success: false, 
            error: error.message || 'Failed to fetch currency rates' 
        };
    }
}

// Fetch timezone information
async function fetchTimezone(timezone) {
    try {
        // Validate input
        if (!timezone || typeof timezone !== 'string') {
            return { success: false, error: 'Invalid timezone provided' };
        }

        const url = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`;
        
        console.log('Fetching timezone:', timezone);
        console.log('API URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Timezone not found' };
            }
            return { 
                success: false, 
                error: `API error: ${response.status} ${response.statusText}` 
            };
        }
        
        const data = await response.json();
        console.log('Timezone API response:', data);
        
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
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { 
                success: false, 
                error: 'Network error - please check your internet connection' 
            };
        }
        
        return { 
            success: false, 
            error: error.message || 'Failed to fetch timezone' 
        };
    }
}