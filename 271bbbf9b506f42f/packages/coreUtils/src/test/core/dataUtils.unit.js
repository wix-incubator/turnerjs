define(['lodash', 'coreUtils/core/dataUtils', 'testUtils'], function (_, dataUtils, testUtils) {
    'use strict';

    describe('dataUtils', function(){

        describe('getChildrenData()', function () {

            it('on mobile', function () {
                var data = {
                    mobileComponents: 'mobile',
                    children: 'non-mobile',
                    components: 'comps'
                };
                expect(dataUtils.getChildrenData(data, true)).toEqual('mobile');
            });

            it('on non-mobile', function () {
                var data = {
                    mobileComponents: 'mobile',
                    children: 'non-mobile',
                    components: 'comps'
                };
                expect(dataUtils.getChildrenData(data, false)).toEqual('non-mobile');
            });

            it('children not found', function () {
                var data = {
                    mobileComponentsFake: 'mobile',
                    childrenFake: 'non-mobile',
                    components: 'comps'
                };
                expect(dataUtils.getChildrenData(data, false)).toEqual('comps');
            });
        });

        describe('getChildrenKey()', function () {
            var isMobile;

            describe('on mobile', function(){
                beforeEach(function(){
                   isMobile = true;
                });

                it('should return mobileComponents if is defined', function(){
                    var data = {
                        mobileComponents: 'mobile',
                        children: 'non-mobile',
                        components: 'comps'
                    };
                    expect(dataUtils.getChildrenKey(data, isMobile)).toEqual('mobileComponents');
                });

                it('should return children if mobileComponents is not defined ', function(){
                    var data = {
                        children: 'non-mobile',
                        components: 'comps'
                    };
                    expect(dataUtils.getChildrenKey(data, isMobile)).toEqual('children');
                });

                it('should return components if mobileComponents and children are not defined ', function(){
                    var data = {
                        components: 'comps'
                    };
                    expect(dataUtils.getChildrenKey(data, isMobile)).toEqual('components');
                });
            });

            describe('on desktop', function(){
                beforeEach(function(){
                    isMobile = false;
                });

                it('should return children if is defined', function(){
                    var data = {
                        mobileComponents: 'mobile',
                        children: 'non-mobile',
                        components: 'comps'
                    };
                    expect(dataUtils.getChildrenKey(data, isMobile)).toEqual('children');
                });

                it('should return components if children is not defined ', function(){
                    var data = {
                        mobileComponents: 'mobile',
                        components: 'comps'
                    };
                    expect(dataUtils.getChildrenKey(data, isMobile)).toEqual('components');
                });
            });
        });

        describe('isMobileStructureExist()', function() {
            it('using structure', function() {
                var pagesData = {
                    masterPage: {
                        structure: {
                            mobileComponents: {
                                someComp: 'fake'
                            }
                        }
                    }
                };
                expect(dataUtils.isMobileStructureExist(pagesData.masterPage)).toBeTruthy();
            });

            it('using structure, but empty', function() {
                var pagesData = {
                    masterPage: {
                        structure: {
                            mobileComponents: {
                            }
                        }
                    }
                };
                expect(dataUtils.isMobileStructureExist(pagesData.masterPage)).toBeFalsy();
            });

            it('using structure, but not found', function() {
                var pagesData = {
                    masterPage: {
                        structure: {
                        }
                    }
                };
                expect(dataUtils.isMobileStructureExist(pagesData.masterPage)).toBeFalsy();
            });
        });

        describe('findHierarchyInStructure', function(){
            it('should return an array of one if the id is of the structure', function(){
                var structure = {
                    id: 'a'
                };
                var id = 'a';
                var siteData = {isMobileView: function() { return false; }};

                expect(dataUtils.findHierarchyInStructure(id, siteData.isMobileView(), structure)).toEqual([structure]);
            });

            it('should return a hierarchy array if the id is inner in the structure', function(){
                var structureA1 = {id: 'a1', components: []};
                var structureA2 = {id: 'a2', components: []};

                var structure = {
                    id: 'a',
                    components: [structureA1, structureA2]
                };
                var id = 'a2';
                var siteData = {isMobileView: function() { return false; }};

                expect(dataUtils.findHierarchyInStructure(id, siteData.isMobileView(), structure)).toEqual([structure, structureA2]);
            });

            it('should return an empty array if id not found in structure', function(){
                var structureA1 = {id: 'a1', components: []};
                var structureA2 = {id: 'a2', components: []};

                var structure = {
                    id: 'a',
                    components: [structureA1, structureA2]
                };
                var id = 'a3';
                var siteData = {isMobileView: function() { return false; }};

                expect(dataUtils.findHierarchyInStructure(id, siteData.isMobileView(), structure)).toEqual([]);
            });

            it('should return a hierarchy of three level structure', function(){
                var structureA2 = {id: 'a2', components: []};
                var structureA1 = {id: 'a1', components: [structureA2]};

                var structure = {
                    id: 'a',
                    components: [structureA1]
                };
                var id = 'a2';
                var siteData = {isMobileView: function() { return false; }};

                expect(dataUtils.findHierarchyInStructure(id, siteData.isMobileView(), structure)).toEqual([structure, structureA1, structureA2]);
            });
        });

        describe('getAllCompsInStructure', function () {
	        function getMap(arrOfComps) {
		        return _.indexBy(arrOfComps, 'id');
	        }

	        it('should include masterPage', function () {
		        var siteData = testUtils.mockFactory.mockSiteData();
		        var structure = siteData.getMasterPageData().structure;

		        var actual = dataUtils.getAllCompsInStructure(structure);

		        expect(structure.id).toEqual('masterPage');
		        expect(actual.masterPage).toEqual(structure);
	        });

            it('should get the root component', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var pageData = siteData.getPageData('page1');

                var actual = dataUtils.getAllCompsInStructure(pageData.structure);
                expect(actual).toEqual(getMap([pageData.structure]));
            });

            it('should get root level components in the page', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var compStructure = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
                var pageData = siteData.getPageData('page1');

                var actual = dataUtils.getAllCompsInStructure(pageData.structure);
                expect(actual).toEqual(getMap([pageData.structure, compStructure]));
            });

            it('should not get mobile component when traversing desktop', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var isMobile = true;
                testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1', {}, isMobile);
                var pageData = siteData.getPageData('page1');

                var actual = dataUtils.getAllCompsInStructure(pageData.structure, !isMobile);
                expect(actual).toEqual(getMap([pageData.structure]));
            });

            it('should get desktop components if isMobile is not set', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
                var pageData = siteData.getPageData('page1');

                var expected = dataUtils.getAllCompsInStructure(pageData.structure, false);
                var actual = dataUtils.getAllCompsInStructure(pageData.structure);
                expect(actual).toEqual(expected);
            });

            it('should not get desktop components when traversing mobile', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var isMobile = false;
                testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1', {}, isMobile);
                var pageData = siteData.getPageData('page1');

                var actual = dataUtils.getAllCompsInStructure(pageData.structure, !isMobile);
                expect(actual).toEqual(getMap([pageData.structure]));
            });

            it('should get deep components', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
                var childStructure = testUtils.mockFactory.createStructure('mobile.core.components.Container', _.omit(container, ['id', 'componentType']));
                container.components = [childStructure];

                var pageData = siteData.getPageData('page1');

                var actual = dataUtils.getAllCompsInStructure(pageData.structure);
                expect(actual).toEqual(getMap([pageData.structure, container, childStructure]));
            });

	        describe('filter function', function () {
		        it('should filter out components who do not match the filter', function () {
			        var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
			        var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
			        var childStructure1 = testUtils.mockFactory.createStructure('compType1', {}, 'c1');
			        var childStructure2 = testUtils.mockFactory.createStructure('compType2', {}, 'c2');
			        var childStructure3 = testUtils.mockFactory.createStructure('compType1', {}, 'c3');
			        container.components = [childStructure1, childStructure2, childStructure3];

			        testUtils.mockFactory.mockComponent('compType1', siteData, 'page1');

			        var pageData = siteData.getPageData('page1');

			        var actual = dataUtils.getAllCompsInStructure(pageData.structure, false, function (c) {
				        return c.componentType !== 'compType1';
			        });

			        expect(actual).toEqual(getMap([pageData.structure, container, childStructure2]));
		        });
	        });
        });

        describe('findCompInStructure', function () {
            it('should return the first component in structure satisfying the predicate', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
                var childStructure1 = testUtils.mockFactory.createStructure('compType1', {}, 'c1');
                var childStructure2 = testUtils.mockFactory.createStructure('compType2', {}, 'c2');
                var childStructure3 = testUtils.mockFactory.createStructure('compType1', {}, 'c3');
                container.components = [childStructure1, childStructure2, childStructure3];

                var compStructure = testUtils.mockFactory.mockComponent('compType1', siteData, 'page1');

                var pageData = siteData.getPageData('page1');

                var foundComponent = dataUtils.findCompInStructure(pageData.structure, false, function (c) {
                    return c.componentType === 'compType1';
                });

                expect(foundComponent).toEqual(compStructure);
            });

            it('should return the first component in structure satisfying the predicate when it is two levels deep', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
                var childStructure1 = testUtils.mockFactory.createStructure('compType1', {}, 'c1');
                var childStructure2 = testUtils.mockFactory.createStructure('compType2', {}, 'c2');
                var childStructure3 = testUtils.mockFactory.createStructure('compType1', {}, 'c3');
                container.components = [childStructure1, childStructure2, childStructure3];

                testUtils.mockFactory.mockComponent('compType1', siteData, 'page1');

                var pageData = siteData.getPageData('page1');

                var foundComponent = dataUtils.findCompInStructure(pageData.structure, false, function (c) {
                    return c.componentType === 'compType2';
                });

                expect(foundComponent).toEqual(childStructure2);
            });

            it('should return null if there is no component in that structure satisfying the predicate', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1');
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'page1');
                var childStructure1 = testUtils.mockFactory.createStructure('compType1', {}, 'c1');
                var childStructure2 = testUtils.mockFactory.createStructure('compType2', {}, 'c2');
                var childStructure3 = testUtils.mockFactory.createStructure('compType1', {}, 'c3');
                container.components = [childStructure1, childStructure2, childStructure3];

                testUtils.mockFactory.mockComponent('compType1', siteData, 'page1');

                var pageData = siteData.getPageData('page1');

                var foundComponent = dataUtils.findCompInStructure(pageData.structure, false, function (c) {
                    return c.componentType === 'compType3';
                });

                expect(foundComponent).toEqual(null);
            });
        });
    });
});
