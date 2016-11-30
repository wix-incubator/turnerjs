define.component('wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.skinParts({
        content: {type: 'htmlElement'},
        searchDomainContainer: {type: 'htmlElement'},
        frmSearchDomain: {type: 'htmlElement'},
        txtDomain: {type: 'htmlElement'},
        suffixSelectionWrapper: {type: 'htmlElement'},
        selectedSuffixWrapper: {type: 'htmlElement'},
        selectedSuffix: {type: 'htmlElement'},
        suffixDropdown: {type: 'htmlElement'},
        searchDomainButton: {type: 'htmlElement'},
        loaderOverlay: {type: 'htmlElement'},
        loader: {type: 'htmlElement'},
        buyDomainContainer: {type: 'htmlElement'},
        availableDomainName: {type: 'htmlElement'},
        availableDomainPrice: {type: 'htmlElement'},
        btnBuyAvailableDomain: {type: 'htmlElement'},
        searchAgain: {type: 'htmlElement'},
        error: {type: 'htmlElement'},
        alternativeDomainsContainer: {type: 'htmlElement'},
        alternativeDomains: {type: 'htmlElement'},
        frmBuyDomain: {type: 'htmlElement'},
        txtBuyDomainValue: {type: 'htmlElement'}
    });

    def.states({
        'topBar':           ['topBar-search', 'topBar-buy'],
        'suffixMenu':       ['suffixMenu-closed', 'suffixMenu-open'],
        'loader':           ['loader-off', 'loader-on'],
        'error':            ['error-off', 'error-on'],
        'altDomains':       ['altDomains-hide', 'altDomains-show'],
        'inputPlaceholder': ['inputPlaceholder-off', 'inputPlaceholder-on']
    });

    def.statics({
        _errorMessages: {
            UNKNOWN_ERROR: "An unknown error occurred.",
            INVALID_CHARS: "Domain contains invalid characters. Please try again.",
            TOO_SHORT: "Domain name is too short.",
            TOO_LONG: "Domain name is too long.",
            DOMAIN_UNAVAILABLE: "The domain {{domainName}} is not available."
        },
        _domainPrices: {
            "com":      14.95,
            "co.uk":    13.95,
            "biz":      15.95,
            "info":     14.95,
            "org":      14.95,
            "net":      14.95
        },
        _maxDomainLength: 63,
        _serviceUrl: "https://premium.wix.com/wix/api/checkDomainNameAvailableAPI",
        _defaultRefCode: 99,
        _buyDomainUrl: "https://premium.wix.com/wix/api/domainDirectPurchaseForm?referralAdditionalInfo=Da_{{refCode}}",
        // Storing the tmpl here instead of in the skin because google translate changes the template and it can't be rendered!
        _tmplDomainSuggestion: '<li>' +
            '<div class="altDomainInfo">' +
            '<div class="altDomainName">{{domainName}}</div>' +
            '<div class="altDomainPrice">{{domainPrice}}</div>' +
            '</div>' +
            '<div class="btnBuyAltDomain" data-domain="{{domainName}}" data-refCode="{{refCode}}">Buy Now</div>' +
            '</li>'
    });

    def.binds([
        '_openSuffixDropdown',
        '_closeSuffixDropdown',
        '_onDomainInputKeyDown',
        '_onSearchDomainClicked',
        '_onDomainDataReceived',
        '_onSelectSuffix',
        '_displaySearchPanel',
        '_onBuyAvailableDomainClicked',
        '_onBuySuggestedDomainClicked'
    ]);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.EDITOR_META_DATA = {
                general: {
                    settings: false,
                    design: false
                }
            };
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.STYLE_PARAM_CHANGE,
                this.INVALIDATIONS.DISPLAY,
                this.INVALIDATIONS.FIRST_RENDER
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        _onRender: function () {
            this._addSearchDomainFormToDOM();

            if (!Modernizr.input.placeholder) {
                this._setupInputPlaceholderText(this._skinParts.txtDomain);
            }

            this._bindEvents();
            this._displaySearchPanel();
        },

        _bindEvents: function () {
            var skinParts = this._skinParts;

            skinParts.frmSearchDomain.addEvent('submit', this._onSearchDomainClicked);
            skinParts.searchAgain.addEvent('click', this._displaySearchPanel);
            skinParts.btnBuyAvailableDomain.addEvent('click', this._onBuyAvailableDomainClicked);
            skinParts.alternativeDomains.addEvent('click', this._onBuySuggestedDomainClicked);
            skinParts.txtDomain.addEvent('keydown', this._onDomainInputKeyDown);
            skinParts.suffixDropdown.addEvent('click', this._onSelectSuffix);

            // Using mootools' custom mouseenter event so the the hover state will be fired for child elements as well
            $(skinParts.suffixSelectionWrapper).addEvents({
                'mouseenter': this._openSuffixDropdown,
                'mouseleave': this._closeSuffixDropdown
            });
        },

        /**
         * Prepend the search domain form to its designated parent
         * (IE8 workaraound, see comments in the skin file for details)
         * @private
         */
        _addSearchDomainFormToDOM: function() {
            this._skinParts.searchDomainContainer.grab(this._skinParts.frmSearchDomain ,'top');
            this._skinParts.frmSearchDomain.setStyle('display', 'block');
        },

        /**
         * Validate that the domain input value is a valid domain value
         * @returns {boolean}
         */
        _validateDomainValue: function() {
            var domain = this._getDomainInputValue().trim();

            // Domain is empty

            if (!domain) {
                this._hideError();
                return false;
            }

            // Check if the value equals the placeholder text - treat as empty

            var placeholder = (this._skinParts && this._skinParts.txtDomain) ? this._skinParts.txtDomain.get('placeholder') : '';
            if (domain == placeholder) {
                this._hideError();
                return false;
            }

            // Domain contains invalid characters

            var beginsOrEndsWithDotOrDash       = /^[\.-]|[\.-]$/i.test(domain),
                containsSequentialDashesOrDots  = /[\-\.]{2,}/i.test(domain), // matches --  ..  -.  .-
                containsInvalidCharacters       = !/^([a-z0-9\-\.]+)$/i.test(domain);

            if (beginsOrEndsWithDotOrDash || containsSequentialDashesOrDots || containsInvalidCharacters) {
                this._showError(this._errorMessages.INVALID_CHARS);
                return false;
            }


            // Validate length

            domain = domain.split('.')[0].trim(); // strip domain of suffixes (in case the user entered them in the input)

            if (domain.length < 3) {
                this._showError(this._errorMessages.TOO_SHORT);
                return false;
            }

            if (domain.length > 63) {
                this._showError(this._errorMessages.TOO_LONG);
                return false;
            }

            return true;
        },

        /**
         * Buy the domain that the user searched for
         * @private
         */
        _onBuyAvailableDomainClicked: function() {
            var domain = this._skinParts.availableDomainName.get('data-value'),
                refCode = this._defaultRefCode;

            this._submitBuyNowForm(domain, refCode);
        },

        /**
         * Buy a domain from the suggestions list
         * @param {Event} event - click event
         * @private
         */
        _onBuySuggestedDomainClicked: function(event) {
            // Check if the click target is the Buy Now button
            if (event && event.target && event.target.get('data-domain')) {
                var domain  = event.target.get('data-domain'),
                    refCode = event.target.get('data-refCode');

                this._submitBuyNowForm(domain, refCode);
            }
        },

        /**
         * Submit the buy domain form
         * @param {String} domain
         * @param {String|Number} refCode
         * @private
         */
        _submitBuyNowForm: function(domain, refCode) {
            refCode = refCode || this._defaultRefCode;
            domain = domain || this._getFullDomainValue();

            this._skinParts.txtBuyDomainValue.value = domain;
            this._skinParts.frmBuyDomain.setAttribute('action', this._buyDomainUrl.replace('{{refCode}}', ''+refCode));
            $(this._skinParts.frmBuyDomain).submit();
        },

        /**
         * Validate domain input and get domain availability data
         */
        _onSearchDomainClicked: function() {
            if (!this._validateDomainValue()) {
                this._hideDomainSuggestionsList();
                return false;
            }

            this._blurDomainInput();
            this._showLoader();
            this._getDomainData()
                .done(this._onDomainDataReceived);

            return false;
        },

        /**
         * Get domain availability data
         * @returns {promise.promise|*|promise|k.promise|Q.promise}
         */
        _getDomainData: function() {
            var dfd = Q.defer(),
                req = new Request.JSONP({
                    method: 'get',
                    url: this._serviceUrl,
                    data: {
                        domainName: this._getFullDomainValue()
                    },
                    onSuccess: function (data) {
                        dfd.resolve(JSON.parse(data));
                    }
                }).send();

            return dfd.promise;
        },

        /**
         * Handle domain availability data and display results to user
         * @param {Object} data
         */
        _onDomainDataReceived: function(data) {
            this._hideLoader();
            this._hideDomainSuggestionsList();

            if (!data || !data.domainName) {
                this._showError(this._errorMessages.UNKNOWN_ERROR);
                return;
            }

            // Domain is available
            if (data.available) {
                this._displayBuyNowPanel(data.domainName);
                this._hideError();
            } else {
                // Domain is unavailable
                this._displayUnavailableDomainMessage(data.domainName);

                // Display suggested available domains, if available
                data.suggestions = data.suggestions || [];
                // check for otherSuggestions
                if (data.otherSuggestions && data.otherSuggestions.length) {
                    data.suggestions.combine(data.otherSuggestions);
                }

                if (data.suggestions.length) {
                    this._renderDomainSuggestions(data.suggestions, data.domainName);
                }
            }

            this.invalidate('sizeChange');
        },

        /**
         * Display the domain search view
         * @private
         */
        _displaySearchPanel: function() {
            this.setState('topBar-search', 'topBar');
            this._clearDomainInputValue();
        },

        /**
         * Display Buy Now panel view with domain info
         * @param {String} domain
         * @private
         */
        _displayBuyNowPanel: function(domain) {
            this._skinParts.availableDomainName.innerHTML = this._getShortenedDomainName(domain);
            this._skinParts.availableDomainName.set('data-value', domain);
            this._skinParts.availableDomainPrice.innerHTML = '$' + this._getDomainPrice(domain);

            this.setState('topBar-buy', 'topBar');
        },

        /**
         * Display unavailable domain error message to user
         * @param {String} domain
         * @private
         */
        _displayUnavailableDomainMessage: function(domain) {
            var errorMessage = this._errorMessages.DOMAIN_UNAVAILABLE.replace('{{domainName}}', this._getShortenedDomainName(domain));

            this._showError(errorMessage);
        },

        /**
         * Limit input and hide views when the input is empty
         * @private
         */
        _onDomainInputKeyDown: function() {
            var val = this._getDomainInputValue(),
                length = val.length;

            if (length === 0) {
                this._hideDomainSuggestionsList();
                this._hideError();
            } else if (length > this._maxDomainLength) {
                this._setDomainInputValue(val.substr(0, this._maxDomainLength));
            }
        },

        /**
         * Render available domains suggestions list
         * @param {Array} suggestions - suggested available domains
         * @param {String} originalDomain
         * @private
         */
        _renderDomainSuggestions: function(suggestions, originalDomain) {
            if (!(suggestions && suggestions.length)) {
                return;
            }

            var suggestionsHtml = '';

            for(var i=0; i < suggestions.length; ++i) {
                suggestionsHtml += this._renderSingleDomainSuggestion(suggestions[i], originalDomain);
            }

            this._showDomainSuggestionsList(suggestionsHtml);
        },

        /**
         * Renders a single item template
         * @param {Object} oSuggestion suggestion object
         * @param {String} originalDomain
         * @returns {string} Rendered item's HTML
         * @private
         */
        _renderSingleDomainSuggestion: function(oSuggestion, originalDomain) {
            var tmpl = this._tmplDomainSuggestion;
            oSuggestion.domainPrice = '$' + this._getDomainPrice(oSuggestion.domainName);
            oSuggestion.refCode = this._getRefCode(oSuggestion.domainName, originalDomain);

            var suggestionHtml = tmpl.replace(/\{\{([^}]+)\}\}/g, function(a, paramName) {
                return oSuggestion[paramName] || '';
            });

            return suggestionHtml;
        },

        /**
         * Open suffix dropdown
         */
        _openSuffixDropdown: function() {
            this.setState('suffixMenu-open', 'suffixMenu');
        },

        /**
         * Close suffix dropdown
         */
        _closeSuffixDropdown: function() {
            this.setState('suffixMenu-closed', 'suffixMenu');
        },

        /**
         * Select domain suffix
         * @param event - selected suffix <li> DOM element
         */
        _onSelectSuffix: function(event) {
            this._closeSuffixDropdown();
            var selectedSuffixText = event.target.innerHTML;

            // When applying translation on the page in Chrome, the HTML changes,
            // and event.target might be an inner <font> tag inside the li
            // So we need to make sure we get the parent li
            var liElm = event.target;
            if (liElm.tagName !== "LI") {
                liElm = liElm.getParent('li');
            }
            var selectedSuffixValue = liElm && liElm.get('data-value') || '.com'; // default to .com

            this._setSuffix(selectedSuffixText, selectedSuffixValue);
        },

        /**
         * Get selected suffix
         * @returns {String}
         */
        _getSuffix: function() {
            return this._skinParts.selectedSuffix.get('data-value');
        },

        /**
         * Set the selected domain suffix
         * @param {String} suffix
         */
        _setSuffix: function(suffixText, suffixValue) {
            this._skinParts.selectedSuffix.innerHTML = suffixText;
            this._skinParts.selectedSuffix.set('data-value', suffixValue);
        },

        /**
         * Show loader animaation
         */
        _showLoader: function() {
            this.setState('loader-on', 'loader');
        },

        /**
         * Hide loader animation
         */
        _hideLoader: function() {
            this.setState('loader-off', 'loader');
        },

        /**
         * Display error message
         * @param {String} message
         */
        _showError: function(message) {
            this._skinParts.error.innerHTML = message;
            this.setState('error-on', 'error');
            this.invalidate('sizeChange');
        },

        /**
         * Hide error message
         */
        _hideError: function() {
            this.setState('error-off', 'error');
            this.invalidate('sizeChange');
        },

        /**
         * Displays the suggested domains list
         * @param {String} suggestionsHtml - list HTML
         * @private
         */
        _showDomainSuggestionsList: function(suggestionsHtml) {
            this._skinParts.alternativeDomains.innerHTML = suggestionsHtml;
            this.setState('altDomains-show', 'altDomains');
            this.invalidate('sizeChange');
        },

        /**
         * Hides the suggested domains list
         * @private
         */
        _hideDomainSuggestionsList: function() {
            this.setState('altDomains-hide', 'altDomains');
            this.invalidate('sizeChange');
        },

        /**
         * Returns the domain input's value
         */
        _getDomainInputValue: function() {
           return this._skinParts.txtDomain.value;
        },

        /**
         * Set the domain input's value
         * @param {String} val
         * @private
         */
        _setDomainInputValue: function(val) {
            this._skinParts.txtDomain.value = val || '';
        },

        /**
         * Clear the domain input's value
         * @private
         */
        _clearDomainInputValue: function() {
            this._setDomainInputValue('');

            // Set focus to the domain input
            this._skinParts.txtDomain.setAttribute('tabIndex', 0);

            // Using try since on IE8 this causes an exception on the first render,
            // because the txtDomain input isn't visible yet
            try {
                this._skinParts.txtDomain.focus();
            } catch (ex) {}
        },

        /**
         * Take focus away from the domain input field
         * @private
         */
        _blurDomainInput: function() {
            if (this._skinParts && this._skinParts.txtDomain) {
                this._skinParts.txtDomain.blur();
            }
        },

        /**
         * Get domain value with suffix
         * @returns {string}
         * @private
         */
        _getFullDomainValue: function() {
            // We only return the first portion of the domain, before any dots
            // The suffix will be determined by the suffix selection dropdown
            return this._getDomainInputValue().split('.')[0].trim() + this._getSuffix();
        },

        /**
         * Shortens the domain to 22 chars
         * @param {String} domain - full domain with suffix
         * @private
         */
        _getShortenedDomainName: function(domain) {
            var oDomain = this._parseDomainInfo(domain);

            if (oDomain.name.length > 22) {
                oDomain.name = oDomain.name.substr(0, 22);

                return oDomain.name + '...' + oDomain.suffix;
            } else {
                return domain; // default
            }
        },

        /**
         * Get the domain price by suffix
         * @param {String} domain
         * @returns {Number} price
         * @private
         */
        _getDomainPrice: function(domain) {
            var suffix = this._parseDomainInfo(domain).suffix,
                price = this._domainPrices[suffix] || this._domainPrices.com;

            return price;
        },

        /**
         * Get the Buy Now form URL referral code
         * @param suggestedDomain
         * @param originalDomain
         * @returns {number}
         * @private
         */
        _getRefCode: function(suggestedDomain, originalDomain) {
            suggestedDomain = this._parseDomainInfo(suggestedDomain);
            originalDomain = this._parseDomainInfo(originalDomain);

            if (suggestedDomain.name == originalDomain.name && suggestedDomain.suffix != originalDomain.suffix) {
                return 98;
            } else if (suggestedDomain.name != originalDomain.name && suggestedDomain.suffix == originalDomain.suffix) {
                return 97;
            }

            return 99;
        },

        /**
         * extracts the domain name and suffix from a domain string
         * @param {String} domain
         * @Return {Object} domain info
         * @private
         */
        _parseDomainInfo: function(domain) {
            var domainParts = domain.split('.'),
                domainName = domainParts.shift(), // pops domain name
                suffix = domainParts.join('.'); // joins suffix parts (e.g: '.' + 'co' + '.' + 'uk')

            return {
                name: domainName,
                suffix: suffix,
                fullDomain: domain
            };
        },

        /**
         * On-the-fly polyfill" for the Domain input's placeholder text
         * @param input
         * @private
         */
        _setupInputPlaceholderText: function(input) {
            var placeholder = input.get('placeholder');

            input.addEvent('focus', function() {
                if (input.value == placeholder) {
                    input.value = '';
                    this.setState('inputPlaceholder-off', 'inputPlaceholder');
                }
            }.bind(this));

            input.addEvent('blur', function() {
                if (!input.value) {
                    input.value = placeholder;
                    this.setState('inputPlaceholder-on', 'inputPlaceholder');
                }
            }.bind(this));

            input.fireEvent('blur');
        }
    });
});