define(['skintest!wysiwyg.viewer.skins.LinkBarNoBGSkin'], function(skinData){
   "use strict";

    describe("LinkBarNoBGSkin test", function(){
        it("should prevent the linkbar from wrapping in desktop", function(){
            expect(skinData.css['#itemsContainer']).toContain({'white-space': 'nowrap'});
        });


        it("should allow the linkbar to wrap whitespace in mobile, so that it does not extend beyond the width of the mobile site", function(){
            expect(skinData.css['[data-state~=\"mobileView\"] #itemsContainer']).toContain({'white-space': 'normal'});
        });
    });
});