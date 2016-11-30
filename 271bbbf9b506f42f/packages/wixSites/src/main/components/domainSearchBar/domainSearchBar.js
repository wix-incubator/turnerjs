/**
 * Created by alexandergonchar on 7/18/14.
 */
define(['react', 'core', 'skins', 'utils', 'lodash', 'zepto', 'reactDOM'], function(React, /** core */ core, skinsPackage, utils, _, zepto, ReactDOM) {
    'use strict';

    var mixins = core.compMixins,
        ajaxLib = utils.ajaxLibrary;

    var domainPrices = {
            "com": 14.95,
            "co.uk": 13.95,
            "biz": 15.95,
            "info": 14.95,
            "org": 14.95,
            "net": 14.95
        },
        errorMessages = {
            UNKNOWN_ERROR: "An unknown error occurred.",
            INVALID_CHARS: "Domain contains invalid characters. Please try again.",
            TOO_SHORT: "Domain name is too short.",
            TOO_LONG: "Domain name is too long.",
            DOMAIN_UNAVAILABLE: "The domain {{domainName}} is not available."
        },
        maxDomainLength = 63,
        serviceUrl = "https://premium.wix.com/wix/api/checkDomainNameAvailableAPI",
        defaultRefCode = 99,
        buyDomainUrl = "https://premium.wix.com/wix/api/domainDirectPurchaseForm?referralAdditionalInfo=Da_{{refCode}}";


    /**
     * Display error message
     * @param {String} message
     */
    function showError(message) {
        this._state.$error = 'error-on';
        this._state.errorMsg = message;
        this.registerReLayout();
    }

    /**
     * Hide error message
     */
    function hideError() {
        this._state.$error = 'error-off';
        this.registerReLayout();
    }

    /**
     * Validate that the domain input value is a valid domain value
     * @returns {boolean}
     */
    function validateDomainValue(domain) {
        if (!domain) {
            hideError.call(this);
            return false;
        }

        // Domain contains invalid characters
        var beginsOrEndsWithDotOrDash = /^[\.-]|[\.-]$/i.test(domain),
            containsSequentialDashesOrDots = /[\-\.]{2,}/i.test(domain), // matches --  ..  -.  .-
            containsInvalidCharacters = !/^([a-z0-9\-\.]+)$/i.test(domain);

        if (beginsOrEndsWithDotOrDash || containsSequentialDashesOrDots || containsInvalidCharacters) {
            showError.call(this, errorMessages.INVALID_CHARS);
            return false;
        }


        // Validate length

        domain = domain.split('.')[0].trim(); // strip domain of suffixes (in case the user entered them in the input)

        if (domain.length < 3) {
            showError.call(this, errorMessages.TOO_SHORT);
            return false;
        }

        if (domain.length > 63) {
            showError.call(this, errorMessages.TOO_LONG);
            return false;
        }

        return true;
    }

    /**
     * Hides the suggested domains list
     */
    function hideDomainSuggestionsList() {
        this._state.$altDomains = 'altDomains-hide';
        this.registerReLayout();
    }

    /**
     * Take focus away from the domain input field
     */
    function blurDomainInput() {
        ReactDOM.findDOMNode(this.refs.txtDomain).blur();
    }

    function showLoader() {
        this._state.$loader = 'loader-on';
    }

    function hideLoader() {
        this._state.$loader = 'loader-off';
    }

    /**
     * Display unavailable domain error message to user
     * @param {String} domain
     */
    function displayUnavailableDomainMessage(domain) {
        var errorMessage = errorMessages.DOMAIN_UNAVAILABLE.replace('{{domainName}}', getShortenedDomainName.call(this, domain));

        showError.call(this, errorMessage);
    }

    /**
     * Get selected suffix
     * @returns {String}
     */
    function getSuffix() {
        return this.state.suffixValue;
    }

    /**
     * Get the Buy Now form URL referral code
     * @param suggestedDomain
     * @param originalDomain
     * @returns {number}
     */
    function getRefCode(suggestedDomain, originalDomain) {
        suggestedDomain = parseDomainInfo(suggestedDomain);
        originalDomain = parseDomainInfo(originalDomain);

        if (suggestedDomain.name === originalDomain.name && suggestedDomain.suffix !== originalDomain.suffix) {
            return 98;
        } else if (suggestedDomain.name !== originalDomain.name && suggestedDomain.suffix === originalDomain.suffix) {
            return 97;
        }

        return 99;
    }

    /**
     * Get domain value with suffix
     * @returns {string}
     */
    function getFullDomainValue(domainInputVal) {
        // We only return the first portion of the domain, before any dots
        // The suffix will be determined by the suffix selection dropdown
        return domainInputVal.split('.')[0].trim() + getSuffix.call(this);
    }

    /**
     * Shortens the domain to 22 chars
     * @param {String} domain - full domain with suffix
     */
    function getShortenedDomainName(domain) {
        var oDomain;

        oDomain = parseDomainInfo(domain);

        if (oDomain.name.length > 22) {
            oDomain.name = oDomain.name.substr(0, 22);

            return oDomain.name + '...' + oDomain.suffix;
        }

        return domain; // default
    }

    /**
     * Display Buy Now panel view with domain info
     * @param {String} domain
     */
    function displayBuyNowPanel(domain) {
        this._state.domainToBuy = domain;
        this._state.$topBar = 'topBar-buy';
    }

    /**
     * extracts the domain name and suffix from a domain string
     * @param {String} domain
     * @Return {Object} domain info
     */
    function parseDomainInfo(domain) {
        var domainParts = (domain || '').split('.'),
            domainName = domainParts.shift(), // pops domain name
            suffix = domainParts.join('.'); // joins suffix parts (e.g: '.' + 'co' + '.' + 'uk')

        return {
            name: domainName,
            suffix: suffix,
            fullDomain: domain
        };
    }

    /**
     * Get the domain price by suffix
     * @param {String} domain
     * @returns {Number} price
     */
    function getDomainPrice(domain) {
        var suffix = parseDomainInfo(domain).suffix,
            price = domainPrices[suffix] || domainPrices.com;

        return price;
    }

    function buildSuffixList() {
        function li(val) {
            return React.DOM.li({'data-value': val}, val);
        }
        return [
            li('.com'),
            li('.co.uk'),
            li('.biz'),
            li('.info'),
            li('.org'),
            li('.net')
        ];
    }

    function getDomainInputVal() {
        return ReactDOM.findDOMNode(this.refs.txtDomain).value.trim();
    }

    /**
     * Set the selected domain suffix
     * @param {String} suffix
     */
    function setSuffix(suffixText, suffixValue) {
        this._state.suffixText = suffixText;
        this._state.suffixValue = suffixValue;
    }

    function buildAlternativesDomTree(altList, originalDomain) {
        if (!altList || altList.length === 0) {
            return '';
        }
        return altList.map(function (alt) {
            var domainName = alt.domainName,
                price = getDomainPrice(domainName),
                refCode = getRefCode.call(this, domainName, originalDomain);
            return React.DOM.li({id: this.props.id},
                [
                    React.DOM.div({className: this.props.styleId + '_altDomainInfo', key: this.props.key + 'dInfo'},
                        [
                            React.DOM.div({className: this.props.styleId + '_altDomainName', key: this.props.key + 'dName'}, domainName),
                            React.DOM.div({className: this.props.styleId + '_altDomainPrice', key: this.props.key + 'dPrice'}, price)
                        ]),
                    React.DOM.div({className: this.props.styleId + '_btnBuyAltDomain', 'data-domain': domainName, 'data-refcode': refCode, key: this.props.key + 'altDInfo'}, 'Buy Now')
                ]);
        }.bind(this));
    }

    /**
     * Submit the buy domain form
     * @param {String} domain
     * @param {String|Number} refCode
     */
    function submitBuyNowForm(domain, refCode) {
        refCode = refCode || defaultRefCode;
        domain = domain || getDomainInputVal.call(this);


        var form = ReactDOM.findDOMNode(this.refs.frmBuyDomain);

        ReactDOM.findDOMNode(this.refs.txtBuyDomainValue).value = domain;
        form.setAttribute('action', buyDomainUrl.replace('{{refCode}}', '' + refCode));

        form.submit();
    }

    /**
     * Set the domain input's value
     * @param {String} val
     */
    function setDomainInputValue(val) {
        this._state.domain = val;
        //this._skinParts.txtDomain.value = val || '';
    }

    /**
     * Clear the domain input's value
     */
    function clearDomainInputValue() {
        setDomainInputValue.call(this, '');
        this._setFocus = true;
    }


    /**
     * @class components.DomainSearchBar
     * @extends {core.skinBasedComp}
     * @property {comp.properties} props
     */
    var DomainSearchBar = {
        displayName: 'DomainSearchBar',
        mixins: [mixins.skinBasedComp],


        setStateFromInside: function () {
            this.setState(this._state);
        },

        clearState: function () {
            this._state = {};
        },

        /**
         * Handle domain availability data and display results to user
         * @param {Object} data
         */
        onDomainDataReceived: function(data) {
            this._state = {};

            hideLoader.call(this);
            hideDomainSuggestionsList.call(this);

            if (!data || !data.domainName) {
                showError.call(this, errorMessages.UNKNOWN_ERROR);
                this.setStateFromInside();
                return;
            }

            // Domain is available
            if (data.available) {
                displayBuyNowPanel.call(this, data.domainName);
                hideError.call(this);
            } else {
                // Domain is unavailable
                displayUnavailableDomainMessage.call(this, data.domainName);

                // Display suggested available domains, if available
                data.suggestions = data.suggestions || [];
                // check for otherSuggestions
                if (data.otherSuggestions && data.otherSuggestions.length) {
                    data.suggestions = _.union(data.suggestions, data.otherSuggestions);
                }

                if (data.suggestions.length) {
                    this.showDomainSuggestions(data.suggestions, data.domainName);
                }
            }

            this.setStateFromInside();

            this.registerReLayout();
        },

        /**
         * Get domain availability data
         */
        getDomainData: function (domainVal, successCb) {
            ajaxLib.get(
                serviceUrl,
                {
                    domainName: getFullDomainValue.call(this, domainVal)
                },
                function (data) {
                    successCb(JSON.parse(data));
                },
                'jsonp'
            );
        },

        /**
         * Buy the domain that the user searched for
         * @private
         */
        onBuyAvailableDomainClicked: function() {
            var domain = ReactDOM.findDOMNode(this.refs.availableDomainName).getAttribute('data-value'),
                refCode = defaultRefCode;

            submitBuyNowForm.call(this, domain, refCode);
        },

        onSearchDomainClicked: function () {
            var domain = getDomainInputVal.call(this);
            this._state = {};

            if (!validateDomainValue.call(this, domain)) {
                hideDomainSuggestionsList.call(this);
                this.setStateFromInside();
                return false;
            }


            showLoader.call(this);
            this.setStateFromInside();

            blurDomainInput.call(this);

            this.getDomainData(domain, this.onDomainDataReceived);

            return false;
        },

        openSuffixDropdown: function() {
            this.setState({$suffixMenu: 'suffixMenu-open'});
        },

        closeSuffixDropdown: function() {
            this.setState({$suffixMenu: 'suffixMenu-closed'});
        },

        /**
         * Select domain suffix
         * @param event - selected suffix <li> DOM element
         */
        onSelectSuffix: function(event) {
            var selectedSuffixText = event.target.innerHTML;

            // When applying translation on the page in Chrome, the HTML changes,
            // and event.target might be an inner <font> tag inside the li
            // So we need to make sure we get the parent li
            var liElm = event.target;
            if (liElm.tagName !== "LI") {
                liElm = zepto(liElm).parent('li').get(0);
            }
            var selectedSuffixValue = liElm && liElm.getAttribute('data-value');

            if (selectedSuffixValue) {
                this.clearState();
                this._state.$suffixMenu = 'suffixMenu-closed';
                setSuffix.call(this, selectedSuffixText, selectedSuffixValue);
                this.setStateFromInside();
            }
        },

        onDomainInputChanged: function (event) {
            var val = event.target.value,
                length = val.length;

            this.clearState();

            if (length === 0) {
                hideDomainSuggestionsList.call(this);
                hideError.call(this);
            } else if (length > maxDomainLength) {
                val = val.substr(0, maxDomainLength);
            }

            setDomainInputValue.call(this, val);
            this.setStateFromInside();
        },

        /**
         * Display the domain search view
         */
        displaySearchPanel: function() {
            this._state.$topBar = 'topBar-search';
            clearDomainInputValue.call(this);
            this.setStateFromInside();
        },

        /**
         * Buy a domain from the suggestions list
         * @param {Event} event - click event
         */
        onBuySuggestedDomainClicked: function(event) {
            // Check if the click target is the Buy Now button
            var domain = event && event.target && event.target.getAttribute('data-domain');
            if (domain) {
                var refCode = event.target.getAttribute('data-refcode');
                submitBuyNowForm.call(this, domain, refCode);
            }
        },

        /**
         * Displays the suggested domains list
         * @param {String} suggestionsHtml - list HTML
         */
        showDomainSuggestions: function (suggestions, originalDomain) {
            this._state.suggestions = suggestions;
            this._state.originalDomain = originalDomain;
            this._state.$altDomains = 'altDomains-show';

            this.registerReLayout();
        },

        getSkinProperties: function () {
            return {
                frmSearchDomain: {
                    style: {
                        display: 'block'
                    },
                    onSubmit: this.onSearchDomainClicked
                },
                txtDomain: {
                    placeholder: "Search for the domain you want",
                    value: this.state.domain,
                    onChange: this.onDomainInputChanged
                },
                suffixSelectionWrapper: {
                    onMouseEnter: this.openSuffixDropdown,
                    onMouseLeave: this.closeSuffixDropdown
                },
                selectedSuffix: {
                    children: this.state.suffixText,
                    'data-value': this.state.suffixValue
                },
                suffixDropdown: {
                    onMouseEnter: this.openSuffixDropdown,
                    onMouseLeave: this.closeSuffixDropdown,
                    children: buildSuffixList(),
                    onClick: this.onSelectSuffix
                },
                loader: {
                    style: {
                        display: this.state.$loader === 'loader-on' ? 'block' : 'none'
                    }
                },
                buyDomainContainer: {
                    addChildren: [
                        React.DOM.p({
                            className: this.props.styleId + '_availableLabel',
                            style: {
                                marginLeft: '5px'
                            }
                        }, 'is avaliable')
                    ]
                },
                availableDomainName: {
                    children: getShortenedDomainName.call(this, this.state.domainToBuy),
                    'data-value': this.state.domainToBuy
                },
                availableDomainPrice: {
                    children: this.state.domainToBuy ? '$' + getDomainPrice(this.state.domainToBuy) : ''
                },
                btnBuyAvailableDomain: {
                    children: 'Buy Now',
                    onClick: this.onBuyAvailableDomainClicked
                },
                searchAgain: {
                    children: 'Search Again',
                    onClick: this.displaySearchPanel
                },
                error: {
                    dangerouslySetInnerHTML: {__html: this.state.errorMsg || ''}
                },
                alternativeDomains: {
                    onClick: this.onBuySuggestedDomainClicked,
                    children: buildAlternativesDomTree.call(this, this.state.suggestions, this.state.originalDomain)
                },
                frmBuyDomain: {
                    method: 'POST'
                },
                txtBuyDomainValue: {
                    type: 'hidden',
                    name: 'domainName'
                },
                searchDomainButton: {
                    type: 'submit',
                    value: 'Search',
                    style: {
                        borderTopLeftRadius: '0px',
                        borderBottomLeftRadius: '0px'
                    }
                },
                availDomainsMessage: {
                    children: "Check out these available domains:"
                }
            };
        },

        /**
         * Returns all values possible in state set to defaults
         */
        getInitialState: function () {
            return {
                $topBar: 'topBar-search',
                $error: 'error-off',
                $altDomains: 'altDomains-hide',
                $loader: 'loader-off',

                domain: '',
                suggestions: [],
                originalDomain: '',
                suffixText: '.com',
                suffixValue: '.com',
                errorMsg: ''
            };
        },

        componentDidUpdate: function () {
            var domainNode;
            if (this._setFocus) {
                domainNode = ReactDOM.findDOMNode(this.refs.txtDomain);
                // Set focus to the domain input
                domainNode.focus();

                this._setFocus = false;
            }
        }

    };

    return DomainSearchBar;
});
