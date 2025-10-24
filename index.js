// index.js - Function detection and processing

class QuippyFunctions {
    constructor() {
        this.patterns = {
            weight: /\b(\d+\.?\d*)\s*(kg|g|lb|lbs|oz|pound|pounds|gram|grams|kilogram|kilograms|ounce|ounces|mg|milligram|milligrams|ton|tons)\b/i,
            length: /\b(\d+\.?\d*)\s*(m|cm|mm|km|ft|feet|foot|inch|inches|in|mile|miles|yard|yards|yd|meter|meters|centimeter|centimeters|millimeter|millimeters|kilometer|kilometers)\b/i,
            // Currency pattern now requires EITHER a symbol OR a currency name
            currency: /(?:(\$|€|£|¥|₹)\s*(\d+\.?\d*))|(?:(\d+\.?\d*)\s+(usd|eur|gbp|jpy|inr|cad|aud|dollar|dollars|euro|euros|pound|pounds|yen|rupee|rupees))/i,
            // FIXED: Now captures optional minutes and timezone abbreviation
            timezone: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\s*(ist|pst|est|cst|mst|utc|gmt|edt|cdt|mdt|pdt|jst|aest|bst|cet|cest)?/i,
            number: /\b\d+\.?\d*\b/,
            // Calculation pattern - after normalization, only basic operators remain
            calculation: /^[\d\s\+\-\*\/\(\)\.]+$/
        };
    }

    detectFunction(text) {
        let cleanText = text.trim();
        
        // Normalize dashes and multiplication symbols for better detection
        cleanText = cleanText.replace(/[–—]/g, '-');  // en-dash, em-dash → minus
        cleanText = cleanText.replace(/[×]/g, '*');   // × → *
        
        // Check for calculations FIRST - detects +, -, *, /, x, X, ×, ÷
        // This must come before currency check since currency pattern can match numbers
        const hasMathOperator = /[\+\-\*\/xX÷]/.test(cleanText);
        const hasNumbers = /\d/.test(cleanText);
        const isValidCalcFormat = /^[\d\s\+\-\*\/xX÷\(\)\.]+$/.test(cleanText);
        
        if (hasMathOperator && hasNumbers && isValidCalcFormat) {
            return { type: 'calculate', icon: 'calculate.svg' };
        }
        
        // Check for weight units
        if (this.patterns.weight.test(cleanText)) {
            return { type: 'weight', icon: 'weight.svg' };
        }
        
        // Check for length units
        if (this.patterns.length.test(cleanText)) {
            return { type: 'length', icon: 'length.svg' };
        }
        
        // Check for currency
        if (this.patterns.currency.test(cleanText)) {
            return { type: 'currency', icon: 'currency.svg' };
        }
        
        // Check for time
        if (this.patterns.timezone.test(cleanText)) {
            return { type: 'timezone', icon: 'time.svg' };
        }
        
        // Default to meaning for words
        return { type: 'meaning', icon: 'meaning.svg' };
    }

    getSuggestions(text, functionType) {
        switch (functionType) {
            case 'weight':
                return this.getWeightSuggestions(text);
            case 'length':
                return this.getLengthSuggestions(text);
            case 'currency':
                return this.getCurrencySuggestions(text);
            case 'timezone':
                return this.getTimezoneSuggestions(text);
            case 'calculate':
                return this.getCalculationSuggestions(text);
            case 'meaning':
                return this.getMeaningSuggestions(text);
            default:
                return [];
        }
    }

    getWeightSuggestions(text) {
        const match = text.match(this.patterns.weight);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        if (!['kg', 'kilogram', 'kilograms'].includes(unit)) {
            suggestions.push({ label: 'To Kg', value: 'Kg', icon: '⚖️' });
        }
        if (!['g', 'gram', 'grams'].includes(unit)) {
            suggestions.push({ label: 'To g', value: 'g', icon: '⚖️' });
        }
        if (!['lb', 'lbs', 'pound', 'pounds'].includes(unit)) {
            suggestions.push({ label: 'To lbs', value: 'lbs', icon: '⚖️' });
        }

        return suggestions;
    }

    getLengthSuggestions(text) {
        const match = text.match(this.patterns.length);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        if (!['m', 'meter', 'meters'].includes(unit)) {
            suggestions.push({ label: 'To meters', value: 'm', icon: '📏' });
        }
        if (!['cm', 'centimeter', 'centimeters'].includes(unit)) {
            suggestions.push({ label: 'To cm', value: 'cm', icon: '📏' });
        }
        if (!['ft', 'feet', 'foot'].includes(unit)) {
            suggestions.push({ label: 'To feet', value: 'ft', icon: '📏' });
        }

        return suggestions;
    }

