define(['skintest!wysiwyg.viewer.skins.displayers.SlideShowSloopyDisplayer'], function (skinData) {
    "use strict";

    //  cssToJson no longer merges css rules due to issues with skinParams, so we can't test this properly
    xdescribe("SlideShowSloopyDisplayer test", function () {
        it("should not display scrollbars, and clip text on title and description", function () {
            expect(skinData.css['#title']).toContain({'white-space': 'nowrap'});
            expect(skinData.css['#description']).toContain({'white-space': 'nowrap'});
        });

        it("should clip text and display an ellipsis for long text", function () {
            expect(skinData.css['#title']).toContain({'text-overflow': 'ellipsis'});
            expect(skinData.css['#description']).toContain({'text-overflow': 'ellipsis'});
        });
    });
});