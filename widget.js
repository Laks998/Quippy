// Widget.js - Controls widget opening, closing, and UI interactions

class QuippyWidget {
    constructor() {
        this.widget = null;
        this.isVisible = false;
        this.selectedText = '';
        this.currentFunction = 'weight';
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Inject widget into page
        this.injectWidget();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Listen for toggle command
        window.addEventListener('quippy-toggle', () => this.toggle());
        
        // Listen for text selection on the page
        this.setupTextSelectionListener();
    }

    injectWidget() {
        // Check if widget already exists
        if (document.getElementById('quippy-widget')) {
            this.widget = document.getElementById('quippy-widget');
            return;
        }

        // Create the widget HTML directly
        const widgetHTML = `
            <div id="quippy-widget" class="quippy-hidden">
                <div class="quippy-header" id="quippy-header">
                    <div class="quippy-logo">
                        <span class="quippy-icon">
                            <img src="assets/logo.svg" width="24" height="24" alt="Quippy">
                        </span>
                        <span class="quippy-title">Hi, I'm Quippy!</span>
                    </div>
                    <div class="quippy-controls">
                        <button class="quippy-settings-btn" id="quippy-settings">
                            <img src="assets/settings.svg" width="20" height="20" alt="Settings">
                        </button>
                        <button class="quippy-close-btn" id="quippy-close">
                            <img src="assets/close.svg" width="20" height="20" alt="Close">
                        </button>
                    </div>
                </div>
                
                <div class="quippy-content">
                    <div id="quippy-initial-state" class="quippy-state">
                        <div class="quippy-instruction">
                            <img src="assets/selecttext.svg" width="40" height="40" alt="Select text" class="quippy-select-icon">
                            <p class="quippy-instruction-text">
                                Select any text on the page and<br>
                                Quippy will help you in just a minute :)
                            </p>
                        </div>
                        
                        <div class="quippy-popular">
                            <p class="quippy-popular-title">Quippy's popular functions:</p>
                            <div class="quippy-function-chips">
                                <button class="quippy-chip" data-function="timezone">
                                    <img src="assets/time.svg" width="16" height="16" alt="" class="chip-icon">
                                    <span>Timezone</span>
                                </button>
                                <button class="quippy-chip" data-function="currency">
                                    <img src="assets/currency.svg" width="16" height="16" alt="" class="chip-icon">
                                    <span>Currency</span>
                                </button>
                                <button class="quippy-chip" data-function="meaning">
                                    <img src="assets/meaning.svg" width="16" height="16" alt="" class="chip-icon">
                                    <span>Meaning</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="quippy-active-state" class="quippy-state quippy-hidden">
                        <div class="quippy-selected-text">
                            <span class="selected-label">Selected Text:</span>
                            <span class="selected-value" id="quippy-selected-text"></span>
                            <button class="quippy-reselect-btn" id="quippy-reselect">
                                <img src="assets/refresh.svg" width="16" height="16" alt="">
                                Re-select
                            </button>
                        </div>
                        
                        <div class="quippy-action-area">
                            <label class="quippy-label">What should Quippy do?</label>
                            
                            <div class="quippy-function-selector">
                                <button class="quippy-dropdown-btn" id="quippy-function-dropdown">
                                    <span class="dropdown-icon" id="quippy-current-icon">
                                        <img src="assets/weight.svg" width="24" height="24" alt="">
                                    </span>
                                    <span class="dropdown-text" id="quippy-current-function">Weight</span>
                                    <img src="assets/dropdown.svg" width="16" height="16" alt="" class="dropdown-arrow">
                                </button>
                                
                                <div class="quippy-dropdown-menu quippy-hidden" id="quippy-dropdown-menu">
                                    <button class="quippy-dropdown-item" data-function="length" data-icon="length.svg">
                                        <img src="assets/length.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Length</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="weight" data-icon="weight.svg">
                                        <img src="assets/weight.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Weight</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="timezone" data-icon="time.svg">
                                        <img src="assets/time.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Timezone</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="health" data-icon="health.svg">
                                        <img src="assets/health.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Health</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="digital" data-icon="digital.svg">
                                        <img src="assets/digital.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Digital</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="calculate" data-icon="calculate.svg">
                                        <img src="assets/calculate.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Maths</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="design" data-icon="design.svg">
                                        <img src="assets/design.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Design</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="meaning" data-icon="meaning.svg">
                                        <img src="assets/meaning.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Meaning</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="currency" data-icon="currency.svg">
                                        <img src="assets/currency.svg" width="18" height="18" alt="" class="item-icon">
                                        <span>Currency</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="quippy-input-area">
                                <input type="text" class="quippy-input" id="quippy-input" placeholder="To Kg">
                                <button class="quippy-submit-btn" id="quippy-submit">
                                    <img src="assets/search.svg" width="20" height="20" alt="Search">
                                </button>
                            </div>
                            
                            <div class="quippy-suggestions" id="quippy-suggestions">
                                <p class="suggestions-label">Suggestions:</p>
                                <div class="suggestions-chips" id="quippy-suggestions-list">
                                    <!-- Suggestions will be dynamically populated -->
                                </div>
                            </div>
                            
                            <div class="quippy-results quippy-hidden" id="quippy-results">
                                <div class="results-content" id="quippy-results-content">
                                    <!-- Results will appear here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Inject into the page
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        this.widget = document.getElementById('quippy-widget');
    }

    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('quippy-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Reselect button
        const reselectBtn = document.getElementById('quippy-reselect');
        if (reselectBtn) {
            reselectBtn.addEventListener('click', () => this.enableReselect());
        }

        // Function dropdown
        const dropdownBtn = document.getElementById('quippy-function-dropdown');
        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // Dropdown items
        const dropdownItems = document.querySelectorAll('.quippy-dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                const func = item.dataset.function;
                const icon = item.dataset.icon;
                this.selectFunction(func, icon);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('quippy-dropdown-menu');
            const dropdownBtn = document.getElementById('quippy-function-dropdown');
            if (dropdown && !dropdown.contains(e.target) && e.target !== dropdownBtn) {
                dropdown.classList.add('quippy-hidden');
                dropdownBtn.classList.remove('active');
            }
        });

        // Submit button
        const submitBtn = document.getElementById('quippy-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }

        // Input enter key
        const input = document.getElementById('quippy-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSubmit();
                }
            });
        }

        // Function chips in initial state
        const functionChips = document.querySelectorAll('.quippy-chip[data-function]');
        functionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const func = chip.dataset.function;
                this.activateFunctionFromChip(func);
            });
        });

        // Setup dragging
        this.setupDragging();
    }

    setupDragging() {
        const header = document.getElementById('quippy-header');
        if (!header) return;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.quippy-controls')) return;
            
            this.isDragging = true;
            header.classList.add('dragging');
            this.widget.classList.add('dragging');
            
            const rect = this.widget.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            this.widget.style.left = x + 'px';
            this.widget.style.top = y + 'px';
            this.widget.style.transform = 'none';
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                const header = document.getElementById('quippy-header');
                if (header) header.classList.remove('dragging');
                this.widget.classList.remove('dragging');
            }
        });
    }

    setupTextSelectionListener() {
        document.addEventListener('mouseup', (e) => {
            // Don't trigger if clicking inside the widget
            if (this.widget && this.widget.contains(e.target)) return;
            
            setTimeout(() => {
                const selection = window.getSelection();
                const text = selection.toString().trim();
                
                if (text && text.length > 0) {
                    this.selectedText = text;
                    this.showWithText(text);
                }
            }, 10);
        });
    }

    toggle() {
        if (this.isVisible) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.widget) return;
        this.widget.classList.remove('quippy-hidden');
        setTimeout(() => {
            this.widget.classList.add('quippy-visible');
            this.isVisible = true;
        }, 10);
    }

    close() {
        if (!this.widget) return;
        this.widget.classList.remove('quippy-visible');
        setTimeout(() => {
            this.widget.classList.add('quippy-hidden');
            this.isVisible = false;
            
            // Reset to initial state
            this.showInitialState();
        }, 400);
    }

    showInitialState() {
        const initialState = document.getElementById('quippy-initial-state');
        const activeState = document.getElementById('quippy-active-state');
        
        if (initialState) initialState.classList.remove('quippy-hidden');
        if (activeState) activeState.classList.add('quippy-hidden');
        
        this.selectedText = '';
        this.clearInputAndResults();
    }

    showWithText(text) {
        this.open();
        
        const initialState = document.getElementById('quippy-initial-state');
        const activeState = document.getElementById('quippy-active-state');
        const selectedTextSpan = document.getElementById('quippy-selected-text');
        
        if (initialState) initialState.classList.add('quippy-hidden');
        if (activeState) activeState.classList.remove('quippy-hidden');
        if (selectedTextSpan) selectedTextSpan.textContent = `"${text}"`;
        
        // Detect function and set it
        const functions = window.quippyFunctions;
        if (functions) {
            const detection = functions.detectFunction(text);
            this.selectFunction(detection.type, detection.icon);
            
            // Update suggestions
            this.updateSuggestions(text, detection.type);
        }
    }

    enableReselect() {
        this.close();
        // Remove highlight
        const highlights = document.querySelectorAll('.quippy-text-highlight');
        highlights.forEach(h => h.classList.remove('quippy-text-highlight'));
    }

    toggleDropdown() {
        const dropdown = document.getElementById('quippy-dropdown-menu');
        const dropdownBtn = document.getElementById('quippy-function-dropdown');
        
        if (!dropdown || !dropdownBtn) return;
        
        const isHidden = dropdown.classList.contains('quippy-hidden');
        
        if (isHidden) {
            dropdown.classList.remove('quippy-hidden');
            dropdownBtn.classList.add('active');
        } else {
            dropdown.classList.add('quippy-hidden');
            dropdownBtn.classList.remove('active');
        }
    }

    selectFunction(functionType, iconFile) {
        this.currentFunction = functionType;
        
        const currentIcon = document.getElementById('quippy-current-icon');
        const currentFunction = document.getElementById('quippy-current-function');
        const dropdown = document.getElementById('quippy-dropdown-menu');
        const dropdownBtn = document.getElementById('quippy-function-dropdown');
        
        // Function name mapping
        const functionNames = {
            'weight': 'Weight',
            'length': 'Length',
            'currency': 'Currency',
            'timezone': 'Timezone',
            'calculate': 'Maths',
            'meaning': 'Meaning',
            'health': 'Health',
            'digital': 'Digital',
            'design': 'Design'
        };
        
        if (currentIcon) {
            currentIcon.innerHTML = `<img src="assets/${iconFile}" width="24" height="24" alt="">`;
        }
        if (currentFunction) {
            currentFunction.textContent = functionNames[functionType] || functionType;
        }
        if (dropdown) {
            dropdown.classList.add('quippy-hidden');
        }
        if (dropdownBtn) {
            dropdownBtn.classList.remove('active');
        }
        
        // Update suggestions
        if (this.selectedText) {
            this.updateSuggestions(this.selectedText, functionType);
        }
        
        // Clear previous results
        this.clearInputAndResults();
    }

    updateSuggestions(text, functionType) {
        const functions = window.quippyFunctions;
        if (!functions) return;
        
        const suggestions = functions.getSuggestions(text, functionType);
        const suggestionsList = document.getElementById('quippy-suggestions-list');
        const suggestionsContainer = document.getElementById('quippy-suggestions');
        
        if (!suggestionsList || !suggestionsContainer) return;
        
        if (suggestions.length === 0) {
            suggestionsContainer.classList.add('quippy-hidden');
            return;
        }
        
        suggestionsContainer.classList.remove('quippy-hidden');
        
        // Get icon mapping for suggestions
        const iconMapping = {
            '⚖️': 'weight.svg',
            '📏': 'length.svg',
            '💲': 'currency.svg',
            '💶': 'currency.svg',
            '💷': 'currency.svg',
            '💵': 'currency.svg',
            '🌍': 'time.svg',
            '🕐': 'time.svg',
            '🕑': 'time.svg',
            '🕒': 'time.svg',
            '🧮': 'calculate.svg',
            '📖': 'meaning.svg',
            '🔤': 'meaning.svg',
            '💡': 'solution.svg'
        };
        
        suggestionsList.innerHTML = suggestions.map(suggestion => {
            const iconFile = iconMapping[suggestion.icon] || 'solution.svg';
            return `
                <button class="suggestion-chip" data-value="${suggestion.value}">
                    <img src="assets/${iconFile}" width="14" height="14" alt="">
                    <span>${suggestion.label}</span>
                </button>
            `;
        }).join('');
        
        // Add click handlers
        const chips = suggestionsList.querySelectorAll('.suggestion-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const input = document.getElementById('quippy-input');
                if (input) {
                    input.value = chip.dataset.value;
                    this.handleSubmit();
                }
            });
        });
    }

    async handleSubmit() {
    const input = document.getElementById('quippy-input');
    if (!input) return;
    
    const targetValue = input.value.trim();
    if (!targetValue && this.currentFunction !== 'meaning' && this.currentFunction !== 'calculate') return;
    
    const functions = window.quippyFunctions;
    if (!functions) return;
    
    // Show loading state
    const resultsContainer = document.getElementById('quippy-results');
    const resultsContent = document.getElementById('quippy-results-content');
    if (resultsContainer) resultsContainer.classList.remove('quippy-hidden');
    if (resultsContent) {
        resultsContent.innerHTML = `
            <div class="result-item loading">
                <img src="assets/loader.svg" width="20" height="20" alt="" class="loading-spinner">
                <span>Give me a sec please</span>
            </div>
        `;
    }
    
    try {
        // Process the conversion/action (now async)
        const result = await functions.processFunction(
            this.selectedText,
            this.currentFunction,
            targetValue
        );
        
        this.displayResults(result);
    } catch (error) {
        console.error('Submit error:', error);
        if (resultsContent) {
            resultsContent.innerHTML = `
                <div class="result-item error">
                    <img src="assets/error.svg" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        <div class="result-label">Oops, something went wrong.</div>
                    </div>
                </div>
            `;
        }
    }
}

    displayResults(result) {
    const resultsContainer = document.getElementById('quippy-results');
    const resultsContent = document.getElementById('quippy-results-content');
    
    if (!resultsContainer || !resultsContent) return;
    
    resultsContainer.classList.remove('quippy-hidden');
    
    // Check if it's an error
    if (result.value === 'Invalid input' || result.value === 'Error' || 
        result.value === 'Calculation error' || result.value === 'Conversion failed' ||
        result.label.includes('error') || result.label.includes('Error')) {
        resultsContent.innerHTML = `
            <div class="result-item error">
                <img src="assets/error.svg" width="24" height="24" alt="" class="result-icon">
                <div class="result-content">
                    <div class="result-label">Oops, something went wrong.</div>
                </div>
            </div>
        `;
        return;
    }
    
    // Success state with icon
    if (typeof result === 'string') {
        resultsContent.innerHTML = `
            <div class="result-item success">
                <img src="assets/solution.svg" width="24" height="24" alt="" class="result-icon">
                <div class="result-content">
                    <div class="result-label">${result}</div>
                </div>
            </div>
        `;
    } else if (Array.isArray(result)) {
        resultsContent.innerHTML = result.map(item => `
            <div class="result-item success">
                <img src="assets/solution.svg" width="24" height="24" alt="" class="result-icon">
                <div class="result-content">
                    <div class="result-value">${item.value}</div>
                    <div class="result-label">${item.label}</div>
                </div>
            </div>
        `).join('');
    } else {
        // Check if label contains HTML (for meaning definitions)
        const hasHtmlLabel = result.label.includes('<div');
        
        if (hasHtmlLabel) {
            resultsContent.innerHTML = `
                <div class="result-item success">
                    <img src="assets/meaning.svg" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        <div class="result-value">${result.value}</div>
                        ${result.label}
                    </div>
                </div>
            `;
        } else {
            // Get appropriate icon based on function type
            const iconMap = {
                'weight': 'weight.svg',
                'length': 'length.svg',
                'currency': 'currency.svg',
                'timezone': 'time.svg',
                'calculate': 'calculate.svg',
                'meaning': 'meaning.svg'
            };
            const iconFile = iconMap[this.currentFunction] || 'solution.svg';
            
            resultsContent.innerHTML = `
                <div class="result-item success">
                    <img src="assets/${iconFile}" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        <div class="result-value">${result.value}</div>
                        <div class="result-label">${result.label}</div>
                    </div>
                </div>
            `;
        }
    }
}

    clearInputAndResults() {
        // Clear the input field
        const input = document.getElementById('quippy-input');
        if (input) {
            input.value = '';
        }
        
        // Hide and clear results
        const resultsContainer = document.getElementById('quippy-results');
        const resultsContent = document.getElementById('quippy-results-content');
        
        if (resultsContainer) {
            resultsContainer.classList.add('quippy-hidden');
        }
        if (resultsContent) {
            resultsContent.innerHTML = '';
        }
    }

    activateFunctionFromChip(functionType) {
        const icons = {
            timezone: 'time.svg',
            currency: 'currency.svg',
            meaning: 'meaning.svg'
        };
        this.selectFunction(functionType, icons[functionType]);
    }
}

// Initialize widget
console.log('Quippy: Initializing widget');
let quippyWidget;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        quippyWidget = new QuippyWidget();
    });
} else {
    quippyWidget = new QuippyWidget();
}