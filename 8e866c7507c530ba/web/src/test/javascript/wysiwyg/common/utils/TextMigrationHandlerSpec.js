//describe('TextMigrationHandler', function(){
//    testRequire().
//        classes('wysiwyg.common.utils.TextMigrationHandler', 'core.utils.css.Font', 'core.utils.css.Color').
//        resources('W.Data', 'W.Theme', 'W.Preview');
//
//    var defaultLineHeight = '1em';
//    beforeEach(function(){
//        spyOn(this.W.Preview, 'getPreviewManagers').andReturn(this.W);
//        this._handler = new this.TextMigrationHandler();
//        this._stylesMap = this.W.Data.getDataByQuery('#CK_EDITOR_FONT_STYLES').get('items');
//    });
//
//    var createHtmlElement = function(tagName, innerHtml) {
//        var elem = document.createElement(tagName);
//        elem.innerHTML = innerHtml;
//        return elem;
//    };
//
//    var texts = ['a','b','c','d','e','f','g','h'];
//    function getStartingTagForStyle(scope, styleCssClass){
//        return '<{0} class="{1}" style="line-height: {2};"><span style="line-height: {2};">'.substitute([
//            scope._stylesMap[styleCssClass].seoTag,
//            styleCssClass,
//            defaultLineHeight
//        ]);
//    }
//    function getEndingTagForStyle(scope, styleCssClass){
//        return '</span></{0}>'.substitute([scope._stylesMap[styleCssClass].seoTag]);
//    }
//    var defaultTag = "hatul";
//    var defaultClass = "font_8";
//    var wrapTextWithDefaultTag = function(text){
//        return '<{0} class="{1}">{2}</{0}>'.substitute([defaultTag, defaultClass, text]);
//    };
//    describe("wrapping/changing blocks", function(){
//        beforeEach(function(){
//            var font =  new this.Font('normal normal normal 45px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            spyOn(this.W.Theme, 'getProperty').andReturn(font);
//        });
//
//        it("should change the block tag if changeable", function(){
//            var styleClass = 'font_0';
//            var before = '<{3}><{0} class="{1}">{2}</{0}></{3}>'.substitute(['span', styleClass ,texts[0],'p']);
//            var expected = getStartingTagForStyle(this, styleClass) + texts[0] + getEndingTagForStyle(this, styleClass);
//
//            var after = this._handler.migrateText(before);
//            //uncomment if you want to see it passing
////            after = after.replace('<p', '<h1').replace('/p', '/h1');
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should wrap a span with the correct block", function(){
//            var styleClass = 'font_0';
//            var before = '<{0} class="{1}">{2}</{0}>'.substitute(['span', styleClass ,texts[0]]);
//            var expected = getStartingTagForStyle(this, styleClass) + texts[0] + getEndingTagForStyle(this, styleClass);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should move inline style to block element while keeping the inline element style", function(){
//            var styleClass = 'font_0';
//            var colorClass = 'color_8'
//            var before = '<p><span class="font_0">b</span></p><p><{0} class="{1}"><{0} class="{2}">{3}</{0}></{0}></p>'.substitute(['span', styleClass , colorClass, texts[0]]);
//            var expected = getStartingTagForStyle(this, "font_0") + 'b' + getEndingTagForStyle(this, "font_0") + getStartingTagForStyle(this, styleClass) + '<{0} class="{2}">{3}</{0}>'.substitute(['span', styleClass , colorClass, texts[0]]) + getEndingTagForStyle(this, styleClass);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should wrap the inline contents of a non changeable block", function(){
//            var styleClass = 'font_0';
//            var unchangeableTag = 'address';
//            var before = '<{3}><{0} class="{1}">{2}</{0}></{3}>'.substitute(['span', styleClass ,texts[0],unchangeableTag, texts[1]]);
//            var expected = '<{0}>{1}{2}{3}</{0}>'.substitute([
//                unchangeableTag,
//                getStartingTagForStyle(this, styleClass),
//                texts[0],
//                getEndingTagForStyle(this, styleClass)
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should go inside a block that has both inline and block children", function(){
//            var styleClass = 'font_0';
//            var outerTag = 'div';
//            var before = '<{3}><{0} class="{1}">{2}</{0}><p><{0} class="{1}">{4}</{0}></p></{3}>'.substitute(['span', styleClass ,texts[0], outerTag, texts[1]]);
//            var expected = '<{0}>{1}{2}{3}{1}{4}{3}</{0}>'.substitute([
//                outerTag,
//                getStartingTagForStyle(this, styleClass),
//                texts[0],
//                getEndingTagForStyle(this, styleClass),
//                texts[1]
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should wrap text with a default tag and class no line height", function(){
//            var before = texts[0];
//            var expected = wrapTextWithDefaultTag(texts[0]);
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should wrap text and inline elements with default tag, no inline, replace style classes with full inline style (no delta)", function(){
//            spyOn(this._handler._stylesMigration._stylesHelper, 'getStyleDelta').andReturn({'font-size': '12px'});
//            var before = '{0}<{1} class="{2}">{3}</{1}>'.substitute([texts[0], 'span', 'font_0', texts[1]]);
//            //I was lazy so I removed the class but not the attribute. will fix it in the someday
//            var expected = wrapTextWithDefaultTag('{0}<{1} style="font-size: 12px; color: rgb(0, 0, 0);">{2}</{1}>'.substitute([
//                texts[0],
//                'span',
//                texts[1]
//            ]));
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//    });
//
//    describe("choosing the right style", function(){
//        var possibleFonts = ['font_0', 'font_2', 'font_8', 'font_1'];
//        beforeEach(function(){
//            var font0 =  new this.Font('normal normal normal 45px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            var font1 =  new this.Font('normal normal normal 0px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            var font2 =  new this.Font('normal normal normal 20px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            var font3 =  new this.Font('normal normal normal 70px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//
//            spyOn(this.W.Theme, 'getProperty').andCallFake(function(styleName){
//                switch (styleName){
//                    case possibleFonts[0]:
//                        return font0;
//                    case possibleFonts[1]:
//                        return font1;
//                    case possibleFonts[2]:
//                        return font2;
//                    case possibleFonts[3]:
//                        return font3;
//                }
//            });
//        });
//        it("should take the style that has more chars if one span per style", function(){
//            var before = '<p><{0} class="{1}">{3}</{0}><{0} class="{2}">{4}</{0}></p>'.substitute([
//                'span',possibleFonts[0], possibleFonts[1], texts[0] + texts[1], texts[0]]);
//            var expected = '{0}{1}<span style="{2}">{3}</span>{4}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                texts[0] + texts[1],
//                'font-size: 0px;',
//                texts[0],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should take the style that has more chars if few spans per style", function(){
//            var before = '<p><{0} class="{1}">{3}</{0}><{0} class="{2}">{4}</{0}><{0} class="{1}">{5}</{0}><{0} class="{2}">{6}</{0}></p>'.substitute([
//                'span',
//                possibleFonts[0],
//                possibleFonts[1],
//                texts[0],
//                texts[1],
//                texts[2],
//                texts[3] +texts[4]
//            ]);
//            var expected = '{0}<{1} style="{7}">{2}</{1}>{3}<{1} style="{7}">{4}</{1}>{5}{6}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[1]),
//                'span',
//                texts[0],
//                texts[1],
//                texts[2],
//                texts[3] +texts[4],
//                getEndingTagForStyle(this, possibleFonts[1]),
//                "font-size: 45px;"
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should take the style that has more chars if few spans per style, different order", function(){
//            var before = '<p><{0} class="{1}">{3}</{0}><{0} class="{2}">{4}</{0}><{0} class="{1}">{5}</{0}><{0} class="{2}">{6}</{0}></p>'.substitute([
//                'span',
//                possibleFonts[0],
//                possibleFonts[1],
//                texts[0],
//                texts[1]+ texts[4] + texts[3],
//                texts[2] + texts[1] + texts[2] + texts[3],
//                texts[3] + texts[3]+ texts[3]
//            ]);
//            var expected = '{0}<{1} style="{7}">{2}</{1}>{3}<{1} style="{7}">{4}</{1}>{5}{6}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[1]),
//                'span',
//                texts[0],
//                texts[1]+ texts[4]+ texts[3],
//                texts[2] + texts[1] + texts[2]+ texts[3],
//                texts[3] + texts[3]+ texts[3],
//                getEndingTagForStyle(this, possibleFonts[1]),
//                "font-size: 45px;"
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//        it("should look into other spans", function(){
//            var before = '<p><{0} style="font-size: 0px;"><{0} class="{1}">{2}</{0}></{0}></p>'.substitute([
//                'span', possibleFonts[0], texts[0]
//            ]);
//            var expected = '{0}<{1} style="font-size: 0px;">{2}</{1}>{3}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                'span', texts[0],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should choose the default style if there is any  unstyled text", function(){
//            var before = '<p><span style="font-size: 0px;">{0}</span></p>'.substitute([texts[0]]);
//            var expected = wrapTextWithDefaultTag('<span style="font-size: 0px;">{0}</span>'.substitute([texts[0]]));
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should choose the default style if there's an unstyled text inside a block", function(){
//            var before = '<p>{0}</p>'.substitute([texts[0]]);
//            var expected = wrapTextWithDefaultTag(texts[0]);
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should replace a deprecated style", function(){
//            //here we're spying on a non existing method
//            spyOn(this._handler._stylesMigration, "getReplacingStyle").andCallFake(function(styleName){
//                if(possibleFonts[3]){
//                    return possibleFonts[0]
//                }
//                return null;
//            });
//            var before = '<p><{0} class="{1}">{2}</{0}></p>'.substitute(['span', possibleFonts[3], texts[0]]);
//            var expected = '{0}<{1} style="{2}">{3}</{1}>{4}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                'span', 'font-size: 70px;', texts[0],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should add font size on the block if a deprecated style A is being replaced by style B and A is smaller than B", function(){
//            spyOn(this._handler._stylesMigration, '_isStyleDeprecated').andReturn(true);
//            spyOn(this._handler._stylesMigration, "getReplacingStyle").andCallFake(function(styleName){
//                if(possibleFonts[1]){
//                    return possibleFonts[0]
//                }
//                return null;
//            });
//            var before = '<p><{0} class="{1}">{2}</{0}></p>'.substitute(['span', possibleFonts[1], texts[0]]);
//            var expected = '<{0} class="{1}" style="{3} line-height: {2};"><span style="line-height: {2};"><{4} style="{3}">{5}</{4}></{4}></{0}>'.substitute([
//                this._stylesMap[possibleFonts[0]].seoTag,
//                possibleFonts[0],
//                defaultLineHeight,
//                "font-size: 0px;",
//                'span',
//                texts[0]
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//        it("should ignore non style classes", function(){
//            var someClass = "testClass";
//            var before = '<p><span class="{0}">{1}</span></p>'.substitute([someClass, texts[0]]);
//            var expected = wrapTextWithDefaultTag('<span class="{0}">{1}</span>'.substitute([someClass, texts[0]]));
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//    });
//
//    describe("nested styles", function(){
//        var possibleFonts = ['font_0', 'font_2', 'font_8'];
//        beforeEach(function(){
//            var font0 =  new this.Font('normal normal normal 45px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            var font1 =  new this.Font('normal normal normal 0px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            var font2 =  new this.Font('normal normal normal 20px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//
//            spyOn(this.W.Theme, 'getProperty').andCallFake(function(styleName){
//                switch (styleName){
//                    case possibleFonts[0]:
//                        return font0;
//                    case possibleFonts[1]:
//                        return font1;
//                    case possibleFonts[2]:
//                        return font2;
//                }
//            });
//        });
//
//        it("should flatten 1 level nested styles, with text before and after", function(){
//            var before = '<p><span class="{0}">{2}<span class="{1}">{3}</span>{4}</span></p>'.substitute([
//                possibleFonts[0], possibleFonts[1], texts[0], texts[1], texts[2]
//            ]);
//            var expected = '{0}{1}<span style="{2}">{3}</span>{4}{5}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                texts[0],
//                'font-size: 0px;',
//                texts[1],
//                texts[2],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//        it("should flatten 1 level nested styles, with no text before and after", function(){
//            var before = '<p><span class="{0}"><span class="{1}">{2}</span></span></p>'.substitute([
//                possibleFonts[0], possibleFonts[1], texts[0]
//            ]);
//            var expected = '{0}<span style="{1}"></span>{2}<span style="{1}"></span>{3}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[1]),
//                'font-size: 45px;',
//                texts[0],
//                getEndingTagForStyle(this, possibleFonts[1])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//        it("should flatten 1 level nested styles with more than 1 class", function(){
//            var before = '<p><span class="{0} test"><span class="test {1}">{2}</span></span></p>'.substitute([
//                possibleFonts[0], possibleFonts[1], texts[0]
//            ]);
//            var expected = '{0}<span class="test" style="{1}"></span><span class="test ">{2}</span><span class="test" style="{1}"></span>{3}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[1]),
//                'font-size: 45px;',
//                texts[0],
//                getEndingTagForStyle(this, possibleFonts[1])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//        it("should flatten few levels of nested styles", function(){
//            var before = '<p><span class="{0}">{3}<span class="{1}">{4}<span class="{2}">{5}</span>{6}</span></span></p>'.substitute([
//                possibleFonts[0], possibleFonts[1], possibleFonts[2], texts[0], texts[1], texts[2], texts[3]
//            ]);
//
//            var expected = '{0}<span style="{1}">{2}</span>{3}<span style="{4}">{5}</span>{6}<span style="{1}"></span>{7}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[1]),
//                'font-size: 45px;',
//                texts[0],
//                texts[1],
//                'font-size: 20px;',
//                texts[2],
//                texts[3],
//                getEndingTagForStyle(this, possibleFonts[1])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//        it("should flatten more than one nested style (same level)", function(){
//            var before = '<p><span class="{0}">{1}<span class="{2}">{3}</span>{4}<span class="{5}">{6}</span>{7}</span></p>'.substitute([
//                possibleFonts[0], texts[0], possibleFonts[1], texts[1], texts[2], possibleFonts[2], texts[3], texts[4]
//            ]);
//
//            var expected = '{0}{1}<span style="{2}">{3}</span>{4}<span style="{5}">{6}</span>{7}{8}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                texts[0],
//                'font-size: 0px;',
//                texts[1],
//                texts[2],
//                'font-size: 20px;',
//                texts[3],
//                texts[4],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should preserve other nested tags", function(){
//            var before = '<p><span class="{0}"><span style="color: red;">1<span class="{1}">{2}2222</span>1</span></span></p>'.substitute([
//                possibleFonts[0], possibleFonts[1], texts[0]
//            ]);
//            var expected = '{0}<span style="{1}"><span style="color: red;">1</span></span><span style="color: red;">{2}</span><span style="{1}"><span style="color: red;">1</span></span>{3}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[1]),
//                'font-size: 45px;',
//                texts[0] + '2222',
//                getEndingTagForStyle(this, possibleFonts[1])
//            ]);
//
//            var after = this._handler.migrateText(before);
//
//            expect(after).toEqual(expected);
//        });
//    });
//
//    //this is a test for a specific method, since it's a fallback I don't know what is the case that we actually get there
//    describe("_verifyNoStyledSpans", function(){
//        var possibleFonts = ['font_0', 'font_2', 'font_8'];
//                beforeEach(function(){
//                    var font0 =  new this.Font('normal normal normal 45px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//                    var font1 =  new this.Font('normal normal normal 0px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//                    var font2 =  new this.Font('normal normal normal 20px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//
//                    spyOn(this.W.Theme, 'getProperty').andCallFake(function(styleName){
//                        switch (styleName){
//                            case possibleFonts[0]:
//                                return font0;
//                            case possibleFonts[1]:
//                                return font1;
//                            case possibleFonts[2]:
//                                return font2;
//                        }
//                    });
//                });
//        it("should replace style classes with inline style", function(){
//            var before = '{0}{1}<span class="{2}">{3}<span class="{2}">{4}</span></span><span class="{2}">{5}</span>{6}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                texts[0],
//                possibleFonts[1],
//                texts[1], texts[2], texts[3],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//            var beforeElement = new Element('div').set('html', before);
//            var expected = '{0}{1}<span style="{2}">{3}<span style="{2}">{4}</span></span><span style="{2}">{5}</span>{6}'.substitute([
//                getStartingTagForStyle(this, possibleFonts[0]),
//                texts[0],
//                'font-size: 0px;',
//                texts[1], texts[2], texts[3],
//                getEndingTagForStyle(this, possibleFonts[0])
//            ]);
//
//            this._handler._stylesMigration._verifyNoStyledSpans(beforeElement.getFirst(), possibleFonts[0]);
//            var after = beforeElement.innerHTML;
//
//            expect(after).toEqual(expected);
//        });
//
//        it("should replace style classes with inline style when the block style is default", function(){
//            spyOn(this._handler._stylesMigration._stylesHelper, 'getStyleDelta').andReturn({'font-size': '12px'});
//
//            var before = wrapTextWithDefaultTag('{0}<span class="{1}">{2}<span class="{1}">{3}</span></span><span class="{1}">{4}</span>'.substitute([
//                texts[0],
//                possibleFonts[1],
//                texts[1], texts[2], texts[3]
//            ]));
//            var beforeElement = new Element('div').set('html', before);
//            var expected = wrapTextWithDefaultTag('{0}<span style="{1}">{2}<span style="{1}">{3}</span></span><span style="{1}">{4}</span>'.substitute([
//                texts[0],
//                'font-size: 12px; color: rgb(0, 0, 0);',
//                texts[1], texts[2], texts[3]
//            ]));
//
//            this._handler._stylesMigration._verifyNoStyledSpans(beforeElement.getFirst(), null);
//            var after = beforeElement.innerHTML;
//
//            expect(after).toEqual(expected);
//        });
//    });
//
//    describe("color inline overrides of style", function(){
//        beforeEach(function(){
//            this.possibleFonts = ['font_0', 'font_2'];
//            this.beforeString = '<p><{0} class="{1}">{3}</{0}><{0} class="{2}">{4}</{0}></p>'.substitute([
//                'span',
//                this.possibleFonts[0],
//                this.possibleFonts[1],
//                texts[0] + texts[1],
//                texts[0]
//            ]);
//
//            this.font0 =  new this.Font('normal normal normal 0px/'+ defaultLineHeight+' Ariel {color_14}', this.W.Theme);
//            this.font2 =  new this.Font('normal normal normal 0px/'+ defaultLineHeight+' Ariel {color_15}', this.W.Theme);
//
//
//            var self = this;
//            spyOn(this.W.Theme, 'getProperty').andCallFake(function(styleName){
//                switch (styleName){
//                    case self.possibleFonts[0]:
//                        return self.font0;
//                    case self.possibleFonts[1]:
//                        return self.font2;
//                    case 'color_14':
//                        return new this.Color(0,0,0,0);
//                    case 'color_15':
//                        return new this.Color(1,0,0,0);
//                }
//            });
//        });
//        it("should set color override as class if both styles has color refs", function(){
//            var expected = '{0}{1}<span class="{2}">{3}</span>{4}'.substitute([
//                getStartingTagForStyle(this, this.possibleFonts[0]),
//                texts[0] + texts[1],
//                'color_15',
//                texts[0],
//                getEndingTagForStyle(this, this.possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(this.beforeString);
//
//            expect(after).toBe(expected);
//        });
//        it("should set color override as style block has ref color and element inline", function(){
//            this.font2.setColor('#000000');
//
//            var expected = '{0}{1}<span style="{2}">{3}</span>{4}'.substitute([
//                getStartingTagForStyle(this, this.possibleFonts[0]),
//                texts[0] + texts[1],
//                'color: rgb(0, 0, 0);',
//                texts[0],
//                getEndingTagForStyle(this, this.possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(this.beforeString);
//
//            expect(after).toBe(expected);
//        });
//        it("should set color override as style if both have custom colors, but different", function(){
//            this.font2.setColor('#000000');
//            this.font0.setColor('#00000F');
//
//            var expected = '{0}{1}<span style="{2}">{3}</span>{4}'.substitute([
//                getStartingTagForStyle(this, this.possibleFonts[0]),
//                texts[0] + texts[1],
//                'color: rgb(0, 0, 0);',
//                texts[0],
//                getEndingTagForStyle(this, this.possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(this.beforeString);
//
//            expect(after).toBe(expected);
//        });
//        it("should set color override as class if block has a ref color but element custom", function(){
//            this.font0.setColor('#000000');
//
//            var expected = '{0}{1}<span class="{2}">{3}</span>{4}'.substitute([
//                getStartingTagForStyle(this, this.possibleFonts[0]),
//                texts[0] + texts[1],
//                'color_15',
//                texts[0],
//                getEndingTagForStyle(this, this.possibleFonts[0])
//            ]);
//
//            var after = this._handler.migrateText(this.beforeString);
//
//            expect(after).toBe(expected);
//        });
//    });
//
//    describe("text nodes, whether empty or not", function(){
//
//        it("should wrap english chars with default tag", function(){
//            var before = texts[0];
//            var expected = wrapTextWithDefaultTag(texts[0]);
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//        it("should wrap special chars with default tag", function(){
//            var before = '@~';
//            var expected = wrapTextWithDefaultTag('@~');
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//        it("should wrap text that includes invisible char with default tag", function(){
//            var before = 'b\na';
//            var expected = wrapTextWithDefaultTag('b\na');
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//        it("should wrap text that starts with invisible char with default tag", function(){
//            var before = '\na';
//            var expected = wrapTextWithDefaultTag('\na');
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//        it("shouldn't wrap \\n ", function(){
//            var before = '\n';
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(before);
//        });
//        it("shouldn't wrap \\t", function(){
//            var before = '\t';
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(before);
//        });
//
//        it("shouldn't wrap &nbsp", function(){
//            var before = '&nbsp;';
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(before);
//        });
//        it("shouldn't wrap \\n\\t", function(){
//            var before = '\n\t';
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(before);
//        });
//        it("paragraph and whitespace text, should change the paragraph but not touch the text", function(){
//            var before = "<p>\n\t<span>a</span></p>\n";
//
//            var expected = wrapTextWithDefaultTag("\n\t<span>a</span>") + '\n';
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual(expected);
//        });
//    });
//
//    describe("simple style changes", function(){
//        it("should change bold class to strong tag", function(){
//            var before = '<span class="bold">a</span>';
//            var expected = wrapTextWithDefaultTag('<strong>a</strong>');
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should change italic class to em tag", function(){
//            var before = '<span class="italic">a</span>';
//            var expected = wrapTextWithDefaultTag('<em>a</em>');
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should change underline class to u tag", function(){
//            var before = '<span class="underline">a</span>';
//            var expected = wrapTextWithDefaultTag('<u>a</u>');
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should leave color class as is", function(){
//            var before = '<span class="color_18">a</span>';
//            var expected = wrapTextWithDefaultTag('<span class="color_18">a</span>');
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should change align right class to inline style", function(){
//            var before = '<p class="alignRight">a</p>';
//            var expected = '<{0} class="{1}" style="text-align: right;">a</{0}>'.substitute([defaultTag, defaultClass]);
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should change align center class to inline style", function(){
//            var before = '<p class="alignCenter">a</p>';
//            var expected = '<{0} class="{1}" style="text-align: center;">a</{0}>'.substitute([defaultTag, defaultClass]);
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should add to each unstyled ul element the default class", function(){
//            var before = '<ul class="font_7" style="line-height: 1.2em;"><li><ul><li><p class="font_7"><span style="line-height: 1.2em;">sdfsdg</span></p></li></ul></li></ul>';
//            var expected = '<ul class="font_7" style="line-height: 1.2em;"><li><ul class="font_100"><li><p class="font_7"><span style="line-height: 1.2em;">sdfsdg</span></p></li></ul></li></ul>';
//            var after = this._handler.migrateText(before);
//            expect(after).toEqual(expected);
//        });
//        it("should add to each unstyled ol element the default class", function(){
//            var before = '<ol><li><span class="font_8">Molecules and ions</span></li></ol>';
//            var expected = '<ol class="font_100"><li><p class="font_8" style="line-height: 1.3em;"><span style="line-height: 1.3em;">Molecules and ions</span></p></li></ol>';
//            var after = this._handler.migrateText(before);
//            expect(after).toEqual(expected);
//        });
//        it("should change justify class to inline style", function(){
//            var before = '<p class="alignJustify">a</p>';
//            var expected = '<{0} class="{1}" style="text-align: justify;">a</{0}>'.substitute([defaultTag, defaultClass]);
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//        it("should leave dir='rtl' as is", function(){
//            var before = '<p dir="rtl">a</p>';
//            var expected = '<{0} dir="rtl" class="{1}">a</{0}>'.substitute([defaultTag, defaultClass]);
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//
//        it("should change align class to inline style on styled blocks as well", function(){
//            var font =  new this.Font('normal normal normal 45px/'+ defaultLineHeight+' "Open Sans","sans-serif" color_14', this.W.Theme);
//            spyOn(this.W.Theme, 'getProperty').andReturn(font);
//            var styleCssClass = 'font_6';
//
//            var before = '<p class="alignRight"><span class="' + styleCssClass + '">a</span></p>';
//            var expected = '<{0} class="{1}" style="line-height: {2}; text-align: right;"><span style="line-height: {2};">a</span></{0}>'.substitute([
//                this._stylesMap[styleCssClass].seoTag,
//                styleCssClass,
//                defaultLineHeight
//            ]);
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//            expect(after).toEqual(expected);
//        });
//    });
//
//    xdescribe("compilations", function(){
//        it("real life 1", function(){
//            var before = '<p>' +
//                '<span>Do yo<span class="font_1">a</span><span class="font_2">b</span><span class="font_1">c</span>' +
//                '<span class="italic"> d</span><span class="font_4">t</span><span class="font_7"> t</span><span class="italic">e</span>' +
//                '<span class="underline"><span class="italic">,</span> \'</span><span class="font_6">r<span class="color_33"> s</span></span>' +
//                '<span class="underline"><span class="color_33">S</span>.</span></span></p>'+
//                '<ul>'+
//                '<li>'+
//                '<span class="font_0"><span>Say w<span class="color_29">h</span>at again.</span></span></li>'+
//                '<li>'+
//                '<span class="italic"><span class="underline"><span class="bold"><span>d</span></span></span></span></li>'+
//                '<li>'+
//                '<span class="font_6"><span>I dare you,</span></span></li>'+
//                '<li>'+
//                '<span class="italic"><span class="bold"><span>I</span></span></span><span class="font_8"><span> double dare y</span></span><span class="italic"><span class="bold"><span>ou motherfucker,</span></span></span></li>'+
//                '<li>'+
//                '<span class="italic"><span class="underline"><span>say what one more Goddamn time!</span></span></span></li>'+
//                '</ul>'+
//                '<p>'+
//                '<span>d<span class="color_19">e</span>f</span></p>'+
//                '<p>'+
//                '<span></span></p>'+
//                '<p class="alignCenter" style="">'+
//                '<span class="font_3"><span>lalalala</span></span></p>'+
//                '<p class="alignCenter" style="">'+
//                '<span></span></p>'+
//                '<p class="alignRight">'+
//                '<span class="font_6"><span>Tralalala</span></span></p>';
//
//            var after = this._handler.migrateText(before, defaultTag, defaultClass);
//
//            expect(after).toEqual('');
//        });
//
//    });
//
//});