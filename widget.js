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

        // Get proper URLs for all assets using chrome.runtime.getURL
        const logoUrl = chrome.runtime.getURL('assets/logo.svg');
        const settingsUrl = chrome.runtime.getURL('assets/settings.svg');
        const closeUrl = chrome.runtime.getURL('assets/close.svg');
        const selectTextUrl = chrome.runtime.getURL('assets/selecttext.svg');
        const refreshUrl = chrome.runtime.getURL('assets/refresh.svg');
        const dropdownUrl = chrome.runtime.getURL('assets/dropdown.svg');
        const searchUrl = chrome.runtime.getURL('assets/search.svg');

        // Create the widget HTML directly
        const widgetHTML = `
            <div id="quippy-widget" class="quippy-hidden">
                <div class="quippy-header" id="quippy-header">
                    <div class="quippy-logo">
                        <span class="quippy-icon">
                            <img src="${logoUrl}" width="24" height="24" alt="Quippy">
                        </span>
                        <span class="quippy-title">Hi, I'm Quippy!</span>
                    </div>
                    <div class="quippy-controls">
                        <button class="quippy-settings-btn" id="quippy-settings">
                            <img src="${settingsUrl}" width="20" height="20" alt="Settings">
                        </button>
                        <button class="quippy-close-btn" id="quippy-close">
                            <img src="${closeUrl}" width="20" height="20" alt="Close">
                        </button>
                    </div>
                </div>
                
                <div class="quippy-content">
                    <div id="quippy-initial-state" class="quippy-state">
                        <div class="quippy-instruction">
                            <img src="${selectTextUrl}" width="40" height="40" alt="Select text" class="quippy-select-icon">
                            <p class="quippy-instruction-text">
                                Select any text on the page and<br>
                                Quippy will help you in just a minute :)
                            </p>
                        </div>
                        
                        <div class="quippy-popular">
                            <p class="quippy-popular-title">Quippy's functions:</p>
                            <div class="quippy-function-chips">
                                <button class="quippy-chip icon-only" data-function="length" title="Length">
                                    <img src="${chrome.runtime.getURL('assets/length.svg')}" width="20" height="20" alt="Length" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="weight" title="Weight">
                                    <img src="${chrome.runtime.getURL('assets/weight.svg')}" width="20" height="20" alt="Weight" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="daycalculator" title="Day Calculator">
                                    <img src="${chrome.runtime.getURL('assets/daycalculator.svg')}" width="20" height="20" alt="Day Calculator" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="area" title="Area">
                                    <img src="${chrome.runtime.getURL('assets/area.svg')}" width="20" height="20" alt="Area" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="volume" title="Volume">
                                    <img src="${chrome.runtime.getURL('assets/volume.svg')}" width="20" height="20" alt="Volume" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="timezone" title="Timezone">
                                    <img src="${chrome.runtime.getURL('assets/time.svg')}" width="20" height="20" alt="Timezone" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="duration" title="Duration">
                                    <img src="${chrome.runtime.getURL('assets/duration.svg')}" width="20" height="20" alt="Duration" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="temperature" title="Temperature">
                                    <img src="${chrome.runtime.getURL('assets/temperature.svg')}" width="20" height="20" alt="Temperature" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="translator" title="Translator">
                                    <img src="${chrome.runtime.getURL('assets/translator.svg')}" width="20" height="20" alt="Translator" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="digital" title="Digital">
                                    <img src="${chrome.runtime.getURL('assets/digital.svg')}" width="20" height="20" alt="Digital" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="calculate" title="Maths">
                                    <img src="${chrome.runtime.getURL('assets/calculate.svg')}" width="20" height="20" alt="Maths" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="design" title="Design">
                                    <img src="${chrome.runtime.getURL('assets/design.svg')}" width="20" height="20" alt="Design" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="meaning" title="Meaning">
                                    <img src="${chrome.runtime.getURL('assets/meaning.svg')}" width="20" height="20" alt="Meaning" class="chip-icon">
                                </button>
                                <button class="quippy-chip icon-only" data-function="currency" title="Currency">
                                    <img src="${chrome.runtime.getURL('assets/currency.svg')}" width="20" height="20" alt="Currency" class="chip-icon">
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="quippy-active-state" class="quippy-state quippy-hidden">
                        <div class="quippy-selected-text">
                            <span class="selected-label">Selected Text:</span>
                            <span class="selected-value" id="quippy-selected-text"></span>
                            <button class="quippy-reselect-btn" id="quippy-reselect">
                                <img src="${refreshUrl}" width="16" height="16" alt="">
                                Re-select
                            </button>
                        </div>
                        
                        <div class="quippy-action-area">
                            <label class="quippy-label">What should Quippy do?</label>
                            
                            <div class="quippy-function-selector">
                                <button class="quippy-dropdown-btn" id="quippy-function-dropdown">
                                    <span class="dropdown-icon" id="quippy-current-icon">
                                        <img src="${chrome.runtime.getURL('assets/weight.svg')}" width="24" height="24" alt="">
                                    </span>
                                    <span class="dropdown-text" id="quippy-current-function">Weight</span>
                                    <img src="${dropdownUrl}" width="16" height="16" alt="" class="dropdown-arrow">
                                </button>
                                
                                <div class="quippy-dropdown-menu quippy-hidden" id="quippy-dropdown-menu">
                                    <button class="quippy-dropdown-item" data-function="length" data-icon="length.svg">
                                        <img src="${chrome.runtime.getURL('assets/length.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Length</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="weight" data-icon="weight.svg">
                                        <img src="${chrome.runtime.getURL('assets/weight.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Weight</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="daycalculator" data-icon="daycalculator.svg">
                                        <img src="${chrome.runtime.getURL('assets/daycalculator.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Day Calculator</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="area" data-icon="area.svg">
                                        <img src="${chrome.runtime.getURL('assets/area.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Area</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="volume" data-icon="volume.svg">
                                        <img src="${chrome.runtime.getURL('assets/volume.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Volume</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="timezone" data-icon="time.svg">
                                        <img src="${chrome.runtime.getURL('assets/time.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Timezone</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="duration" data-icon="duration.svg">
                                        <img src="${chrome.runtime.getURL('assets/duration.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Duration</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="temperature" data-icon="temperature.svg">
                                        <img src="${chrome.runtime.getURL('assets/temperature.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Temperature</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="translator" data-icon="translator.svg">
                                        <img src="${chrome.runtime.getURL('assets/translator.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Translator</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="digital" data-icon="digital.svg">
                                        <img src="${chrome.runtime.getURL('assets/digital.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Digital</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="calculate" data-icon="calculate.svg">
                                        <img src="${chrome.runtime.getURL('assets/calculate.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Maths</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="design" data-icon="design.svg">
                                        <img src="${chrome.runtime.getURL('assets/design.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Design</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="meaning" data-icon="meaning.svg">
                                        <img src="${chrome.runtime.getURL('assets/meaning.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Meaning</span>
                                    </button>
                                    <button class="quippy-dropdown-item" data-function="currency" data-icon="currency.svg">
                                        <img src="${chrome.runtime.getURL('assets/currency.svg')}" width="18" height="18" alt="" class="item-icon">
                                        <span>Currency</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="quippy-input-area">
                                <input type="text" class="quippy-input" id="quippy-input" placeholder="Kg">
                                <button class="quippy-submit-btn" id="quippy-submit">
                                    <img src="${searchUrl}" width="20" height="20" alt="Search">
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
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up
                const func = item.dataset.function;
                const icon = item.dataset.icon;
                this.selectFunction(func, icon);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('quippy-dropdown-menu');
            const dropdownBtn = document.getElementById('quippy-function-dropdown');
            
            // Check if click is outside both dropdown and button
            if (dropdown && dropdownBtn && 
                !dropdown.contains(e.target) && 
                !dropdownBtn.contains(e.target)) {
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
        if (!this.widget) return;
        
        const header = document.getElementById('quippy-header');
        if (!header) return;

        // Function to start dragging
        const startDrag = (e) => {
            // Don't drag if clicking on interactive elements
            const target = e.target;
            
            // Check if clicking on buttons, inputs, or other interactive elements
            if (target.tagName === 'BUTTON' || 
                target.tagName === 'INPUT' ||
                target.closest('button') || 
                target.closest('input') || 
                target.closest('.quippy-dropdown-menu') ||
                target.closest('.quippy-dropdown-item') ||
                target.closest('.suggestion-chip') ||
                target.closest('.quippy-chip') ||
                target.closest('.quippy-controls')) {
                return;
            }
            
            // Only preventDefault if we're actually starting to drag
            e.preventDefault();
            
            this.isDragging = true;
            header.classList.add('dragging');
            this.widget.classList.add('dragging');
            
            const rect = this.widget.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        // Add mousedown to entire widget
        this.widget.addEventListener('mousedown', startDrag);

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            
            const widgetRect = this.widget.getBoundingClientRect();
            const widgetWidth = widgetRect.width;
            const widgetHeight = widgetRect.height;
            
            // Calculate new position
            let newX = e.clientX - this.dragOffset.x;
            let newY = e.clientY - this.dragOffset.y;
            
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Add boundaries - keep widget within viewport
            const minTop = 0;
            const maxTop = viewportHeight - 80; // Keep at least 80px visible at bottom
            const minLeft = -(widgetWidth - 120); // Keep at least 120px visible on left
            const maxLeft = viewportWidth - 120; // Keep at least 120px visible on right
            
            // Apply constraints
            newX = Math.max(minLeft, Math.min(newX, maxLeft));
            newY = Math.max(minTop, Math.min(newY, maxTop));
            
            this.widget.style.left = newX + 'px';
            this.widget.style.top = newY + 'px';
            this.widget.style.transform = 'none';
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                header.classList.remove('dragging');
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
                
                // Only update if widget is already visible
                if (text && text.length > 0 && this.isVisible) {
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
            // Check if there's any text selected when opening
            const selection = window.getSelection();
            const text = selection.toString().trim();
            
            if (text && text.length > 0) {
                // Open with the selected text
                this.selectedText = text;
                this.showWithText(text);
            } else {
                // Open in initial state
                this.open();
            }
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
        const input = document.getElementById('quippy-input');
        
        // Function name mapping
        const functionNames = {
            'weight': 'Weight',
            'length': 'Length',
            'area': 'Area',
            'volume': 'Volume',
            'duration': 'Duration',
            'temperature': 'Temperature',
            'currency': 'Currency',
            'timezone': 'Timezone',
            'calculate': 'Maths',
            'meaning': 'Meaning',
            'translator': 'Translator',
            'digital': 'Digital',
            'design': 'Design',
            'daycalculator': 'Day Calculator'
        };
        
        // Placeholder mapping based on function type
        const placeholders = {
            'weight': 'Kg',
            'length': 'm',
            'area': 'm²',
            'volume': 'liters',
            'duration': 'hours',
            'temperature': '°C',
            'currency': 'USD',
            'timezone': 'PST',
            'calculate': 'Calculate',
            'meaning': 'define',
            'translator': 'es',
            'digital': 'Mbps',
            'design': 'px',
            'daycalculator': 'day'
        };
        
        if (currentIcon) {
            currentIcon.innerHTML = `<img src="${chrome.runtime.getURL('assets/' + iconFile)}" width="24" height="24" alt="">`;
        }
        if (currentFunction) {
            currentFunction.textContent = functionNames[functionType] || functionType;
        }
        if (input) {
            input.placeholder = placeholders[functionType] || 'Enter value';
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

    async updateSuggestions(text, functionType) {
        const functions = window.quippyFunctions;
        if (!functions) return;
        
        let suggestions;
        
        // For meaning type, use async version to check if examples exist
        if (functionType === 'meaning') {
            suggestions = await functions.getMeaningSuggestionsWithCheck(text);
        } else {
            suggestions = functions.getSuggestions(text, functionType);
        }
        
        const suggestionsList = document.getElementById('quippy-suggestions-list');
        const suggestionsContainer = document.getElementById('quippy-suggestions');
        
        if (!suggestionsList || !suggestionsContainer) return;
        
        if (suggestions.length === 0) {
            suggestionsContainer.classList.add('quippy-hidden');
            return;
        }
        
        suggestionsContainer.classList.remove('quippy-hidden');
        
        // Function type to icon mapping - use this for all suggestions
        const functionIconMap = {
            'weight': 'weight.svg',
            'length': 'length.svg',
            'area': 'area.svg',
            'volume': 'volume.svg',
            'duration': 'duration.svg',
            'temperature': 'temperature.svg',
            'daycalculator': 'daycalculator.svg',
            'currency': 'currency.svg',
            'timezone': 'time.svg',
            'calculate': 'calculate.svg',
            'meaning': 'meaning.svg',
            'translator': 'translator.svg',
            'digital': 'digital.svg',
            'design': 'design.svg'
        };
        
        suggestionsList.innerHTML = suggestions.map(suggestion => {
            // Always use the icon for the current function type
            const iconFile = functionIconMap[functionType] || 'solution.svg';
            const iconUrl = chrome.runtime.getURL('assets/' + iconFile);
            return `
                <button class="suggestion-chip" data-value="${suggestion.value}">
                    <img src="${iconUrl}" width="14" height="14" alt="">
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
            const loaderUrl = chrome.runtime.getURL('assets/loader.svg');
            resultsContent.innerHTML = `
                <div class="result-item loading">
                    <img src="${loaderUrl}" width="20" height="20" alt="" class="loading-spinner">
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
                const errorUrl = chrome.runtime.getURL('assets/error.svg');
                resultsContent.innerHTML = `
                    <div class="result-item error">
                        <img src="${errorUrl}" width="24" height="24" alt="" class="result-icon">
                        <div class="result-content">
                            <div class="result-value">Oops, something went wrong</div>
                        </div>
                    </div>
                `;
            }
        }
    }

    sanitizeErrorMessage(message) {
        if (!message) return message;
        
        // Remove ALL technical jargon
        message = message.replace(/API error:?\s*\d*/gi, "Sorry, we couldn't get you");
        message = message.replace(/\b(403|404|500|502|503|401|400|429)\b/g, "");
        message = message.replace(/HTTP status:?\s*\d*/gi, "");
        message = message.replace(/status code:?\s*\d*/gi, "");
        message = message.replace(/network error/gi, "check your connection");
        message = message.replace(/failed to fetch/gi, "check your connection");
        message = message.replace(/timeout/gi, "took too long");
        message = message.replace(/server error/gi, "something went wrong");
        
        // Clean up any double spaces
        message = message.replace(/[^\S\n]+/g, ' ').trim();
        
        // If message is empty after cleaning, provide default
        if (!message || message.length === 0) {
            return "Sorry, we couldn't get you";
        }
        
        return message;
    }

    displayResults(result) {
        const resultsContainer = document.getElementById('quippy-results');
        const resultsContent = document.getElementById('quippy-results-content');
        
        if (!resultsContainer || !resultsContent) return;
        
        resultsContainer.classList.remove('quippy-hidden');
        
        // SANITIZE ALL MESSAGES BEFORE PROCESSING
        if (result && typeof result === 'object' && !Array.isArray(result)) {
            if (result.value) {
                result.value = this.sanitizeErrorMessage(result.value);
            }
            if (result.label && typeof result.label === 'string') {
                result.label = this.sanitizeErrorMessage(result.label);
            }
        }
        
        const errorUrl = chrome.runtime.getURL('assets/error.svg');
        const noInternetUrl = chrome.runtime.getURL('assets/nointernet.svg');
        const warningUrl = chrome.runtime.getURL('assets/warning.svg');
        const solutionUrl = chrome.runtime.getURL('assets/quippysolution.svg');
        
        // Categorize the error type
        const errorType = this.categorizeError(result);
        
        // ERRORS (RED) - Network/API failures, critical errors
        if (errorType === 'error') {
            // Check if it's an internet-related error
            const isInternetError = this.isInternetError(result);
            const iconUrl = isInternetError ? noInternetUrl : errorUrl;
            
            const errorTitle = this.getErrorTitle(result);
            const errorMessage = this.getErrorMessage(result);
            
            // If there's both title and message, show both
            // If there's only message, show just the message
            let contentHTML = '';
            if (errorTitle && errorMessage && errorTitle !== errorMessage) {
                contentHTML = `
                    <div class="result-value">${errorTitle}</div>
                    <div class="result-label">${errorMessage}</div>
                `;
            } else if (errorMessage) {
                contentHTML = `<div class="result-label">${errorMessage}</div>`;
            } else if (errorTitle) {
                contentHTML = `<div class="result-label">${errorTitle}</div>`;
            }
            
            resultsContent.innerHTML = `
                <div class="result-item error">
                    <img src="${iconUrl}" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        ${contentHTML}
                    </div>
                </div>
            `;
            return;
        }
        
        // INFO (BLUE) - Informational messages (not errors)
        if (errorType === 'info') {
            const infoTitle = this.getInfoTitle(result);
            const infoMessage = this.getInfoMessage(result);
            
            // If there's both title and message, show both
            // If there's only message, show just the message
            let contentHTML = '';
            if (infoTitle && infoMessage && infoTitle !== infoMessage) {
                contentHTML = `
                    <div class="result-value">${infoTitle}</div>
                    <div class="result-label">${infoMessage}</div>
                `;
            } else if (infoMessage) {
                contentHTML = `<div class="result-label">${infoMessage}</div>`;
            } else if (infoTitle) {
                contentHTML = `<div class="result-label">${infoTitle}</div>`;
            }
            
            resultsContent.innerHTML = `
                <div class="result-item info">
                    <img src="${warningUrl}" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        ${contentHTML}
                    </div>
                </div>
            `;
            return;
        }
        
        // SUCCESS (GREEN) - Normal results
        if (typeof result === 'string') {
            resultsContent.innerHTML = `
                <div class="result-item success">
                    <img src="${solutionUrl}" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        <div class="result-label">${result}</div>
                    </div>
                </div>
            `;
        } else if (Array.isArray(result)) {
            resultsContent.innerHTML = result.map(item => `
                <div class="result-item success">
                    <img src="${solutionUrl}" width="24" height="24" alt="" class="result-icon">
                    <div class="result-content">
                        <div class="result-value">${item.value}</div>
                        <div class="result-label">${item.label}</div>
                    </div>
                </div>
            `).join('');
        } else {
            // Check if label contains HTML (for meaning definitions)
            const hasHtmlLabel = result.label && result.label.includes('<div');
            
            if (hasHtmlLabel) {
                resultsContent.innerHTML = `
                    <div class="result-item success">
                        <img src="${solutionUrl}" width="24" height="24" alt="" class="result-icon">
                        <div class="result-content">
                            <div class="result-value">${result.value}</div>
                            ${result.label}
                        </div>
                    </div>
                `;
            } else {
                // Format the label to make "Best meeting time:" bold
                let formattedLabel = result.label || '';
                formattedLabel = formattedLabel.replace(/Best meeting time:/g, '<strong>Best meeting time:</strong>');
                
                resultsContent.innerHTML = `
                    <div class="result-item success">
                        <img src="${solutionUrl}" width="24" height="24" alt="" class="result-icon">
                        <div class="result-content">
                            <div class="result-value">${result.value}</div>
                            <div class="result-label" style="white-space: pre-line;">${formattedLabel}</div>
                        </div>
                    </div>
                `;
            }
        }
    }

    isInternetError(result) {
        const value = result.value ? result.value.toLowerCase() : '';
        const label = result.label ? result.label.toLowerCase() : '';
        const combined = value + ' ' + label;
        
        const internetKeywords = [
            'no internet',
            'check your connection',
            'network',
            'connection',
            'timeout'
        ];
        
        for (const keyword of internetKeywords) {
            if (combined.includes(keyword)) {
                return true;
            }
        }
        
        return false;
    }

    categorizeError(result) {
        // Normalize the error message for checking
        const value = result.value ? result.value.toLowerCase() : '';
        const label = result.label ? result.label.toLowerCase() : '';
        const combined = value + ' ' + label;
        
        // CRITICAL: Check INFO keywords FIRST (before error keywords)
        // These are not errors - just informational messages
        const infoKeywords = [
            'already in that language',        // Translation to same language
            'text is already in',              // Same detection
            'no examples found',               // Dictionary lookup partial success
            'no synonyms found',               // Dictionary lookup partial success
            'no example sentences',            // Dictionary lookup partial success
        ];
        
        for (const keyword of infoKeywords) {
            if (combined.includes(keyword)) {
                return 'info';  // ℹ️ BLUE - informational only
            }
        }
        
        // NOW check for actual ERRORS (these show in RED)
        const errorKeywords = [
            'sorry, we couldn\'t',             // Generic API failure
            'couldn\'t find',                  // Word not found
            'couldn\'t translate',             // Translation failed
            'couldn\'t get',                   // Generic failure
            'couldn\'t convert',               // Conversion failed
            'check your internet',             // Connection issues
            'check your connection',           // Connection issues
            'network error',                   // Connection issues
            'no internet',                     // Connection issues
            'not found in dictionary',         // Word lookup failed
            'word not found',                  // Word lookup failed
            'no definitions found',            // No results from API
            'invalid',                         // Bad input
            'unsupported',                     // Feature not available
            'took too long',                   // Timeout
            'timeout',                         // Timeout
            'oops, something went wrong',      // Generic error
        ];
        
        for (const keyword of errorKeywords) {
            if (combined.includes(keyword)) {
                return 'error';  // 😞 RED - actual error
            }
        }
        
        // If no keywords matched, default to success
        return 'success';
    }

    getErrorTitle(result) {
        // Return empty string - we'll just show the full message in getErrorMessage
        return '';
    }

    getErrorMessage(result) {
        if (result.label) {
            // Remove any HTML tags
            let message = result.label.replace(/<[^>]*>/g, '');
            // Sanitize technical terms
            message = this.sanitizeErrorMessage(message);
            return message;
        }
        
        // Fallback messages based on result.value
        const value = result.value ? result.value.toLowerCase() : '';
        
        if (value.includes('no internet') || value.includes('check your connection') || value.includes('network')) {
            return 'Check your internet connection';
        }
        
        if (value.includes('translation')) {
            return "Sorry, we couldn't translate that";
        }
        
        if (value.includes('currency') || value.includes('convert')) {
            return "Sorry, we couldn't convert that";
        }
        
        // Sanitize the value itself
        return this.sanitizeErrorMessage(result.value) || "Sorry, we couldn't get you";
    }

    getInfoTitle(result) {
        // Return empty string - we'll just show the full message in getInfoMessage
        return '';
    }

    getInfoMessage(result) {
        if (result.label) {
            // Remove any HTML tags
            let message = result.label.replace(/<[^>]*>/g, '');
            // Sanitize technical terms
            message = this.sanitizeErrorMessage(message);
            
            // If it still looks like an error after sanitization, make it friendlier
            if (!message || message.includes("Sorry, we couldn't get you")) {
                return "We couldn't find that";
            }
            
            return message;
        }
        
        const value = result.value ? result.value.toLowerCase() : '';
        
        if (value.includes("don't know")) {
            return "We don't know that word";
        }
        
        if (value.includes('hmm') || value.includes("couldn't understand")) {
            return "Hmm... we couldn't understand that";
        }
        
        if (value.includes('already in that language')) {
            return 'Text is already in that language';
        }
        
        if (value.includes('not found') || value.includes('no definition')) {
            return "We couldn't find that";
        }
        
        // Sanitize the value itself
        return this.sanitizeErrorMessage(result.value) || "We couldn't find that";
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
    // Primary shortcut: Ctrl+K (Windows) or Cmd+K (Mac)
    const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
    
    // Backward compatibility: Ctrl+Q (Windows only, avoid Cmd+Q on Mac)
    const isCtrlQ = e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'q';
    
    if (isCtrlK || isCtrlQ) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('quippy-toggle'));
        console.log('Quippy: Keyboard shortcut triggered!');
    }
});

