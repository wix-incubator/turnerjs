define(['lodash', 'wixappsBuilder/util/viewsTemplatesUtils'], function (_, viewsTemplatesUtils) {
    'use strict';

    describe('viewsTemplatesUtils', function () {
        describe('generateView', function () {
            var template, mobileItemView, itemView, partType, arrayView, mobileArrayView;
            var partViewName = 'BarvazOgerView';

            beforeEach(function () {
                partType = {
                    "name": 'BarvazOgerType',
                    "fields": [
                        {
                            "type": "wix:Image",
                            "name": "image3"
                        }
                    ]
                };
                arrayView = {
                    "name": "PaginatedListTemplate3", "forType": "Array",
                    "comp": {
                        "name": "VBox",
                        "items": [
                            {
                                "id": "listItem", "comp": {
                                "name": "LIST_ITEM"
                            }
                            },
                            {
                                "id": "footerSpacer", "comp": {
                                "name": "VSpacer", "size": {
                                    "$expr": "$itemSpacing"
                                }
                            }
                            }
                        ]
                    }
                };
                mobileArrayView = {
                    "name": "PaginatedListTemplate3", "forType": "Array", "format": "Mobile",
                    "comp": {
                        "name": "HBox",
                        "items": [
                            {
                                "id": "listItem", "comp": {
                                "name": "LIST_ITEM"
                            }
                            },
                            {
                                "id": "footerSpacer", "comp": {
                                "name": "VSpacer", "size": {
                                    "$expr": "$itemSpacing"
                                }
                            }
                            }
                        ]
                    }
                };
                itemView = {
                    "name": "BlankList", "forType": "BlankType", "comp": {
                        "name": "VBox", "items": [{
                            "id": "image_proxy", "data": "image1", "comp": {
                                "name": "Image"
                            }
                        }]
                    }
                };
                mobileItemView = {
                    "name": "BlankList", "forType": "BlankType", "format": "Mobile", "comp": {
                        "name": "HBox", "items": [{
                            "id": "image_proxy", "data": "image1", "comp": {
                                "name": "Image"
                            }
                        }]
                    }
                };
                template = {
                    type: {
                        "fields": [
                            {
                                "type": "wix:Image",
                                "name": "image1"
                            }
                        ]
                    },
                    views: [arrayView, mobileArrayView, itemView, mobileItemView]
                };
            });

            it('when view type is for array and no format, arrayView is adjusted', function () {
                var viewType = {forType: 'Array', name: partViewName};
                var view = viewsTemplatesUtils.generateView(template, viewType, partType);
                var expected = _.merge(_.cloneDeep(arrayView), {
                    "name": partViewName,
                    "comp": {"items": [{"comp": {"name": partViewName}}]}
                });

                expect(view).toEqual(expected);
            });

            it('when view type is for array and mobile format, but there is no mobile format for array, arrayView is adjusted', function () {
                template.views = _.reject(template.views, function (templateView) {
                    return _.isEqual(templateView, mobileArrayView);
                });
                var viewType = {forType: 'Array', name: partViewName, format: 'Mobile'};
                var view = viewsTemplatesUtils.generateView(template, viewType, partType);
                var expected = _.merge(_.cloneDeep(arrayView), {
                    "name": partViewName,
                    "format": "Mobile",
                    "comp": {"items": [{"comp": {"name": partViewName}}]}
                });

                expect(view).toEqual(expected);
            });

            it('when view type is for array and mobile format, mobileArrayView is adjusted', function () {
                var viewType = {forType: 'Array', name: partViewName, format: 'Mobile'};
                var view = viewsTemplatesUtils.generateView(template, viewType, partType);
                var expected = _.merge(_.cloneDeep(mobileArrayView), {
                    "name": partViewName,
                    "comp": {"items": [{"comp": {"name": partViewName}}]}
                });

                expect(view).toEqual(expected);
            });

            it('when view type is for the part type and no format, itemView is adjusted and data fields are matched', function () {
                var viewType = {forType: partType.name, name: partViewName};
                var view = viewsTemplatesUtils.generateView(template, viewType, partType);
                var expected = _.merge(_.cloneDeep(itemView), {
                    "name": partViewName, "forType": partType.name,
                    "comp": {"items": [{"data": "image3"}]}
                });

                expect(view).toEqual(expected);
            });

            it('when view type is for the part type and mobile format, but there is no mobile format for this part type, itemView is adjusted and data fields are matched', function () {
                template.views = _.reject(template.views, function (templateView) {
                    return _.isEqual(templateView, mobileItemView);
                });
                var viewType = {forType: partType.name, name: partViewName, format: 'Mobile'};
                var view = viewsTemplatesUtils.generateView(template, viewType, partType);
                var expected = _.merge(_.cloneDeep(itemView), {
                    "name": partViewName, "forType": partType.name, format: 'Mobile',
                    "comp": {"items": [{"data": "image3"}]}
                });

                expect(view).toEqual(expected);
            });

            it('when view type is for array and mobile format, mobileArrayView is adjusted', function () {
                var viewType = {forType: partType.name, name: partViewName, format: 'Mobile'};
                var view = viewsTemplatesUtils.generateView(template, viewType, partType);
                var expected = _.merge(_.cloneDeep(mobileItemView), {
                    "name": partViewName, "forType": partType.name,
                    "comp": {"items": [{"data": "image3"}]}
                });

                expect(view).toEqual(expected);
            });
        });
    });
});
