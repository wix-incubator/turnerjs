define(['lodash', 'react', 'skins'], function (_, React, skins) {
    'use strict';

    describe("skins renderer", function () {
        var skinsRenderer = skins.skinsRenderer;

        describe("creating CSS skin", function () {
            var skinData, styleProps, themeData, styleId, mobileData;

            function css() {
                return skinsRenderer.createSkinCss(skinData, styleProps, themeData, styleId, mobileData, {scriptsLocationMap: {skins: '//static.example.com/'}});
            }

            beforeEach(function () {
                skinData = {
                    "react": [],
                    "exports": {},
                    "params": {},
                    "paramsDefaults": {},
                    "paramsMutators": {},
                    "mediaQueries": [],
                    "css": {}
                };

                styleProps = {};

                themeData = {
                    "id": "THEME_DATA",
                    "type": "WFlatTheme",
                    "metaData": {
                        "schemaVersion": "1.0"
                    },
                    "siteBg": "none 0 0 center center auto no-repeat no-repeat scroll transparent",
                    "mobileBg": "none 0 0 center center auto no-repeat no-repeat scroll transparent",
                    "color": [],
                    "font": [],
                    "border": [],
                    "padding1": "0 0 0 0",
                    "padding2": "0 0 0 0",
                    "padding3": "0 0 0 0",
                    "iconSize": "3.2",
                    "bulletSize": "1.5",
                    "headerSpacing": "2.25em",
                    "componentSpacing": "0.45em",
                    "itemSpacing": "0.75em",
                    "thumbSpacing": "0.23em",
                    "iconSpacing": "0.75em",
                    "themePresets": {
                        "mobileBg": true
                    },
                    "THEME_DIRECTORY": "photography",
                    "BG_DIRECTORY": "photography",
                    "CONTACT_DIRECTORY": "photography/contact",
                    "NETWORKS_DIRECTORY": "photography/network",
                    "EXTERNAL_LINKS_DIRECTORY": "photography/external",
                    "PAGES_DIRECTORY": "photography/pages",
                    "WEB_THEME_DIRECTORY": "viewer",
                    "BASE_THEME_DIRECTORY": "base"
                };

                styleId = "s0";

                mobileData = {
                    "requestModel": {
                        "userAgent": "test browser",
                        "cookie": "",
                        "localStorage": {}
                    },
                    getSiteZoomRatio: function () {
                        throw new Error("not implemented");
                    }
                };
            });

            it("should produce empty css for empty skin", function () {
                var emptyCss = skinsRenderer.createSkinCss(skinData, styleProps, themeData, styleId, mobileData);
                expect(emptyCss).toBe('');
            });

            it("should produce root css rule for skin with \"%\"", function () {
                skinData.css["%"] = "some css rule";
                styleId = "someClass";

                expect(css()).toBe(".someClass {some css rule}");
            });

            it("should produce skinpart css rule for \"%part\"", function () {
                skinData.css["%part"] = "color: red";
                expect(css()).toBe(".s0part {color: red}");
            });

            describe("skin params rendering", function () {
                describe("background color", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "background-color:[bg];";
                        skinData.params.bg = "BG_COLOR";
                    });

                    it("should render default constant background color", function () {
                        skinData.paramsDefaults.bg = "#000";
                        expect(css()).toBe(".s0 {background-color:rgba(0, 0, 0, 1);}");
                    });

                    it("should render default theme-dependent background color", function () {
                        skinData.paramsDefaults.bg = "color_0";
                        themeData.color = ["#bee"];

                        expect(css()).toBe(".s0 {background-color:rgba(187, 238, 238, 1);}");
                    });

                    it("should render overriden background color if specified", function () {
                        skinData.paramsDefaults.bg = "#000";
                        styleProps.bg = "#fff";

                        expect(css()).toBe(".s0 {background-color:rgba(255, 255, 255, 1);}");
                    });

                    it("should render transparent as transparent", function () {
                        skinData.paramsDefaults.bg = "transparent";

                        expect(css()).toBe(".s0 {background-color:transparent;}");
                    });
                });

                describe("border radius color", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "[rd]";
                        skinData.params.rd = "BORDER_RADIUS";
                    });

                    it("should render default constant border radius", function () {
                        skinData.paramsDefaults.rd = "5px/10%";
                        expect(css()).toBe(".s0 {border-radius:5px/10%;}");
                    });

                    it("should render overriden border radius if specified", function () {
                        skinData.paramsDefaults.rd = "5px";
                        styleProps.rd = "0 5px 0 5px";

                        expect(css()).toBe(".s0 {border-radius:0 5px 0 5px;}");
                    });

                    it("should not render values greater than 99999px", function () {
                        skinData.paramsDefaults.rd = "5px";
                        styleProps.rd = "0 999999999999px 0 123456789px";

                        expect(css()).toBe(".s0 {border-radius:0 99999px 0 99999px;}");
                    });
                });

                describe("box shadow", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "[shd]";
                        skinData.params.shd = "BOX_SHADOW";
                    });

                    it("should render default constant box shadow", function () {
                        skinData.paramsDefaults.shd = "0 1px 4px rgba(0, 0, 0, 0.6)";
                        expect(css()).toBe(".s0 {box-shadow:0 1px 4px rgba(0, 0, 0, 0.6);}");
                    });

                    it("should render overriden box shadow if specified", function () {
                        skinData.paramsDefaults.shd = "0 1px 4px rgba(0, 0, 0, 0.6)";
                        styleProps.shd = "none";

                        expect(css()).toBe(".s0 {box-shadow:none;}");
                    });
                });

                describe("font", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "[fnt]";
                        skinData.params.fnt = "FONT";
                        themeData.color = ["#FFCC00"];
                    });

                    it("should render default constant font - and should not render color!", function () {
                        skinData.paramsDefaults.fnt = "normal normal normal 34px/1em FbNeoGothic {color_0}";

                        expect(css()).toBe(".s0 {font:normal normal normal 34px/1em FbNeoGothic,sans-serif ;}");
                    });


                    it("should render theme font - and should not render color!", function () {
                        styleProps.fnt = "font_0";
                        themeData.font = ["normal normal normal 24px/1em Arial {color_0}"];

                        var cssString = css();

                        expect(cssString.indexOf(".s0 {font:normal normal normal 24px/1em Arial")).toBe(0);

                    });

                    it("should render overriden font", function () {
                        skinData.paramsDefaults.fnt = "font_0";
                        styleProps.fnt = "normal normal normal 24px/1em Arial";

                        var cssString = css();
                        expect(cssString.indexOf(".s0 {font:normal normal normal 24px/1em Arial")).toBe(0);
                    });
                });

                describe("size", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "border: [brw] solid #000";
                        skinData.params.brw = "SIZE";
                    });

                    it("should render default size and append px if missing", function () {
                        skinData.paramsDefaults.brw = 6;
                        expect(css()).toBe(".s0 {border: 6px solid #000}");
                    });

                    it("should render overriden size instead of default", function () {
                        skinData.paramsDefaults.brw = 6;
                        styleProps.brw = "5px";
                        expect(css()).toBe(".s0 {border: 5px solid #000}");
                    });
                });

                describe("color", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "color: [labelText]";
                        skinData.params.labelText = "COLOR";
                    });

                    it("should render natural default color in HEX", function () {
                        skinData.paramsDefaults.labelText = "red";
                        expect(css()).toBe(".s0 {color: #FF0000}");
                    });

                    it("should render theme color", function () {
                        skinData.paramsDefaults.labelText = "color_0";
                        themeData.color = ["#bee"];
                        expect(css()).toBe(".s0 {color: #BBEEEE}");
                    });

                    it("should render overriden RGB color in HEX", function () {
                        skinData.paramsDefaults.labelText = "color_0";
                        styleProps.labelText = "rgb(0,0,0)";
                        expect(css()).toBe(".s0 {color: #000000}");
                    });
                });

                describe("color with alpha channel", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "background-color: [bg1]";
                        skinData.params.bg1 = "COLOR_ALPHA";
                    });

                    it("should render natural default color in RGBA", function () {
                        skinData.paramsDefaults.bg1 = "red";
                        expect(css()).toBe(".s0 {background-color: rgba(255, 0, 0, 1)}");
                    });

                    it("should render theme color in RGBA", function () {
                        skinData.paramsDefaults.bg1 = "color_0";
                        themeData.color = ["160,160,160,0.5"];
                        expect(css()).toBe(".s0 {background-color: rgba(160, 160, 160, 0.5)}");
                    });

                    it("should render transparent color override", function () {
                        skinData.paramsDefaults.bg1 = "color_0";
                        styleProps.bg1 = "transparent";
                        expect(css()).toBe(".s0 {background-color: transparent}");
                    });
                });

                describe("transition", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "[trans]";
                        skinData.params.trans = "TRANSITION";
                    });

                    it("should render default transition", function () {
                        skinData.paramsDefaults.trans = "color 0.4s ease 0s";
                        expect(css()).toBe(".s0 {transition: color 0.4s ease 0s;}");
                    });

                    it("should render overriden transition", function () {
                        skinData.paramsDefaults.trans = "color 0.4s ease 0s";
                        styleProps.trans = "color 1s linear 1s";
                        expect(css()).toBe(".s0 {transition: color 1s linear 1s;}");
                    });
                });

                describe("inverted zoom", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "[zoom]";
                        skinData.params.zoom = "INVERTED_ZOOM";
                        skinData.paramsDefaults.zoom = 1;
                    });

                    it("should use mobileData.getSiteZoomRatio to render inverted zoom", function () {
                        spyOn(mobileData, 'getSiteZoomRatio');

                        css();

                        expect(mobileData.getSiteZoomRatio).toHaveBeenCalled();
                    });

                    it("should use mobileData.getSiteZoomRatio value to render css", function () {
                        spyOn(mobileData, 'getSiteZoomRatio').and.returnValue(2.0);

                        expect(css()).toBe(".s0 {zoom: 2;}");
                    });
                });

                describe("url", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "url([tdr]1.png)";
                        skinData.params.tdr = "URL";
                    });

                    it("should render base theme url", function () {
                        skinData.paramsDefaults.tdr = "BASE_THEME_DIRECTORY";
                        expect(css()).toMatch(/url\(\/\/static.*\/1.png\)/);
                    });

                    it("should render web theme url", function () {
                        styleProps.tdr = "WEB_THEME_DIRECTORY";
                        expect(css()).toMatch(/url\(\/\/static.*\/1.png\)/);
                    });

                    it("should render overriden custom url", function () {
                        skinData.paramsDefaults.tdr = "UNWORKING_URL";
                        styleProps.tdr = "http://site.com/";
                        expect(css()).toBe(".s0 {url(http://site.com/1.png)}");
                    });
                });

                describe("empty params", function () {
                    beforeEach(function () {
                        skinData.css["%"] = "[emp]";
                    });

                    it("should be rendered as empty string even if type is unknown", function () {
                        skinData.params.emp = "TYPE_DOES_NOT_MATTER";
                        expect(css()).toBe(".s0 {}");
                    });

                    it("should be rendered as empty string even if type is simple", function () {
                        skinData.params.emp = "SIZE";
                        expect(css()).toBe(".s0 {}");
                    });

                    it("should be rendered as empty string even if type is complex", function () {
                        skinData.params.emp = "BORDER_RADIUS";
                        expect(css()).toBe(".s0 {}");
                    });
                });
            });

            describe("skin media queries rendering", function () {
                it("should render media query", function () {
                    skinData.mediaQueries = [{
                        "query": "@media (orientation: landscape)",
                        "css": {
                            "%": "font-size:0.5em;"
                        }
                    }];

                    expect(css()).toBe("@media (orientation: landscape){.s0 {font-size:0.5em;}}");
                });

                // TODO: ask somebody from core team
                it("is not able to render media query with params, unfortunately (!)", function () {
                    skinData.params.bg = "COLOR";
                    skinData.paramsDefaults.bg = "red";
                    skinData.mediaQueries = [{
                        "query": "@media (orientation: landscape)",
                        "css": {
                            "%": "background-color: [bg];"
                        }
                    }];

                    expect(css()).toBe("@media (orientation: landscape){.s0 {background-color: ;}}");
                });
            });

            describe("exported skins rendering", function () {
                it("ignores not found skins", function () {
                    skinData.exports = {
                        "comp": {
                            "skin": "not found"
                        }
                    };

                    expect(css()).toBe("");
                });

                it("renders found skins", function () {
                    skinData.exports = {
                        "comp": {
                            "skin": "skins.core.ImageNewSkin"
                        }
                    };

                    expect(css()).toMatch(/\.s0comp {.*}/);
                });
            });
        });

        describe("html rendering", function () {
            var skinTree, refData, styleName, rootId, structure, props, state;

            function comp() {
                return skinsRenderer.renderSkinHTML(skinTree, refData, styleName, rootId, structure, props, state);
            }

            beforeEach(function () {
                skinTree = [];
                refData = {};
                styleName = "testStyle";
                rootId = "testComp";
                structure = {};
                props = {};
                state = {};
            });

            it("can render empty component", function () {
                props = comp().props;

                expect(props.id).toBe("testComp");
                expect(props.className).toBe("testStyle");
            });

            it("can render empty component even if skin tree is missing", function () {
                skinTree = undefined;
                props = comp().props;

                expect(props.id).toBe("testComp");
                expect(props.className).toBe("testStyle");
            });

            it("can ignores children with remove ref", function () {
                skinTree = [["div", "child", [], {}]];

                refData = {
                    child: "remove"
                };

                expect(comp().props.children).not.toBeDefined();
            });

            it("can render component with skin tree", function () {
                rootId = "_";

                skinTree = [
                    ["div", "child", [], {},
                        ["div", "grandchild1", [], {}],
                        ["div", "grandchild2", [], {}]
                    ]
                ];

                var child = comp().props.children;

                expect(child.props.id).toBe("_child");
                expect(child.props.children[0].props.id).toBe("_grandchild1");
                expect(child.props.children[1].props.id).toBe("_grandchild2");
            });

            it("can render node with classes", function () {
                rootId = "_";
                styleName = "s_";
                skinTree = [
                    ["div", "someId", ["class2"], {
                        "className": "hi",
                        "customProp": "customValue"
                    }]
                ];

                var child = comp().props.children;

                expect(child.props.id).toBe("_someId");
                expect(child.props.className).toContain("s_class2");
                expect(child.props.className).toContain("s_someId");
                expect(child.props.customProp).toBe("customValue");
            });

            it('should render globally defined classes without styleName prefix', function () {
                var globallyDefinedClass = 'globallyDefinedClass';
                var classPrefix = '_';
                var globallyDefinedClassPrefix = classPrefix + 'g!';

                rootId = "_";
                styleName = "styleName_";
                skinTree = [
                    ["div", null, ["class2", globallyDefinedClassPrefix + globallyDefinedClass], {}]
                ];

                var child = comp().props.children;
                var classList = child.props.className.split(' ');

                expect(classList).toContain("styleName_class2");
                expect(classList).toContain(globallyDefinedClass);
            });

            it("can render node with null ref data", function () {
                skinTree = [["div", null, [], {}]];

                expect(comp().props.children).toBeDefined();
            });

            it("throws when rendering unknown tags", function () {
                skinTree = [["x-google-maps", null, [], {}]];
                expect(comp).toThrow();
            });

            it("can render nodes of different types", function () {
                skinTree = [["img", "image", [], {}]];

                refData = {
                    "image": {
                        "parentConst": React.DOM.img
                    }
                };

                expect(comp().props.children.props.id).toBe('testCompimage');
            });

            it("can render children in node", function () {
                refData = {
                    "": {
                        "children": [{props: {refInParent: "test"}}]
                    }
                };

                expect(comp().props.children.props.refInParent).toBe("test");
            });

            it("can append children to node", function () {
                skinTree = [["div", "child1", [], {}]];

                refData = {
                    "": {
                        "addChildren": [{props: {refInParent: "child2"}}]
                    },
                    "child1": {}
                };

                expect(comp().props.children[0].props.id).toMatch(/child1$/i);
                expect(comp().props.children[1].props.refInParent).toBe("child2");
            });

            it("can prepend a child to node", function () {
                refData = {
                    "": {
                        "addChildren": [{props: {refInParent: "child-last"}}],
                        "addChildBefore": [{props: {refInParent: "child-first"}}, "child-last"]
                    }
                };

                expect(comp().props.children[0].props.refInParent).toBe("child-first");
                expect(comp().props.children[1].props.refInParent).toBe("child-last");
            });

            it("appends instead of prepending if child ref is not found", function () {
                refData = {
                    "": {
                        "addChildren": [{props: {refInParent: "child-existing"}}],
                        "addChildBefore": [{props: {refInParent: "child-appended"}}, "child-not-existing"]
                    }
                };

                expect(comp().props.children[0].props.refInParent).toBe("child-existing");
                expect(comp().props.children[1].props.refInParent).toBe("child-appended");
            });

            it("can programatically wrap node if declared so", function () {
                var wrapper = jasmine.createSpy("wrapper");

                skinTree = [["div", "to-wrap", [], {}]];

                refData = {
                    "to-wrap": {
                        "wrap": [wrapper]
                    }
                };

                comp();

                expect(wrapper.calls.count()).toBe(1);
                expect(wrapper.calls.first().args[1].props.id).toMatch(/to-wrap$/i);
            });

            it("adds all specified properties to the rendered node", function () {
                refData = {
                    "": {
                        "prop": {"innerProp": "innerValue"}
                    }
                };

                expect(comp().props.prop).toEqual({innerProp: "innerValue"});
            });

            it("skips already rendered comps in refs", function () {
                var alreadyRendered = comp();

                skinTree = [["div", "already-rendered", [], {}]];

                refData = {
                    "already-rendered": alreadyRendered
                };

                expect(comp().props.children).toBe(alreadyRendered);
            });

            describe("renderer plugins", function () {
                function any(_type) {
                    return jasmine.any(_type || Object);
                }

                it("ignores non-functions when adding", function () {
                    skinsRenderer.registerRenderPlugin({});
                    expect(comp).not.toThrow();
                });

                it("is called with such args as skinTree, indexes, etc", function () {
                    var plugin = jasmine.createSpy("plugin");
                    skinsRenderer.registerRenderPlugin(plugin);

                    comp();

                    expect(plugin).toHaveBeenCalledWith(any(Object), any(Array), refData, any(Object), any(Object));
                });
            });
        });
    });
});
