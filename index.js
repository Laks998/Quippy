// index.js - Function detection and processing

class QuippyFunctions {
    constructor() {
        this.patterns = {
            weight: /\b(\d+\.?\d*)\s*(kg|g|lb|lbs|oz|pound|pounds|gram|grams|kilogram|kilograms|ounce|ounces|mg|milligram|milligrams|ton|tons)\b/i,
            // Feet + inches pattern - matches formats like: 6'4", 6'4, 6ft 4in, 6' 4", 6 feet 4 inches
            feetInches: /(\d+)\s*(?:'|ft|feet)\s*(\d+)?\s*(?:"|''|in|inch|inches)?/i,
            length: /\b(\d+\.?\d*)\s*(m|cm|mm|km|ft|feet|foot|inch|inches|in|mile|miles|yard|yards|yd|meter|meters|centimeter|centimeters|millimeter|millimeters|kilometer|kilometers)\b/i,
            // Duration pattern for time units
            duration: /\b(\d+\.?\d*)\s*(hr|hrs|hour|hours|min|mins|minute|minutes|sec|secs|second|seconds|day|days|week|weeks|month|months|year|years|yr|yrs)\b/i,
            // Design units pattern - px, rem, em, pt, dp, sp, inches
            design: /\b(\d+\.?\d*)\s*(px|rem|em|pt|dp|sp|in|inch|inches|pixel|pixels|point|points)\b/i,
            // Digital storage pattern - bytes, KB, MB, GB, TB, PB and binary equivalents + network speed (bps, Kbps, Mbps, Gbps, Tbps)
            digital: /\b(\d+\.?\d*)\s*(b|byte|bytes|kb|kilobyte|kilobytes|mb|megabyte|megabytes|gb|gigabyte|gigabytes|tb|terabyte|terabytes|pb|petabyte|petabytes|kib|mib|gib|tib|pib|bps|kbps|mbps|gbps|tbps|kilobits per second|megabits per second|gigabits per second|terabits per second|bits per second)\b/i,
            // Area calculation pattern - detects "5m x 6m", "12ft by 10ft", etc. BEFORE area pattern
            areaCalc: /\b(\d+\.?\d*)\s*(m|cm|mm|km|ft|feet|foot|inch|inches|in|mile|miles|yard|yards|yd|meter|meters)\s*(?:x|×|by)\s*(\d+\.?\d*)\s*(m|cm|mm|km|ft|feet|foot|inch|inches|in|mile|miles|yard|yards|yd|meter|meters)\b/i,
            // Area pattern - square meters, square feet, acres, hectares, etc. (no trailing \b for Unicode ²)
            area: /\b(\d+\.?\d*)\s*(m²|m2|sq m|sqm|square meter|square meters|ft²|ft2|sq ft|sqft|square foot|square feet|km²|km2|sq km|square kilometer|square kilometers|acre|acres|hectare|hectares|ha|cm²|cm2|sq cm|square centimeter|square centimeters|mm²|mm2|sq mm|square millimeter|square millimeters|in²|in2|sq in|square inch|square inches|yd²|yd2|sq yd|square yard|square yards)/i,
            // Volume pattern - cubic meters, liters, gallons, etc. (no trailing \b for Unicode ³)
            volume: /\b(\d+\.?\d*)\s*(m³|m3|cubic meter|cubic meters|ft³|ft3|cubic foot|cubic feet|cm³|cm3|cc|cubic centimeter|cubic centimeters|l|liter|liters|litre|litres|ml|milliliter|milliliters|millilitre|millilitres|gal|gallon|gallons|qt|quart|quarts|pt|pint|pints|cup|cups|fl oz|fluid ounce|fluid ounces|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons)/i,
            // Temperature pattern - requires degree symbol with C/F/K or full word to avoid conflicts
            temperature: /\b(-?\d+\.?\d*)\s*(°\s*[CcFfKk]|celsius|fahrenheit|kelvin)\b/i,
            // Currency pattern now requires EITHER a symbol OR a currency name
            currency: /(?:(\$|€|£|¥|₹)\s*([\d,]+\.?\d*))|(?:([\d,]+\.?\d*)\s+([A-Z]{3}|dollar|dollars|euro|euros|pound|pounds|yen|rupee|rupees))|(?:([A-Z]{3})\s+([\d,]+\.?\d*))/i,
            // FIXED: Now captures optional minutes and timezone abbreviation OR country name
            timezone: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\s*(?:(?:utc|gmt)\s*([\+\-])(\d{1,2})(?::?(\d{2}))?|(ist|pst|est|cst|mst|utc|gmt|edt|cdt|mdt|pdt|jst|aest|bst|cet|cest)|(?:in\s+)?(india|japan|china|uk|usa|america|australia|germany|france|canada|brazil|russia|korea|singapore|dubai|uae|italy|spain|mexico|thailand|vietnam|indonesia|philippines|malaysia|pakistan|egypt|turkey|argentina|south africa|new zealand|sweden|norway|denmark|finland|netherlands|belgium|switzerland|austria|ireland|portugal|poland|greece|toronto|vancouver|montreal|new york|los angeles|chicago|san francisco|miami|boston|seattle|dallas|houston|atlanta|denver|phoenix|philadelphia|london|paris|berlin|tokyo|sydney|melbourne|mumbai|delhi|bangalore|shanghai|beijing|hong kong|dubai|singapore|moscow|madrid|barcelona|rome|milan|amsterdam|brussels|zurich|vienna|stockholm|copenhagen|oslo|helsinki|lisbon|warsaw|prague|budapest|athens|istanbul|cairo|cape town|johannesburg|nairobi|lagos|buenos aires|rio de janeiro|sao paulo|mexico city|lima|santiago|bogota|bangkok|jakarta|manila|kuala lumpur|hanoi|ho chi minh|karachi|lahore|dhaka|tehran|riyadh|tel aviv|auckland|wellington))/i,
            // Calculation pattern - after normalization, only basic operators remain
            calculation: /^[\d\s\+\-\*\/\(\)\.]+$/,
            // Day calculator patterns
            relativeDate: /\b(?:in\s+)?(\d+)\s+(day|days|week|weeks|month|months|year|years)(?:\s+(?:from\s+now|ago|later|before|back))?\b/i,
            specificDate: /\b(\d{1,2}|[a-z]{3,9})[\s\/\-](\d{1,2}|[a-z]{3,9})[\s\/\-](\d{2,4})\b/i,
            isoDate: /\b(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})\b/
        };
    }
    
    detectFunction(text) {
        let cleanText = text.trim();
        console.log('🔍 detectFunction called with:', JSON.stringify(text));
        console.log('🔍 cleanText:', JSON.stringify(cleanText));
        console.log('🔍 Has √ symbol:', cleanText.includes('√'));
        
        const isPlainEnglishWord = /^[a-zA-Z\s]+$/.test(cleanText);
        const hasNumbers = /\d/.test(cleanText);

        if (isPlainEnglishWord && !hasNumbers) {
            // Check if it contains non-English characters for translator
            const hasNonEnglish = /[^\x00-\x7F]/.test(cleanText);
            if (hasNonEnglish) {
                console.log('✅ Detected as: translator (non-English letters)');
                return { type: 'translator', icon: 'translator.svg' };
            }
            // Plain English word - default to meaning
            console.log('✅ Detected as: meaning (plain English word)');
            return { type: 'meaning', icon: 'meaning.svg' };
        }
        
        // Check for DAY CALCULATOR patterns BEFORE other patterns
        if (this.patterns.relativeDate.test(cleanText)) {
            console.log('✅ Detected as: day calculator (relative date)');
            return { type: 'daycalculator', icon: 'daycalculator.svg' };
        }

        if (this.patterns.isoDate.test(cleanText)) {
            console.log('✅ Detected as: day calculator (ISO date)');
            return { type: 'daycalculator', icon: 'daycalculator.svg' };
        }

        if (this.patterns.specificDate.test(cleanText)) {
            console.log('✅ Detected as: day calculator (specific date)');
            return { type: 'daycalculator', icon: 'daycalculator.svg' };
        }

        // Normalize dashes and multiplication symbols for better detection
        cleanText = cleanText.replace(/[–—]/g, '-');  // en-dash, em-dash → minus
        cleanText = cleanText.replace(/[×]/g, '*');   // × → *
        
        // Check for percentage calculations (e.g., "12% of 500", "15%")
        const hasPercentage = /\d+\.?\d*\s*%/.test(cleanText);
        if (hasPercentage) {
            console.log('✅ Detected as: percentage calculation');
            return { type: 'calculate', icon: 'calculate.svg' };
        }
        
        // Check for square root (√) or cube root (∛) symbols - must be before timezone!
        if (cleanText.includes('√') || cleanText.includes('∛')) {
            console.log('✅ Detected as: root calculation (√ or ∛)');
            return { type: 'calculate', icon: 'calculate.svg' };
        }
        
        // Check for area CALCULATIONS (5m x 6m, 12ft by 10ft) BEFORE area units check
        if (this.patterns.areaCalc.test(cleanText)) {
            console.log('✅ Detected as: area calculation (e.g., 5m x 6m)');
            return { type: 'area', icon: 'area.svg' };
        }
        
        // Check for area units BEFORE superscript check (m², sq ft, acres, etc.)
        // This prevents "150 m²" from being detected as a calculation
        if (this.patterns.area.test(cleanText)) {
            console.log('✅ Detected as: area');
            return { type: 'area', icon: 'area.svg' };
        }
        
        // Check for volume units BEFORE superscript check (m³, liters, gallons, etc.)
        // This prevents "150 m³" from being detected as a calculation
        if (this.patterns.volume.test(cleanText)) {
            console.log('✅ Detected as: volume');
            return { type: 'volume', icon: 'volume.svg' };
        }
        
        // Check for superscript powers (², ³, ⁴, etc.)
        const hasSuperscript = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(cleanText);
        if (hasSuperscript) {
            console.log('✅ Detected as: superscript calculation');
            return { type: 'calculate', icon: 'calculate.svg' };
        }
        
        // Check for calculations - detects +, -, *, /, x, X, ×, ÷, ^, **, √, ∛
        const hasMathOperator = /[\+\-\*\/xX÷\^√∛]/.test(cleanText);
        const hasNumbersForCalc = /\d/.test(cleanText);  // ✅ RENAMED to avoid duplicate
        const isValidCalcFormat = /^[\d\s\+\-\*\/xX÷\^√∛\(\)\.]+$/.test(cleanText);
        
        console.log('🔍 Math checks:', { hasMathOperator, hasNumbersForCalc, isValidCalcFormat });
        
        if (hasMathOperator && hasNumbersForCalc && isValidCalcFormat) {
            console.log('✅ Detected as: math calculation');
            return { type: 'calculate', icon: 'calculate.svg' };
        }
        
        // Check for temperature units - AFTER calculation checks to avoid conflicts
        if (this.patterns.temperature.test(cleanText)) {
            console.log('✅ Detected as: temperature');
            return { type: 'temperature', icon: 'temperature.svg' };
        }
        
        // Check for feet+inches format BEFORE timezone to avoid conflicts (e.g., "6'4"")
        if (this.patterns.feetInches.test(cleanText)) {
            console.log('✅ Detected as: feet+inches (length)');
            return { type: 'length', icon: 'length.svg' };
        }
        
        // Check for weight units
        if (this.patterns.weight.test(cleanText)) {
            console.log('✅ Detected as: weight');
            return { type: 'weight', icon: 'weight.svg' };
        }
        
        // Check for length units
        if (this.patterns.length.test(cleanText)) {
            return { type: 'length', icon: 'length.svg' };
        }
        
        // Check for duration units
        if (this.patterns.duration.test(cleanText)) {
            return { type: 'duration', icon: 'duration.svg' };
        }
        
        // Check for design units (px, rem, em, pt, dp, sp)
        if (this.patterns.design.test(cleanText)) {
            console.log('✅ Detected as: design units');
            return { type: 'design', icon: 'design.svg' };
        }
        
        // Check for digital storage units (B, KB, MB, GB, TB, PB, KiB, MiB, GiB, etc.) and network speed (bps, Kbps, Mbps, Gbps, Tbps)
        if (this.patterns.digital.test(cleanText)) {
            console.log('✅ Detected as: digital storage/speed');
            return { type: 'digital', icon: 'digital.svg' };
        }
        
        // Check for time FIRST (before currency, to avoid UTC being detected as currency)
        if (this.patterns.timezone.test(cleanText)) {
            console.log('✅ Detected as: timezone');
            console.log('🔍 Timezone pattern matched:', cleanText.match(this.patterns.timezone));
            return { type: 'timezone', icon: 'time.svg' };
        }

        // Check for currency AFTER timezone
        if (this.patterns.currency.test(cleanText)) {
            return { type: 'currency', icon: 'currency.svg' };
        }
        
        // Check if text contains non-English characters (for auto-translator detection)
        const hasNonEnglish = /[^\x00-\x7F]/.test(cleanText);
        
        if (hasNonEnglish) {
            console.log('✅ Detected as: translator (non-English text)');
            return { type: 'translator', icon: 'translator.svg' };
        }
        
        // Default to meaning for English words
        console.log('✅ Detected as: meaning (default)');
        return { type: 'meaning', icon: 'meaning.svg' };
    }

