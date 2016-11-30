define(["wixappsCore/core/stylesheetRenderer"], function (stylesheetRenderer) {
    'use strict';

    describe("stylesheetRenderer", function () {
        it("should throw if stylesheet definition is not an array", function () {
            var stylesheet = {some: "data"};
            var compId = "appPart1";
            var viewId = "viewName1";

            expect(function () {
                stylesheetRenderer.render(stylesheet, compId, viewId);
            }).toThrow();
        });
        it("should return null when view did not define any stylesheet definition", function () {
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(undefined, compId, viewId);

            expect(styleData).toBe(null);
        });
        it("should return null when stylesheet definition is an empty object", function () {
            var stylesheet = {};
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);

            expect(styleData).toBe(null);
        });
        it("should return null when stylesheet definition is an empty Array", function () {
            var stylesheet = [];
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);

            expect(styleData).toBe(null);
        });
        it("should add the prefix to a single css rule", function () {
            var stylesheet = [
                {
                    ".myStyle": {
                        "color": "#000000",
                        "font-size": "5px"
                    }
                }
            ];
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);

            var expected = "#" + compId + " #" + viewId + " .myStyle{color:#000000;font-size:5px}";

            expect(styleData).toEqual(expected);
        });
        it("should add the prefix to each css rule when definition contains more then one rule", function () {
            var stylesheet = [
                {
                    ".myStyle": {
                        "color": "#000000",
                        "font-size": "5px"
                    }
                },
                {
                    ".myStyle2": {
                        "color": "#FFFFFF",
                        "font-size": "15px"
                    }
                }
            ];
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);

            var expected = "#" + compId + " #" + viewId + " .myStyle{color:#000000;font-size:5px}";
            expected += "#" + compId + " #" + viewId + " .myStyle2{color:#FFFFFF;font-size:15px}";

            expect(styleData).toEqual(expected);
        });
        it("should add the prefix to each css rule when definition contains one rule with comma delimited name", function () {
            var stylesheet = [
                {
                    ".myStyle, .myStyle2": {
                        "color": "#000000",
                        "font-size": "5px"
                    }
                }
            ];
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);

            var expected = "#" + compId + " #" + viewId + " .myStyle{color:#000000;font-size:5px}";
            expected += "#" + compId + " #" + viewId + " .myStyle2{color:#000000;font-size:5px}";

            expect(styleData).toEqual(expected);
        });

        it('should render rgba colors properly', function(){
            var stylesheet = [
                {
                    ".myStyle": {
                        "color": "rgba(0,0,0,1)",
                        "font-size": "5px"
                    }
                }
            ];
            var compId = "appPart1";
            var viewId = "viewName1";

            var styleData = stylesheetRenderer.render(stylesheet, compId, viewId);

            var expected = "#" + compId + " #" + viewId + " .myStyle{color:rgba(0,0,0,1);font-size:5px}";

            expect(styleData).toEqual(expected);
        });
    });
});