    getCurrencySuggestions(text) {
        return [
            { label: 'To USD', value: 'USD', icon: '💲' },
            { label: 'To EUR', value: 'EUR', icon: '💶' },
            { label: 'To GBP', value: 'GBP', icon: '💷' },
            { label: 'To INR', value: 'INR', icon: '💵' }
        ];
    }

    getTimezoneSuggestions(text) {
        // Parse to see if there's already a timezone in the text
        const match = text.match(this.patterns.timezone);
        const detectedTz = match && match[4] ? match[4].toUpperCase() : null;
        
        const allSuggestions = [
            { label: 'To UTC', value: 'UTC', icon: '🌍' },
            { label: 'To EST', value: 'EST', icon: '🕐' },
            { label: 'To PST', value: 'PST', icon: '🕑' },
            { label: 'To IST', value: 'IST', icon: '🕒' }
        ];
        
        // Filter out the detected timezone from suggestions
        return detectedTz 
            ? allSuggestions.filter(s => s.value !== detectedTz)
            : allSuggestions;
    }

    getCalculationSuggestions(text) {
        return [
            { label: '= Calculate', value: 'calculate', icon: '🧮' }
        ];
    }

    getMeaningSuggestions(text) {
        return [
            { label: 'Define', value: 'define', icon: '📖' },
            { label: 'Synonyms', value: 'synonyms', icon: '🔤' },
            { label: 'Examples', value: 'examples', icon: '💡' }
        ];
    }

    async processFunction(text, functionType, target) {
        switch (functionType) {
            case 'weight':
                return this.convertWeight(text, target);
            case 'length':
                return this.convertLength(text, target);
            case 'currency':
                return await this.convertCurrency(text, target);
            case 'timezone':
                return this.convertTimezone(text, target);
            case 'calculate':
                return this.calculate(text);
            case 'meaning':
                return await this.getMeaning(text, target);
            default:
                return { value: 'Function not yet implemented', label: '' };
        }
    }

    convertWeight(text, target) {
        const match = text.match(this.patterns.weight);
        if (!match) {
            return { value: 'Invalid weight format', label: '' };
        }

        const value = parseFloat(match[1]);
        const fromUnit = match[2].toLowerCase();
        const toUnit = target.toLowerCase();

        // Conversion table to grams
        const toGrams = {
            'g': 1, 'gram': 1, 'grams': 1,
            'kg': 1000, 'kilogram': 1000, 'kilograms': 1000,
            'mg': 0.001, 'milligram': 0.001, 'milligrams': 0.001,
            'lb': 453.592, 'lbs': 453.592, 'pound': 453.592, 'pounds': 453.592,
            'oz': 28.3495, 'ounce': 28.3495, 'ounces': 28.3495,
            'ton': 907185, 'tons': 907185
        };

        const valueInGrams = value * toGrams[fromUnit];
        const result = valueInGrams / toGrams[toUnit];

        return {
            value: `${result.toFixed(2)} ${toUnit}`,
            label: `Converted from ${value} ${fromUnit}`
        };
    }

    convertLength(text, target) {
        const match = text.match(this.patterns.length);
        if (!match) {
            return { value: 'Invalid length format', label: '' };
        }

        const value = parseFloat(match[1]);
        const fromUnit = match[2].toLowerCase();
        const toUnit = target.toLowerCase();

        // Conversion table to meters
        const toMeters = {
            'm': 1, 'meter': 1, 'meters': 1,
            'cm': 0.01, 'centimeter': 0.01, 'centimeters': 0.01,
            'mm': 0.001, 'millimeter': 0.001, 'millimeters': 0.001,
            'km': 1000, 'kilometer': 1000, 'kilometers': 1000,
            'ft': 0.3048, 'feet': 0.3048, 'foot': 0.3048,
            'in': 0.0254, 'inch': 0.0254, 'inches': 0.0254,
            'yd': 0.9144, 'yard': 0.9144, 'yards': 0.9144,
            'mile': 1609.34, 'miles': 1609.34
        };

        const valueInMeters = value * toMeters[fromUnit];
        const result = valueInMeters / toMeters[toUnit];

        return {
            value: `${result.toFixed(2)} ${toUnit}`,
            label: `Converted from ${value} ${fromUnit}`
        };
    }

