define([
    'testUtils',
    'wixSites/components/domainSearchBar/domainSearchBar',
    'reactDOM'
],
    function(testUtils, domainSearchBar, ReactDOM) {
    'use strict';

    var domainSearchComp;

    var errorMessages = {
        UNKNOWN_ERROR: "An unknown error occurred.",
        INVALID_CHARS: "Domain contains invalid characters. Please try again.",
        TOO_SHORT: "Domain name is too short.",
        TOO_LONG: "Domain name is too long.",
        DOMAIN_UNAVAILABLE: "The domain {{domainName}} is not available."
    };

    describe('DomainSearchBar component', function () {
        beforeEach(function () {
            var props = testUtils.mockFactory.mockProps()
                .setSkin("wysiwyg.common.components.domainsearchbar.viewer.skins.DomainSearchBarSkin");
            props.structure.componentType = 'wysiwyg.common.components.domainsearchbar.viewer.DomainSearchBar';

            domainSearchComp = testUtils.getComponentFromDefinition(domainSearchBar, props);

            spyOn(domainSearchComp, 'registerReLayout').and.returnValue();
        });


        it('default state should have proper values', function () {

            var state = domainSearchComp.getInitialState();

            expect(state).toEqual(jasmine.objectContaining({
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
            }));
        });


        describe('getSkinProperties', function () {

            it('should return empty alternative domains from the scratch', function () {
                var sProps = domainSearchComp.getSkinProperties();
                expect(sProps.alternativeDomains.children).toBe('');
            });

            it('should return alternative domains when have such', function () {
                var suggestions = [
                    {domainName: 'aaa.com'}, {domainName: 'bbb.com'}
                ];

                domainSearchComp.clearState();
                domainSearchComp.showDomainSuggestions(suggestions, 'ccc.com');
                domainSearchComp.setStateFromInside();
                var sProps = domainSearchComp.getSkinProperties();
                expect(sProps.alternativeDomains.children.length).toEqual(suggestions.length);
            });
        });


        describe('search button click', function () {
            it('should show buy now panel and hide errors', function () {
                // arrange
                var data = {
                    available: true,
                    domainName: 'google.com'
                };

                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = 'google';
                spyOn(domainSearchComp, 'getDomainData').and.callFake(function (domaim, cb) {
                    return cb(data);
                });

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                var state = domainSearchComp.state;
                expect(state.domainToBuy).toEqual(data.domainName);
                expect(state.$topBar).toEqual('topBar-buy');
                expect(state.$error).toEqual('error-off');
            });

            it('should set alternative domains when domain is not available', function () {
                // arrange
                var data = {
                    available: false,
                    domainName: 'google.com',
                    suggestions: [
                        {domainName: 'aaa.com'}, {domainName: 'bbb.com'}
                    ]
                };


                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = 'google';
                spyOn(domainSearchComp, 'getDomainData').and.callFake(function (domaim, cb) {
                    return cb(data);
                });

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                var sProps = domainSearchComp.getSkinProperties();
                expect(sProps.alternativeDomains.children.length).toEqual(data.suggestions.length);
            });

            it('should set set error state when error comes from the server', function () {
                // arrange
                var data = {
                        errorData: true
                    },
                    domain = 'google';


                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = domain;
                spyOn(domainSearchComp, 'getDomainData').and.callFake(function (domaim, cb) {
                    return cb(data);
                });

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                expect(domainSearchComp.state.$error).toEqual('error-on');
                expect(domainSearchComp.state.errorMsg).toEqual(errorMessages.UNKNOWN_ERROR);
            });

            it('should show error that domain contains invalid characters', function () {
                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = '123 xx,.';

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                expect(domainSearchComp.state.$error).toEqual('error-on');
                expect(domainSearchComp.state.errorMsg).toEqual(errorMessages.INVALID_CHARS);
            });

            it('should show error that domain is too short contains invalid characters', function () {
                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = 'ab';

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                expect(domainSearchComp.state.$error).toEqual('error-on');
                expect(domainSearchComp.state.errorMsg).toEqual(errorMessages.TOO_SHORT);
            });

            it('should show error that domain is too short contains invalid characters', function () {
                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = new Array(65).join('a');

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                expect(domainSearchComp.state.$error).toEqual('error-on');
                expect(domainSearchComp.state.errorMsg).toEqual(errorMessages.TOO_LONG);
            });

            it('should cause relayout when there are suggestions from the server', function() {
                // arrange
                // arrange
                var data = {
                        available: false,
                        domainName: 'google.com',
                        suggestions: [
                            {domainName: 'aaa.com'}, {domainName: 'bbb.com'}
                        ]
                    };


                ReactDOM.findDOMNode(domainSearchComp.refs.txtDomain).value = 'google';
                spyOn(domainSearchComp, 'getDomainData').and.callFake(function (domaim, cb) {
                    return cb(data);
                });

                // act
                domainSearchComp.getSkinProperties().frmSearchDomain.onSubmit();

                // assert
                expect(domainSearchComp.registerReLayout).toHaveBeenCalled();
                //expect(domainSearchComp.registerReLayout.calls.count()).toEqual(1);
            });

        });

    });
});