    getSuggestions(text, functionType) {
        switch (functionType) {
            case 'weight':
                return this.getWeightSuggestions(text);
            case 'length':
                return this.getLengthSuggestions(text);
            case 'duration':
                return this.getDurationSuggestions(text);
            case 'design':
                return this.getDesignSuggestions(text);
            case 'digital':
                return this.getDigitalSuggestions(text);
            case 'area':
                return this.getAreaSuggestions(text);
            case 'volume':
                return this.getVolumeSuggestions(text);
            case 'temperature':
                return this.getTemperatureSuggestions(text);
            case 'currency':
                return this.getCurrencySuggestions(text);
            case 'timezone':
                return this.getTimezoneSuggestions(text);
            case 'calculate':
                return this.getCalculationSuggestions(text);
            case 'meaning':
                return this.getMeaningSuggestions(text);
            case 'translator':
                return this.getTranslatorSuggestions(text);
            case 'daycalculator':
                return this.getDayCalculatorSuggestions(text);
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
            suggestions.push({ label: 'Kg', value: 'Kg', icon: '⚖️' });
        }
        if (!['g', 'gram', 'grams'].includes(unit)) {
            suggestions.push({ label: 'g', value: 'g', icon: '⚖️' });
        }
        if (!['lb', 'lbs', 'pound', 'pounds'].includes(unit)) {
            suggestions.push({ label: 'lbs', value: 'lbs', icon: '⚖️' });
        }

        return suggestions;
    }

    getLengthSuggestions(text) {
        // Check if it's feet+inches format first
        const feetInchMatch = text.match(this.patterns.feetInches);
        if (feetInchMatch) {
            // For feet+inches, suggest cm, meters, and inches
            return [
                { label: 'cm', value: 'cm', icon: '📏' },
                { label: 'meters', value: 'm', icon: '📏' },
                { label: 'inches', value: 'in', icon: '📏' }
            ];
        }
        
        // Otherwise handle regular length units
        const match = text.match(this.patterns.length);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        if (!['m', 'meter', 'meters'].includes(unit)) {
            suggestions.push({ label: 'meters', value: 'm', icon: '📏' });
        }
        if (!['cm', 'centimeter', 'centimeters'].includes(unit)) {
            suggestions.push({ label: 'cm', value: 'cm', icon: '📏' });
        }
        if (!['ft', 'feet', 'foot'].includes(unit)) {
            suggestions.push({ label: 'feet', value: 'ft', icon: '📏' });
        }

        return suggestions;
    }

    getDurationSuggestions(text) {
        const match = text.match(this.patterns.duration);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        // Suggest different time units based on what's selected
        if (!['hr', 'hrs', 'hour', 'hours'].includes(unit)) {
            suggestions.push({ label: 'hours', value: 'hours', icon: 'duration.svg' });
        }
        if (!['min', 'mins', 'minute', 'minutes'].includes(unit)) {
            suggestions.push({ label: 'minutes', value: 'minutes', icon: 'duration.svg' });
        }
        if (!['sec', 'secs', 'second', 'seconds'].includes(unit)) {
            suggestions.push({ label: 'seconds', value: 'seconds', icon: 'duration.svg' });
        }
        if (!['day', 'days'].includes(unit)) {
            suggestions.push({ label: 'days', value: 'days', icon: 'duration.svg' });
        }

        return suggestions;
    }

    getDesignSuggestions(text) {
        const match = text.match(this.patterns.design);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        // Normalize unit names
        const normalizedUnit = unit.replace(/s$/, ''); // Remove plural 's'
        
        // Web units
        if (!['px', 'pixel'].includes(normalizedUnit)) {
            suggestions.push({ label: 'px', value: 'px', icon: '📐' });
        }
        if (!['rem'].includes(normalizedUnit)) {
            suggestions.push({ label: 'rem', value: 'rem', icon: '📐' });
        }
        if (!['em'].includes(normalizedUnit)) {
            suggestions.push({ label: 'em', value: 'em', icon: '📐' });
        }
        
        // Print units
        if (!['pt', 'point'].includes(normalizedUnit)) {
            suggestions.push({ label: 'pt', value: 'pt', icon: '📐' });
        }
        
        // Android units
        if (!['dp'].includes(normalizedUnit)) {
            suggestions.push({ label: 'dp', value: 'dp', icon: '📐' });
        }
        if (!['sp'].includes(normalizedUnit)) {
            suggestions.push({ label: 'sp', value: 'sp', icon: '📐' });
        }
        
        // Physical units
        if (!['in', 'inch'].includes(normalizedUnit)) {
            suggestions.push({ label: 'inches', value: 'in', icon: '📐' });
        }

        return suggestions;
    }

    getDigitalSuggestions(text) {
        const match = text.match(this.patterns.digital);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        // Check if it's a speed unit BEFORE normalizing (important!)
        const isSpeedUnit = unit.includes('bps') || unit.includes('bits per second');
        
        if (isSpeedUnit) {
            // Network speed suggestions
            if (unit !== 'bps') {
                suggestions.push({ label: 'bps', value: 'bps', icon: '💾' });
            }
            if (unit !== 'kbps') {
                suggestions.push({ label: 'Kbps', value: 'Kbps', icon: '💾' });
            }
            if (unit !== 'mbps') {
                suggestions.push({ label: 'Mbps', value: 'Mbps', icon: '💾' });
            }
            if (unit !== 'gbps') {
                suggestions.push({ label: 'Gbps', value: 'Gbps', icon: '💾' });
            }
            if (unit !== 'tbps') {
                suggestions.push({ label: 'Tbps', value: 'Tbps', icon: '💾' });
            }
        } else {
            // Storage unit suggestions (bytes)
            // Normalize unit names for storage
            const normalizedUnit = unit.replace(/s$/, '').replace(/\s+/g, '');
            
            if (!['b', 'byte'].includes(normalizedUnit)) {
                suggestions.push({ label: 'B', value: 'B', icon: '💾' });
            }
            if (!['kb', 'kilobyte'].includes(normalizedUnit)) {
                suggestions.push({ label: 'KB', value: 'KB', icon: '💾' });
            }
            if (!['mb', 'megabyte'].includes(normalizedUnit)) {
                suggestions.push({ label: 'MB', value: 'MB', icon: '💾' });
            }
            if (!['gb', 'gigabyte'].includes(normalizedUnit)) {
                suggestions.push({ label: 'GB', value: 'GB', icon: '💾' });
            }
            if (!['tb', 'terabyte'].includes(normalizedUnit)) {
                suggestions.push({ label: 'TB', value: 'TB', icon: '💾' });
            }
            
            // Binary units (IEC standard)
            if (!['kib'].includes(normalizedUnit)) {
                suggestions.push({ label: 'KiB', value: 'KiB', icon: '💾' });
            }
            if (!['mib'].includes(normalizedUnit)) {
                suggestions.push({ label: 'MiB', value: 'MiB', icon: '💾' });
            }
            if (!['gib'].includes(normalizedUnit)) {
                suggestions.push({ label: 'GiB', value: 'GiB', icon: '💾' });
            }
        }

        return suggestions;
    }

