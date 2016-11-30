describe('DomainSearchBar', function() {
	testRequire().components('wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar');

    function createComponent(){
        this.componentLogic = new this.DomainSearchBar('testCompId', new Element('div'));
    }

    beforeEach(function (){
        createComponent.call(this);
    });

    describe('Domain name validation (_validateDomainValue() method)', function() {

        beforeEach(function() {
            this.spies = [
                spyOn(this.componentLogic, '_showError').andReturn(false)
            ];
        });

        it('Should return true when the domain contains only alphanumeric characters', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('validdomain123');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(true);
        });

        it('Should return true when the domain contains non-sequential, non-leading, non-trailing dashes', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('valid-domain-name');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(true);
        });

        it('Should return true when the domain contains non-sequential, non-leading, non-trailing dots', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('valid.domain.name');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(true);
        });

        it('Should return true when the domain is 3 characters long', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('dom');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(true);
        });

        it('Should return true when the domain is 63 chatacters long', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567890');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(true);
        });

        it('Should return false when the domain contains invalid characters', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid%^#-domain');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain contains invalid characters', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid%^#-domain');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain is under 3 charachters long', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('do');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with TOO_SHORT error when the domain is under 3 charachters long', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('do');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.TOO_SHORT);
        });

        it('Should return false when the domain is over 63 characters long', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz012345678901');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with TOO_LONG error when the domain is over 63 characters long', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz012345678901');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.TOO_LONG);
        });

        it('Should return false when the domain is blank', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should return false when the domain starts with a dot', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('.invalidDomain');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain starts with a dot', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('.invalidDomain');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain ends with a dot', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalidDomain.');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain ends with a dot', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalidDomain.');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain contains sequential dots', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid..domain.name');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain contains sequential dots', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid..domain.name');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain starts with a dash', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('-invalidDomain');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain starts with a dash', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('-invalidDomain');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain ends with a dash', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalidDomain-');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain ends with a dash', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalidDomain-');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain contains sequential dashes', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid--domain-name');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain contains sequential dashes', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid--domain-name');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain contains a dashes after a dot', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid.-domainName');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain contains a dashes after a dot', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid.-domainName');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

        it('Should return false when the domain contains a dot after a dash', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid-.domainName');

            var isValid = this.componentLogic._validateDomainValue();

            expect(isValid).toBe(false);
        });

        it('Should call _showError with INVALID_CHARS error when the domain contains a dot after a dash', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('invalid-.domainName');

            this.componentLogic._validateDomainValue();

            expect(this.componentLogic._showError).toHaveBeenCalledWith(this.componentLogic._errorMessages.INVALID_CHARS);
        });

    });

    describe('_getFullDomainValue method', function() {

        it('Should return "test.com" when domain is "test" and suffix is ".com"', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('test');
            spyOn(this.componentLogic, '_getSuffix').andReturn('.com');

            var domain = this.componentLogic._getFullDomainValue();

            expect(domain).toBe('test.com');
        });

        it('Should return "test.com" when domain is "test.com" and suffix is ".com"', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('test.com');
            spyOn(this.componentLogic, '_getSuffix').andReturn('.com');

            var domain = this.componentLogic._getFullDomainValue();

            expect(domain).toBe('test.com');
        });

        it('Should return "test.co.uk" when domain is "test.com" and suffix is ".co.uk"', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('test.com');
            spyOn(this.componentLogic, '_getSuffix').andReturn('.co.uk');

            var domain = this.componentLogic._getFullDomainValue();

            expect(domain).toBe('test.co.uk');
        });

        it('Should return "test.biz" when domain is "test.co.il" and suffix is ".biz"', function() {
            spyOn(this.componentLogic, '_getDomainInputValue').andReturn('test.co.il');
            spyOn(this.componentLogic, '_getSuffix').andReturn('.biz');

            var domain = this.componentLogic._getFullDomainValue();

            expect(domain).toBe('test.biz');
        });

    });

    describe('_onSearchDomainClicked', function() {
        beforeEach(function() {
            this.dfd = Q.defer();

            this.spies = [
                spyOn(this.componentLogic, '_showLoader').andReturn(),
                spyOn(this.componentLogic, '_getDomainData').andReturn(this.dfd.promise)
            ];
        });

        it('Should call _validateDomainValue', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn();

            this.componentLogic._onSearchDomainClicked();

            expect(this.componentLogic._validateDomainValue).toHaveBeenCalled();
        });

        it('Should call _showLoader if _validateDomainValue returns true', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(true);

            this.componentLogic._onSearchDomainClicked();

            expect(this.componentLogic._showLoader).toHaveBeenCalled();
        });

        it('Should not call _showLoader if _validateDomainValue returns false', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(false);

            this.componentLogic._onSearchDomainClicked();

            expect(this.componentLogic._showLoader).not.toHaveBeenCalled();
        });

        it('Should call _getDomainData if _validateDomainValue returns true', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(true);

            this.componentLogic._onSearchDomainClicked();

            expect(this.componentLogic._getDomainData).toHaveBeenCalled();
        });

        it('Should not call _getDomainData if _validateDomainValue returns false', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(false);

            this.componentLogic._onSearchDomainClicked();

            expect(this.componentLogic._getDomainData).not.toHaveBeenCalled();
        });

        it('Should return false when _validateDomainValue returns true', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(true);

            var ret = this.componentLogic._onSearchDomainClicked();

            expect(ret).toBe(false);
        });

        it('Should return false when _validateDomainValue returns false', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(false);

            var ret = this.componentLogic._onSearchDomainClicked();

            expect(ret).toBe(false);
        });

        it('Should call _hideDomainSuggestionsList when _validateDomainValue returns false', function() {
            spyOn(this.componentLogic, '_validateDomainValue').andReturn(false);
            spyOn(this.componentLogic, '_hideDomainSuggestionsList').andReturn();

            this.componentLogic._onSearchDomainClicked();

            expect(this.componentLogic._hideDomainSuggestionsList).toHaveBeenCalled();
        });
    });

    describe('_onDomainDataReceived', function() {

        var respAvailableDomain = {
            domainName: 'test.com',
            available: true
        };

        var respUnavailableDomainWithNoSuggestions = {
            domainName: 'test.com',
            available: false,
            suggestions: [],
            otherSuggestions:[]
        };

        var respUnavailableDomainWith2Suggestions = {
            domainName: 'test.com',
            available: false,
            suggestions: [
                {
                    domainName: 'test.info'
                },
                {
                    domainName: 'test.biz'
                }
            ],
            otherSuggestions:[]
        };

        var respUnavailableDomainWith2SuggestionsAnd1OtherSuggestions = {
            domainName: 'test.com',
            available: false,
            suggestions: [
                {
                    domainName: 'test.info'
                },
                {
                    domainName: 'test.biz'
                }
            ],
            otherSuggestions:[
                {
                    domainName: 'test.co.uk'
                }
            ]
        };

        beforeEach(function() {
            this.spies = [
                spyOn(this.componentLogic, '_displayUnavailableDomainMessage').andReturn(),
                spyOn(this.componentLogic, '_displayBuyNowPanel').andReturn()
            ];
        });

        it('Should call _hideLoader', function() {
            spyOn(this.componentLogic, '_hideLoader').andReturn(); // No skin part

            this.componentLogic._onDomainDataReceived(respAvailableDomain);

            expect(this.componentLogic._hideLoader).toHaveBeenCalled();
        });

        it('Should call _hideDomainSuggestionsList', function() {
            spyOn(this.componentLogic, '_hideDomainSuggestionsList').andReturn(); // No skin part

            this.componentLogic._onDomainDataReceived(respAvailableDomain);

            expect(this.componentLogic._hideDomainSuggestionsList).toHaveBeenCalled();
        });

        it('Should call _displayBuyNowPanel with "test.com" when the domain "test.com" is available', function() {
            this.componentLogic._onDomainDataReceived(respAvailableDomain);

            expect(this.componentLogic._displayBuyNowPanel).toHaveBeenCalledWith('test.com');
        });

        it('Should not call _displayBuyNowPanel when the domain is unavailable', function() {
            this.componentLogic._onDomainDataReceived(respUnavailableDomainWithNoSuggestions);

            expect(this.componentLogic._displayBuyNowPanel).not.toHaveBeenCalled();
        });

        it('Should call _displayUnavailableDomainMessage with "test.com" when test.com is unavailabe', function() {
            this.componentLogic._onDomainDataReceived(respUnavailableDomainWithNoSuggestions);

            expect(this.componentLogic._displayUnavailableDomainMessage).toHaveBeenCalledWith('test.com');
        });

        it('Should not call _renderDomainSuggestions when "test.com" is unavailabe and suggestions & otherSuggestions arraya are empty', function() {
            spyOn(this.componentLogic, '_renderDomainSuggestions').andReturn();

            this.componentLogic._onDomainDataReceived(respUnavailableDomainWithNoSuggestions);

            expect(this.componentLogic._renderDomainSuggestions).not.toHaveBeenCalled();
        });

        it('Should call _renderDomainSuggestions with 2 items when "test.com" is unavailabe and suggestions array contains 2 items and otherSuggestions is empty', function() {
            spyOn(this.componentLogic, '_renderDomainSuggestions').andReturn();

            this.componentLogic._onDomainDataReceived(respUnavailableDomainWith2Suggestions);

            expect(this.componentLogic._renderDomainSuggestions).toHaveBeenCalled();
            expect(this.componentLogic._renderDomainSuggestions.argsForCall[0][0].length).toEqual(2);
        });

        it('Should call _renderDomainSuggestions with 3 items when "test.com" is unavailabe and suggestions array contains 2 items and otherSuggestions comains 1 item', function() {
            spyOn(this.componentLogic, '_renderDomainSuggestions').andReturn();

            this.componentLogic._onDomainDataReceived(respUnavailableDomainWith2SuggestionsAnd1OtherSuggestions);

            expect(this.componentLogic._renderDomainSuggestions).toHaveBeenCalled();
            expect(this.componentLogic._renderDomainSuggestions.argsForCall[0][0].length).toEqual(3);
        });
    });

    describe('_showLoader', function() {
        it('Should call setState with loader-on', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._showLoader();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('loader-on', 'loader');
        });
    });

    describe('_hideLoader', function() {
        it('Should call setState with loader-off', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._hideLoader();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('loader-off', 'loader');
        });
    });

    describe('_showError', function() {
        beforeEach(function() {
            this.componentLogic._skinParts = this.componentLogic._skinParts || {};
            this.componentLogic._skinParts.error = new Element("div");
        });

        var errorMessage = "This is an error message";

        it('Should call setState with error-on', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._showError(errorMessage);

            expect(this.componentLogic.setState).toHaveBeenCalledWith('error-on', 'error');
        });

        it('Should set the error text to "This is an error message"', function() {
            this.componentLogic._showError(errorMessage);

            expect(this.componentLogic._skinParts.error.innerHTML).toEqual(errorMessage);
        });
    });

    describe('_hideError', function() {
        it('Should call setState with error-off', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._hideError();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('error-off', 'error');
        });
    });

    describe('_openSuffixDropdown', function() {
        it('Should call setState with suffixMenu-open', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._openSuffixDropdown();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('suffixMenu-open', 'suffixMenu');
        });
    });

    describe('_closeSuffixDropdown', function() {
        it('Should call setState with suffixMenu-closed', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._closeSuffixDropdown();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('suffixMenu-closed', 'suffixMenu');
        });
    });

    describe('_showDomainSuggestionsList', function() {
        beforeEach(function() {
            this.componentLogic._skinParts = this.componentLogic._skinParts || {};
            this.componentLogic._skinParts.alternativeDomains = new Element('div');
        });

        var renderedHtml = "<div>Rendered HTML</div>";

        it('Should call setState with altDomains-show', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._showDomainSuggestionsList(renderedHtml);

            expect(this.componentLogic.setState).toHaveBeenCalledWith('altDomains-show', 'altDomains');
        });

        it('Should set the list HTML to the rendered HTML param', function() {
            this.componentLogic._showDomainSuggestionsList(renderedHtml);

            expect(this.componentLogic._skinParts.alternativeDomains.innerHTML).toEqual(renderedHtml);
        });
    });

    describe('_hideDomainSuggestionsList', function() {
        it('Should call setState with altDomains-hide', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._hideDomainSuggestionsList();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('altDomains-hide', 'altDomains');
        });
    });

    describe('_getShortenedDomainName', function() {
        it('Should return "test.co.uk" when the domain is "test.co.uk"', function() {
            var domain = "test.co.uk";

            var shortenedDomain = this.componentLogic._getShortenedDomainName(domain);

            expect(shortenedDomain).toEqual("test.co.uk");
        });

        it('Should return "abcdefghijklmnopqrstuv...co.uk" when the domain is "abcdefghijklmnopqrstuvwxyz.co.uk"', function() {
            var domain = "abcdefghijklmnopqrstuvwxyz.co.uk";

            var shortenedDomain = this.componentLogic._getShortenedDomainName(domain);

            expect(shortenedDomain).toEqual("abcdefghijklmnopqrstuv...co.uk");
        });
    });

    describe('_getDomainPrice', function() {
        it('Should return 14.95 when the domain is test.com', function() {
            var domain = 'test.com';

            var price = this.componentLogic._getDomainPrice(domain);

            expect(price).toEqual(14.95);
        });

        it('Should return 13.95 when the domain is test.co.uk', function() {
            var domain = 'test.co.uk';

            var price = this.componentLogic._getDomainPrice(domain);

            expect(price).toEqual(13.95);
        });

        it('Should return 14.95 when the domain contains an unknown suffix - test.suf.fix', function() {
            var domain = 'test.suf.fix';

            var price = this.componentLogic._getDomainPrice(domain);

            expect(price).toEqual(14.95);
        });
    });

    describe('_displaySearchPanel', function() {
        beforeEach(function() {
            this.spies = [
                spyOn(this.componentLogic, '_clearDomainInputValue').andReturn()
            ];
        });

        it('Should call setState with topBar-search', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._displaySearchPanel();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('topBar-search', 'topBar');
        });

        it('Should clear the domain text-input (call _clearDomainInputValue)', function() {
            this.componentLogic._displaySearchPanel();

            expect(this.componentLogic._clearDomainInputValue).toHaveBeenCalled();
        });
    });

    describe('_displayBuyNowPanel', function() {
        beforeEach(function() {
            this.componentLogic._skinParts = this.componentLogic._skinParts || {};
            this.componentLogic._skinParts.availableDomainName = new Element("div");
            this.componentLogic._skinParts.availableDomainPrice = new Element("div");
        });

        it('Should call setState with topBar-buy', function() {
            spyOn(this.componentLogic, 'setState');

            this.componentLogic._displayBuyNowPanel('test.com');

            expect(this.componentLogic.setState).toHaveBeenCalledWith('topBar-buy', 'topBar');
        });

        it('Should set the displayed domain to be "test.com" when the domain param is "test.com"', function() {
            this.componentLogic._displayBuyNowPanel('test.com');

            expect(this.componentLogic._skinParts.availableDomainName.innerHTML).toEqual('test.com');
        });

        it('Should call _getDomainPrice with "test.com" when the domain param is "test.com"', function() {
           spyOn(this.componentLogic, '_getDomainPrice');

            this.componentLogic._displayBuyNowPanel('test.com');

            expect(this.componentLogic._getDomainPrice).toHaveBeenCalledWith('test.com');
        });

        it('Should set the domain price to "$19.95" when _getDomainPrice returns 19.95', function() {
            spyOn(this.componentLogic, '_getDomainPrice').andReturn(19.95);

            this.componentLogic._displayBuyNowPanel('test.com');

            expect(this.componentLogic._skinParts.availableDomainPrice.innerHTML).toEqual('$19.95');
        });
    });

    describe('_displayUnavailableDomainMessage', function() {
        it('Should call _showError with DOMAIN_UNAVAILABLE error message', function() {
            spyOn(this.componentLogic, '_showError').andReturn();
            var domain = 'test.com';

            this.componentLogic._displayUnavailableDomainMessage(domain);

            var errorMessage = this.componentLogic._errorMessages.DOMAIN_UNAVAILABLE.replace('{{domainName}}', domain);
            expect(this.componentLogic._showError).toHaveBeenCalledWith(errorMessage);
        });
    });

    describe('_renderDomainSuggestions', function() {
        var suggestions = [
            {
                domainName: "domain1.com"
            },
            {
                domainName: "domain2.co.uk"
            },
            {
                domainName: "domain3.suf.fix"
            }
        ];

        beforeEach(function(){
           this.spies = [
               spyOn(this.componentLogic, '_showDomainSuggestionsList').andReturn()
           ];
        });

        it('Should call _renderSingleDomainSuggestion 3 times when data contains 3 items', function() {
            var spy = spyOn(this.componentLogic, '_renderSingleDomainSuggestion').andReturn();

            this.componentLogic._renderDomainSuggestions(suggestions);

            expect(spy.callCount).toEqual(3);
        });

        it('Should not call _renderSingleDomainSuggestion when data contains no items', function() {
            spyOn(this.componentLogic, '_renderSingleDomainSuggestion').andReturn();

            this.componentLogic._renderDomainSuggestions(null);

            expect(this.componentLogic._renderSingleDomainSuggestion).not.toHaveBeenCalled();
        });

        it('Should call _showDomainSuggestionsList with rendered HTML when data contains items', function() {
            var singleRenderedItem = '<li>Rednered</li>';
            spyOn(this.componentLogic, '_renderSingleDomainSuggestion').andReturn(singleRenderedItem);

            this.componentLogic._renderDomainSuggestions(suggestions);

            var renderedHtml = '<li>Rednered</li><li>Rednered</li><li>Rednered</li>';
            expect(this.componentLogic._showDomainSuggestionsList).toHaveBeenCalledWith(renderedHtml);
        });

        it('Should not call _showDomainSuggestionsList when data contains no items', function() {
            this.componentLogic._renderDomainSuggestions(null);

            expect(this.componentLogic._showDomainSuggestionsList).not.toHaveBeenCalled();
        });
    });

    describe('Buy domain referral code (_getRefCode)', function() {
        it('Should return 98 when the suggested domain matches the searched domain, but the suffix is different', function() {
            var originalDomain = 'test.com',
                suggestedDomain = 'test.co.uk';

            var refCode = this.componentLogic._getRefCode(suggestedDomain, originalDomain);

            expect(refCode).toEqual(98);
        });

        it('Should return 97 when the suggested domain name is different than the searched domain, but with the same suffix', function() {
            var originalDomain = 'test.com',
                suggestedDomain = 'test123.com';

            var refCode = this.componentLogic._getRefCode(suggestedDomain, originalDomain);

            expect(refCode).toEqual(97);
        });

        it('Should return 99 if domain is the same as original', function() {
            var domain = 'test.com';

            var refCode = this.componentLogic._getRefCode(domain, domain);

            expect(refCode).toEqual(99);
        });

        it('Should return 99 if both suggested domain name and suggested suffix are different than the original', function() {
            var originalDomain = 'test.com',
                suggestedDomain = 'test123.co.uk';

            var refCode = this.componentLogic._getRefCode(suggestedDomain, originalDomain);

            expect(refCode).toEqual(99);
        });
    });

});