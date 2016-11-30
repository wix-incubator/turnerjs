define(['lodash', 'dataFixer/plugins/wrongAnchorsFixer'], function(_, wrongAnchorsFixer) {
    'use strict';

    describe('wrongAnchorsFixer spec', function() {
        function mockComp(id, y, height, anchors, children) {
            return {
                id: id,
                components: children ? children : [],
                layout: {x: 0, y: y, height: height, width:10, anchors: anchors ? anchors : [], rotationInDegrees: 0}
            };
        }

        function mockAnchor(type, target, distance, locked, originalValue) {
            return {
                distance: distance,
                type: type,
                targetComponent: target,
                locked: _.isBoolean(locked) ? locked : true,
                originalValue: originalValue ? originalValue : 0,
                topToTop: 0
            };
        }

        describe("two components shouldn't have anchors from the same size to each other", function () {
            it("if two comps have the same anchors to each other remove the anchor from the lower comp (with the larger y)", function () {
                var pageStructure = {structure:{"components": [
                    {"id": "ScrnWdthCntnr0", "layout": {"width": 980, "height": 510, "x": 0, "y": -62, "anchors": [
                        {"distance": 30, "topToTop": 499, "originalValue": 437, "type": "TOP_TOP", "locked": true, "targetComponent": "Cntnr8"}
                    ]}},
                    {"id": "Cntnr8", "layout": {"width": 1090, "height": 447, "x": -60, "y": 437, "anchors": [
                        {"distance": 20, "topToTop": 20, "originalValue": 200, "type": "TOP_TOP", "locked": true, "targetComponent": "ScrnWdthCntnr0"}
                    ]}}
                ], "mobileComponents": [
                    {"id": "ScrnWdthCntnr0", "layout": {"width": 320, "height": 40, "x": 0, "y": 200, "anchors": [
                        {"distance": 15, "topToTop": 15, "originalValue": 215, "type": "TOP_TOP", "locked": true, "targetComponent": "Cntnr8"}
                    ]}},
                    {"id": "Cntnr8", "layout": {"width": 280, "height": 50, "x": 20, "y": 180, "anchors": [
                        {"distance": 20, "topToTop": 20, "originalValue": 200, "type": "TOP_TOP", "locked": true, "targetComponent": "ScrnWdthCntnr0"}
                    ]}}
                ], "layout": {"width": 980, "height": 1051, "x": 0, "y": 0, "anchors": []}}};
                expect(pageStructure.structure.mobileComponents[0].layout.anchors.length).toEqual(1);
                expect(pageStructure.structure.mobileComponents[1].layout.anchors.length).toEqual(1);

                expect(pageStructure.structure.components[0].layout.anchors.length).toEqual(1);
                expect(pageStructure.structure.components[1].layout.anchors.length).toEqual(1);
                wrongAnchorsFixer.exec(pageStructure);
                expect(pageStructure.structure.mobileComponents[0].layout.anchors.length).toEqual(0);
                expect(pageStructure.structure.mobileComponents[1].layout.anchors.length).toEqual(1);

                var desktopScrnWdthCntnr0TopTopAnchors = _.filter(pageStructure.structure.components[0].layout.anchors, {type: 'TOP_TOP'});
                var Cntnr8TopTopAnchors = _.filter(pageStructure.structure.components[1].layout.anchors, {type: 'TOP_TOP'});
                expect(desktopScrnWdthCntnr0TopTopAnchors.length).toEqual(1);
                expect(Cntnr8TopTopAnchors.length).toEqual(0);
            });
        });

        describe("break anchor circles", function () {

            beforeEach(function () {
                this.page = {
                    structure: {
                        id: 'page',
                        components: [
                            mockComp('anchorToPage', 300, 100, [mockAnchor('BOTTOM_PARENT', 'page', 0, true)])
                        ],
                        mobileComponents: [],
                        layout: {height: 400, y: 0, width: 980, x: 0, anchors: []}
                    },
                    data: {document_data: {}, theme_data: {}, component_properties: {}}
                };
            });

            it("should do nothing if no bottom top negative anchor", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10)]),
                    mockComp('B', 0, 100, [mockAnchor("TOP_TOP", 'C', -30)]),
                    mockComp('C', 0, 100, [mockAnchor("BOTTOM_BOTTOM", 'B', -30)]));

                var expected = _.cloneDeep(this.page);
                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should do nothing if there is a bottom top anchor from A to B and there is no component with bottom bottom anchor to A in the chain, 1 level", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 10));

                var expected = _.cloneDeep(this.page);
                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should do nothing if there is a bottom top anchor from A to B and there is no component with bottom bottom anchor to A in the chain, 2 levels", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 20, [mockAnchor("BOTTOM_TOP", 'D', 10)]),
                    mockComp('D', 90, 10));

                var expected = _.cloneDeep(this.page);
                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should do nothing if there is a bottom top anchor from A to B and there is a bottom bottom anchor to A in the chain from a component whos bottom is lower than A's (impossible in reality)", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 20, [mockAnchor("BOTTOM_TOP", 'D', 10)]),
                    mockComp('D', 90, 30, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]));

                var expected = _.cloneDeep(this.page);
                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should remove the back anchor if there is a negative bottom top anchor from A to B and top top anchor from B to A", function(){
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'A', 20)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[2].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should remove the back anchor if there is a negative bottom top anchor from A to B and bottom top anchor from B to A", function(){
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("BOTTOM_TOP", 'A', 20)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[2].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });
            it("should remove the back anchor if there is a negative bottom top anchor from A to B and bottom bottom anchor from B to A", function(){
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("BOTTOM_BOTTOM", 'A', 20)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[2].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });
            it("should remove anchor 1 level 1 component", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[3].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should remove anchor 1 level 2 components", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20), mockAnchor("TOP_TOP", 'D', 20)]),
                    mockComp('C', 70, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]),
                    mockComp('D', 65, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[3].layout.anchors = [];
                expected.structure.components[4].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should remove anchor 2 levels 1 component", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20), mockAnchor("BOTTOM_TOP", 'E', 20)]),
                    mockComp('C', 70, 10, [mockAnchor("TOP_TOP", 'D', 10)]),
                    mockComp('D', 65, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]),
                    mockComp('E', 65, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[4].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should remove anchor 2 levels 2 components", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 10, [mockAnchor("TOP_TOP", 'D', 10), mockAnchor("BOTTOM_TOP", 'E', 10)]),
                    mockComp('D', 65, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]),
                    mockComp('E', 65, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[4].layout.anchors = [];
                expected.structure.components[5].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should not remove other bottom bottom anchors", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]),
                    mockComp('D', 70, 10, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]));

                var expected = _.cloneDeep(this.page);
                expected.structure.components[3].layout.anchors = [];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            it("should not go into endless loops.. because we have legal circular anchors...", function () {
                this.page.structure.components.push(
                    mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', -30)]),
                    mockComp('B', 60, 50, [mockAnchor("TOP_TOP", 'C', 20)]),
                    mockComp('C', 70, 10, [mockAnchor("BOTTOM_BOTTOM", 'B', 10)]));

                var expected = _.cloneDeep(this.page);

                wrongAnchorsFixer.exec(this.page);

                expect(this.page).toEqual(expected);
            });

            describe('mobile BOTTOM_TOP & BOTTOM_BOTTOM anchors', function () {
                it('should break a cycle that contains a "negative" bottom top anchor', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10)]),
                        mockComp('B', 150, 100, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                        mockComp('C', 300, 100, [mockAnchor("BOTTOM_TOP", 'A', 10)])
                    ];

                    var expected = _.cloneDeep(this.page);
                    expected.structure.mobileComponents[2].layout.anchors = [];
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should break a cycle that contains a "negative" bottom bottom anchor', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10)]),
                        mockComp('B', 150, 100, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                        mockComp('C', 300, 100, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)])
                    ];

                    var expected = _.cloneDeep(this.page);
                    expected.structure.mobileComponents[2].layout.anchors = [];
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should break 2 cycles', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10), mockAnchor("BOTTOM_TOP", 'D', 10)]),
                        mockComp('B', 150, 100, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                        mockComp('C', 300, 100, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)]),
                        mockComp('D', 150, 100, [mockAnchor("BOTTOM_TOP", 'E', 10)]),
                        mockComp('E', 300, 100, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)])
                    ];

                    var expected = _.cloneDeep(this.page);
                    expected.structure.mobileComponents[2].layout.anchors = [];
                    expected.structure.mobileComponents[4].layout.anchors = [];
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should break a cycle that contains a "negative" bottom top anchor, with bottom_bottom anchors in the chain', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10)]),
                        mockComp('B', 150, 100, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                        mockComp('C', 300, 100, [mockAnchor("BOTTOM_BOTTOM", 'D', 10)]),
                        mockComp('D', 280, 150, [mockAnchor("BOTTOM_TOP", 'A', 10)])
                    ];



                    var expected = _.cloneDeep(this.page);
                    expected.structure.mobileComponents[3].layout.anchors = [];
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should break a cycle by only removing the negative anchor and keeping all other anchors', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10)]),
                        mockComp('B', 150, 100, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                        mockComp('C', 300, 100, [mockAnchor("BOTTOM_BOTTOM", 'D', 10)]),
                        mockComp('D', 280, 150, [mockAnchor("BOTTOM_TOP", 'A', 10), mockAnchor("BOTTOM_TOP", 'E', 10)]),
                        mockComp('E', 280, 150, [])
                    ];



                    var expected = _.cloneDeep(this.page);
                    expected.structure.mobileComponents[3].layout.anchors = [mockAnchor("BOTTOM_TOP", 'E', 10)];
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should break a cycle in a container\'s components', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('parent', 0, 100, [], [
                            mockComp('A', 0, 100, [mockAnchor("BOTTOM_TOP", 'B', 10)]),
                            mockComp('B', 150, 100, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                            mockComp('C', 300, 100, [mockAnchor("BOTTOM_BOTTOM", 'D', 10)]),
                            mockComp('D', 280, 150, [mockAnchor("BOTTOM_TOP", 'A', 10)])
                        ])
                    ];

                    var expected = _.cloneDeep(this.page);
                    expected.structure.mobileComponents[0].components[3].layout.anchors = [];
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should not break a legal top-top bottom-bottom cycle', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("TOP_TOP", 'B', 10)]),
                        mockComp('B', 20, 30, [mockAnchor("BOTTOM_BOTTOM", 'A', 50)])
                    ];

                    var expected = _.cloneDeep(this.page);
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });

                it('should not break a legal top-top bottom-bottom cycle with bottom-top anchors in the cycle', function () {
                    this.page.structure.mobileComponents = [
                        mockComp('A', 0, 100, [mockAnchor("TOP_TOP", 'B', 10)]),
                        mockComp('B', 20, 30, [mockAnchor("BOTTOM_TOP", 'C', 10)]),
                        mockComp('C', 60, 30, [mockAnchor("BOTTOM_BOTTOM", 'A', 10)])
                    ];

                    var expected = _.cloneDeep(this.page);
                    wrongAnchorsFixer.exec(this.page);

                    expect(this.page).toEqual(expected);
                });
            });
        });

		describe("pages shouldn't have anchors", function(){
			beforeEach(function() {
				this.regularPage = {
					structure: {
						componentType: "mobile.core.components.Page",
						layout: {
							anchors: [{
								distance: 632,
								locked: false,
								originalValue: 1222,
								targetComponent: "ANY_ANCHOR_ID_WHICH_IS_WRONG",
								topToTop: 0,
								type: "BOTTOM_BOTTOM"
							}]
						},
                        components: [{
                            layout: {
                                anchors: []
                            }
                        }]
					}
				};

                this.appPage = {
                    structure: {
                        componentType: "wixapps.integration.components.AppPage",
                        layout: {
                            anchors: [{
                                distance: 632,
                                locked: false,
                                originalValue: 1222,
                                targetComponent: "ANY_ANCHOR_ID_WHICH_IS_WRONG",
                                topToTop: 0,
                                type: "BOTTOM_BOTTOM"
                            }]
                        },
                        components: [{
                            layout: {
                                anchors: []
                            }
                        }]
                    }
                };
			});



			it("should remove anchors from page", function(){
				wrongAnchorsFixer.exec(this.regularPage);
				expect(_.size(this.regularPage.structure.layout.anchors)).toBe(0);
			});

			it("should remove anchors from appPage (blog/list)", function(){
				wrongAnchorsFixer.exec(this.appPage);
				expect(_.size(this.appPage.structure.layout.anchors)).toBe(0);
			});
		});

        describe("fix broken anchors", function () {

            beforeEach(function () {
                this.page = {
                    structure: {
                        id: 'page',
                        components: [],
                        layout: {height: 100, y: 0, anchors: []}
                    },
                    data: {document_data: {}, theme_data: {}, component_properties: {}}
                };
            });

            it("should remove anchors between components in different containers", function () {
                this.page.structure.components = [
                    mockComp('a', 0, 0),
                    mockComp('b', 0, 0, [], [
                        mockComp('b1', 0, 0, [mockAnchor('BOTTOM_BOTTOM', 'a', 0, true), mockAnchor('BOTTOM_BOTTOM', 'b2', 0), mockAnchor('TOP_TOP', 'a', 0), mockAnchor('BOTTOM_TOP', 'a', 0)]),
                        mockComp('b2', 0, 0, [])
                    ])
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[1].components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_BOTTOM', 'b2', 0)]);
            });

            it("should remove BOTTOM_PARENT anchors if they don't point to parent", function () {
                this.page.structure.components = [
                    mockComp('a', 0, 0, [], [
                        mockComp('a1', 0, 0, [mockAnchor('BOTTOM_PARENT', 'a', '0'), mockAnchor('BOTTOM_PARENT', 'page', '0')])
                    ])
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_PARENT', 'a', '0')]);
            });

            it("should remove BOTTOM_BOTTOM anchors to a non resizable component", function () {
                var unResizableComponent = mockComp('c', 50, 30, []);
                unResizableComponent.componentType = 'wysiwyg.viewer.components.FacebookShare';
                this.page.structure.components = [
                    mockComp('a', 0, 0, [mockAnchor('BOTTOM_BOTTOM', 'c', 0, false, 100), mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]),
                    mockComp('b', 50, 30, []),
                    unResizableComponent
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]);
            });

            it("should set original value to be not bigger than target height for BOTTOM_BOTTOM anchors, ", function () {
                this.page.structure.components = [
                    mockComp('a', 0, 0, [mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 100), mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]),
                    mockComp('b', 50, 30, [])
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 30), mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]);
            });

            it("should set original value to be not bigger than target height for BOTTOM_PARENT anchors, ", function () {
                this.page.structure.components = [
                    mockComp('a', 50, 30, [], [
                        mockComp('a1', 0, 0, [mockAnchor('BOTTOM_PARENT', 'a', 0, true, 100), mockAnchor('BOTTOM_PARENT', 'a', 0, false, 25)])
                    ])
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_PARENT', 'a', 0, true, 30), mockAnchor('BOTTOM_PARENT', 'a', 0, false, 25)]);
            });

            it("should set original value to be not bigger than target top for BOTTOM_TOP anchors", function () {
                this.page.structure.components = [
                    mockComp('a', 0, 0, [mockAnchor('BOTTOM_TOP', 'b', 0, false, 100), mockAnchor('BOTTOM_TOP', 'b', 0, false, 25)]),
                    mockComp('b', 50, 30, [])
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_TOP', 'b', 0, false, 50), mockAnchor('BOTTOM_TOP', 'b', 0, false, 25)]);
            });

            //there is a fixer that enforces that all top top anchors are locked, so there is no need for that test
            xit("should set original value to be not bigger than target top for TOP_TOP anchors", function () {
                this.page.structure.components = [
                    mockComp('a', 0, 0, [mockAnchor('TOP_TOP', 'b', 0, false, 100), mockAnchor('TOP_TOP', 'b', 0, false, 25)]),
                    mockComp('b', 50, 30, [])
                ];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('TOP_TOP', 'b', 0, false, 50), mockAnchor('TOP_TOP', 'b', 0, false, 25)]);
            });

            it("should use target bounding Y when fixing original value for BOTTOM_TOP and TOP_TOP anchors,", function () {
                var rotatedComponent = mockComp('b', 50, 30, []);
                rotatedComponent.layout.rotationInDegrees = 90;
                rotatedComponent.layout.width = 70;
                this.page.structure.components = [
                    mockComp('a', 0, 0, [mockAnchor('BOTTOM_TOP', 'b', 0, false, 100), mockAnchor('BOTTOM_TOP', 'b', 0, false, 25)]),
                    rotatedComponent
                ];
                var rotatedComponentBoundingY = parseInt(rotatedComponent.layout.y - (70 - rotatedComponent.layout.height) / 2, 10);

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_TOP', 'b', 0, false, rotatedComponentBoundingY), mockAnchor('BOTTOM_TOP', 'b', 0, false, 25)]);
            });

            it("not Ancorable Components not need to have anchors from them - back to top - clear anchors from not anchorable comps", function () {
                var anchor = mockAnchor('BOTTOM_TOP', 'b', 0, false, 25);
                var backToTop = {
                    id: "mockBackTopTop",
                    components:  [],
                    layout: {x: 0, y: 50, height: 100, width:10, anchors:  [anchor], rotationInDegrees: 0}
                };
                this.page.structure.mobileComponents = [
                    mockComp('a', 0, 0, [], [backToTop])

                ];
                expect(this.page.structure.mobileComponents[0].components[0].layout.anchors.length).toEqual(1);
                wrongAnchorsFixer.exec(this.page);
                expect(this.page.structure.mobileComponents[0].components[0].layout.anchors.length).toEqual(0);
            });

            it("should set original value to be not bigger than target height for BOTTOM_PARENT anchors, ", function () {
                this.page.structure.components = [
                    mockComp('a', 50, 30, [], [
                        mockComp('a1', 0, 0, [mockAnchor('TOP_TOP', 'a', 0, true, 100), mockAnchor('BOTTOM_PARENT', 'a', 0, false, 25)])
                    ])
                ];
                expect(this.page.structure.components[0].components[0].layout.anchors.length).toEqual(2);

                wrongAnchorsFixer.exec(this.page);
                expect(this.page.structure.components[0].components[0].layout.anchors.length).toEqual(1);

            });
        });

        describe('renaming masterPage ID', function(){
            it('should rename targetComponent from SITE_STRUCTURE to masterPage in relevant anchors', function(){
                var masterPage = {
                    structure: {
                        type: 'Document',
                        children: [
                            mockComp('anchorToMasterPage', 300, 100, [mockAnchor('BOTTOM_PARENT', 'SITE_STRUCTURE', 0, true)])
                        ],
                        mobileComponents: [],
                        layout: {height: 400, y: 0, width: 980, x: 0, anchors: []}
                    },
                    data: {
                        document_data: {},
                        theme_data: {},
                        component_properties: {}
                    }
                };

                wrongAnchorsFixer.exec(masterPage);

                expect(masterPage.structure.children[0].layout.anchors[0].targetComponent).toEqual('masterPage');
            });
        });

        describe('when anchors were deleted from json', function () {
            beforeEach(function () {
                this.page = {
                    structure: {
                        id: 'page',
                        components: [],
                        layout: {height: 100, y: 0}
                    },
                    data: {document_data: {}, theme_data: {}, component_properties: {}}
                };
            });

            it('should not run fixer on components in page', function () {
                var topLevelComp = mockComp();
                topLevelComp.layout.anchors = undefined;
                var wrongAnchors = [mockAnchor('BOTTOM_BOTTOM', 'a', 0, true), mockAnchor('BOTTOM_BOTTOM', 'b2', 0), mockAnchor('TOP_TOP', 'a', 0), mockAnchor('BOTTOM_TOP', 'a', 0)];
                topLevelComp.components = [
                    mockComp('a', 0, 0),
                    mockComp('b', 0, 0, [], [
                        mockComp('b1', 0, 0, _.clone(wrongAnchors)),
                        mockComp('b2', 0, 0, [])
                    ])];

                this.page.structure.components = [topLevelComp];

                wrongAnchorsFixer.exec(this.page);

                expect(this.page.structure.components[0].components[1].components[0].layout.anchors).toEqual(wrongAnchors);
            });
        });
    });
});