    getAreaSuggestions(text) {
        // Check if it's an area CALCULATION (5m x 6m, 12ft by 10ft)
        const calcMatch = text.match(this.patterns.areaCalc);
        if (calcMatch) {
            // For area calculations, suggest square units
            return [
                { label: 'm²', value: 'm2', icon: '📐' },
                { label: 'sq ft', value: 'sqft', icon: '📐' },
                { label: 'sq in', value: 'sqin', icon: '📐' },
                { label: 'acres', value: 'acre', icon: '📐' }
            ];
        }

        // Otherwise handle regular area units
        const match = text.match(this.patterns.area);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        // Normalize unit names
        const normalizedUnit = unit.replace(/²/g, '2').replace(/sq\s*/g, '').replace(/square\s*/g, '').trim();
        
        // Metric area units
        if (!['m²', 'm2', 'sq m', 'sqm', 'square meter', 'square meters'].some(u => unit.includes(u.replace(/\s/g, '')))) {
            suggestions.push({ label: 'm²', value: 'm2', icon: '📐' });
        }
        if (!['cm²', 'cm2', 'sq cm', 'square centimeter', 'square centimeters'].some(u => unit.includes(u.replace(/\s/g, '')))) {
            suggestions.push({ label: 'cm²', value: 'cm2', icon: '📐' });
        }
        
        // Imperial area units
        if (!['ft²', 'ft2', 'sq ft', 'sqft', 'square foot', 'square feet'].some(u => unit.includes(u.replace(/\s/g, '')))) {
            suggestions.push({ label: 'sq ft', value: 'sqft', icon: '📐' });
        }
        if (!['in²', 'in2', 'sq in', 'square inch', 'square inches'].some(u => unit.includes(u.replace(/\s/g, '')))) {
            suggestions.push({ label: 'sq in', value: 'sqin', icon: '📐' });
        }
        
        // Land area units
        if (!['acre', 'acres'].includes(unit)) {
            suggestions.push({ label: 'acres', value: 'acre', icon: '📐' });
        }
        if (!['hectare', 'hectares', 'ha'].includes(unit)) {
            suggestions.push({ label: 'hectares', value: 'hectare', icon: '📐' });
        }

        return suggestions;
    }

    getVolumeSuggestions(text) {
        const match = text.match(this.patterns.volume);
        if (!match) return [];

        const unit = match[2].toLowerCase();
        const suggestions = [];

        // Normalize unit names
        const normalizedUnit = unit.replace(/³/g, '3').replace(/cubic\s*/g, '').trim();
        
        // Metric volume units
        if (!['l', 'liter', 'liters', 'litre', 'litres'].includes(unit)) {
            suggestions.push({ label: 'liters', value: 'l', icon: '📐' });
        }
        if (!['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'].includes(unit)) {
            suggestions.push({ label: 'ml', value: 'ml', icon: '📐' });
        }
        if (!['m³', 'm3', 'cubic meter', 'cubic meters'].some(u => unit.includes(u.replace(/\s/g, '')))) {
            suggestions.push({ label: 'm³', value: 'm3', icon: '📐' });
        }
        
        // Imperial volume units
        if (!['gal', 'gallon', 'gallons'].includes(unit)) {
            suggestions.push({ label: 'gallons', value: 'gal', icon: '📐' });
        }
        if (!['cup', 'cups'].includes(unit)) {
            suggestions.push({ label: 'cups', value: 'cup', icon: '📐' });
        }
        if (!['fl oz', 'fluid ounce', 'fluid ounces'].some(u => unit.includes(u.replace(/\s/g, '')))) {
            suggestions.push({ label: 'fl oz', value: 'floz', icon: '📐' });
        }

        return suggestions;
    }

    getTemperatureSuggestions(text) {
        const match = text.match(this.patterns.temperature);
        if (!match) return [];

        const unit = match[2].toLowerCase().replace(/°\s*/g, ''); // Remove ° and spaces
        const suggestions = [];

        // Suggest different temperature units based on what's selected
        if (!['c', 'celsius'].includes(unit)) {
            suggestions.push({ label: '°C', value: 'C', icon: '🌡️' });
        }
        if (!['f', 'fahrenheit'].includes(unit)) {
            suggestions.push({ label: '°F', value: 'F', icon: '🌡️' });
        }
        if (!['k', 'kelvin'].includes(unit)) {
            suggestions.push({ label: 'K', value: 'K', icon: '🌡️' });
        }

        return suggestions;
    }

    getCurrencySuggestions(text) {
        return [
            { label: 'USD', value: 'USD', icon: '💲' },
            { label: 'EUR', value: 'EUR', icon: '💶' },
            { label: 'GBP', value: 'GBP', icon: '💷' },
            { label: 'INR', value: 'INR', icon: '💵' }
        ];
    }

