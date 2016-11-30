define(['testUtils', 'santaProps/types/modules/LayoutSantaTypes'], function (/** testUtils */ testUtils, LayoutSantaTypes) {
    'use strict';

    describe('LayoutSantaTypes.', function () {

        it('reLayoutIfPending should call siteAPI.reLayoutIfPending', function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();
            spyOn(siteAPI, 'reLayoutIfPending');

            var reLayoutIfPending = LayoutSantaTypes.reLayoutIfPending.fetch({siteAPI: siteAPI});
            reLayoutIfPending();
            expect(siteAPI.reLayoutIfPending).toHaveBeenCalled();

            siteAPI.reLayoutIfPending.calls.reset();

            var reLayoutIfPendingRequired = LayoutSantaTypes.reLayoutIfPending.isRequired.fetch({siteAPI: siteAPI});
            reLayoutIfPendingRequired();
            expect(siteAPI.reLayoutIfPending).toHaveBeenCalled();
        });

        it('registerReLayoutPending should register pending relayout', function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();

            var registerReLayoutPending = LayoutSantaTypes.registerReLayoutPending.fetch({siteAPI: siteAPI});
            registerReLayoutPending();
            expect(siteAPI._site.reLayoutPending).toBe(true);

            siteAPI._site.reLayoutPending = false;

            var registerReLayoutPendingRequired = LayoutSantaTypes.registerReLayoutPending.isRequired.fetch({siteAPI: siteAPI});
            registerReLayoutPendingRequired();
            expect(siteAPI._site.reLayoutPending).toBe(true);
        });

    });

});
