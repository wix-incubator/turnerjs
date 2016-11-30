define(['lodash', 'errorUtils', 'santa-harness'], function (_, errorUtils, santa) {
    'use strict';

    xdescribe('Document Services - Site Mobile Conversion', function () {

        // To update site:
        //  1 go to mobile view
        //  2 documentServices.mobileConversion.resetMobileLayoutOnAllPages()
        //  3 documentServices.publish()

        // Assumptions about the site structure:
        //  1 site contains a page with the title 'current' with at least two components one under another
        //  2 components are squares
        //  3 distance between components and to the page boundaries is not less than component height
        //  4 components are aligned to the left top corner of the page

        var documentServices;

        function resolveComponentRecursive(component, options) {
            var layout = documentServices.components.layout.get(component);
            return {
                id: component.id,
                x: _.get(options, 'verifyX', false) ? layout.x : null,
                children:
                    _(component)
                        .thru(documentServices.components.getChildren)
                        .sortBy(function(comp) {
                            return _.get(documentServices.components.layout.get(comp), 'y');
                        })
                        .map(function(comp) {
                            return resolveComponentRecursive(comp, options);
                        })
                        .value()
            };
        }

        function getSortedSiteStructure(options) {
            var data = {};
            var allPages = documentServices.pages.getPageIdList();
            if (!_.get(options, 'verifyMasterPage', true)) {
                allPages = _.reject(allPages, documentServices.pages.getMasterPageId());
            }

            _.forEach(allPages, function(pageId) {
                var pagePointer = documentServices.components.get.byId(pageId);
                data[pageId] = resolveComponentRecursive(pagePointer, options);
            });

            return data;
        }

        function runStructureTest(siteName, strategy, done, options) {
            santa.start({site: siteName}).then(function (harness) {
                documentServices = harness.documentServices;
                documentServices.viewMode.set(documentServices.viewMode.VIEW_MODES.MOBILE);
                errorUtils.waitForSuccess(documentServices, function () {
                    var expectedSiteStructure = getSortedSiteStructure(options);
                    documentServices.mobileConversion.resetMobileLayoutOnAllPages({heuristicStrategy: strategy});
                    errorUtils.waitForSuccess(documentServices, function () {
                        expect(getSortedSiteStructure(options)).toEqual(expectedSiteStructure);
                        done();
                    });
                });
            });
        }

        it('should not change order and hierarchy of mobile components for an ADI site', function (done) {
            runStructureTest('mobileConversionADI', 'onboarding', function() {
                documentServices.pages.duplicate(documentServices.pages.getPrimaryPageId());
                errorUtils.waitForSuccess(documentServices, done);
            });
        });

        it('should not change order and hierarchy of mobile components for a user site', function (done) {
            runStructureTest('mobileConversion', 'default', done);
        });


        it('should remove occluded and empty backgrounds for onboarding', function (done) {
            runStructureTest('remove-empty-stuff', 'onboarding', done);
        });

        it('should treat virtual groups correctly', function (done) {
            runStructureTest('algo-features', 'default', done, {verifyX: true});
        });

        it('should nest strips into a single column', function (done) {
            runStructureTest('columns-nesting', 'default', done);
        });
    });
});
