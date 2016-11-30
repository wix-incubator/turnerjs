describe('TextStylesHandler', function(){
    testRequire().
        classes('wysiwyg.editor.components.richtext.TextStylesHandler').
        resources('W.Theme', 'W.Css', 'W.Data');


    beforeEach(function(){
        this.handler = new this.TextStylesHandler();
        this.handler._viewer = {
            theme: self.W.Theme,
            css: self.W.Css
        };
    });

    describe("_getCssClassToTagsMap", function(){
        var compStylesMap = {
            'h1': {'seoTag': 's1', 'cssClass': 'testFont1'},
            'h2': {'seoTag': 's2', 'cssClass': 'testFont2'},
            'h3': {'seoTag': 's2', 'cssClass': 'testFont2'}
        };

        beforeEach(function(){
            this.Data.addDataItem('mockStylesMap', {'type': 'map', 'items': compStylesMap});
            this.handler._compStylesMap = this.Data.getDataByQuery('#mockStylesMap').get('items');
        });
        it("should return a map from css class to an array of tags", function(){
            var map = this.handler._getCssClassToTagsMap();
            expect(map.testFont1, JSON.stringify(map.testFont1)).toBeEquivalentTo(['h1']);
            expect(map.testFont2, JSON.stringify(map.testFont2)).toBeEquivalentTo(['h2', 'h3']);
        });

    });
    describe("_fontSelectorConverter", function(){
        var cssClassesToTagsMap = {
            'a': ['h1'],
            'b': ['h2', 'h3']
        };
        beforeEach(function(){
            this.handler._CssClassToTagsMap = cssClassesToTagsMap;
        });
        it("should create a selector containing the one tag in the map and the class", function(){
            var selector = this.handler._fontSelectorConverter('.a');
            expect(selector).toMatch('h1, .a');
        });
        it("should create a selector containing the two tag in the map and the class", function(){
            var selector = this.handler._fontSelectorConverter('.b');
            expect(selector).toMatch('h2,h3, .b');
        });
    });
    describe("_getColorsMap", function(){
        it("should return a map with the property name as keys if no prefix passed", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn(['color_0', 'color_1']);
            var map = this.handler._getColorsMap();
            expect(map.color_0).toBeDefined();
            expect(map.color_1).toBeDefined();
        });
        it("should ignore properties that their names don't start with color_", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn(['color_0', 'color_1', 'ignore']);
            var map = this.handler._getColorsMap();
            expect(map.color_0).toBeDefined();
            expect(map.color_1).toBeDefined();
            expect(map.ignore).toBeUndefined();
        });
        it("should return a map with the prefix + property name as keys if prefix passed", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn(['color_0', 'color_1']);
            var map = this.handler._getColorsMap('prefix_');
            expect(map.prefix_color_0).toBeDefined();
            expect(map.prefix_color_1).toBeDefined();
            expect(map.color_0).toBeUndefined();
        });
    });

    describe("_getThemePropertiesCss", function(){
        it("should return an empty string if there are no properties for the string", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn([]);
            var css = this.handler._getThemePropertiesCss('test');
            expect(css).toBe('');
        });
        it("should return a css string for fonts", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn(['font_0', 'font_1']);
            var css = this.handler._getThemePropertiesCss('font');
            expect(css).toMatch(/.font_0{.+?}.font_1{.+?}/gi);
        });
        it("should return a css string for colors, which will include both fore color and back color classes", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn(['color_0', 'color_1']);
            var css = this.handler._getThemePropertiesCss('color');
            expect(css).toMatch(/.color_0{.+?}.backcolor_0{.+?}.color_1{.+?}.backcolor_1{.+?}/gi);
        });
        it("should use the selector converter is passed", function(){
            spyOn(this.handler._viewer.theme, 'getPropertiesAccordingToType').andReturn(['font_0']);
            var css = this.handler._getThemePropertiesCss('font', function(selector){
                return 't_' + selector;
            });
            expect(css).toMatch(/t_.font_0{.+?}/gi);
        });
    });
});