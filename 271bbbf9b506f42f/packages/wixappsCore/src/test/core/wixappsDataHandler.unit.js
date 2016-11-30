define(["lodash", "wixappsCore/core/wixappsDataHandler"], function (_, /** wixappsCore.wixappsDataHandler */ wixappsDataHandler) {
    "use strict";

    describe("wixappsDataHandler", function () {

        var mockSiteData = {
            wixapps: {
                app: {
                    descriptor: {key: "value"},
                    compId: ["typeName", "itemId"],
                    compId_extraData: {
                        some: {
                            extra: "data"
                        }
                    },
                    items: {
                        typeName: {
                            itemId: {
                                _type: "typeName",
                                title: "I'm a title"
                            }
                        }
                    }
                },
                app2: {},
                blog: {
                    categories: ['cat', 'cat2']
                }
            }
        };
        var packageName = "app";

//        return {
//
//            getDescriptor: getDescriptor,
//
//            getDataByCompId: getDataByCompId,
//
//            getExtraDataByCompId: getExtraDataByCompId,
//
//            getDataItemById: getDataItemById,
//
//            getDataByPath: getDataByPath,
//
//            setDataByPath: setDataByPath,
//
//            getSiteDataDestination: getSiteDataDestination
//
//        };

        describe("getDescriptor", function () {
            it("should return the app descriptor when it exists", function () {
                var desc = wixappsDataHandler.getDescriptor(mockSiteData, packageName);
                expect(desc).toEqual(mockSiteData.wixapps.app.descriptor);
            });
            it("should return undefined when the app descriptor does not exist", function () {
                var desc = wixappsDataHandler.getDescriptor(mockSiteData, "app2");
                expect(desc).toBeNull();
            });
            it("should return null when the appDataStore does not exist", function () {
                var desc = wixappsDataHandler.getDescriptor(mockSiteData, "app3");
                expect(desc).toBe(null);
            });
        });

        describe("getDataByCompId", function () {
            it("should return the data path registered for the given compId", function () {
                var data = wixappsDataHandler.getDataByCompId(mockSiteData, packageName, "compId");
                expect(data).toEqual(mockSiteData.wixapps.app.compId);
            });
            it("should return undefined when the compId does not exist", function () {
                var data = wixappsDataHandler.getDataByCompId(mockSiteData, packageName, "compId2");
                expect(data).toBeNull();
            });
            it("should return null when the appDataStore does not exist", function () {
                var data = wixappsDataHandler.getDataByCompId(mockSiteData, "app3");
                expect(data).toBe(null);
            });
        });

        describe("getExtraDataByCompId", function () {
            it("should return the extra data registered for the given compId", function () {
                var data = wixappsDataHandler.getExtraDataByCompId(mockSiteData, packageName, "compId");
                expect(data).toEqual(mockSiteData.wixapps.app.compId_extraData);
            });
            it("should return undefined when the compId does not have any extra data entry", function () {
                var data = wixappsDataHandler.getExtraDataByCompId(mockSiteData, packageName, "compId2");
                expect(data).toBeNull();
            });
            it("should return null when the appDataStore does not exist", function () {
                var data = wixappsDataHandler.getExtraDataByCompId(mockSiteData, "app3");
                expect(data).toBe(null);
            });
        });

        describe("getDataByPath", function () {
            it("should return data item at given path", function () {
                var data = wixappsDataHandler.getDataByPath(mockSiteData, "app", ["typeName", "itemId", "_type"]);
                expect(data).toEqual("typeName");
            });
            it("should return multiple data items when given path is an array of arrays", function () {
                var path = [
                    ["typeName", "itemId", "_type"],
                    ["typeName", "itemId", "title"]
                ];
                var data = wixappsDataHandler.getDataByPath(mockSiteData, "app", path);
                expect(data).toEqual(["typeName", "I'm a title"]);
            });
            it("should return an empty array when given an empty array as the path", function () {
                var data = wixappsDataHandler.getDataByPath(mockSiteData, "app", []);
                expect(data).toEqual([]);
            });
            it("should return undefined when last step in the path does not exist", function () {
                var data = wixappsDataHandler.getDataByPath(mockSiteData, "app", ["typeName", "itemId", "_type", "not here"]);
                expect(data).toBeUndefined();
            });
            it("should throw when a step in the path that is not the last one doesn't exist", function () {
                expect(function () {
                    wixappsDataHandler.getDataByPath(mockSiteData, "app", ["typeName", "itemId", "_type", "not here", "error"]);
                }).toThrow();
            });
        });

        describe("setDataByPath", function () {
            it("should set the value of the data at a given path to the given value", function () {
                wixappsDataHandler.setDataByPath(mockSiteData, "app", ["typeName", "itemId", "_type"], "newValue");
                expect(mockSiteData.wixapps.app.items.typeName.itemId._type).toEqual("newValue");
            });
        });

        describe("getBlogCategoriesFromPackagedData", function () {
            it("should return the categories when it exists", function () {
                var desc = wixappsDataHandler.getBlogCategoriesFromPackageData(mockSiteData.wixapps.blog);
                expect(desc).toEqual(mockSiteData.wixapps.blog.categories);
            });
        });

        describe("getBlogCategories", function () {
            it("should return the categories when it exists", function () {
                var desc = wixappsDataHandler.getBlogCategories(mockSiteData);
                expect(desc).toEqual(mockSiteData.wixapps.blog.categories);
            });
        });

        describe("getBlogCategoryByName", function () {
            it("should return blog category by its name", function () {
                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    }]),
                    "categoryName",
                    {
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: []
                    }]),
                    "otherCategoryName",
                    {
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    }, {
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: []
                    }]),
                    "otherCategoryName",
                    {
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    }, {
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: []
                    }]),
                    "categoryName",
                    {
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: [{
                            id: "subcategoryId",
                            name: "subcategoryName",
                            subcategories: []
                        }]
                    }]),
                    "subcategoryName",
                    {
                        id: "subcategoryId",
                        name: "subcategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: [{
                            id: "otherSubcategoryId",
                            name: "otherSubcategoryName",
                            subcategories: []
                        }]
                    }]),
                    "otherSubcategoryName",
                    {
                        id: "otherSubcategoryId",
                        name: "otherSubcategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: [{
                            id: "subcategoryId",
                            name: "subcategoryName",
                            subcategories: []
                        }, {
                            id: "otherSubcategoryId",
                            name: "otherSubcategoryName",
                            subcategories: []
                        }]
                    }]),
                    "otherSubcategoryName",
                    {
                        id: "otherSubcategoryId",
                        name: "otherSubcategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: [{
                            id: "subcategoryId",
                            name: "subcategoryName",
                            subcategories: []
                        }, {
                            id: "otherSubcategoryId",
                            name: "otherSubcategoryName",
                            subcategories: []
                        }]
                    }]),
                    "subcategoryName",
                    {
                        id: "subcategoryId",
                        name: "subcategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    }, {
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: [{
                            id: "subcategoryId",
                            name: "subcategoryName",
                            subcategories: []
                        }]
                    }]),
                    "subcategoryName",
                    {
                        id: "subcategoryId",
                        name: "subcategoryName",
                        subcategories: []
                    });

                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: [{
                            id: "subcategoryId",
                            name: "subcategoryName",
                            subcategories: []
                        }, {
                            id: "otherSubcategoryId",
                            name: "otherSubcategoryName",
                            subcategories: []
                        }]
                    }, {
                        id: "otherCategoryId",
                        name: "otherCategoryName",
                        subcategories: []
                    }]),
                    "subcategoryName",
                    {
                        id: "subcategoryId",
                        name: "subcategoryName",
                        subcategories: []
                    });
            });

            it("should return null if blog category does not exist", function () {
                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithBlogCategories([{
                        id: "categoryId",
                        name: "categoryName",
                        subcategories: []
                    }]),
                    "otherCategoryName",
                    null);
            });

            it("should return null if blog categories do not exist", function () {
                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithEmptyBlogStore(),
                    "categoryName",
                    null);
            });

            it("should return null if blog store does not exist", function () {
                givenSiteDataAndNameExpectReturnValue(
                    mockSiteDataWithoutBlogStore(),
                    "categoryName",
                    null);
            });

            function givenSiteDataAndNameExpectReturnValue(siteData, name, expectedReturnValue) {
                var actualReturnValue = wixappsDataHandler.getBlogCategoryByName(siteData, name);
                expect(actualReturnValue).toEqual(expectedReturnValue);
            }

            function mockSiteDataWithBlogCategories(categories) {
                var categoryById = {};
                var orderedCategories = [];
                _.forEach(categories, function (category) {
                    categoryById[category.id] = category;
                    orderedCategories.push(category);

                    _.forEach(category.subcategories, function (subcategory) {
                        categoryById[subcategory.id] = subcategory;
                        orderedCategories.push(subcategory);
                    });
                });

                var siteData = mockSiteDataWithEmptyBlogStore();
                siteData.wixapps.blog.categories = {
                    categories: categories,
                    categoryById: categoryById,
                    orderedCategories: orderedCategories
                };

                return siteData;
            }

            function mockSiteDataWithEmptyBlogStore() {
                var siteData = mockSiteDataWithoutBlogStore();
                siteData.wixapps.blog = {};
                return siteData;
            }

            function mockSiteDataWithoutBlogStore() {
                return {wixapps: {}};
            }
        });
    });
});