    getTimezoneSuggestions(text) {
        // Parse to see if there's already a timezone or country in the text
        const match = text.match(this.patterns.timezone);
        const detectedTz = match && match[4] ? match[4].toUpperCase() : null;
        const detectedCountry = match && match[5] ? match[5].toLowerCase() : null;
        
        const allSuggestions = [
            { label: 'India 🇮🇳', value: 'India', icon: '🌍' },
            { label: 'Japan 🇯🇵', value: 'Japan', icon: '🌍' },
            { label: 'UK 🇬🇧', value: 'UK', icon: '🌍' },
            { label: 'USA 🇺🇸', value: 'USA', icon: '🌍' },
            { label: 'China 🇨🇳', value: 'China', icon: '🌍' },
            { label: 'Australia 🇦🇺', value: 'Australia', icon: '🌍' },
            { label: 'Germany 🇩🇪', value: 'Germany', icon: '🌍' },
            { label: 'Dubai 🇦🇪', value: 'Dubai', icon: '🌍' },
            { label: 'UTC', value: 'UTC', icon: '🌍' }
        ];
        
        // Filter out the detected timezone/country from suggestions
        if (detectedTz || detectedCountry) {
            return allSuggestions.filter(s => 
                s.value.toUpperCase() !== (detectedTz || '') && 
                s.value.toLowerCase() !== (detectedCountry || '')
            );
        }
        
        return allSuggestions;
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
    
    async getMeaningSuggestionsWithCheck(text) {
        // Fetch word data to check if examples exist
        const result = await chrome.runtime.sendMessage({
            action: 'fetch-word-meaning',
            word: text.trim()
        });
        
        const baseSuggestions = [
            { label: 'Define', value: 'define', icon: '📖' },
            { label: 'Synonyms', value: 'synonyms', icon: '🔤' }
        ];
        
        // Check if any definition has an example
        if (result.success && result.data && result.data.definitions) {
            const hasExamples = result.data.definitions.some(def => def.example && def.example.length > 0);
            if (hasExamples) {
                baseSuggestions.push({ label: 'Examples', value: 'examples', icon: '💡' });
            }
        }
        
        return baseSuggestions;
    }

    getTranslatorSuggestions(text) {
        // Return popular language suggestions with English first
        return [
            { label: 'English 🇬🇧', value: 'en', icon: 'translator.svg' },
            { label: 'Spanish 🇪🇸', value: 'es', icon: 'translator.svg' },
            { label: 'French 🇫🇷', value: 'fr', icon: 'translator.svg' },
            { label: 'German 🇩🇪', value: 'de', icon: 'translator.svg' },
            { label: 'Japanese 🇯🇵', value: 'ja', icon: 'translator.svg' },
            { label: 'Chinese 🇨🇳', value: 'zh', icon: 'translator.svg' },
            { label: 'Italian 🇮🇹', value: 'it', icon: 'translator.svg' },
            { label: 'Portuguese 🇵🇹', value: 'pt', icon: 'translator.svg' },
            { label: 'Russian 🇷🇺', value: 'ru', icon: 'translator.svg' },
            { label: 'Arabic 🇸🇦', value: 'ar', icon: 'translator.svg' },
            { label: 'Hindi 🇮🇳', value: 'hi', icon: 'translator.svg' }
        ];
    }

    getDayCalculatorSuggestions(text) {
    const suggestions = [];
    
    if (this.patterns.relativeDate.test(text)) {
        suggestions.push(
            { label: 'Get Date', value: 'date', icon: 'daycalculator.svg' },
            { label: 'Day of Week', value: 'day', icon: 'daycalculator.svg' }
        );
    }
    else if (this.patterns.specificDate.test(text) || this.patterns.isoDate.test(text)) {
        suggestions.push(
            { label: 'Day of Week', value: 'day', icon: 'daycalculator.svg' },
            { label: 'Age', value: 'age', icon: 'daycalculator.svg' },
            { label: 'Days From Now', value: 'fromnow', icon: 'daycalculator.svg' }
        );
    }
    
    return suggestions;
}

    async processFunction(text, functionType, target) {
        switch (functionType) {
            case 'weight':
                return this.convertWeight(text, target);
            case 'length':
                return this.convertLength(text, target);
            case 'duration':
                return this.convertDuration(text, target);
            case 'design':
                return this.convertDesign(text, target);
            case 'digital':
                return this.convertDigital(text, target);
            case 'area':
                return this.convertArea(text, target);
            case 'volume':
                return this.convertVolume(text, target);
            case 'temperature':
                return this.convertTemperature(text, target);
            case 'currency':
                return await this.convertCurrency(text, target);
            case 'timezone':
                return this.convertTimezone(text, target);
            case 'calculate':
                return this.calculate(text);
            case 'meaning':
                return await this.getMeaning(text, target);
            case 'translator':
                return await this.translateText(text, target);
            case 'daycalculator':
                return this.calculateDay(text, target);
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
        // First check if it's feet+inches format (e.g., 6'4", 6ft 4in)
        const feetInchMatch = text.match(this.patterns.feetInches);
        if (feetInchMatch) {
            const feet = parseInt(feetInchMatch[1]);
            const inches = feetInchMatch[2] ? parseInt(feetInchMatch[2]) : 0;
            
            // Convert to total inches first
            const totalInches = (feet * 12) + inches;
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
            
            // Convert total inches to meters, then to target unit
            const valueInMeters = totalInches * 0.0254; // inches to meters
            const result = valueInMeters / toMeters[toUnit];
            
            return {
                value: `${result.toFixed(2)} ${toUnit}`,
                label: `Converted from ${feet}' ${inches}"`
            };
        }
        
        // Otherwise handle regular length units
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

    convertDuration(text, target) {
        const match = text.match(this.patterns.duration);
        if (!match) {
            return { value: 'Invalid duration format', label: '' };
        }

        const value = parseFloat(match[1]);
        const fromUnit = match[2].toLowerCase();
        const toUnit = target.toLowerCase();

        // Conversion table to seconds
        const toSeconds = {
            'sec': 1, 'secs': 1, 'second': 1, 'seconds': 1,
            'min': 60, 'mins': 60, 'minute': 60, 'minutes': 60,
            'hr': 3600, 'hrs': 3600, 'hour': 3600, 'hours': 3600,
            'day': 86400, 'days': 86400,
            'week': 604800, 'weeks': 604800,
            'month': 2592000, 'months': 2592000,  // Approximate: 30 days
            'year': 31536000, 'years': 31536000, 'yr': 31536000, 'yrs': 31536000  // 365 days
        };

        const valueInSeconds = value * toSeconds[fromUnit];
        const result = valueInSeconds / toSeconds[toUnit];

        return {
            value: `${result.toFixed(2)} ${toUnit}`,
            label: `Converted from ${value} ${fromUnit}`
        };
    }

    convertDesign(text, target) {
        const match = text.match(this.patterns.design);
        if (!match) {
            return { value: 'Invalid design unit format', label: '' };
        }

        const value = parseFloat(match[1]);
        let fromUnit = match[2].toLowerCase();
        const toUnit = target.toLowerCase();

        // Normalize unit names (remove plural 's')
        fromUnit = fromUnit.replace(/s$/, '');
        if (fromUnit === 'pixel') fromUnit = 'px';
        if (fromUnit === 'point') fromUnit = 'pt';
        if (fromUnit === 'inch') fromUnit = 'in';

        // Base font size assumptions
        const BASE_FONT_SIZE = 16; // 16px = 1rem = 1em (default)
        const PX_TO_PT_RATIO = 0.75; // 1pt = 1.333px at 96 DPI
        const ANDROID_BASE_DPI = 160; // Android baseline DPI
        const CSS_PPI = 96; // CSS pixels per inch (standard for web/screens)

        // First, convert everything to px
        let valueInPx;
        switch (fromUnit) {
            case 'px':
                valueInPx = value;
                break;
            case 'rem':
                valueInPx = value * BASE_FONT_SIZE;
                break;
            case 'em':
                valueInPx = value * BASE_FONT_SIZE; // Assuming parent = root
                break;
            case 'pt':
                valueInPx = value / PX_TO_PT_RATIO; // 1pt = 0.75px → px = pt / 0.75
                break;
            case 'dp':
            case 'sp':
                valueInPx = value; // At 160 DPI (mdpi), 1dp = 1px
                break;
            case 'in':
                valueInPx = value * CSS_PPI; // 1 inch = 96 CSS pixels
                break;
            default:
                return { value: 'Unsupported unit', label: '' };
        }

        // Then convert from px to target unit
        let result;
        let resultUnit = toUnit;
        switch (toUnit) {
            case 'px':
                result = valueInPx;
                break;
            case 'rem':
                result = valueInPx / BASE_FONT_SIZE;
                break;
            case 'em':
                result = valueInPx / BASE_FONT_SIZE;
                break;
            case 'pt':
                result = valueInPx * PX_TO_PT_RATIO;
                break;
            case 'dp':
            case 'sp':
                result = valueInPx; // At 160 DPI (mdpi), 1px = 1dp
                break;
            case 'in':
                result = valueInPx / CSS_PPI; // px to inches
                break;
            default:
                return { value: 'Unsupported target unit', label: '' };
        }

        // Format the output nicely
        const precision = result % 1 === 0 ? 0 : 2; // No decimals for whole numbers
        const fromUnitDisplay = fromUnit === 'px' ? 'px' : fromUnit;
        const toUnitDisplay = toUnit === 'px' ? 'px' : toUnit;

        // Add context to label
        let labelContext = '';
        if (fromUnit === 'in' || toUnit === 'in') {
            labelContext = ' @ 96 PPI';
        } else if (fromUnit === 'rem' || toUnit === 'rem' || fromUnit === 'em' || toUnit === 'em') {
            labelContext = ' (base: 16px)';
        }

        return {
            value: `${result.toFixed(precision)} ${toUnitDisplay}`,
            label: `Converted from ${value}${fromUnitDisplay}${labelContext}`
        };
    }

    convertDigital(text, target) {
        const match = text.match(this.patterns.digital);
        if (!match) {
            return { value: 'Invalid digital storage/speed format', label: '' };
        }

        const value = parseFloat(match[1]);
        let fromUnit = match[2].toLowerCase();
        let toUnit = target.toLowerCase();

        // Check if units are speed BEFORE normalizing
        const isFromSpeed = fromUnit.includes('bps') || fromUnit.includes('bits per second');
        const isToSpeed = toUnit.includes('bps') || toUnit.includes('bits per second');

        // Normalize unit names (remove spaces for "bits per second" variants)
        fromUnit = fromUnit.replace(/\s+/g, '');
        toUnit = toUnit.replace(/\s+/g, '');
        
        // Normalize storage unit names (remove plural 's' only for non-speed units)
        if (!isFromSpeed) {
            fromUnit = fromUnit.replace(/s$/, '');
            if (fromUnit === 'byte') fromUnit = 'b';
            if (fromUnit === 'kilobyte') fromUnit = 'kb';
            if (fromUnit === 'megabyte') fromUnit = 'mb';
            if (fromUnit === 'gigabyte') fromUnit = 'gb';
            if (fromUnit === 'terabyte') fromUnit = 'tb';
            if (fromUnit === 'petabyte') fromUnit = 'pb';
        } else {
            // Normalize speed unit names
            if (fromUnit === 'bitspersecond') fromUnit = 'bps';
            if (fromUnit === 'kilobitspersecond') fromUnit = 'kbps';
            if (fromUnit === 'megabitspersecond') fromUnit = 'mbps';
            if (fromUnit === 'gigabitspersecond') fromUnit = 'gbps';
            if (fromUnit === 'terabitspersecond') fromUnit = 'tbps';
        }
        
        if (!isToSpeed) {
            toUnit = toUnit.replace(/s$/, '');
            if (toUnit === 'byte') toUnit = 'b';
            if (toUnit === 'kilobyte') toUnit = 'kb';
            if (toUnit === 'megabyte') toUnit = 'mb';
            if (toUnit === 'gigabyte') toUnit = 'gb';
            if (toUnit === 'terabyte') toUnit = 'tb';
            if (toUnit === 'petabyte') toUnit = 'pb';
        } else {
            // Normalize speed unit names
            if (toUnit === 'bitspersecond') toUnit = 'bps';
            if (toUnit === 'kilobitspersecond') toUnit = 'kbps';
            if (toUnit === 'megabitspersecond') toUnit = 'mbps';
            if (toUnit === 'gigabitspersecond') toUnit = 'gbps';
            if (toUnit === 'terabitspersecond') toUnit = 'tbps';
        }

        // Conversion table to BYTES (using decimal/SI standard: 1 KB = 1000 B)
        const toBytes = {
            'b': 1,
            'kb': 1000,
            'mb': 1000000,
            'gb': 1000000000,
            'tb': 1000000000000,
            'pb': 1000000000000000,
            // Binary units (IEC standard: 1 KiB = 1024 B)
            'kib': 1024,
            'mib': 1048576,
            'gib': 1073741824,
            'tib': 1099511627776,
            'pib': 1125899906842624
        };

        // Conversion table to BITS PER SECOND (using decimal/SI standard: 1 Kbps = 1000 bps)
        const toBitsPerSecond = {
            'bps': 1,
            'kbps': 1000,
            'mbps': 1000000,
            'gbps': 1000000000,
            'tbps': 1000000000000
        };

        let result;
        let fromUnitDisplay;
        let toUnitDisplay;

        // Case 1: Both are storage units (bytes)
        if (!isFromSpeed && !isToSpeed) {
            const fromMultiplier = toBytes[fromUnit];
            const toMultiplier = toBytes[toUnit];

            if (!fromMultiplier || !toMultiplier) {
                return { value: 'Unsupported storage unit', label: '' };
            }

            const valueInBytes = value * fromMultiplier;
            result = valueInBytes / toMultiplier;
            fromUnitDisplay = fromUnit.toUpperCase();
            toUnitDisplay = toUnit.toUpperCase();
        }
        // Case 2: Both are speed units (bits per second)
        else if (isFromSpeed && isToSpeed) {
            const fromMultiplier = toBitsPerSecond[fromUnit];
            const toMultiplier = toBitsPerSecond[toUnit];

            if (!fromMultiplier || !toMultiplier) {
                return { value: 'Unsupported speed unit', label: '' };
            }

            const valueInBps = value * fromMultiplier;
            result = valueInBps / toMultiplier;
            
            // Proper display formatting for speed units
            fromUnitDisplay = fromUnit === 'bps' ? 'bps' : fromUnit.charAt(0).toUpperCase() + fromUnit.slice(1);
            toUnitDisplay = toUnit === 'bps' ? 'bps' : toUnit.charAt(0).toUpperCase() + toUnit.slice(1);
        }
        // Case 3: Converting between storage and speed (e.g., MB to Mbps or Mbps to MB)
        else {
            return {
                value: 'Cannot convert between storage and speed',
                label: 'Storage (bytes) and speed (bits/sec) are different types of units'
            };
        }

        // Format the output nicely
        const precision = result % 1 === 0 ? 0 : 2; // No decimals for whole numbers

        return {
            value: `${result.toFixed(precision)} ${toUnitDisplay}`,
            label: `Converted from ${value} ${fromUnitDisplay}`
        };
    }

    convertArea(text, target) {
        // Check if it's an area CALCULATION (5m x 6m, 12ft by 10ft)
        const calcMatch = text.match(this.patterns.areaCalc);
        if (calcMatch) {
            const length = parseFloat(calcMatch[1]);
            const lengthUnit = calcMatch[2].toLowerCase();
            const width = parseFloat(calcMatch[3]);
            const widthUnit = calcMatch[4].toLowerCase();

            // Normalize length unit names
            const normalizeLengthUnit = (unit) => {
                if (['m', 'meter', 'meters'].includes(unit)) return 'm';
                if (['cm', 'centimeter', 'centimeters'].includes(unit)) return 'cm';
                if (['mm', 'millimeter', 'millimeters'].includes(unit)) return 'mm';
                if (['km', 'kilometer', 'kilometers'].includes(unit)) return 'km';
                if (['ft', 'feet', 'foot'].includes(unit)) return 'ft';
                if (['in', 'inch', 'inches'].includes(unit)) return 'in';
                if (['yd', 'yard', 'yards'].includes(unit)) return 'yd';
                if (['mile', 'miles'].includes(unit)) return 'mile';
                return unit;
            };

            const fromLengthUnit = normalizeLengthUnit(lengthUnit);
            const fromWidthUnit = normalizeLengthUnit(widthUnit);

            // Convert both dimensions to meters first
            const toMeters = {
                'm': 1,
                'cm': 0.01,
                'mm': 0.001,
                'km': 1000,
                'ft': 0.3048,
                'in': 0.0254,
                'yd': 0.9144,
                'mile': 1609.34
            };

            const lengthInMeters = length * toMeters[fromLengthUnit];
            const widthInMeters = width * toMeters[fromWidthUnit];
            const areaInM2 = lengthInMeters * widthInMeters;

            // Convert to target square unit
            const toUnit = target.toLowerCase();
            const normalizeAreaUnit = (unit) => {
                unit = unit.replace(/²/g, '2').replace(/\s+/g, '');
                if (['m²', 'm2', 'sqm', 'squaremeter', 'squaremeters'].includes(unit)) return 'm2';
                if (['cm²', 'cm2', 'sqcm', 'squarecentimeter', 'squarecentimeters'].includes(unit)) return 'cm2';
                if (['mm²', 'mm2', 'sqmm', 'squaremillimeter', 'squaremillimeters'].includes(unit)) return 'mm2';
                if (['km²', 'km2', 'sqkm', 'squarekilometer', 'squarekilometers'].includes(unit)) return 'km2';
                if (['ft²', 'ft2', 'sqft', 'squarefoot', 'squarefeet'].includes(unit)) return 'sqft';
                if (['in²', 'in2', 'sqin', 'squareinch', 'squareinches'].includes(unit)) return 'sqin';
                if (['yd²', 'yd2', 'sqyd', 'squareyard', 'squareyards'].includes(unit)) return 'sqyd';
                if (['acre', 'acres'].includes(unit)) return 'acre';
                if (['hectare', 'hectares', 'ha'].includes(unit)) return 'hectare';
                return unit;
            };

            const to = normalizeAreaUnit(toUnit);

            const toM2 = {
                'm2': 1,
                'cm2': 0.0001,
                'mm2': 0.000001,
                'km2': 1000000,
                'sqft': 0.092903,
                'sqin': 0.00064516,
                'sqyd': 0.836127,
                'acre': 4046.86,
                'hectare': 10000
            };

            if (!toM2[to]) {
                return { value: 'Unsupported area unit', label: '' };
            }

            const result = areaInM2 / toM2[to];

            // Format unit display
            const displayUnit = (unit) => {
                if (unit === 'm2') return 'm²';
                if (unit === 'cm2') return 'cm²';
                if (unit === 'mm2') return 'mm²';
                if (unit === 'km2') return 'km²';
                if (unit === 'sqft') return 'sq ft';
                if (unit === 'sqin') return 'sq in';
                if (unit === 'sqyd') return 'sq yd';
                if (unit === 'hectare') return 'hectares';
                return unit;
            };

            return {
                value: `${result.toFixed(2)} ${displayUnit(to)}`,
                label: `Area of ${length}${fromLengthUnit} × ${width}${fromWidthUnit}`
            };
        }

        // Otherwise handle regular area units
        const match = text.match(this.patterns.area);
        if (!match) {
            return { value: 'Invalid area format', label: '' };
        }

        const value = parseFloat(match[1]);
        let fromUnit = match[2].toLowerCase();
        let toUnit = target.toLowerCase();

        // Normalize unit names
        const normalizeAreaUnit = (unit) => {
            unit = unit.replace(/²/g, '2').replace(/\s+/g, '');
            if (['m²', 'm2', 'sqm', 'squaremeter', 'squaremeters'].includes(unit)) return 'm2';
            if (['cm²', 'cm2', 'sqcm', 'squarecentimeter', 'squarecentimeters'].includes(unit)) return 'cm2';
            if (['mm²', 'mm2', 'sqmm', 'squaremillimeter', 'squaremillimeters'].includes(unit)) return 'mm2';
            if (['km²', 'km2', 'sqkm', 'squarekilometer', 'squarekilometers'].includes(unit)) return 'km2';
            if (['ft²', 'ft2', 'sqft', 'squarefoot', 'squarefeet'].includes(unit)) return 'sqft';
            if (['in²', 'in2', 'sqin', 'squareinch', 'squareinches'].includes(unit)) return 'sqin';
            if (['yd²', 'yd2', 'sqyd', 'squareyard', 'squareyards'].includes(unit)) return 'sqyd';
            if (['acre', 'acres'].includes(unit)) return 'acre';
            if (['hectare', 'hectares', 'ha'].includes(unit)) return 'hectare';
            return unit;
        };

        const from = normalizeAreaUnit(fromUnit);
        const to = normalizeAreaUnit(toUnit);

        // Conversion table to square meters
        const toM2 = {
            'm2': 1,
            'cm2': 0.0001,
            'mm2': 0.000001,
            'km2': 1000000,
            'sqft': 0.092903,
            'sqin': 0.00064516,
            'sqyd': 0.836127,
            'acre': 4046.86,
            'hectare': 10000
        };

        if (!toM2[from] || !toM2[to]) {
            return { value: 'Unsupported area unit', label: '' };
        }

        const valueInM2 = value * toM2[from];
        const result = valueInM2 / toM2[to];

        // Format unit display
        const displayUnit = (unit) => {
            if (unit === 'm2') return 'm²';
            if (unit === 'cm2') return 'cm²';
            if (unit === 'mm2') return 'mm²';
            if (unit === 'km2') return 'km²';
            if (unit === 'sqft') return 'sq ft';
            if (unit === 'sqin') return 'sq in';
            if (unit === 'sqyd') return 'sq yd';
            if (unit === 'hectare') return 'hectares';
            return unit;
        };

        return {
            value: `${result.toFixed(2)} ${displayUnit(to)}`,
            label: `Converted from ${value} ${displayUnit(from)}`
        };
    }

    convertVolume(text, target) {
        const match = text.match(this.patterns.volume);
        if (!match) {
            return { value: 'Invalid volume format', label: '' };
        }

        const value = parseFloat(match[1]);
        let fromUnit = match[2].toLowerCase();
        let toUnit = target.toLowerCase();

        // Normalize unit names
        const normalizeVolumeUnit = (unit) => {
            unit = unit.replace(/³/g, '3').replace(/\s+/g, '');
            if (['m³', 'm3', 'cubicmeter', 'cubicmeters'].includes(unit)) return 'm3';
            if (['cm³', 'cm3', 'cc', 'cubiccentimeter', 'cubiccentimeters'].includes(unit)) return 'cm3';
            if (['ft³', 'ft3', 'cubicfoot', 'cubicfeet'].includes(unit)) return 'ft3';
            if (['l', 'liter', 'liters', 'litre', 'litres'].includes(unit)) return 'l';
            if (['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'].includes(unit)) return 'ml';
            if (['gal', 'gallon', 'gallons'].includes(unit)) return 'gal';
            if (['qt', 'quart', 'quarts'].includes(unit)) return 'qt';
            if (['pt', 'pint', 'pints'].includes(unit)) return 'pt';
            if (['cup', 'cups'].includes(unit)) return 'cup';
            if (['floz', 'fl oz', 'fluidounce', 'fluidounces'].includes(unit)) return 'floz';
            if (['tbsp', 'tablespoon', 'tablespoons'].includes(unit)) return 'tbsp';
            if (['tsp', 'teaspoon', 'teaspoons'].includes(unit)) return 'tsp';
            return unit;
        };

        const from = normalizeVolumeUnit(fromUnit);
        const to = normalizeVolumeUnit(toUnit);

        // Conversion table to liters
        const toLiters = {
            'l': 1,
            'ml': 0.001,
            'm3': 1000,
            'cm3': 0.001,
            'ft3': 28.3168,
            'gal': 3.78541,      // US gallons
            'qt': 0.946353,      // US quarts
            'pt': 0.473176,      // US pints
            'cup': 0.236588,     // US cups
            'floz': 0.0295735,   // US fluid ounces
            'tbsp': 0.0147868,   // US tablespoons
            'tsp': 0.00492892    // US teaspoons
        };

        if (!toLiters[from] || !toLiters[to]) {
            return { value: 'Unsupported volume unit', label: '' };
        }

        const valueInLiters = value * toLiters[from];
        const result = valueInLiters / toLiters[to];

        // Format unit display
        const displayUnit = (unit) => {
            if (unit === 'm3') return 'm³';
            if (unit === 'cm3') return 'cm³';
            if (unit === 'ft3') return 'ft³';
            if (unit === 'l') return 'liters';
            if (unit === 'gal') return 'gallons';
            if (unit === 'floz') return 'fl oz';
            return unit;
        };

        return {
            value: `${result.toFixed(2)} ${displayUnit(to)}`,
            label: `Converted from ${value} ${displayUnit(from)}`
        };
    }

    convertTemperature(text, target) {
        const match = text.match(this.patterns.temperature);
        if (!match) {
            return { value: 'Invalid temperature format', label: 'Use format like: 25°C, 25°F, 25 celsius' };
        }

        const value = parseFloat(match[1]);
        const fromUnit = match[2].toLowerCase().replace(/°\s*/g, ''); // Remove ° and spaces
        const toUnit = target.toUpperCase();

        // Normalize unit names
        const normalizeUnit = (unit) => {
            if (['c', 'celsius'].includes(unit)) return 'C';
            if (['f', 'fahrenheit'].includes(unit)) return 'F';
            if (['k', 'kelvin'].includes(unit)) return 'K';
            return unit.toUpperCase();
        };

        const from = normalizeUnit(fromUnit);
        const to = toUnit;

        let result;
        
        // Convert to Celsius first (as intermediate)
        let celsius;
        if (from === 'C') {
            celsius = value;
        } else if (from === 'F') {
            celsius = (value - 32) * 5/9;
        } else if (from === 'K') {
            celsius = value - 273.15;
        }

        // Then convert from Celsius to target unit
        if (to === 'C') {
            result = celsius;
        } else if (to === 'F') {
            result = (celsius * 9/5) + 32;
        } else if (to === 'K') {
            result = celsius + 273.15;
        }

        // Format the result with appropriate symbol
        const symbol = to === 'K' ? 'K' : `°${to}`;
        const fromSymbol = from === 'K' ? 'K' : `°${from}`;
        
        return {
            value: `${result.toFixed(2)} ${symbol}`,
            label: `Converted from ${value}${fromSymbol}`
        };
    }

        async convertCurrency(text, target) {
        try {
            const match = text.match(this.patterns.currency);
            if (!match) {
                return { value: 'Invalid currency format', label: '' };
            }

            let amount, fromCurrency;

            // Pattern 1: Symbol format ($100, €50)
            if (match[1] && match[2]) {
                const symbols = { '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR' };
                fromCurrency = symbols[match[1]];
                amount = parseFloat(match[2].replace(/,/g, '')); // Remove commas!
            } 
            // Pattern 2: Number + Currency (100 USD, 130 AED)
            else if (match[3] && match[4]) {
                amount = parseFloat(match[3].replace(/,/g, '')); // Remove commas!
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
            // Pattern 3: Currency + Number (USD 120, AED 130) - NEW!
            else if (match[5] && match[6]) {
                fromCurrency = match[5].toUpperCase();
                amount = parseFloat(match[6].replace(/,/g, '')); // Remove commas!
            } else {
                return { value: 'Invalid currency format', label: '' };
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

    // NEW: UTC offset comes FIRST now (match[4], match[5], match[6])
    const utcSign = match[4]; // + or -
    const utcHours = match[5] ? parseInt(match[5]) : null;
    const utcMinutes = match[6] ? parseInt(match[6]) : 0;

    // THEN timezone code (match[7])
    const fromTzCode = match[7] ? match[7].toUpperCase() : null;

    // THEN country name (match[8])
    const fromCountry = match[8] ? match[8].toLowerCase() : null;

    if (period) {
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
    }

    const cityTimezones = {
        'toronto': -5 * 60, 'vancouver': -8 * 60, 'montreal': -5 * 60,
        'new york': -5 * 60, 'los angeles': -8 * 60, 'chicago': -6 * 60,
        'san francisco': -8 * 60, 'miami': -5 * 60, 'boston': -5 * 60,
        'seattle': -8 * 60, 'dallas': -6 * 60, 'houston': -6 * 60,
        'atlanta': -5 * 60, 'denver': -7 * 60, 'phoenix': -7 * 60,
        'philadelphia': -5 * 60, 'london': 0, 'paris': 1 * 60,
        'berlin': 1 * 60, 'madrid': 1 * 60, 'barcelona': 1 * 60,
        'rome': 1 * 60, 'milan': 1 * 60, 'amsterdam': 1 * 60,
        'brussels': 1 * 60, 'zurich': 1 * 60, 'vienna': 1 * 60,
        'stockholm': 1 * 60, 'copenhagen': 1 * 60, 'oslo': 1 * 60,
        'helsinki': 2 * 60, 'lisbon': 0, 'warsaw': 1 * 60,
        'prague': 1 * 60, 'budapest': 1 * 60, 'athens': 2 * 60,
        'istanbul': 3 * 60, 'moscow': 3 * 60, 'tokyo': 9 * 60,
        'mumbai': 5 * 60 + 30, 'delhi': 5 * 60 + 30, 'bangalore': 5 * 60 + 30,
        'shanghai': 8 * 60, 'beijing': 8 * 60, 'hong kong': 8 * 60,
        'singapore': 8 * 60, 'bangkok': 7 * 60, 'jakarta': 7 * 60,
        'manila': 8 * 60, 'kuala lumpur': 8 * 60, 'hanoi': 7 * 60,
        'ho chi minh': 7 * 60, 'karachi': 5 * 60, 'lahore': 5 * 60,
        'dhaka': 6 * 60, 'tehran': 3 * 60 + 30, 'riyadh': 3 * 60,
        'tel aviv': 2 * 60, 'sydney': 10 * 60, 'melbourne': 10 * 60,
        'auckland': 12 * 60, 'wellington': 12 * 60, 'cairo': 2 * 60,
        'cape town': 2 * 60, 'johannesburg': 2 * 60, 'nairobi': 3 * 60,
        'lagos': 1 * 60, 'buenos aires': -3 * 60, 'rio de janeiro': -3 * 60,
        'sao paulo': -3 * 60, 'mexico city': -6 * 60, 'lima': -5 * 60,
        'santiago': -3 * 60, 'bogota': -5 * 60, 'dubai': 4 * 60
    };

    const countryTimezones = {
        'india': 5 * 60 + 30, 'japan': 9 * 60, 'china': 8 * 60,
        'uk': 0, 'usa': -5 * 60, 'america': -5 * 60,
        'australia': 10 * 60, 'germany': 1 * 60, 'france': 1 * 60,
        'canada': -5 * 60, 'brazil': -3 * 60, 'russia': 3 * 60,
        'korea': 9 * 60, 'singapore': 8 * 60, 'uae': 4 * 60,
        'italy': 1 * 60, 'spain': 1 * 60, 'mexico': -6 * 60,
        'thailand': 7 * 60, 'vietnam': 7 * 60, 'indonesia': 7 * 60,
        'philippines': 8 * 60, 'malaysia': 8 * 60, 'pakistan': 5 * 60,
        'egypt': 2 * 60, 'turkey': 3 * 60, 'argentina': -3 * 60,
        'south africa': 2 * 60, 'new zealand': 12 * 60, 'sweden': 1 * 60,
        'norway': 1 * 60, 'denmark': 1 * 60, 'finland': 2 * 60,
        'netherlands': 1 * 60, 'belgium': 1 * 60, 'switzerland': 1 * 60,
        'austria': 1 * 60, 'ireland': 0, 'portugal': 0,
        'poland': 1 * 60, 'greece': 2 * 60
    };

    const allTimezones = { ...cityTimezones, ...countryTimezones };
    
    let fromTz, fromLabel, fromOffset;
    
    // Check if UTC offset format (e.g., UTC+5:30)
    if (utcHours !== null) {
        const offsetMinutes = (utcHours * 60) + utcMinutes;
        fromOffset = utcSign === '-' ? -offsetMinutes : offsetMinutes;
        fromTz = `UTC${utcSign}${utcHours}${utcMinutes ? ':' + utcMinutes.toString().padStart(2, '0') : ''}`;
        fromLabel = fromTz;
    } else if (fromCountry) {
        fromTz = fromCountry;
        fromLabel = fromCountry.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        fromOffset = allTimezones[fromTz.toLowerCase()] || 0;
    } else if (fromTzCode) {
        fromTz = fromTzCode;
        fromLabel = fromTzCode;
        const tzOffsets = {
            'UTC': 0, 'GMT': 0, 'EST': -5 * 60, 'EDT': -4 * 60,
            'CST': -6 * 60, 'CDT': -5 * 60, 'MST': -7 * 60, 'MDT': -6 * 60,
            'PST': -8 * 60, 'PDT': -7 * 60, 'IST': 5 * 60 + 30,
            'JST': 9 * 60, 'AEST': 10 * 60, 'BST': 1 * 60,
            'CET': 1 * 60, 'CEST': 2 * 60
        };
        fromOffset = tzOffsets[fromTz] || 0;
    } else {
        fromTz = 'LOCAL';
        fromLabel = 'LOCAL';
        fromOffset = -(new Date().getTimezoneOffset());
    }

    const targetLower = target.toLowerCase();
    const toOffset = allTimezones[targetLower] || (() => {
        const tzOffsets = {
            'UTC': 0, 'GMT': 0, 'EST': -5 * 60, 'EDT': -4 * 60,
            'CST': -6 * 60, 'CDT': -5 * 60, 'MST': -7 * 60, 'MDT': -6 * 60,
            'PST': -8 * 60, 'PDT': -7 * 60, 'IST': 5 * 60 + 30,
            'JST': 9 * 60, 'AEST': 10 * 60, 'BST': 1 * 60,
            'CET': 1 * 60, 'CEST': 2 * 60,
            'LOCAL': -(new Date().getTimezoneOffset())
        };
        return tzOffsets[target.toUpperCase()] || 0;
    })();
    
    const diffMinutes = toOffset - fromOffset;

    let totalMinutes = (hours * 60) + minutes + diffMinutes;
    let dayOffset = 0;
    
    while (totalMinutes >= 24 * 60) {
        totalMinutes -= 24 * 60;
        dayOffset++;
    }
    while (totalMinutes < 0) {
        totalMinutes += 24 * 60;
        dayOffset--;
    }

    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;
    let displayHours = newHours;
    let ampm = 'AM';
    
    if (newHours >= 12) {
        ampm = 'PM';
        if (newHours > 12) displayHours = newHours - 12;
    }
    if (newHours === 0) displayHours = 12;

    const formattedTime = `${displayHours}:${newMinutes.toString().padStart(2, '0')} ${ampm}`;
    const targetLabel = target.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    let label = `Converted from ${fromLabel}`;
    if (dayOffset !== 0) {
        const dayText = dayOffset > 0 ? 'next day' : 'previous day';
        label += ` (${dayText})`;
    }

    // Calculate overlapping work hours (9 AM - 5 PM)
    const workStart = 9;
    const workEnd = 17;
    let overlapStart = null;
    let overlapEnd = null;

    for (let hour = workStart; hour <= workEnd; hour++) {
        const convertedHour = (hour * 60 + diffMinutes) / 60;
        if (convertedHour >= workStart && convertedHour <= workEnd) {
            if (overlapStart === null) overlapStart = hour;
            overlapEnd = hour;
        }
    }

    if (overlapStart !== null && overlapEnd !== null) {
        const formatHour = (h) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${displayHour} ${period}`;
        };
        label += `\n\n**Best meeting time:**\n${formatHour(overlapStart)} - ${formatHour(overlapEnd)} (${fromLabel})`;
    } else {
        label += `\n\nNo overlapping work hours (9 AM - 5 PM)`;
    }

    return {
        value: `${formattedTime} (${targetLabel})`,
        label: label
    };
}
    calculateDay(text, mode) {
        try {
            const cleanText = text.trim();
            
            const monthNames = {
                'jan': 0, 'january': 0, 'feb': 1, 'february': 1,
                'mar': 2, 'march': 2, 'apr': 3, 'april': 3,
                'may': 4, 'jun': 5, 'june': 5,
                'jul': 6, 'july': 6, 'aug': 7, 'august': 7,
                'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
                'nov': 10, 'november': 10, 'dec': 11, 'december': 11
            };
            
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthFullNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                'July', 'August', 'September', 'October', 'November', 'December'];
            
            const relativeMatch = cleanText.match(this.patterns.relativeDate);
            if (relativeMatch) {
                const amount = parseInt(relativeMatch[1]);
                const unit = relativeMatch[2].toLowerCase();
                const isAgo = /ago|before|back/i.test(cleanText);
                
                const today = new Date();
                let targetDate = new Date(today);
                
                if (unit.includes('day')) {
                    targetDate.setDate(today.getDate() + (isAgo ? -amount : amount));
                } else if (unit.includes('week')) {
                    targetDate.setDate(today.getDate() + (isAgo ? -amount : amount) * 7);
                } else if (unit.includes('month')) {
                    targetDate.setMonth(today.getMonth() + (isAgo ? -amount : amount));
                } else if (unit.includes('year')) {
                    targetDate.setFullYear(today.getFullYear() + (isAgo ? -amount : amount));
                }
                
                const dayOfWeek = dayNames[targetDate.getDay()];
                const formattedDate = `${targetDate.getDate()} ${monthFullNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
                
                return { value: formattedDate, label: `${dayOfWeek}` };
            }
            
            const isoMatch = cleanText.match(this.patterns.isoDate);
            if (isoMatch) {
                const year = parseInt(isoMatch[1]);
                const month = parseInt(isoMatch[2]) - 1;
                const day = parseInt(isoMatch[3]);
                const date = new Date(year, month, day);
                
                if (mode === 'day' || !mode) {
                    return {
                        value: dayNames[date.getDay()],
                        label: `${date.getDate()} ${monthFullNames[date.getMonth()]} ${date.getFullYear()}`
                    };
                } else if (mode === 'age') {
                    const today = new Date();
                    let age = today.getFullYear() - date.getFullYear();
                    const monthDiff = today.getMonth() - date.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                        age--;
                    }
                    
                    let months = today.getMonth() - date.getMonth();
                    if (today.getDate() < date.getDate()) {
                        months--;
                    }
                    if (months < 0) {
                        months += 12;
                    }
                    
                    let ageStr = `${age} years`;
                    if (months > 0) {
                        ageStr += `, ${months} month${months > 1 ? 's' : ''}`;
                    }
                    
                    return {
                        value: ageStr + ' old',
                        label: `Born on ${dayNames[date.getDay()]}, ${date.getDate()} ${monthFullNames[date.getMonth()]} ${date.getFullYear()}`
                    };
                } else if (mode === 'fromnow') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);
                    
                    const diffTime = date - today;
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) {
                        return { value: 'Today', label: dayNames[date.getDay()] };
                    } else if (diffDays === 1) {
                        return { value: 'Tomorrow', label: dayNames[date.getDay()] };
                    } else if (diffDays === -1) {
                        return { value: 'Yesterday', label: dayNames[date.getDay()] };
                    } else if (diffDays > 0) {
                        return { value: `In ${diffDays} days`, label: dayNames[date.getDay()] };
                    } else {
                        return { value: `${Math.abs(diffDays)} days ago`, label: dayNames[date.getDay()] };
                    }
                }
            }
            
            const specificMatch = cleanText.match(this.patterns.specificDate);
            if (specificMatch) {
                let day, month, year;
                const part1 = specificMatch[1];
                const part2 = specificMatch[2];
                const part3 = specificMatch[3];
                
                const monthName = part2.toLowerCase();
                if (monthNames[monthName] !== undefined) {
                    day = parseInt(part1);
                    month = monthNames[monthName];
                    year = parseInt(part3);
                } else if (monthNames[part1?.toLowerCase()] !== undefined) {
                    month = monthNames[part1.toLowerCase()];
                    day = parseInt(part2);
                    year = parseInt(part3);
                } else {
                    if (parseInt(part1) > 12) {
                        day = parseInt(part1);
                        month = parseInt(part2) - 1;
                    } else if (parseInt(part2) > 12) {
                        month = parseInt(part1) - 1;
                        day = parseInt(part2);
                    } else {
                        day = parseInt(part1);
                        month = parseInt(part2) - 1;
                    }
                    year = parseInt(part3);
                }
                
                if (year < 100) {
                    year += (year < 50) ? 2000 : 1900;
                }
                
                const date = new Date(year, month, day);
                
                if (isNaN(date.getTime())) {
                    return { value: 'Invalid date', label: 'Please check the date format' };
                }
                
                if (mode === 'day' || !mode) {
                    return {
                        value: dayNames[date.getDay()],
                        label: `${date.getDate()} ${monthFullNames[date.getMonth()]} ${date.getFullYear()}`
                    };
                } else if (mode === 'age') {
                    const today = new Date();
                    let age = today.getFullYear() - date.getFullYear();
                    const monthDiff = today.getMonth() - date.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                        age--;
                    }
                    
                    let months = today.getMonth() - date.getMonth();
                    if (today.getDate() < date.getDate()) {
                        months--;
                    }
                    if (months < 0) {
                        months += 12;
                    }
                    
                    let ageStr = `${age} years`;
                    if (months > 0) {
                        ageStr += `, ${months} month${months > 1 ? 's' : ''}`;
                    }
                    
                    return {
                        value: ageStr + ' old',
                        label: `Born on ${dayNames[date.getDay()]}, ${date.getDate()} ${monthFullNames[date.getMonth()]} ${date.getFullYear()}`
                    };
                } else if (mode === 'fromnow') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);
                    
                    const diffTime = date - today;
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) {
                        return { value: 'Today', label: dayNames[date.getDay()] };
                    } else if (diffDays === 1) {
                        return { value: 'Tomorrow', label: dayNames[date.getDay()] };
                    } else if (diffDays === -1) {
                        return { value: 'Yesterday', label: dayNames[date.getDay()] };
                    } else if (diffDays > 0) {
                        return { value: `In ${diffDays} days`, label: dayNames[date.getDay()] };
                    } else {
                        return { value: `${Math.abs(diffDays)} days ago`, label: dayNames[date.getDay()] };
                    }
                }
            }
            
