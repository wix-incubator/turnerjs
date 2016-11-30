define(['lodash', 'testUtils', 'definition!siteUtils/core/dataResolver'], function (_, testUtils, dataResolverDef) {
    'use strict';

    describe('dataResolver', function () {
        function getDataResolver(dataRefs, propertiesRefs, customResolvers) {
            var DataResolver = dataResolverDef(_, {
                Data: dataRefs || {},
                Properties: propertiesRefs || {}
            }, customResolvers || {});

            return new DataResolver();
        }


        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
        });

        describe('DataResolver', function () {
            describe('getDataByQuery', function () {
                describe('multiple current page ids', function () {

                    it("should get the data of the item from it's page data", function () {
                        var expected = {
                            id: 'comp-1',
                            type: 'Basic',
                            property: 5
                        };

                        this.siteData.addData(expected);

                        var dataResolver = getDataResolver();
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + expected.id);

                        expect(actual).toEqual(expected);
                    });

                    it("should resolve ref data of the item if it's a ref property", function () {
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            property: 5
                        };

                        this.siteData.addData(data1).addData(data2);
                        var dataRefs = {
                            Basic: {
                                refProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(_.defaults({refProperty: data2}, data1));
                    });

                    it('should get the data from one of the currentPageIds (only one) if it was not found in masterPage (i.e. pageId equals masterPage)', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            property: 5
                        };

                        this.siteData.addData(data1, 'masterPage')
                            .addData(data2, 'testPage');

                        var dataRefs = {
                            Basic: {
                                refProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(_.defaults({refProperty: data2}, data1));
                    });

                    it('should get the data from one of the currentPageIds (more then one) if it was not found in masterPage (i.e. pageId equals masterPage)', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        this.siteData.addPageWithDefaults('testPage2');
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data3 = {
                            id: 'data-3',
                            type: 'InnerType',
                            value: 6
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            anotherRefProperty: 'data-3',
                            property: 5
                        };

                        this.siteData.addData(data1, 'masterPage')
                            .addData(data2, 'testPage')
                            .addData(data3, 'testPage2');

                        var dataRefs = {
                            Basic: {
                                refProperty: false,
                                anotherRefProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage2', 'testPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(_.defaults({refProperty: data2, anotherRefProperty: data3}, data1));
                    });

                    it('should use masterPage as the only fallback page when requesting data from a specific page and not masterPage', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        this.siteData.addPageWithDefaults('testPage2');
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data3 = {
                            id: 'data-3',
                            type: 'InnerType',
                            value: 6
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            anotherRefProperty: 'data-3',
                            property: 5
                        };

                        this.siteData.addData(data1, 'testPage')
                            .addData(data2, 'masterPage')
                            .addData(data3, 'testPage2');

                        var dataRefs = {
                            Basic: {
                                refProperty: false,
                                anotherRefProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage2', 'testPage'], 'testPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        var expected = _.defaults({
                            refProperty: data2,
                            anotherRefProperty: null
                        }, data1);

                        expect(actual).toEqual(expected);
                    });

                    it('should not resolve data from fallbackPages if the data exists in the requested page (for refs)', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        var data2 = {
                            id: 'data-1',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            property: 15
                        };

                        this.siteData.addData(data1, 'testPage')
                            .addData(data2, 'masterPage');

                        var dataResolver = getDataResolver();
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage'], 'testPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(data1);
                    });

                    it('should not resolve data from fallbackPages if the data exists in the requested page (for refs)', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data3 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 6
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            property: 5
                        };

                        this.siteData.addData(data1, 'testPage')
                            .addData(data2, 'masterPage')
                            .addData(data3, 'testPage');

                        var dataRefs = {
                            Basic: {
                                refProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage'], 'testPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(_.defaults({refProperty: data3}, data1));
                    });

                    it('should support properties of type object', function () {
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            barvaz: 'oger'
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            object: {
                                ref: 'data-2'
                            },
                            heli: 'wow'
                        };

                        this.siteData.addData(data1).addData(data2);

                        var dataResolver = getDataResolver({Basic: {object: {ref: false}}});
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        var expected = _.defaults({object: {ref: data2}}, data1);

                        expect(actual).toEqual(expected);
                    });

                    it('should not resolve $ref property', function () {
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            object: {
                                type: 'HasRefs',
                                ref: 'data-2'
                            },
                            property: 5
                        };

                        this.siteData.addData(data1).addData(data2);
                        var dataRefs = {
                            HasRefs: {
                                ref: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        var expected = _.cloneDeep(data1);
                        expect(actual).toEqual(expected);
                    });

                    it('should resolve two level deep refs', function () {
                        var imageData = {
                            id: 'image-1',
                            uti: 'www.barvaz.oger.com/image.jpeg',
                            title: 'barvaz'
                        };

                        var pageData = {
                            id: 'data-1',
                            type: 'Page',
                            pageBackgrounds: {
                                desktop: {
                                    custom: true,
                                    isPreset: false,
                                    ref: 'image-1'
                                }
                            },
                            property: 5
                        };

                        this.siteData.addData(pageData).addData(imageData);
                        var dataRefs = {
                            Page: {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: false
                                    }
                                }
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + pageData.id);

                        var expected = _.cloneDeep(pageData);
                        expected.pageBackgrounds.desktop.ref = imageData;
                        expect(actual).toEqual(expected);
                    });

                    it('should resolve two level deep refs without changing the original', function () {
                        var imageData = {
                            id: 'image-1',
                            uti: 'www.barvaz.oger.com/image.jpeg',
                            title: 'barvaz'
                        };

                        var pageData = {
                            id: 'data-1',
                            type: 'Page',
                            pageBackgrounds: {
                                desktop: {
                                    custom: true,
                                    isPreset: false,
                                    ref: 'image-1'
                                }
                            },
                            property: 5
                        };

                        this.siteData.addData(pageData).addData(imageData);
                        var dataRefs = {
                            Page: {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: false
                                    }
                                }
                            }
                        };
                        var expected = _.cloneDeep(pageData);

                        var dataResolver = getDataResolver(dataRefs);
                        dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + pageData.id);

                        expect(pageData).toEqual(expected);
                    });

                    it("should set ref property to null if the ref data doesn't exist", function () {
                        var data = {
                            id: 'data-1',
                            type: 'HasRefs',
                            ref: '#data-2'
                        };

                        this.siteData.addData(data);
                        var dataRefs = {
                            HasRefs: {
                                ref: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                        var expected = _.clone(data);
                        expected.ref = null;
                        expect(actual).toEqual(expected);
                    });

                    it('should return the string value of the property if there is no data with the ref data if the property refData is true', function () {
                        var data = {
                            id: 'data-1',
                            type: 'HasRefs',
                            ref: '#data-2'
                        };

                        this.siteData.addData(data);
                        var dataRefs = {
                            HasRefs: {
                                ref: true
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                        expect(actual).toEqual(data);
                    });

                    it('should not clone data without refs', function () {
                        var expected = {
                            id: 'comp-1',
                            type: 'Basic',
                            property: 5
                        };

                        this.siteData.addData(expected);

                        var dataResolver = getDataResolver();
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + expected.id);

                        expect(actual).toBe(this.siteData.getData(expected.id));
                    });

                    it('should clone data with refs', function () {
                        var data = {
                            id: 'data-1',
                            type: 'HasRefs',
                            ref: '#data-2'
                        };

                        this.siteData.addData(data);
                        var dataRefs = {
                            HasRefs: {
                                ref: true
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                        expect(actual).not.toBe(this.siteData.getData(data.id));
                    });

                    it("should not add properties of refs if they don't exist in the raw data", function () {
                        var expected = {
                            id: 'comp-1',
                            type: 'Basic',
                            property: 5
                        };

                        this.siteData.addData(expected);

                        var dataRefs = {
                            Basic: {
                                anotherProp: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + expected.id);

                        expect(actual).toEqual(this.siteData.getData(expected.id));
                    });
                });

                describe('single current page id', function () {
                    it("should get the data of the item from it's page data", function () {
                        var expected = {
                            id: 'comp-1',
                            type: 'Basic',
                            property: 5
                        };

                        this.siteData.addData(expected);

                        var dataResolver = getDataResolver();
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + expected.id);

                        expect(actual).toEqual(expected);
                    });

                    it("should resolve ref data of the item if it's a ref property", function () {
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            property: 5
                        };

                        this.siteData.addData(data1).addData(data2);
                        var dataRefs = {
                            Basic: {
                                refProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(_.defaults({refProperty: data2}, data1));
                    });

                    it('should get the data from the currentPageId if it was not found in masterPage (i.e. pageId equals masterPage)', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            property: 5
                        };

                        this.siteData.addData(data1, 'masterPage')
                            .addData(data2, 'testPage');

                        var dataRefs = {
                            Basic: {
                                refProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        expect(actual).toEqual(_.defaults({refProperty: data2}, data1));
                    });

                    it('should use masterPage as the fallback page when requesting data from a specific page and not masterPage', function () {
                        this.siteData.addPageWithDefaults('testPage');
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            refProperty: 'data-2',
                            property: 5
                        };

                        this.siteData.addData(data1, 'testPage')
                            .addData(data2, 'masterPage');

                        var dataRefs = {
                            Basic: {
                                refProperty: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['testPage'], 'testPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        var expected = _.defaults({
                            refProperty: data2
                        }, data1);

                        expect(actual).toEqual(expected);
                    });

                    it('should support properties of type object', function () {
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            barvaz: 'oger'
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            object: {
                                ref: 'data-2'
                            },
                            heli: 'wow'
                        };

                        this.siteData.addData(data1).addData(data2);

                        var dataResolver = getDataResolver({Basic: {object: {ref: false}}});
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        var expected = _.defaults({object: {ref: data2}}, data1);

                        expect(actual).toEqual(expected);
                    });

                    it('should not resolve $ref property', function () {
                        var data2 = {
                            id: 'data-2',
                            type: 'InnerType',
                            value: 5
                        };

                        var data1 = {
                            id: 'data-1',
                            type: 'Basic',
                            object: {
                                type: 'HasRefs',
                                ref: 'data-2'
                            },
                            property: 5
                        };

                        this.siteData.addData(data1).addData(data2);
                        var dataRefs = {
                            HasRefs: {
                                ref: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data1.id);

                        var expected = _.cloneDeep(data1);
                        expect(actual).toEqual(expected);
                    });

                    it('should resolve two level deep refs', function () {
                        var imageData = {
                            id: 'image-1',
                            uti: 'www.barvaz.oger.com/image.jpeg',
                            title: 'barvaz'
                        };

                        var pageData = {
                            id: 'data-1',
                            type: 'Page',
                            pageBackgrounds: {
                                desktop: {
                                    custom: true,
                                    isPreset: false,
                                    ref: 'image-1'
                                }
                            },
                            property: 5
                        };

                        this.siteData.addData(pageData).addData(imageData);
                        var dataRefs = {
                            Page: {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: false
                                    }
                                }
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + pageData.id);

                        var expected = _.cloneDeep(pageData);
                        expected.pageBackgrounds.desktop.ref = imageData;
                        expect(actual).toEqual(expected);
                    });

                    it('should resolve two level deep refs without changing the original', function () {
                        var imageData = {
                            id: 'image-1',
                            uti: 'www.barvaz.oger.com/image.jpeg',
                            title: 'barvaz'
                        };

                        var pageData = {
                            id: 'data-1',
                            type: 'Page',
                            pageBackgrounds: {
                                desktop: {
                                    custom: true,
                                    isPreset: false,
                                    ref: 'image-1'
                                }
                            },
                            property: 5
                        };

                        this.siteData.addData(pageData).addData(imageData);
                        var dataRefs = {
                            Page: {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: false
                                    }
                                }
                            }
                        };
                        var expected = _.cloneDeep(pageData);

                        var dataResolver = getDataResolver(dataRefs);
                        dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + pageData.id);

                        expect(pageData).toEqual(expected);
                    });

                    it("should set ref property to null if the ref data doesn't exist", function () {
                        var data = {
                            id: 'data-1',
                            type: 'HasRefs',
                            ref: '#data-2'
                        };

                        this.siteData.addData(data);
                        var dataRefs = {
                            HasRefs: {
                                ref: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                        var expected = _.clone(data);
                        expected.ref = null;
                        expect(actual).toEqual(expected);
                    });

                    it('should return the string value of the property if there is no data with the ref data if the property refData is true', function () {
                        var data = {
                            id: 'data-1',
                            type: 'HasRefs',
                            ref: '#data-2'
                        };

                        this.siteData.addData(data);
                        var dataRefs = {
                            HasRefs: {
                                ref: true
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                        expect(actual).toEqual(data);
                    });

                    it('should not clone data without refs', function () {
                        var expected = {
                            id: 'comp-1',
                            type: 'Basic',
                            property: 5
                        };

                        this.siteData.addData(expected);

                        var dataResolver = getDataResolver();
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + expected.id);

                        expect(actual).toBe(this.siteData.getData(expected.id));
                    });

                    it('should clone data with refs', function () {
                        var data = {
                            id: 'data-1',
                            type: 'HasRefs',
                            ref: '#data-2'
                        };

                        this.siteData.addData(data);
                        var dataRefs = {
                            HasRefs: {
                                ref: true
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                        expect(actual).not.toBe(this.siteData.getData(data.id));
                    });

                    it("should not add properties of refs if they don't exist in the raw data", function () {
                        var expected = {
                            id: 'comp-1',
                            type: 'Basic',
                            property: 5
                        };

                        this.siteData.addData(expected);

                        var dataRefs = {
                            Basic: {
                                anotherProp: false
                            }
                        };

                        var dataResolver = getDataResolver(dataRefs);
                        var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + expected.id);

                        expect(actual).toEqual(this.siteData.getData(expected.id));
                    });

	                it('should resolve all items in a referenced array', function () {
		                var items = [{id: 'item-1', label: 'first item'}, {id: 'item-2', label: 'first item'}];
		                var data = {
			                id: 'data-1',
			                type: 'HasArrayRefs',
			                items: ['#item-1', '#item-2']
		                };

		                this.siteData.addData(data);
		                _.forEach(items, function (item) {
			                this.siteData.addData(item);
		                }, this);

		                var dataRefs = {
			                HasArrayRefs: {
				                items: false
			                }
		                };

		                var dataResolver = getDataResolver(dataRefs);
		                var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

		                expect(actual).toEqual(_.defaults({items: items}, data));
	                });

	                it('should return the string value of the property if there is no data with the ref data and the property in refData is true for deeper data', function () {
		                var data = {
			                id: 'data-1',
			                type: 'HasDeepRefs',
			                inner: {
				                ref: '#data-3'
			                },
			                ref: '#data-2'
		                };

		                this.siteData.addData(data);

		                var dataRefs = {
			                HasDeepRefs: {
				                inner: {
					                ref: true
				                }
			                }
		                };

		                var dataResolver = getDataResolver(dataRefs);
		                var actual = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

		                expect(actual).toEqual(data);
	                });
                });
            });

            describe('clearCache', function () {
                it('should return data from cache on second call to getDataByQuery', function () {
                    var data = {
                        id: 'data-1',
                        type: 'HasRefs',
                        ref: '#data-2'
                    };

                    this.siteData.addData(data);
                    var dataRefs = {
                        HasRefs: {
                            ref: true
                        }
                    };

                    var dataResolver = getDataResolver(dataRefs);
                    var first = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    var second = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                    expect(first).toBe(second);
                });

                it('should return new instance if the cache cleared', function () {
                    var data = {
                        id: 'data-1',
                        type: 'HasRefs',
                        ref: '#data-2'
                    };

                    this.siteData.addData(data);
                    var dataRefs = {
                        HasRefs: {
                            ref: true
                        }
                    };

                    var dataResolver = getDataResolver(dataRefs);
                    var first = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    dataResolver.clearCache();
                    var second = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                    expect(first).toEqual(second);
                    expect(first).not.toBe(second);
                });
            });

            describe('setReadingFromCache', function () {
                it('should return new instance if the reading from cache is false', function () {
                    var data = {
                        id: 'data-1',
                        type: 'HasRefs',
                        ref: '#data-2'
                    };

                    this.siteData.addData(data);
                    var dataRefs = {
                        HasRefs: {
                            ref: true
                        }
                    };

                    var dataResolver = getDataResolver(dataRefs);
                    var first = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    dataResolver.setReadingFromCache(false);
                    var second = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                    expect(first).toEqual(second);
                    expect(first).not.toBe(second);
                });

                it('should return same instance once the reading from cache is set back to true', function () {
                    var data = {
                        id: 'data-1',
                        type: 'HasRefs',
                        ref: '#data-2'
                    };

                    this.siteData.addData(data);
                    var dataRefs = {
                        HasRefs: {
                            ref: true
                        }
                    };

                    var dataResolver = getDataResolver(dataRefs);
                    var first = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    dataResolver.setReadingFromCache(false);
                    var second = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    dataResolver.setReadingFromCache(true);
                    var third = dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);

                    expect(first).not.toBe(second);
                    expect(first).not.toBe(third);
                    expect(second).toBe(third);
                });
            });

            describe('SE-13017: dataItems and propertyItems with identical ids', function(){
                it('should each return the correct item (data->dataItem, property->propertyItem)', function(){
                    //NOTE: there currently needs top be refs in the dataItem in order for the item to be cached... otherwise this test is meaningless
                    var COMMON_ID = 'idWhichExistsInDataAndProps';
                    var DATA_TYPE = 'DataItemWithRefs';
                    var PROPERTY_TYPE = 'PropertiesItem';
                    var data = {
                        id: COMMON_ID,
                        type: DATA_TYPE,
                        ref: '#data-ref'
                    };

                    var properties = {
                        id: COMMON_ID,
                        type: PROPERTY_TYPE
                    };

                    var dataRefs = {};
                    dataRefs[DATA_TYPE] = {ref: true};

                    var currentPageId = this.siteData.getCurrentUrlPageId();
                    this.siteData.addData(data, currentPageId).addProperties(properties, currentPageId);

                    var dataResolver = getDataResolver(dataRefs);
                    dataResolver.setReadingFromCache(true);
                    var dataItem = dataResolver.getDataByQuery(this.siteData.pagesData, [currentPageId], currentPageId, this.siteData.dataTypes.DATA, '#' + data.id);
                    var propertiesItem = dataResolver.getDataByQuery(this.siteData.pagesData, [currentPageId], currentPageId, this.siteData.dataTypes.PROPERTIES, properties.id);

                    expect(dataItem.type).toEqual(DATA_TYPE);
                    expect(propertiesItem.type).toEqual(PROPERTY_TYPE);
                });
            });
            describe('Data Resolver Plugins', function(){
                beforeEach(function(){
                    var customResolvers = {
                        'HasPlugin': {
                            resolve: function(obj){return _.clone(obj);}
                        }
                    };
                    this.dataResolver = getDataResolver(null, null, customResolvers);
                    this.spiedResolver = spyOn(customResolvers.HasPlugin, 'resolve').and.callThrough();

                });
                it('should call a plugin if required by data type', function(){
                    var data = {
                        id: 'data-1',
                        type: 'HasPlugin'
                    };
                    this.siteData.addData(data);

                    var result = this.dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    expect(this.spiedResolver).toHaveBeenCalledWith(data, jasmine.any(Function));
                    expect(result).toEqual(data);

                });

                it('should not call a plugin if not required by data type', function(){
                    var data = {
                        id: 'data-1',
                        type: 'UseDefault'
                    };
                    this.siteData.addData(data);

                    this.dataResolver.getDataByQuery(this.siteData.pagesData, ['masterPage'], 'masterPage', this.siteData.dataTypes.DATA, '#' + data.id);
                    expect(this.spiedResolver).not.toHaveBeenCalled();
                });
            });

        });
    });
});