    async convertCurrency(text, target) {
        try {
            const match = text.match(this.patterns.currency);
            if (!match) {
                return { value: 'Invalid currency format', label: '' };
            }

            let amount, fromCurrency;

            if (match[1] && match[2]) {
                // Symbol format: $100
                const symbols = { '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR' };
                fromCurrency = symbols[match[1]];
                amount = parseFloat(match[2]);
            } else {
                // Text format: 100 USD
                amount = parseFloat(match[3]);
                const currencyText = match[4].toLowerCase();
                const currencyMap = {
                    'usd': 'USD', 'dollar': 'USD', 'dollars': 'USD',
                    'eur': 'EUR', 'euro': 'EUR', 'euros': 'EUR',
                    'gbp': 'GBP', 'pound': 'GBP', 'pounds': 'GBP',
                    'jpy': 'JPY', 'yen': 'JPY',
                    'inr': 'INR', 'rupee': 'INR', 'rupees': 'INR',
                    'cad': 'CAD',
                    'aud': 'AUD'
                };
                fromCurrency = currencyMap[currencyText] || currencyText.toUpperCase();
            }

            const toCurrency = target.toUpperCase();

            const response = await chrome.runtime.sendMessage({
                action: 'fetch-currency-rates',
                from: fromCurrency,
                to: toCurrency,
                amount: amount
            });

            if (response.success) {
                return {
                    value: `${response.data.convertedAmount} ${toCurrency}`,
                    label: `${amount} ${fromCurrency} = ${response.data.convertedAmount} ${toCurrency}`
                };
            } else {
                return {
                    value: 'Conversion failed',
                    label: response.error || 'Could not fetch exchange rates'
                };
            }
        } catch (error) {
            console.error('Currency conversion error:', error);
            return {
                value: 'Error',
                label: 'Failed to convert currency'
            };
        }
    }

    convertTimezone(text, target) {
        const match = text.match(this.patterns.timezone);
        if (!match) {
            return { value: 'Invalid time format', label: '' };
        }

        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3] ? match[3].toUpperCase() : null;
        const fromTz = match[4] ? match[4].toUpperCase() : 'LOCAL';

        // Convert to 24-hour format if AM/PM is specified
        if (period) {
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
        }

        // UTC offsets for common timezones
        const tzOffsets = {
            'UTC': 0, 'GMT': 0,
            'EST': -5, 'EDT': -4,
            'CST': -6, 'CDT': -5,
            'MST': -7, 'MDT': -6,
            'PST': -8, 'PDT': -7,
            'IST': 5.5,
            'JST': 9,
            'AEST': 10,
            'BST': 1,
            'CET': 1, 'CEST': 2,
            'LOCAL': -(new Date().getTimezoneOffset() / 60)
        };

        const fromOffset = tzOffsets[fromTz] || 0;
        const toOffset = tzOffsets[target.toUpperCase()] || 0;
        const diff = toOffset - fromOffset;

        let newHours = hours + diff;
        let newMinutes = minutes;

        // Handle day overflow/underflow
        if (newHours >= 24) newHours -= 24;
        if (newHours < 0) newHours += 24;

        const formattedTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;

