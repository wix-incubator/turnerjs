define([
    'lodash',
    'dataFixer/plugins/migrateStripToColumnsContainer',
    'coreUtils',
    'dataFixer/plugins/behaviorsDataFixer'
], function (_,
             migrateStripToColumnsContainerOriginal,
             coreUtils,
             behaviorsDataFixer) {
    'use strict';

    var migrateStripToColumnsContainer;

    describe('migrateDeprecatedComps spec', function () {
        beforeEach(function () {
            var counter = 0;

            migrateStripToColumnsContainer = {
                exec: function (pageJson) {
                    migrateStripToColumnsContainerOriginal.exec(pageJson, null, null, null, null, true);
                }
            };

            spyOn(coreUtils.guidUtils, 'getUniqueId').and.callFake(function (prefix, delim) {
                return (prefix || '') + (delim || '') + ++counter;
            });
        });

        describe('migrate StripContainer to StripColumnsContainer', function () {
            beforeEach(function () {
                this.mockPageJson = {
                    'structure': {
                        'components': [
                            {
                                'type': 'Container',
                                'styleId': 'strc1',
                                'id': 'comp-ijo20i7k',
                                'components': [
                                    {
                                        'type': 'Component',
                                        'styleId': 'wp2',
                                        'id': 'comp-ijo22bbz',
                                        'dataQuery': '#dataItem-ijo22bc1',
                                        'layout': {
                                            'width': 321,
                                            'height': 225,
                                            'x': 318,
                                            'y': 82,
                                            'scale': 1,
                                            'rotationInDegrees': 0,
                                            'anchors': [
                                                {
                                                    'distance': 94,
                                                    'originalValue': 401,
                                                    'type': 'BOTTOM_PARENT',
                                                    'locked': false,
                                                    'targetComponent': 'comp-ijo20i7k'
                                                }
                                            ],
                                            'fixedPosition': false
                                        },
                                        'propertyQuery': 'propItem-ijo22bc3',
                                        'componentType': 'wysiwyg.viewer.components.WPhoto'
                                    }
                                ],
                                'designQuery': '#dataItem-ijo20i9p',
                                'layout': {
                                    'width': 980,
                                    'height': 401,
                                    'x': 0,
                                    'y': 0,
                                    'scale': 1,
                                    'rotationInDegrees': 0,
                                    'anchors': [
                                        {
                                            'distance': 0,
                                            'originalValue': 500,
                                            'type': 'BOTTOM_PARENT',
                                            'locked': true,
                                            'targetComponent': 'ig7op'
                                        }
                                    ],
                                    'fixedPosition': false
                                },
                                'behaviors': '[]',
                                'componentType': 'wysiwyg.viewer.components.StripContainer'
                            }
                        ],
                        'mobileComponents': [
                            {
                                'type': 'Container',
                                'styleId': 'strc1',
                                'id': 'comp-ijo20i7k',
                                'components': [
                                    {
                                        'type': 'Component',
                                        'styleId': 'wp2',
                                        'id': 'comp-ijo22bbz',
                                        'dataQuery': '#dataItem-ijo22bc1',
                                        'layout': {
                                            'width': 300,
                                            'height': 210,
                                            'x': 10,
                                            'y': 10,
                                            'scale': 1,
                                            'rotationInDegrees': 0,
                                            'anchors': [
                                                {
                                                    'distance': 181,
                                                    'topToTop': 10,
                                                    'originalValue': 401,
                                                    'type': 'BOTTOM_PARENT',
                                                    'locked': false,
                                                    'targetComponent': 'comp-ijo20i7k'
                                                }
                                            ],
                                            'fixedPosition': false
                                        },
                                        'propertyQuery': 'propItem-ijo22bc3',
                                        'componentType': 'wysiwyg.viewer.components.WPhoto'
                                    }
                                ],
                                'designQuery': '#dataItem-ijo20i9p-2',
                                'layout': {
                                    'width': 320,
                                    'height': 401,
                                    'x': 0,
                                    'y': 10,
                                    'scale': 1,
                                    'rotationInDegrees': 0,
                                    'anchors': [
                                        {
                                            'distance': 10,
                                            'topToTop': 10,
                                            'originalValue': 421,
                                            'type': 'BOTTOM_PARENT',
                                            'locked': true,
                                            'targetComponent': 'ig7op'
                                        }
                                    ],
                                    'fixedPosition': false
                                },
                                'componentType': 'wysiwyg.viewer.components.StripContainer'
                            }
                        ],
                        'dataQuery': '#ig7op',
                        'skin': 'skins.core.InlineSkin',
                        'layout': {
                            'width': 980,
                            'height': 500,
                            'x': 0,
                            'y': 0,
                            'scale': 1,
                            'rotationInDegrees': 0,
                            'anchors': [],
                            'fixedPosition': false
                        },
                        'componentType': 'mobile.core.components.Page'
                    },
                    'data': {
                        'document_data': {},
                        'design_data': {
                            'dataItem-ijo22bc1': {
                                'type': 'Image',
                                'id': 'dataItem-ijo22bc1',
                                'title': 'Blurred Beach',
                                'uri': 'a97014d3cac6454b822f786b7d1f2878.jpg',
                                'description': '',
                                'width': 2351,
                                'height': 1302,
                                'alt': ''
                            },
                            'dataItem-ijo2fqkr': {
                                'type': 'Image',
                                'id': 'dataItem-ijo2fqkr',
                                'title': 'Black Water',
                                'uri': '221eb5f37f0741bbafb2f8e5852b5103.jpg',
                                'description': 'public/491df47b-5958-4dc7-9029-37f428755d45/c2a37dfc-36cf-4bfd-b940-55bac7bdc9e6',
                                'width': 5184,
                                'height': 3456
                            },
                            'dataItem-ijo20i9p-2': {
                                'type': "MediaContainerDesignData",
                                'id': 'dataItem-ijo20i9p-2',
                                'background': '#dataItem-ijo20i9p-21'
                            },
                            'dataItem-ijo20i9p-21': {
                                'type': 'BackgroundMedia',
                                'id': 'dataItem-ijo20i9p1',
                                'mediaRef': '#dataItem-ijo2fqkr',
                                'color': '#BADA55',
                                'colorOpacity': 1,
                                'alignType': 'center',
                                'fittingType': 'fill',
                                'scrollType': 'none',
                                'colorOverlay': '',
                                'colorOverlayOpacity': 0
                            }
                        },
                        'component_properties': {
                            'propItem-ijo22bc3': {
                                'type': 'WPhotoProperties',
                                'metaData': {
                                    'schemaVersion': '1.0'
                                },
                                'displayMode': 'fill',
                                'onClickBehavior': 'goToLink'
                            }
                        },
                        'behaviors_data': {}
                    }
                };
            });

            it('Should move behaviors from stripContainer to column', function () {
                var migratedPageJson = _.cloneDeep(this.mockPageJson);
                behaviorsDataFixer.exec(migratedPageJson);

                migrateStripToColumnsContainer.exec(migratedPageJson);

                var columnBehaviorQuery = _.get(migratedPageJson, 'structure.components.0.components.0.behaviorQuery');
                var columnBehaviors = _.get(migratedPageJson, ['data', 'behaviors_data', columnBehaviorQuery, 'items']);
                var originalStripContainerBehaviors = _.get(this.mockPageJson, 'structure.components.0.behaviors');
                expect(columnBehaviors).toEqual(originalStripContainerBehaviors);
            });
        });
    });
});
