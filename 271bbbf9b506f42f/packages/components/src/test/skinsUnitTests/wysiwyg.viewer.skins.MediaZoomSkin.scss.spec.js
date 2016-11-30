define(['skintest!wysiwyg.viewer.skins.AppPartMediaZoomSkin'], function(skinData){
    "use strict";

    describe("AppPartMediaZoomSkin test", function() {

        describe('Gallery navigation arrows', function() {
            // #CLNT-3509
            it('Next arrow should have 20px right in order not to cover scrollbar', function() {
                expect(skinData.css['#buttonNext'].right).toEqual('20px');
            });

            it('Previous arrow should have 20px left for symmetric purpose', function() {
                expect(skinData.css['#buttonPrev'].left).toEqual('20px');
            });
        });
    });
});
