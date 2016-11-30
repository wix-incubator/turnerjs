define(['lodash', 'dataFixer/plugins/toPageAnchorsFixer'], function(_, toPageAnchorsFixer) {
    'use strict';

    describe('toPageAnchorsFixer spec', function() {

        describe("add bottom parent anchor to to the bottom most component of page if missing", function () {
            function mockComp(id, y, height, anchors) {
                return {
                    id: id,
                    layout: {x: 0, y: y, height: height, width:10, anchors: anchors ? anchors : [], rotationInDegrees: 0}
                };
            }

            function addBottomParentAnchor(page, compId) {
                var anchor = {
                    distance: 10,
                    type: "BOTTOM_PARENT",
                    targetComponent: page.structure.id,
                    locked: false,
                    originalValue: 0,
                    topToTop: 0
                };
                var comp = _.find(page.structure.components, {id: compId});
                comp.layout.anchors.push(anchor);
            }

            function testCompAnchors(page, compId, clonedPage) {
                var comp = _.find(page.structure.components, {id: compId});
                expect(comp.layout.anchors.length).toBe(1);
                expect(comp.layout.anchors[0].type).toBe('BOTTOM_PARENT');
                comp.layout.anchors = [];
                expect(page).toEqual(clonedPage);
            }

            beforeEach(function () {
                this.page = {
                    structure: {
                        id: 'page',
                        components: [
                            mockComp('top', 10, 100),
                            mockComp('bottom', 50, 100)
                        ],
                        layout: {height: 100, y: 0, anchors: []}
                    },
                    data: {document_data: {}, theme_data: {}, component_properties: {}}
                };
            });

            it("should do nothing if the bottom most comp has a bottom parent anchor", function () {
                addBottomParentAnchor(this.page, 'bottom');
                var clonedPage = _.cloneDeep(this.page);

                toPageAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(clonedPage);
            });
            it("should add anchor to the bottom most page child if no page child has bottom parent anchors", function () {
                var clonedPage = _.cloneDeep(this.page);
                toPageAnchorsFixer.exec(this.page);

                testCompAnchors(this.page, 'bottom', clonedPage);
            });

            it("should add anchor to the bottom most page child if another component has a bottom parent anchor", function () {
                addBottomParentAnchor(this.page, 'top');
                var clonedPage = _.cloneDeep(this.page);

                toPageAnchorsFixer.exec(this.page);

                testCompAnchors(this.page, 'bottom', clonedPage);
            });

            xit("should add the anchor to the bottom most component even if it's y is smaller but it's height covers for it", function () {
                this.page.structure.components.unshift(mockComp('bottomMost', 30, 200));
                var clonedPage = _.cloneDeep(this.page);
                toPageAnchorsFixer.exec(this.page);

                testCompAnchors(this.page, 'bottomMost', clonedPage);
            });
        });

    });
});
