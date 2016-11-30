define(['lodash', 'definition!skintest'], function(_, SkintestDefinition){
	'use strict';

    var skinData, skintest, skins;

    function onLoad(val){
        skinData = val;
    }

    function setSkinCssRules(rulesObj){
        _.merge(skins.skins.mockskin.css, rulesObj);
    }

    function mockSkinCssAndLoad(rulesObj){
        setSkinCssRules(rulesObj);
        skintest.load('mockskin');
    }

		describe('', function(){
    beforeEach(function(){
        skins = {skins: {'mockskin': {css: {}}}};
        skintest = new SkintestDefinition(_, skins);
        skintest.load = _.partialRight(skintest.load, function require(){}, onLoad);
    });
    describe('skintest loader plugin', function(){
        it('should have a valid definition', function(){
            expect(skintest).not.toBeUndefined();
        });

        it('should be a requirejs plugin', function(){
            expect(skintest.load).toBeDefined();
            expect(typeof skintest.load).toBe('function');
        });
    });
    describe("the css data returned from using the skintest!skinName loader", function(){
        it("should retrieve the skin data from the skins.json", function(){
            skintest.load('mockskin');
            expect(skinData.css).toBeDefined();
        });
        it("should convert class selectors", function(){
            mockSkinCssAndLoad({
                '%_someClass' : 'position:absolute;left:200px;'
            });
            skintest.load('mockskin');
            expect(skinData.css['.someClass']).toEqual({
                'position' : 'absolute',
                'left' : '200px'
            });
        });
        describe(":host should be converted", function(){
            it("from % to host", function(){
                mockSkinCssAndLoad({
                    '%' : 'position:absolute;left:200px;'
                });
                skintest.load('mockskin');
                expect(skinData.css[':host']).toEqual({
                    'position' : 'absolute',
                    'left' : '200px'
                });
            });

            it("also if followed by a colon, %:", function(){
                mockSkinCssAndLoad({
                    '%:' : 'position:absolute;left:200px;'
                });
                skintest.load('mockskin');
                expect(skinData.css[':host:']).toEqual({
                    'position' : 'absolute',
                    'left' : '200px'
                });
            });

            it("but not if it's followed by something else", function(){
                mockSkinCssAndLoad({
                    '%#' : 'position:absolute;left:200px;'
                });
                skintest.load('mockskin');
                expect(skinData.css[':host:']).not.toEqual({
                    'position' : 'absolute',
                    'left' : '200px'
                });
            });
        });
        it("should convert attribute selectors", function(){
            mockSkinCssAndLoad({
                '%[data-state~="abc"]' : 'position:absolute;left:200px;'
            });
            skintest.load('mockskin');
            expect(skinData.css["[data-state~=\"abc\"]"]).toEqual({
                'position' : 'absolute',
                'left' : '200px'
            });
        });
        it("should convert ID selectors", function(){
            mockSkinCssAndLoad({
                '%someID' : 'position:absolute;left:200px;'
            });
            skintest.load('mockskin');
            expect(skinData.css["#someID"]).toEqual({
                'position' : 'absolute',
                'left' : '200px'
            });
        });

    });
		});
});
