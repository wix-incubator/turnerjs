define(['testUtils', 'core', 'documentServices/aspects/DocumentServicesAspect'], function (/** testUtils */ testUtils, core, DocumentServicesApsectClass) {
    'use strict';

    describe('DocumentServicesAspect tests', function () {
        beforeEach(function (done) {
            var self = this;
            this.aspectSiteAPICallbacks = [];
            testUtils.mockModules(['core/siteRender/SiteAspectsSiteAPI'],
                {
                    'core/siteRender/SiteAspectsSiteAPI': {
                        registerToUrlPageChange: function (callback) {
                            self.aspectSiteAPICallbacks.push(callback);
                        }
                    }
                },
                function (AspectsSiteAPI) {
                    self.aspectsSiteAPI = new AspectsSiteAPI();

                    /** @type DocumentServicesAspect*/
                    self.documentServicesAspect = new DocumentServicesApsectClass(self.aspectsSiteAPI);
                    done();
                });
        });

        it('initialization - aspect has registered to a urlPageChange event', function () {
            expect(this.aspectSiteAPICallbacks.length).toEqual(1);
        });

        it('registered functions are called upon page navigation and then removed from stack', function() {
            var callback = jasmine.createSpy('fakePageChangedCallback');
            var evt = {};
            this.documentServicesAspect.registerToUrlPageChange(callback);
            this.documentServicesAspect.handlePageChange.call(this.documentServicesAspect, evt);

            expect(callback).toHaveBeenCalledWith(evt);

            this.documentServicesAspect.handlePageChange.call(this.documentServicesAspect, evt);

            expect(callback.calls.count()).toEqual(1);
        });
    });
});