            return { value: 'Sorry, we do not have that function', label: 'Please try the suggestions' };
            
        } catch (error) {
            console.error('Day calculator error:', error);
            return { value: 'Error', label: 'Failed to calculate date' };
        }
    }

    calculate(text) {
        try {
            console.log('🧮 Calculate called with text:', text);
            
            // Normalize operators
            let expression = text.replace(/[–—]/g, '-');
            expression = expression.replace(/[×xX]/g, '*');
            expression = expression.replace(/[÷]/g, '/');
            
            // Convert superscripts to ^ power notation
            // ⁰¹²³⁴⁵⁶⁷⁸⁹
            const superscriptMap = {
                '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
                '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
            };
            
            // Find and replace superscripts with ^power
            expression = expression.replace(/(\d+\.?\d*)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, superscript) => {
                let power = '';
                for (let char of superscript) {
                    power += superscriptMap[char] || char;
                }
                return `${base}^${power}`;
            });
            
            // Handle square root symbol (√) by converting to power notation
            // √25 → (25)^0.5
            // 2√25 → 2*(25^0.5)
            // √(expression) → (expression)^0.5
            expression = expression.replace(/(\d+)?√\(([^)]+)\)/g, (match, coef, expr) => {
                if (coef) {
                    return `${coef}*((${expr})^0.5)`;
                }
                return `((${expr})^0.5)`;
            });
            
            expression = expression.replace(/(\d+)?√(\d+\.?\d*)/g, (match, coef, number) => {
                if (coef) {
                    return `${coef}*(${number}^0.5)`;
                }
                return `(${number}^0.5)`;
            });
            
            // Handle cube root symbol (∛) by converting to power notation
            // ∛27 → (27)^(1/3)
            // 2∛27 → 2*(27^(1/3))
            // ∛(expression) → (expression)^(1/3)
            expression = expression.replace(/(\d+)?∛\(([^)]+)\)/g, (match, coef, expr) => {
                if (coef) {
                    return `${coef}*((${expr})^(1/3))`;
                }
                return `((${expr})^(1/3))`;
            });
            
            expression = expression.replace(/(\d+)?∛(\d+\.?\d*)/g, (match, coef, number) => {
                if (coef) {
                    return `${coef}*(${number}^(1/3))`;
                }
                return `(${number}^(1/3))`;
            });
            
            // Handle percentage calculations
            // Pattern 1: "12% of 500" or "12 % of 500"
            expression = expression.replace(/(\d+\.?\d*)\s*%\s*of\s*(\d+\.?\d*)/gi, (match, percent, number) => {
                return `(${percent}/100)*${number}`;
            });
            
            // Pattern 2: Just "12%" -> convert to decimal
            expression = expression.replace(/(\d+\.?\d*)\s*%/g, (match, percent) => {
                return `(${percent}/100)`;
            });
            
            expression = expression.replace(/\s+/g, '');
            
            console.log('🧮 Normalized expression:', expression);

            // Security: Only allow numbers and basic operators (including ^)
            const validPattern = /^[\d+\-*/()^.]+$/;
            
            if (!validPattern.test(expression)) {
                console.error('❌ Invalid expression format:', expression);
                return { value: 'Invalid expression', label: 'Only numbers and +, -, *, /, ^, %, (, ) allowed' };
            }
            
            console.log('✅ Expression passed validation');
            
            // Parse and evaluate without eval (CSP-safe)
            const result = this.evaluateExpression(expression);
            console.log('✅ Calculation result:', result);
            
            if (!isFinite(result)) {
                return { value: 'Error', label: 'Result is not a valid number' };
            }

            // Round to 10 decimal places to eliminate floating point errors
            const rounded = Math.round(result * 1e10) / 1e10;

            return {
                value: rounded.toString(),
                label: text
            };
        } catch (error) {
            console.error('❌ Calculation error:', error);
            return {
                value: 'Error',
                label: 'Invalid calculation'
            };
        }
    }

    // Safe expression evaluator (no eval, CSP-friendly)
    evaluateExpression(expr) {
        let pos = 0;
        
        const peek = () => expr[pos];
        const consume = () => expr[pos++];
        
        const parseNumber = () => {
            let num = '';
            while (pos < expr.length && (peek() >= '0' && peek() <= '9' || peek() === '.')) {
                num += consume();
            }
            return parseFloat(num);
        };
        
        const parseFactor = () => {
            if (peek() === '(') {
                consume(); // (
                const value = parseExpression();
                consume(); // )
                return value;
            }
            
            if (peek() === '-') {
                consume();
                return -parseFactor();
            }
            
            if (peek() === '+') {
                consume();
                return parseFactor();
            }
            
            return parseNumber();
        };
        
        // Handle power operations (^) - right-to-left associativity
        const parsePower = () => {
            let value = parseFactor();
            
            if (pos < expr.length && peek() === '^') {
                consume(); // consume ^
                const exponent = parsePower(); // right-to-left: recursively parse power
                value = Math.pow(value, exponent);
            }
            
            return value;
        };
        
        const parseTerm = () => {
            let value = parsePower(); // Use parsePower instead of parseFactor
            
            while (pos < expr.length && (peek() === '*' || peek() === '/')) {
                const op = consume();
                const right = parsePower(); // Use parsePower instead of parseFactor
                
                if (op === '*') {
                    value *= right;
                } else {
                    if (right === 0) throw new Error('Division by zero');
                    value /= right;
                }
            }
            
            return value;
        };
        
        const parseExpression = () => {
            let value = parseTerm();
            
            while (pos < expr.length && (peek() === '+' || peek() === '-')) {
                const op = consume();
                const right = parseTerm();
                
                if (op === '+') {
                    value += right;
                } else {
                    value -= right;
                }
            }
            
            return value;
        };
        
        return parseExpression();
    }

    async getMeaning(text, target) {
        console.log('🔥🔥🔥🔥🔥 GET MEANING CALLED 🔥🔥🔥🔥🔥');
        console.log('🔥 Word:', text);
        console.log('🔥 Target:', target);
        
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
                        console.log('🔥🔥🔥 DEFINE ACTION STARTING 🔥🔥🔥');
                        console.log('📥 Raw definitions from API:', data.definitions.length);
                        
                        // STEP 1: Filter out ONLY genuinely rare/archaic definitions
                        const filteredDefs = data.definitions.filter(def => {
                            const defText = (def.definition || '').toLowerCase();
                            
                            console.log('🔍 Checking definition:', defText.substring(0, 80));
                            
                            // ULTRA-SPECIFIC filters - only removes truly rare meanings
                            const rarePatterns = [
                                // Scientific/biological
                                'any of numerous species',
                                'any of various species',
                                'genus of',
                                'family of',
                                
                                // Historical/archaic markers
                                'archaic',
                                'obsolete',
                                
                                // The specific rare "desert" meaning
                                'usually in the plural',
                                'that which is deserved or merited',
                            ];
                            
                            // Check if this definition matches ANY rare pattern
                            const isRare = rarePatterns.some(pattern => {
                                const match = defText.includes(pattern);
                                if (match) {
                                    console.log(`❌ MATCHED RARE PATTERN: "${pattern}"`);
                                }
                                return match;
                            });
                            
                            if (isRare) {
                                console.log(`🚫 FILTERING OUT: ${defText.substring(0, 60)}...`);
                            } else {
                                console.log(`✅ KEEPING: ${defText.substring(0, 60)}...`);
                            }
                            
                            return !isRare; // Keep it if NOT rare
                        });
                        
                        // STEP 2: Smart sorting - prioritize SHORT, COMMON meanings
                        const posOrder = ['verb', 'noun', 'adjective', 'adverb'];
                        
                        console.log(`📊 Total definitions: ${data.definitions.length}`);
                        console.log(`📊 After filtering: ${filteredDefs.length}`);
                        
                        // Use filtered definitions (no fallback to originals)
                        const sortedDefs = [...filteredDefs].sort((a, b) => {
                            const posA = (a.partOfSpeech || '').toLowerCase();
                            const posB = (b.partOfSpeech || '').toLowerCase();
                            const defA = (a.definition || '').toLowerCase();
                            const defB = (b.definition || '').toLowerCase();
                            
                            // PRIORITY 1: Deprioritize uncommon usage patterns
                            const uncommonMarkersA = [
                                'usually in the plural',
                                'that which is',
                            ].filter(marker => defA.includes(marker)).length;
                            
                            const uncommonMarkersB = [
                                'usually in the plural',
                                'that which is',
                            ].filter(marker => defB.includes(marker)).length;
                            
                            if (uncommonMarkersA > uncommonMarkersB) return 1;
                            if (uncommonMarkersB > uncommonMarkersA) return -1;
                            
                            // PRIORITY 2: Prioritize SHORTER definitions (more concise = more common)
                            // Google shows short, clear definitions
                            const lengthA = defA.length;
                            const lengthB = defB.length;
                            
                            // Penalize very long definitions (>150 chars)
                            if (lengthA > 150 && lengthB <= 150) return 1;
                            if (lengthB > 150 && lengthA <= 150) return -1;
                            
                            // Among reasonable length defs, prefer shorter (40-100 chars)
                            if (lengthA <= 150 && lengthB <= 150) {
                                return lengthA - lengthB; // Shorter comes first
                            }
                            
                            // PRIORITY 3: Prioritize by part of speech (verb/noun first)
                            const indexA = posOrder.indexOf(posA);
                            const indexB = posOrder.indexOf(posB);
                            
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                            if (indexA !== -1) return -1;
                            if (indexB !== -1) return 1;
                            
                            return 0;
                        });
                        
                        // STEP 3: Take ONLY top 3 definitions (Google style)
                        let topDefs = sortedDefs.slice(0, 3);
                        
                        // Smart fallback: if we filtered out EVERYTHING, try Wikipedia instead
                        if (topDefs.length === 0) {
                            console.log('⚠️ All definitions filtered - trying Wikipedia fallback...');
                            
                            // Don't show the filtered rare definition - try Wikipedia instead
                            try {
                                const wikiResponse = await chrome.runtime.sendMessage({
                                    action: 'fetch-wikipedia',
                                    query: word
                                });
                                
                                if (wikiResponse && wikiResponse.success) {
                                    console.log('✅ Wikipedia fallback successful!');
                                    const wikiData = wikiResponse.data;
                                    
                                    return {
                                        value: wikiData.title || word,
                                        label: `
                                            <div style="max-height: 300px; overflow-y: auto;">
                                                <div style="background: #e3f2fd; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                                                    <div style="font-family: 'DM Sans', sans-serif; color: #1976d2; font-size: 10px; font-weight: 600; line-height: 1.6; margin-bottom: 4px;">📚 FROM WIKIPEDIA (Dictionary had only rare meanings)</div>
                                                    ${wikiData.description ? `<div style="font-family: 'DM Sans', sans-serif; font-style: italic; color: #555; font-size: 10px; font-weight: 600; line-height: 1.6; margin-bottom: 8px;">${wikiData.description}</div>` : ''}
                                                </div>
                                                <div style="font-family: 'DM Sans', sans-serif; line-height: 1.5; color: #4A4A4A; font-size: 12px; font-weight: 400;">
                                                    ${wikiData.extract || 'No description available'}
                                                </div>
                                                ${wikiData.url ? `<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd;">
                                                    <a href="${wikiData.url}" target="_blank" style="font-family: 'DM Sans', sans-serif; color: #1976d2; font-size: 12px; font-weight: 400; text-decoration: none;">
                                                        Read more on Wikipedia →
                                                    </a>
                                                </div>` : ''}
                                            </div>
                                        `
                                    };
                                }
                            } catch (wikiError) {
                                console.error('❌ Wikipedia fallback failed:', wikiError);
                            }
                            
                            // If Wikipedia also fails, show a helpful message
                            return {
                                value: `"${word}"`,
                                label: `<div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #666;">
                                    <div style="margin-bottom: 8px;">The dictionary only has rare/archaic definitions for this word.</div>
                                    <div style="color: #888; font-size: 11px;">Try searching online for: "${word} definition"</div>
                                </div>`
                            };
                        }
                        
                        if (topDefs.length === 0) {
                            definitionsList = `<div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #999;">No definitions found</div>`;
                        } else {
                            // Group by part of speech for clean display
                            const groupedDefs = {};
                            topDefs.forEach(def => {
                                const pos = (def.partOfSpeech || 'other').toLowerCase();
                                if (!groupedDefs[pos]) groupedDefs[pos] = [];
                                groupedDefs[pos].push(def);
                            });
                            
                            // Generate clean, concise HTML (like Google)
                            definitionsList = Object.entries(groupedDefs).map(([pos, defs]) => {
                                return defs.map((def, index) => {
                                    // Keep definitions concise
                                    let definition = def.definition || 'No definition';
                                    if (definition.length > 100) {
                                        definition = definition.substring(0, 100) + '...';
                                    }
                                    
                                    const showPosLabel = index === 0;
                                    return `
                                        <div style="margin-bottom: 10px;">
                                            ${showPosLabel ? `<div style="font-family: 'DM Sans', sans-serif; font-style: italic; color: #888; font-size: 10px; font-weight: 600; line-height: 1.6; margin-bottom: 4px;">
                                                ${pos}
                                            </div>` : ''}
                                            <div style="font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; line-height: 1.5; color: #4A4A4A;">${definition}</div>
                                        </div>
                                    `;
                                }).join('');
                            }).join('');
                        }
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

    async translateText(text, targetLanguage) {
        try {
            const sourceText = text.trim();
            
            // Map language names to ISO codes
            const languageCodeMap = {
                // English names to codes
                'english': 'en',
                'spanish': 'es',
                'french': 'fr',
                'german': 'de',
                'japanese': 'ja',
                'chinese': 'zh-CN',
                'italian': 'it',
                'portuguese': 'pt',
                'russian': 'ru',
                'arabic': 'ar',
                'hindi': 'hi',
                'korean': 'ko',
                'dutch': 'nl',
                'polish': 'pl',
                'turkish': 'tr',
                'vietnamese': 'vi',
                'thai': 'th',
                'swedish': 'sv',
                'danish': 'da',
                'finnish': 'fi',
                'norwegian': 'no',
                // Already ISO codes (keep as-is)
                'en': 'en',
                'es': 'es',
                'fr': 'fr',
                'de': 'de',
                'ja': 'ja',
                'zh': 'zh-CN',
                'zh-cn': 'zh-CN',
                'it': 'it',
                'pt': 'pt',
                'ru': 'ru',
                'ar': 'ar',
                'hi': 'hi',
                'ko': 'ko',
                'nl': 'nl',
                'pl': 'pl',
                'tr': 'tr',
                'vi': 'vi',
                'th': 'th',
                'sv': 'sv',
                'da': 'da',
                'fi': 'fi',
                'no': 'no'
            };
            
            // Convert to lowercase and get the proper language code
            const targetCode = languageCodeMap[targetLanguage.toLowerCase()] || targetLanguage;
            
            console.log('🌐 Translation request:', {
                sourceText,
                targetLanguage,
                targetCode
            });
            
            // Send message to background script to perform translation
            const response = await chrome.runtime.sendMessage({
                action: 'translate-text',
                text: sourceText,
                targetLanguage: targetCode
            });
            
            console.log('📥 Translation response:', response);
            console.log('📥 Response type:', typeof response);
            console.log('📥 Response.success:', response?.success);
            console.log('📥 Response.translatedText:', response?.translatedText);
            console.log('📥 Response.error:', response?.error);
            
            if (response && response.success) {
                // Language name mapping for display
                const languageNames = {
                    'en': 'English',
                    'es': 'Spanish',
                    'fr': 'French',
                    'de': 'German',
                    'ja': 'Japanese',
                    'zh-CN': 'Chinese',
                    'zh': 'Chinese',
                    'it': 'Italian',
                    'pt': 'Portuguese',
                    'ru': 'Russian',
                    'ar': 'Arabic',
                    'hi': 'Hindi',
                    'ko': 'Korean',
                    'nl': 'Dutch',
                    'pl': 'Polish',
                    'tr': 'Turkish',
                    'vi': 'Vietnamese',
                    'th': 'Thai',
                    'sv': 'Swedish',
                    'da': 'Danish',
                    'fi': 'Finnish',
                    'no': 'Norwegian'
                };
                
                const langName = languageNames[targetCode] || targetCode.toUpperCase();
                
                return {
                    value: response.translatedText,
                    label: `Translated to ${langName}`
                };
            } else {
                console.error('❌ Translation failed:', response);
                return {
                    value: 'Translation failed',
                    label: response?.error || 'Could not translate text'
                };
            }
        } catch (error) {
            console.error('❌ Translation error:', error);
            console.error('Error stack:', error.stack);
            return {
                value: 'Error',
                label: `Failed to translate: ${error.message}`
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