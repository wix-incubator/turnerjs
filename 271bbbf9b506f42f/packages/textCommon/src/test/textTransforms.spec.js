/*
 several online examples could be found at: http://roniba.wix.com/brightness-react
 http://roniba.wix.com/brightness-react?petri_ovr=specs.RenderReact:true&ReactSource=http://127.0.0.1&baseVersion=http://127.0.0.1&debug=all&showMobileView=true
 */
define(['lodash', 'siteUtils', 'textCommon/utils/textTransforms'], function (_, siteUtils, textTransforms) {

    'use strict';

    describe('textTransforms', function () {
        beforeEach(function () {

            this.descend = function descend(element, lvl){
                if (lvl === undefined) {
                    lvl = 1;
                }
                if (lvl <= 0) {
                    return element;
                }
                return descend(element.children[0], lvl - 1);
            };

            this.addTextNode = function(element, params){
                if (params.text) {
                    return element.appendChild(window.document.createTextNode(params.text));
                }
                if (params.autoGenerateText){
                    return element.appendChild(window.document.createTextNode("auto-generated-text"));
                }
            };

            this.createElement = function createElement(params) {
                var docfrag = window.document.createDocumentFragment();
                var container = docfrag.appendChild(window.document.createElement('div'));
                if (params.elementHtml) {
                    container.innerHTML = params.elementHtml;
                    return container.children[0];

                }

                var element = container.appendChild(window.document.createElement(params.tag));
                _.forEach(params.classes, function(className){
                    element.classList.add(className);
                });
                _.forEach(params.style, function(value, key) {
                    element.style[key] = value;
                });
                _.forEach(params.children, function(child) {
                    element.appendChild(child);
                });

                this.addTextNode(element, params);
                return element;
            };

            this.getOptions = function getOptions(otherOptions){
                return _.assign({}, {
                    fontGetter: function(fontClass) {
                        switch (fontClass) {
                            case 'font_2':
                                return "normal normal normal 120px/1.4em Open+Sans {color_1}";

                            case 'font_3':
                                return "normal normal normal 32px/1.1em Arial {color_14}";
                        }
                    },
                    colorGetter: function(colorClass) {
                        switch (colorClass) {
                            case 'color_1':
                                return "#717070";

                            case 'color_4':
                                return "#343464";
                        }
                    },
                    scale: 1,
                    brightness: 1
                }, otherOptions);
            };

        });

        describe('setting font sizes', function () {
            beforeEach(function () {
                spyOn(siteUtils.mobileUtils, 'convertFontSizeToMobile').and.callFake(function(fontSize, scale){
                    return fontSize * (scale || 1);
                });
            });

            it('should preserve legacy behavior of not changing font size when scale is missing', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["font_2"]});
                var options = this.getOptions();
                delete options.scale;

                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('');
            });

            it('should not change font size when font size is unknown', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["font_10000"]});
                var options = this.getOptions();
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('');
            });

            it('should set font size according to theme', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["font_2"]});
                var options = this.getOptions();
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('120px');
            });

            it('should set font size according to style', function () {
                var originalElement = this.createElement({tag: 'h2', style: {'font-size': '16px'}});
                var options = this.getOptions();
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('16px');
            });

            it('should preserve the legacy behavior of not changing font sizes with floating point values', function () {
                var originalElement = this.createElement({tag: 'h2', style: {'font-size': '16.1px'}});
                var options = this.getOptions();
                textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                expect(siteUtils.mobileUtils.convertFontSizeToMobile).not.toHaveBeenCalled();
            });

            it('should set font size first according to own theme or style over parent theme and style', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ['font_2'], children: [
                    this.createElement({tag: 'span', classes: ['font_3'], children: [
                        this.createElement({tag: 'span', style: {'font-size': '16px'}, children: [
                            this.createElement({tag: 'span', style: {'font-size': '40px'}})
                        ]})
                    ]})
                ]});

                var options = this.getOptions();
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('120px');
                expect(this.descend(adjustedElement, 1).style['font-size']).toBe('32px');
                expect(this.descend(adjustedElement, 2).style['font-size']).toBe('16px');
                expect(this.descend(adjustedElement, 3).style['font-size']).toBe('40px');
            });

            it('should scale font size according to the scale property', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ['font_2']});
                var options = this.getOptions({scale: 1.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('180px');

                options = this.getOptions({scale: 0.5});
                adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style['font-size']).toBe('60px');
            });
        });

        describe('setting color', function () {
            it('should not set color if brightness property is missing', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["color_1"]});
                var options = this.getOptions();
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('');
            });

            it('should not set color if brightness property equals 1', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["color_1"]});
                var options = this.getOptions();
                delete options.brightness;
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('');
            });

            it('should not set color if no color definitions exist', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["color_10000"]});
                var options = this.getOptions();
                delete options.brightness;
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('');
            });

            it("should set color according to color theme", function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["color_1"]});
                var options = this.getOptions({brightness: 1.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(168, 168, 168)');
            });

            it("should set color according to style", function () {
                var originalElement = this.createElement({tag: 'h2', style: {color: 'rgb(113, 112, 112)'}});
                var options = this.getOptions({brightness: 1.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(168, 168, 168)');
            });

            it("should set color according to font theme", function () {
                var originalElement = this.createElement({tag: 'h2', classes: ['font_2']});
                var options = this.getOptions({brightness: 1.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(168, 168, 168)');
            });

            it("when both theme and style color exist go with the style color", function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["color_4"], style: {color: 'rgb(113, 112, 112)'}});
                var options = this.getOptions({brightness: 1.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(168, 168, 168)');
            });

            it("when no theme and style color exist fallback to parent", function () {
                var originalElement = this.createElement({tag: 'span', classes: ["color_4"], children: [
                    this.createElement({tag: 'span', style: {color: 'rgb(113, 112, 112)'}})
                ]});

                var options = this.getOptions({brightness: 1.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(78, 78, 152)');
                expect(this.descend(adjustedElement, 1).style.color).toBe('rgb(168, 168, 168)');
            });

            it("should set color according to brightness", function () {
                var originalElement = this.createElement({tag: 'h2', classes: ['font_2']});
                var options = this.getOptions({brightness: 1.2});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(135, 135, 135)');

                options = this.getOptions({brightness: 0.5});
                adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(56, 56, 56)');
            });

            it('should accepr text non standard rgba color- "r,g,b,a"', function () {
                function colorGetter() {
                    return "255,203,5,1";
                }

                var originalElement = this.createElement({tag: 'h2', classes: ["color_33"], autoGenerateText: true});
                var options = this.getOptions({brightness: 1.5, colorGetter: colorGetter});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(255, 232, 138)');
            });

            it('pure black text (#000000) should first converted to #121212 before adding the brightness', function () {
                var originalElement = this.createElement({tag: 'h2', classes: ["font_2"], style: {color: '#000000'}, autoGenerateText: true});
                var options = this.getOptions({brightness: 0.5});
                var adjustedHtml = textTransforms.applyMobileAdjustments(originalElement.parentElement.innerHTML, options);
                var adjustedElement = this.createElement({elementHtml: adjustedHtml});
                expect(adjustedElement.style.color).toBe('rgb(10, 10, 10)');
            });
        });
    });
});