        return {
            value: `${formattedTime} ${target.toUpperCase()}`,
            label: `Converted from ${fromTz}`
        };
    }

    calculate(text) {
        try {
            // Normalize operators
            let expression = text.replace(/[–—]/g, '-');
            expression = expression.replace(/[×xX]/g, '*');
            expression = expression.replace(/[÷]/g, '/');
            expression = expression.replace(/\s+/g, '');

            // Security: Only allow numbers and basic operators
            if (!/^[\d\+\-\*\/\(\)\.]+$/.test(expression)) {
                return { value: 'Invalid expression', label: '' };
            }

            const result = eval(expression);

            return {
                value: result.toString(),
                label: `${text} =`
            };
        } catch (error) {
            return {
                value: 'Error',
                label: 'Invalid calculation'
            };
        }
    }

    async getMeaning(text, target) {
        try {
            const word = text.trim().toLowerCase();
            const action = target ? target.toLowerCase() : 'define';
            
            console.log('🔍 getMeaning called with:', { word, action });
            
            // STEP 1: Send message to background script
            let dictionaryResponse;
            try {
                console.log('📤 Sending message to background script...');
                dictionaryResponse = await chrome.runtime.sendMessage({
                    action: 'fetch-word-meaning',
                    word: word
                });
                console.log('📥 Received response:', dictionaryResponse);
            } catch (msgError) {
                console.error('❌ Message sending error:', msgError);
                return {
                    value: `"${word}"`,
                    label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">⚠️ Extension error: Please reload the extension at chrome://extensions/</span>`
                };
            }

            // STEP 2: Check if we got a response
            if (!dictionaryResponse) {
                console.error('❌ No response from background script');
                return {
                    value: `"${word}"`,
                    label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">⚠️ No response from background. Reload extension.</span>`
                };
            }
            
            // STEP 3: Check if dictionary lookup was successful
            if (dictionaryResponse.success) {
                console.log('✅ Dictionary lookup successful');
                
                // Validate the response data structure
                if (!dictionaryResponse.data) {
                    console.error('❌ No data in response');
                    return {
                        value: `"${word}"`,
                        label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">Invalid response format</span>`
                    };
                }
                
                const data = dictionaryResponse.data;
                
                // Validate definitions array
                if (!data.definitions || !Array.isArray(data.definitions) || data.definitions.length === 0) {
                    console.error('❌ No definitions in response');
                    return {
                        value: `"${word}"`,
                        label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">No definitions found</span>`
                    };
                }
                
                // Filter content based on the selected action
                let definitionsList = '';
                
                try {
                    if (action === 'define') {
                        // Only show definitions, no examples or synonyms
                        definitionsList = data.definitions.map(def => `
                            <div style="margin-bottom: 12px;">
                                <div style="font-family: 'DM Sans', sans-serif; font-style: italic; color: #888; font-size: 10px; font-weight: 600; line-height: 1.6;">${def.partOfSpeech || 'unknown'}</div>
                                <div style="font-family: 'DM Sans', sans-serif; margin-top: 4px; font-size: 12px; font-weight: 400; line-height: 1.5; color: #4A4A4A;">${def.definition || 'No definition'}</div>
                            </div>
                        `).join('');
                    } else if (action === 'synonyms') {
                        // Only show synonyms
                        const allSynonyms = data.definitions
                            .flatMap(def => def.synonyms || [])
                            .filter((syn, index, self) => self.indexOf(syn) === index); // Remove duplicates
                        
                        if (allSynonyms.length > 0) {
                            definitionsList = `
                                <div style="margin-bottom: 12px;">
                                    <div style="font-family: 'DM Sans', sans-serif; color: #4A4A4A; font-size: 12px; font-weight: 400; line-height: 1.5;">
                                        ${allSynonyms.join(', ')}
                                    </div>
                                </div>
                            `;
                        } else {
                            // No synonyms in dictionary - try DataMuse API fallback
                            console.log('📖 No synonyms in dictionary, trying DataMuse...');
                            
                            try {
                                const datamuseResponse = await chrome.runtime.sendMessage({
                                    action: 'fetch-synonyms',
                                    word: word
                                });
                                
                                console.log('📥 DataMuse response:', datamuseResponse);
                                
                                if (datamuseResponse && datamuseResponse.success && datamuseResponse.synonyms.length > 0) {
                                    definitionsList = `
                                        <div style="margin-bottom: 12px;">
                                            <div style="font-family: 'DM Sans', sans-serif; color: #4A4A4A; font-size: 12px; font-weight: 400; line-height: 1.5;">
                                                ${datamuseResponse.synonyms.join(', ')}
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    definitionsList = `<div style="font-family: 'DM Sans', sans-serif; color: #888; font-size: 12px; font-weight: 400;">No synonyms found.</div>`;
                                }
                            } catch (datamuseError) {
                                console.error('❌ DataMuse error:', datamuseError);
                                definitionsList = `<div style="font-family: 'DM Sans', sans-serif; color: #888; font-size: 12px; font-weight: 400;">No synonyms found.</div>`;
                            }
                        }
                    } else if (action === 'examples') {
                        // Only show examples
                        const examplesList = data.definitions
                            .filter(def => def.example)
                            .map(def => `
                                <div style="margin-bottom: 12px;">
                                    <div style="font-family: 'DM Sans', sans-serif; font-style: italic; color: #888; font-size: 10px; font-weight: 600; line-height: 1.6;">${def.partOfSpeech || 'unknown'}</div>
                                    <div style="font-family: 'DM Sans', sans-serif; color: #666; font-size: 12px; font-weight: 400; line-height: 1.5; margin-top: 4px;">"${def.example}"</div>
                                </div>
                            `).join('');
                        
                        if (examplesList) {
                            definitionsList = examplesList;
                        } else {
                            definitionsList = `<div style="font-family: 'DM Sans', sans-serif; color: #888; font-size: 12px; font-weight: 400;">No examples found.</div>`;
                        }
                    } else {
                        // Default: show everything
                        definitionsList = data.definitions.map(def => `
                            <div style="margin-bottom: 12px;">
                                <div style="font-family: 'DM Sans', sans-serif; font-style: italic; color: #888; font-size: 10px; font-weight: 600; line-height: 1.6;">${def.partOfSpeech || 'unknown'}</div>
                                <div style="font-family: 'DM Sans', sans-serif; margin-top: 4px; font-size: 12px; font-weight: 400; line-height: 1.5; color: #4A4A4A;">${def.definition || 'No definition'}</div>
                                ${def.example ? `<div style="font-family: 'DM Sans', sans-serif; color: #666; font-size: 12px; font-weight: 400; line-height: 1.5; margin-top: 4px;">Example: "${def.example}"</div>` : ''}
                                ${(def.synonyms && def.synonyms.length > 0) ? `<div style="font-family: 'DM Sans', sans-serif; color: #666; font-size: 11px; font-weight: 400; line-height: 1.6; margin-top: 4px;">Synonyms: ${def.synonyms.join(', ')}</div>` : ''}
                            </div>
                        `).join('');
                    }
                } catch (processingError) {
                    console.error('❌ Error processing definitions:', processingError);
                    return {
                        value: `"${word}"`,
                        label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">Error processing definition data</span>`
                    };
                }
                
                return {
                    value: data.word || word,
                    label: `
                        <div style="max-height: 300px; overflow-y: auto;">
                            ${data.phonetic ? `<div style="font-family: 'DM Sans', sans-serif; color: #888; font-size: 12px; font-weight: 400; line-height: 1.5; margin-bottom: 8px;">${data.phonetic}</div>` : ''}
                            ${definitionsList}
                        </div>
                    `
                };
            } else {
                // Dictionary failed - try Wikipedia as fallback
                console.log('⚠️ Dictionary not found, trying Wikipedia...');
                
                let wikiResponse;
                try {
                    console.log('📤 Sending Wikipedia request...');
                    wikiResponse = await chrome.runtime.sendMessage({
                        action: 'fetch-wikipedia',
                        query: word
                    });
                    console.log('📥 Wikipedia response:', wikiResponse);
                } catch (wikiMsgError) {
                    console.error('❌ Wikipedia message error:', wikiMsgError);
                    return {
                        value: `"${word}"`,
                        label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">Not found in dictionary</span>`
                    };
                }

                if (!wikiResponse) {
                    console.error('❌ No Wikipedia response');
                    return {
                        value: `"${word}"`,
                        label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">Not found</span>`
                    };
                }
                
                if (wikiResponse.success) {
                    console.log('✅ Wikipedia lookup successful');
                    const data = wikiResponse.data;
                    
                    return {
                        value: data.title || word,
                        label: `
                            <div style="max-height: 300px; overflow-y: auto;">
                                <div style="background: #e3f2fd; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                                    <div style="font-family: 'DM Sans', sans-serif; color: #1976d2; font-size: 10px; font-weight: 600; line-height: 1.6; margin-bottom: 4px;">📚 FROM WIKIPEDIA</div>
                                    ${data.description ? `<div style="font-family: 'DM Sans', sans-serif; font-style: italic; color: #555; font-size: 10px; font-weight: 600; line-height: 1.6; margin-bottom: 8px;">${data.description}</div>` : ''}
                                </div>
                                <div style="font-family: 'DM Sans', sans-serif; line-height: 1.5; color: #4A4A4A; font-size: 12px; font-weight: 400;">
                                    ${data.extract || 'No description available'}
                                </div>
                                ${data.url ? `<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd;">
                                    <a href="${data.url}" target="_blank" style="font-family: 'DM Sans', sans-serif; color: #1976d2; font-size: 12px; font-weight: 400; text-decoration: none;">
                                        Read more on Wikipedia →
                                    </a>
                                </div>` : ''}
                            </div>
                        `
                    };
                } else {
                    // Both dictionary and Wikipedia failed
                    console.log('❌ Both dictionary and Wikipedia failed');
                    const errorMsg = wikiResponse.error || dictionaryResponse.error || 'Not found';
                    return {
                        value: `"${word}"`,
                        label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #666;">${errorMsg}</span>`
                    };
                }
            }
        } catch (error) {
            // This is the final catch-all error handler
            console.error('❌❌❌ OUTER CATCH - Unexpected error in getMeaning:', error);
            console.error('Error stack:', error.stack);
            return {
                value: `"${text}"`,
                label: `<span style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; color: #FF4444;">Unexpected error: ${error.message}</span>`
            };
        }
    }
}

// Initialize functions
window.quippyFunctions = new QuippyFunctions();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle-quippy') {
        window.dispatchEvent(new CustomEvent('quippy-toggle'));
        sendResponse({ success: true });
    }
    return true;
});

// Direct keyboard listener as backup
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('quippy-toggle'));
        console.log('Quippy: Keyboard shortcut triggered!');
    }
});