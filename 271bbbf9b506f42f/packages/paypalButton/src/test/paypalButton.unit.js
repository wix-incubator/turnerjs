define(['lodash', 'testUtils', 'utils', 'paypalButton'], function (_, testUtils, utils, paypalButton) {
    'use strict';

    describe('PayPal Button Component', function () {

        function getSkinProperties(props) {
            return testUtils.getComponentFromDefinition(paypalButton, props).getSkinProperties();
        }

        function createPayPalProps(languageCode) {
            return testUtils.santaTypesBuilder.getComponentProps(paypalButton, {
                compData: {
                    merchantID: 'test@wix.com'
                },
                compProp: {
                    currencyCode: 'USD',
                    amount: '19.99',
                    buttonType: 'buy',
                    itemName: 'toy',
                    itemID: '12345',
                    organizationName: 'wix',
                    organizationID: '77',
                    showCreditCards: true,
                    smallButton: false,
                    target: '_blank',
                    language: languageCode || 'en'
                },
                structure: {
                    componentType: 'wysiwyg.viewer.components.PayPalButton'
                }
            });
        }

        var paypalProps, skinProperties;

        beforeEach(function () {
            paypalProps = createPayPalProps();
        });

        describe('Submit button testing', function () {

            describe('Language', function () {
                it('should render image sources in lang defined in props.language is not "userLang"', function () {
                    paypalProps.compProp.language = 'es';

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('es_ES');
                    expect(skinProperties.trackingPixel.src).toContain('es_ES');
                });

                it('should render image sources in user lang if props.language is "userLang" and user lang is supported', function () {
                    paypalProps.compProp.language = 'userLang';

                    spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('fr');
                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('fr_FR');
                    expect(skinProperties.trackingPixel.src).toContain('fr_FR');
                });

                it('should render image sources in english if props.language is "userLang" but user lang is not supported', function () {
                    paypalProps.compProp.language = 'userLang';

                    spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('some random language');
                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('en_US');
                    expect(skinProperties.trackingPixel.src).toContain('en_US');
                });

                describe('Japanese', function() {
                    it('should support rendering the paypal button when the language code is JA', function() {
                        paypalProps = createPayPalProps('JA');

                        skinProperties = getSkinProperties(paypalProps);

                        expect(skinProperties.submitImage.src).toContain('ja_JP');
                        expect(skinProperties.trackingPixel.src).toContain('ja_JP');
                    });

                    it('should support rendering the paypal button when the language code is JP as a fallback for older saved sites', function() {
                        paypalProps = createPayPalProps('jp');

                        skinProperties = getSkinProperties(paypalProps);

                        expect(skinProperties.submitImage.src).toContain('ja_JP');
                        expect(skinProperties.trackingPixel.src).toContain('ja_JP');
                    });
                });
            });

            describe('Buy button tests', function () {

                it('Should have the right button source for "large buy now button with credit cards"', function () {
                    paypalProps.compProp.buttonType = 'buy';
                    paypalProps.compProp.smallButton = false;
                    paypalProps.compProp.showCreditCards = true;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('btn_buynowCC_LG.gif');
                });

                it('Should have the right button source for "large buy now button without credit cards"', function () {
                    paypalProps.compProp.buttonType = 'buy';
                    paypalProps.compProp.smallButton = false;
                    paypalProps.compProp.showCreditCards = false;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('btn_buynow_LG.gif');
                });

                it('Should have the right button source for "small buy now button without credit cards"', function () {
                    paypalProps.compProp.buttonType = 'buy';
                    paypalProps.compProp.smallButton = true;
                    paypalProps.compProp.showCreditCards = false;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('btn_buynow_SM.gif');
                });
            });

            describe('Donate button tests', function () {

                it('Should have the right button source for "large donate button with credit cards"', function () {
                    paypalProps.compProp.buttonType = 'donate';
                    paypalProps.compProp.smallButton = false;
                    paypalProps.compProp.showCreditCards = true;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('btn_donateCC_LG.gif');
                });

                it('Should have the right button source for "large donate button without credit cards"', function () {
                    paypalProps.compProp.buttonType = 'donate';
                    paypalProps.compProp.smallButton = false;
                    paypalProps.compProp.showCreditCards = false;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('btn_donate_LG.gif');
                });

                it('Should have the right button source for "small donate button without credit cards"', function () {
                    paypalProps.compProp.buttonType = 'donate';
                    paypalProps.compProp.smallButton = true;
                    paypalProps.compProp.showCreditCards = false;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.submitImage.src).toContain('btn_donate_SM.gif');
                });
            });
        });

        describe('Form params testing', function () {

            describe('Button type based param testing', function () {

                it('Should have correct values for "buy now" button type', function () {
                    paypalProps.compProp.buttonType = 'buy';

                    var cmdType = '_xclick',
                        buildNotation = 'Wix_BuyNow_WPS_IL',
                        itemName = paypalProps.compProp.itemName,
                        itemNumber = paypalProps.compProp.itemID;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.cmd.value).toEqual(cmdType);
                    expect(skinProperties.item_name.value).toEqual(itemName);
                    expect(skinProperties.item_number.value).toEqual(itemNumber);
                    expect(skinProperties.bn.value).toEqual(buildNotation);
                });

                it('Should have correct values for "donate" button type', function () {
                    paypalProps.compProp.buttonType = 'donate';

                    var cmdType = '_donations',
                        buildNotation = 'Wix_Donate_WPS_IL',
                        itemName = paypalProps.compProp.organizationName,
                        itemNumber = paypalProps.compProp.organizationID;

                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.cmd.value).toEqual(cmdType);
                    expect(skinProperties.item_name.value).toEqual(itemName);
                    expect(skinProperties.item_number.value).toEqual(itemNumber);
                    expect(skinProperties.bn.value).toEqual(buildNotation);
                });
            });

            describe('Amount param test', function () {

                it('Should have amount field', function () {
                    var amount = '19.99';
                    paypalProps.compProp.amount = amount;
                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.amount.value).toEqual(amount);
                });

                it('Should not have amount field', function () {
                    paypalProps.compProp.amount = 0;
                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.amount.value).toBeUndefined();
                });
            });

            describe('Target param test', function () {

                it('Should have _blank target', function () {
                    var target = '_blank';
                    paypalProps.compProp.target = target;
                    skinProperties = getSkinProperties(paypalProps);

                    expect(skinProperties.form.target).toEqual(target);
                });
            });
        });

    });
});
