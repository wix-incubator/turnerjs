define(['lodash', 'testUtils', 'twitterFeed'], function (_, testUtils, twitterFeed) {
    'use strict';

    var createProps = function(propsOverrides) {
        return testUtils.santaTypesBuilder.getComponentProps(twitterFeed, propsOverrides);
    };

    var createComponent = function (propsOverrides) {
        return testUtils.getComponentFromDefinition(twitterFeed, createProps(propsOverrides));
    };

    describe('Twitter Feed Component', function () {
        describe('displayed label', function(){
            it('should display "wix" by default', function() {
                this.twitterFeedComp = createComponent({
                    compData: {
                        accountToFollow: undefined
                    }
                });
                var skinProps = this.twitterFeedComp.getSkinProperties();

                expect(skinProps.label.children).toEqual('wix');
            });

            it('should display the accountToFollow if provided', function() {
                this.twitterFeedComp = createComponent({
                    compData: {
                        accountToFollow: 'MileyCyrus'
                    }
                });
                var skinProps = this.twitterFeedComp.getSkinProperties();

                expect(skinProps.label.children).toEqual('MileyCyrus');
            });
        });

        describe('rendered link', function(){
            it('should link to "wix" by default', function() {
                this.twitterFeedComp = createComponent({
                    compData: {
                        accountToFollow: undefined
                    }
                });
                var skinProps = this.twitterFeedComp.getSkinProperties();

                expect(skinProps.link.href).toEqual('https://twitter.com/intent/user?screen_name=wix');
            });

            it('should link to accountToFollow if provided', function() {
                this.twitterFeedComp = createComponent({
                    compData: {
                        accountToFollow: 'MileyCyrus'
                    }
                });
                var skinProps = this.twitterFeedComp.getSkinProperties();

                expect(skinProps.link.href).toEqual('https://twitter.com/intent/user?screen_name=MileyCyrus');
            });
        });
    });
});
