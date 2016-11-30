define([
    'lodash',
    'definition!dataFixer/plugins/designDataFixer',
    'testUtils',
    'experiment'
], function(_, designDataFixerDef, testUtils, experiment) {
    'use strict';
    var openExperiments = testUtils.experimentHelper.openExperiments;
    var lastId = -1;
    var guidUtils = {getUniqueId: function () { return 'i' + ++lastId; }};
    var coreUtils = {guidUtils: guidUtils};
    var designDataFixer = designDataFixerDef(_, coreUtils, experiment);

    var mockPageData = {
        data: {
            document_data: {
                'dataItem-strip1': {
                    type: 'StripContainer',
                    id: 'dataItem-strip1',
                    background: '#dataItem-bgmedia1'
                },

                'dataItem-strip2': {
                    type: 'StripContainer',
                    id: 'dataItem-strip2',
                    background: '#dataItem-bgmedia2'
                },

                'dataItem-strip3': {
                    type: 'StripContainer',
                    id: 'dataItem-strip3',
                    background: '#dataItem-bgmedia3'
                },

                'dataItem-bgmedia1': {
                    type: 'BackgroundMedia',
                    id: 'dataItem-bgmedia1',
                    mediaRef: '#dataItem-image1',
                    imageOverlay: '#dataItem-olimage'
                },

                'dataItem-bgmedia2': {
                    type: 'BackgroundMedia',
                    id: 'dataItem-bgmedia2',
                    mediaRef: '#dataItem-image2'
                },

                'dataItem-bgmedia3': {
                    type: 'BackgroundMedia',
                    id: 'dataItem-bgmedia3',
                    mediaRef: '#dataItem-image3'
                },

                'dataItem-image1': {
                    type: 'Image',
                    id: 'dataItem-image1',
                    link: '#an-evil-link-record '
                },

                'dataItem-image2': {
                    type: 'Image',
                    id: 'dataItem-image2'
                },

                'dataItem-image3': {
                    type: 'Image',
                    id: 'dataItem-image3'
                },

                'dataItem-olimage': {
                    type: 'Image',
                    id: 'dataItem-olimage'
                }
            }
        },

        structure: {
            components: [
                {
                    type: 'Container',
                    id: 'comp-strip1',
                    components: [
                        {
                            type: 'Container',
                            id: 'comp-strip2',
                            components: [],
                            dataQuery: '#dataItem-strip2',
                            componentType: 'wysiwyg.viewer.components.StripContainer'
                        },
                        {
                            type: 'Container',
                            id: 'comp-container1',
                            children: [
                                {
                                    type: 'Noncontainer',
                                    id: 'comp-noncontainer1',
                                    components: [],
                                    dataQuery: '#dataItem-noncontainer1',
                                    componentType: 'some.non.container.type'
                                },
                                {
                                    type: 'Container',
                                    id: 'comp-strip3',
                                    components: [],
                                    dataQuery: '#dataItem-strip3',
                                    componentType: 'wysiwyg.viewer.components.StripContainer'
                                }
                            ],
                            dataQuery: '#nothing-here',
                            componentType: 'some.other.container.type'
                        }
                    ],
                    dataQuery: '#dataItem-strip1',
                    componentType: 'wysiwyg.viewer.components.StripContainer'
                }
            ],

            mobileComponents: [
                {
                    type: 'Container',
                    id: 'comp-strip1',
                    components: [],
                    dataQuery: '#dataItem-strip1',
                    componentType: 'wysiwyg.viewer.components.StripContainer'
                }
            ]
        }
    };

    var mockPageDataWithDesignData = {
        data: {
            document_data: {
                'dataItem-strip4': {
                    type: 'StripContainer',
                    id: 'dataItem-strip4'
                }
            },
            design_data: {
                'dataItem-mcdd1': {
                    type: 'MediaContainerDesignData',
                    id: 'dataItem-mcdd1',
                    background: '#dataItem-ddbgmedia1'
                },

                'dataItem-ddbgmedia1': {
                    type: 'BackgroundMedia',
                    id: 'dataItem-ddbgmedia1',
                    mediaRef: '#dataItem-ddvideo1'
                },

                'dataItem-ddvideo1': {
                    type: 'WixVideo',
                    id: 'dataItem-ddvideo1',
                    posterImageRef: '#dataItem-ddimage1'
                },

                'dataItem-ddimage1': {
                    type: 'Image',
                    id: 'dataItem-ddimage1'
                }
            }
        },

        structure: {
            components: [
                {
                    type: 'Container',
                    id: 'comp-strip4',
                    components: [],
                    dataQuery: '#dataItem-strip4',
                    designQuery: '#dataItem-mcdd1',
                    componentType: 'wysiwyg.viewer.components.StripContainer'
                }
            ],

            mobileComponents: [
                {
                    type: 'Container',
                    styleId: 'strc1',
                    id: 'comp-strip4',
                    components: [],
                    dataQuery: '#dataItem-strip4',
                    designQuery: '#dataItem-mcdd1',
                    componentType: 'wysiwyg.viewer.components.StripContainer'
                }
            ]
        }
    };

    describe('designDataFixer', function() {
        beforeEach(function(){
            this.mockPageData = _.cloneDeep(mockPageData);
            this.mockPageDataWithDesignData = _.cloneDeep(mockPageDataWithDesignData);
            lastId = -1;
        });

        it('convert all strip components in any depth of the component tree', function() {
            openExperiments('designData');
            var documentData = this.mockPageData.data.document_data;
            var backgroundMediaItems = [
                documentData['dataItem-bgmedia1'],
                documentData['dataItem-bgmedia2'],
                documentData['dataItem-bgmedia3']
            ];

            designDataFixer.exec(this.mockPageData);

            var designData = this.mockPageData.data.design_data;

            expect(designData['dataItem-bgmedia1']).toEqual(backgroundMediaItems[0]);
            expect(designData['dataItem-bgmedia2']).toEqual(backgroundMediaItems[1]);
            expect(designData['dataItem-bgmedia3']).toEqual(backgroundMediaItems[2]);
            expect(documentData['dataItem-bgmedia1']).toBeUndefined();
            expect(documentData['dataItem-bgmedia2']).toBeUndefined();
            expect(documentData['dataItem-bgmedia3']).toBeUndefined();
        });

        it('moves strip container data items to design_data map', function() {
            var documentData = this.mockPageData.data.document_data;
            var backgroundMediaItem = documentData['dataItem-bgmedia1'];
            var imageItem = documentData['dataItem-image1'];
            var imageOverlayItem = documentData['dataItem-olimage'];

            designDataFixer.exec(this.mockPageData);
            var designData = this.mockPageData.data.design_data;
            var component = this.mockPageData.structure.components[0];

            expect(designData).toBeDefined();
            expect(designData.i0.background).toEqual('#dataItem-bgmedia1');
            expect(component.designQuery).toEqual('#i0');

            expect(designData['dataItem-bgmedia1']).toEqual(backgroundMediaItem);
            expect(designData['dataItem-image1']).toEqual(imageItem);
            expect(designData['dataItem-olimage']).toEqual(imageOverlayItem);
            expect(documentData['dataItem-bgmedia1']).toBeUndefined();
            expect(documentData['dataItem-image1']).toBeUndefined();
            expect(documentData['dataItem-olimage']).toBeUndefined();
        });

        it('only patches StripContainers', function () {
            openExperiments('designData');
            var mockData = _.assign(this.mockPageData, {
                data: {
                    document_data: {
                        'dataItem-strip1': {
                            type: 'NotAStripContainer'
                        }
                    }
                },

                structure: {
                    components: {
                        0: {
                            componentType: 'wysiwyg.viewer.components.NotAStripContainer'
                        }
                    },
                    mobileComponents: []
                }
            });

            designDataFixer.exec(mockData);
            var designData = mockData.data.design_data;
            expect(designData['dataItem-bgmedia1']).toBeUndefined();
            expect(designData['dataItem-image1']).toBeUndefined();
        });

        it('removes "link" fields from image data items before moving them between the maps', function(){
            openExperiments('designData');
            var documentData = this.mockPageData.data.document_data;
            expect(documentData['dataItem-image1'].link).toBeDefined();

            designDataFixer.exec(this.mockPageData);

            var designData = this.mockPageData.data.design_data;
            expect(designData['dataItem-image1'].link).toBeUndefined();
        });
    });

});
