describe("wixParser", function(){

    var editor;

    beforeEach(function(){
        if(!editor){
            var loaded = false;
            var ready = false;
            waitsFor(function(){
                return CKEDITOR && CKEDITOR.on;
            }, "initial ckeditor load", 500);

            runs(function(){
                CKEDITOR.on('loaded', function(){
                    loaded = true;
                }, this);
            });
            waitsFor(function(){
                return loaded;
            }, "ckeditor load", 3000);

            runs(function(){
                editor = CKEDITOR.replace("testArea", {
                    customConfig: 'my/myConfig.js'
                });
                editor.on('instanceReady', function(){
                    ready = true;
                }, this);
            });
            waitsFor(function(){
                return ready;
            }, "for ck editor to be ready", 5000);
        }
    });
    function getHtml(editorIns){
        editorIns = editorIns || editor;
        return editorIns.editable().$.innerHTML.toLowerCase();
    }

    function getHtmlSpecificElement(elementId, editorIns){
        var html = getHtml(editorIns);
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.getElementById(elementId);
    }

    function setData(data, editorIns){
        editorIns = editorIns || editor;
        var ready = false;

        editorIns.setData(data, function(){
            ready = true;
        }, false);

        waitsFor(function(){
            return ready;
        }, "data ready", 200);
    }

    function setHtml(html, editorIns){
        editorIns = editorIns || editor;
        return editorIns.editable().$.innerHTML = html;
    }

    function getData(editorIns){
        editorIns = editorIns || editor;
        return editorIns.getData().replace(/\n/g, '');
    }

    describe("initialization", function(){
        //you cannot set plait text without a wrapping node at this point, it will try to wrap it
        it("should not change plain text on set", function(){
            setData("<p>asdf asdf</p>");
            runs(function(){
                expect(getHtml()).toBe("<p>asdf asdf</p>");
            });
        });

        it("should not change plain text on get", function(){
            setData("<p>a</p>");
            runs(function(){
                expect(editor.getData()).toMatch("<p>a</p>");
            });
        });

        it("should set the correct styles maps", function(){
            editor.config.stylesMap = {
                'h1': {'cssClass': 'a', 'seoTag': 'p'},
                'h2': {'cssClass': 'b', 'seoTag': 'p'},
                'h3': {'cssClass': 'c', 'seoTag': 'div'}
            };
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
            var maps = editor.config.wixParser;
            expect(maps.editorTagsToWysTagAndClass).toBeEquivalentTo(editor.config.stylesMap);
            expect(maps.wysTagToWysClassToEditorTag, JSON.stringify(maps.wysTagToWysClassToEditorTag)).toBeEquivalentTo({
                'p':{
                    'a': 'h1',
                    'b': 'h2'
                } ,
                'div': {
                    'c': 'h3'
                }
            });
        });

        it("should really update the maps each time", function(){
            editor.config.stylesMap = {'h1': {'cssClass': 'a', 'seoTag': 'p'}};
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);

            setData('<p class="a">a</p>');

            runs(function(){
                expect(getHtml()).toMatch('<h1>a</h1>');

                editor.config.stylesMap = {'h2': {'cssClass': 'a', 'seoTag': 'p'}};
                CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);

                setData('<p class="a">a</p>');
            });

            runs(function(){
                expect(getHtml()).toMatch('<h2>a</h2>');
            });
        });
    });

    describe("font styles, tags to classes", function(){
        var stylesMap = {
            'h1': {'cssClass': 'font_0', 'seoTag': 'center'},
            'h2': {'cssClass': 'font_1', 'seoTag': 'div'},
            'h3': {'cssClass': 'font_2', 'seoTag': 'pre'},
            'h4': {'cssClass': 'font_3', 'seoTag': 'header'},
            'h5': {'cssClass': 'font_4', 'seoTag': 'section'},
            'h6': {'cssClass': 'font_5', 'seoTag': 'article'},
            'address': {'cssClass': 'font_6', 'seoTag': 'footer'},
            'p': {'cssClass': 'font_7', 'seoTag': 'blockquote'}
        };

        beforeEach(function(){
            editor.config.stylesMap = stylesMap;
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
        });

        describe("on set data", function(){
            it("should convert wys tag and class the right tag", function(){
                setData('<{0} class="{1}">a</{0}>'.substitute([stylesMap.h1.seoTag, stylesMap.h1.cssClass]));
                runs(function(){
                    expect(getHtml()).toMatch('<h1>a</h1>');
                });
            });
            it("should convert a few paragraphs with wys tag and class to the right tags", function(){
                setData('<{0} class="{1}">a</{0}><{2} class="{3}">b</{2}><{4} class="{5}">c</{4}>'.substitute([
                    stylesMap.h1.seoTag, stylesMap.h1.cssClass, stylesMap.p.seoTag, stylesMap.p.cssClass, stylesMap.h2.seoTag, stylesMap.h2.cssClass]));
                runs(function(){
                    expect(getHtml()).toMatch('<h1>a</h1><p>b</p><h2>c</h2>');
                });
            });
            it("should ignore non block tags ", function(){
                setData('<p><span class="font_0">b</span></p>');
                runs(function(){
                    expect(getHtml()).toMatch('<p><span class="font_0">b</span></p>');
                });
            });
            it("should ignore block tags which aren't in the stylesMap", function(){
                setData('<blockquote class="font_0">b</blockquote>');
                runs(function(){
                    expect(getHtml()).toMatch('<blockquote class="font_0">b</blockquote>');
                });
            });
            it("should ignore classes which aren't in the stylesMap", function(){
                setData('<p class="nono">b</p>');
                runs(function(){
                    expect(getHtml()).toMatch('<p class="nono">b</p>');
                });
            });
            it("should convert some of the tags and leave some of the tags", function(){
                setData('<{0} class="{1}">a</{0}><blockquote class="font_3">b</blockquote>'.substitute([stylesMap.h1.seoTag, stylesMap.h1.cssClass]));
                runs(function(){
                    expect(getHtml()).toMatch('<h1>a</h1><blockquote class="font_3">b</blockquote>');
                });
            });
        });

        describe("on get data", function(){
            it("it should convert block tag to wys tag and class", function(){
                setHtml('<h1>a</h1>');
                expect(getData()).toMatch('<{0} class="{1}">a</{0}>'.substitute([stylesMap.h1.seoTag, stylesMap.h1.cssClass]));
            });
            it("should convert multiple block tags to wys tags and classes", function(){
                setHtml('<h1>a</h1><p>b</p><h6>c</h6>');
                expect(getData()).toMatch('<{0} class="{1}">a</{0}><{2} class="{3}">b</{2}><{4} class="{5}">c</{4}>'.substitute([
                    stylesMap.h1.seoTag, stylesMap.h1.cssClass, stylesMap.p.seoTag, stylesMap.p.cssClass, stylesMap.h6.seoTag, stylesMap.h6.cssClass
                ]));
            });
            it("should ignore block tags not in list", function(){
                setHtml('<div>a</div>');
                expect(getData()).toMatch('<div>a</div>');
            });
            it("should convert some of the tags and leave some of the tags", function(){
                setHtml('<h1>a</h1><div>b</div><h6>c</h6>');
                expect(getData()).toMatch('<{0} class="{1}">a</{0}><div>b</div><{2} class="{3}">c</{2}>'.substitute([
                    stylesMap.h1.seoTag, stylesMap.h1.cssClass, stylesMap.h6.seoTag, stylesMap.h6.cssClass
                ]));
            });
            it("should not change the html in the editor", function(){
                setHtml('<h1>a</h1>');
                getData();
                expect(getHtml()).toMatch('<h1>a</h1>');
            });
        });
    });

    describe("colors", function(){
        var colorsMap = {
            'c1': '#ff0000',
            'c2': '#00ff00',
            'c3': '#0000ff'
        };
        var bgColorsMap = {
            'b1': '#ff0000',
            'b2': '#00ff00',
            'b3': '#0000ff'
        };
        beforeEach(function(){
            editor.config.colorsMap = colorsMap;
            editor.config.bgColorsMap = bgColorsMap;
            editor.config.stylesMap = {};
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
        });

        describe("on set data", function(){
            it("should convert a span with a color class to a span with font color style", function(){
                setData('<p><span class="c1" id="test">a</span></p>');
                runs(function(){
                    var element = getHtmlSpecificElement('test');
                    expect( element.getStyle('color')).toMatch(colorsMap.c1);
                    expect(element.getAttribute('class')).toBeNull();
                });
            });
            //support only spans at this point
            xit("should convert a p with a color class to a p with font color style", function(){
                setData('<p class="c1">a</p>');
                runs(function(){
                    expect(getHtml()).toMatch('<p style="{0}">a</p>'.substitute([colorsMap.c1]));
                });
            });
            it("should convert a span multiple classes among which a color class to a span with font color style", function(){
                setData('<p><span class="aa c1 bb" id="test">a</span></p>');
                runs(function(){
                    var element = getHtmlSpecificElement('test');
                    expect(element.getStyle('color')).toBe(colorsMap.c1);
                    expect(element.getAttribute('class')).toBe("aa bb");
                });
            });
            it("should add the color style to existing styles", function(){
                setData('<p><span style="padding: 3px" class="c1" id="test">a</span></p>');
                runs(function(){
                    var element = getHtmlSpecificElement('test');
                    expect( element.getStyle('color')).toMatch(colorsMap.c1);
                    expect( element.getStyle('padding')).toMatch('3px');
                });
            });
            it("should convert a span which has both color and bg color class", function(){
                setData('<p><span class="c1 b2" id="test">aa</span></p>');
                runs(function(){
                    var element = getHtmlSpecificElement('test');
                    expect( element.getStyle('color')).toMatch(colorsMap.c1);
                    expect( element.getStyle('background-color')).toMatch(colorsMap.b1);
                    expect(element.getAttribute('class')).toBeNull();
                });
            });
        });

        describe("on get data", function(){
            it("should add correct class to a span with a color existing in map", function(){
                setHtml('<p><span style="color: {0}">a</span></p>'.substitute([colorsMap.c1]));
                expect(getData()).toMatch('<p><span class="c1">a</span></p>');
            });
            it("should ignore colors that aren't in map", function(){
                setHtml('<p><span style="color: #123456">a</span></p>');
                expect(getData()).toMatch('<p><span style="color: #123456">a</span></p>');
            });
            it("should add both color and bg color classes and remove style for a span that has both color and bg color styles", function(){
                setHtml('<p><span style="color: {0};background-color: {1}">a</span></p>'.substitute([colorsMap.c1, bgColorsMap.b2]));
                expect(getData()).toMatch('<p><span class="c1 b2">a</span></p>');
            });
            it("should ignore case in style value", function(){
                editor.config.bgColorsMap.b2 = bgColorsMap.b2.toUpperCase();
                CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
                setHtml('<p><span style="color: {0};background-color: {1}">a</span></p>'.substitute([colorsMap.c1.toLowerCase(), bgColorsMap.b2.toUpperCase()]));
                expect(getData()).toMatch('<p><span class="c1 b2">a</span></p>');
            });
            it("should accept colors in rgb as well", function(){
                editor.config.colorsMap.c1 = colorsMap.c1.toUpperCase();
                CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
                setHtml('<p><span style="color: {0};background-color: {1}">a</span></p>'.substitute([colorsMap.c1.hexToRgb(), bgColorsMap.b2.hexToRgb()]));
                expect(getData()).toMatch('<p><span class="c1 b2">a</span></p>');
            });
            it("should ignore case if getStyle returns wrong case", function(){

            });
        })
    });

    describe("nested tags", function(){
        var colorsMap = {
            'c1': '#ff0000',
            'c2': '#00ff00',
            'c3': '#0000ff'
        };
        var stylesMap = {
            'h1': {'cssClass': 'font_0', 'seoTag': 'center'},
            'h2': {'cssClass': 'font_1', 'seoTag': 'div'},
            'h3': {'cssClass': 'font_2', 'seoTag': 'pre'}
        };
        beforeEach(function(){
            editor.config.colorsMap = colorsMap;
            editor.config.stylesMap = stylesMap;
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
        });
        it("should work on set data", function(){
            setData('<{0} id="test1" class="{1}">aa<span id="test2" class="c1">bb</span></{0}><p id="ttt"><span class="c2">gg</span></p>'.substitute([
                stylesMap.h1.seoTag, stylesMap.h1.cssClass
            ]));
            runs(function(){
                var el1 = getHtmlSpecificElement('test1');
                expect(el1.tagName.toLowerCase()).toBe('h1');
                expect(el1.getAttribute('class')).toBeNull();
                expect(el1.innerText).toBe('aabb');

                var el = getHtmlSpecificElement('test2');
                expect(el.getAttribute('class')).toBeNull();
                expect(el.getStyle('color')).toBe(colorsMap.c1);

                expect(getHtmlSpecificElement('ttt')).toBeDefined();

            });
        });

    });

    describe('multiple editors', function(){
        var editor2;
        beforeEach(function(){
            if(!editor2){
                var ready = false;
                runs(function(){
                    editor2 = CKEDITOR.replace("testArea2", {
                        customConfig: 'my/myConfig.js'
                    });
                    editor2.on('instanceReady', function(){
                        ready = true;
                    }, this);
                });
                waitsFor(function(){
                    return ready;
                }, "for ck editor to be ready", 5000);
            }
        });
        it("should load both editors", function(){
            expect(editor).toBeDefined();
            expect(editor2).toBeDefined();
        });

        it("should not change the config of second editor when first is changed", function(){
            var editor2Config = editor2.config.stylesMap;
            editor.config.stylesMap = {'h1': 'aaaa'};
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);

            expect(editor2.config.stylesMap).toBe(editor2Config);
        });

        it("should not change the data of the second editor when data is set to the first editor", function(){
            editor.config.stylesMap = {'h1': 'cc'};
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);

            setData('<p class="cc">aa</p>', editor);

            runs(function(){
                expect(getHtml(editor2)).toBe("");
            });
        });
        it("should convert the data on set according to each styles map", function(){
            editor.config.stylesMap = {'h1': {'cssClass': 'cc', 'seoTag': 'p'}} ;
            CKEDITOR.plugins.wixParser.resetTheMaps(editor.config);
            editor2.config.stylesMap = {'h2': {'cssClass': 'cc', 'seoTag': 'p'}};
            CKEDITOR.plugins.wixParser.resetTheMaps(editor2.config);

            setData('<p class="cc">aa</p>', editor);
            runs(function(){
                setData('<p class="cc">aa</p>', editor2);
            });

            runs(function(){
                expect(getHtml(editor)).toBe('<h1>aa</h1>');
                expect(getHtml(editor2)).toBe('<h2>aa</h2>');
            });
        });
        it("should not affect the second editor when getting (and converting back) the data of the first", function(){
            setHtml('<p>aa</p>', editor);
            setHtml('<p>bb</p>', editor2);

            getData(editor);

            expect(getHtml(editor2)).toBe('<p>bb</p>');
        });

    });

});