define(['lodash', 'utils', 'testUtils', 'components/components/disqusComments/disqusComments'],
    function (_, /** utils */ utils, /** testUtils */ testUtils, disqusCommentsDef) {
        'use strict';

        describe('DisqusComments component', function() {
            var siteAPI;
            function createDisqusComponent(data) {

                var siteData = testUtils.mockFactory.mockSiteData();
                var props = testUtils.mockFactory
                    .mockProps(siteData)
                    .setCompData(data || {});
                props.structure.componentType = 'wysiwyg.common.components.disquscomments.viewer.DisqusComments';

                siteAPI = props.siteAPI;

                return testUtils.getComponentFromDefinition(disqusCommentsDef, props);

            }

            beforeEach(function() {
                spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('en');
            });

            describe('when disqusId is defined', function() {
                var component;

                beforeEach(function () {
                    component = createDisqusComponent({disqusId: 'someDisqusId'});
                });

                it('component should be defined', function() {
                    expect(component).toBeDefined();
                });

                describe('getIframeSrc()', function() {

                    beforeEach(function() {
                        spyOn(utils.urlUtils, 'toQueryString').and.callThrough();
                        spyOn(component, 'getDisqusInstanceId').and.returnValue('result_disqus_identifier');
                        siteAPI.setPageTitle('page title');
                        component.getIframeSrc();
                    });

                    it('should call utils.urlUtils.toQueryString to encode arguments', function() {
                        expect(utils.urlUtils.toQueryString).toHaveBeenCalled();
                    });

                    it('should use supplied disqusId', function() {
                        expect(utils.urlUtils.toQueryString.calls.mostRecent().args[0]).toContain({
                            disqusId : 'someDisqusId'
                        });
                    });

                    it('should use componentId as id for post messaging', function() {
                        expect(utils.urlUtils.toQueryString.calls.mostRecent().args[0]).toContain({
                            compId : component.props.id
                        });
                    });

                    it('should use result of getDisqusInstanceId() as disqusInstanceId', function() {
                        expect(utils.urlUtils.toQueryString.calls.mostRecent().args[0]).toContain({
                            disqusInstanceId : 'result_disqus_identifier'
                        });
                    });

                    it('should use current page title as pateTitle', function() {
                        expect(utils.urlUtils.toQueryString.calls.mostRecent().args[0]).toContain({
                            pageTitle : 'page title'
                        });
                    });
                });

                xdescribe('getDisqusInstanceId()', function() {
                    beforeEach(function() {
                        spyOn(component, 'getHash').and.callThrough();
                    });

                    describe('when component in editor', function () {
                        beforeEach(function () {
                            spyOn(component, 'isComponentInMasterPage').and.callThrough();
                            spyOn(component, 'getSinglePostComponent').and.callThrough();
                            component.props.siteData.viewMode = 'preview';

                            component.getDisqusInstanceId();
                        });

                        it('should use \'editor\' keyword for instanceId generation', function () {
                            expect(component.getHash).toHaveBeenCalledWith('editor');
                        });

                        it('should not check if component on master page', function () {
                            expect(component.isComponentInMasterPage).not.toHaveBeenCalled();
                        });

                        it('should not search for single post component', function () {
                            expect(component.getSinglePostComponent).not.toHaveBeenCalled();
                        });
                    });

                    describe('when component on master page', function () {

                        beforeEach(function () {
                            spyOn(component, 'isComponentInMasterPage').and.returnValue(true);
                            spyOn(component, 'getSinglePostComponent').and.callThrough();

                            component.getDisqusInstanceId();
                        });


                        it('should use only siteId for disqusIdentifier generation', function () {
                            expect(component.getHash.calls.mostRecent().args.length).toEqual(1);
                            expect(component.getHash.calls.mostRecent().args[0]).toEqual('bac442c8-b7fd-4bd1-ac7e-096fec2fc800');
                        });

                        it('should not search for single post component', function () {
                            expect(component.getSinglePostComponent).not.toHaveBeenCalled();
                        });
                    });

                    describe('when component on single post page', function() {
                        beforeEach(function () {
                            spyOn(component, 'isComponentInMasterPage').and.returnValue(false);
                            spyOn(component, 'getSinglePostComponent').and.returnValue({id: '1'});

                            component.props.siteAPI.getSiteData().wixapps.blog = {
                                '1': ['Post', 'test_post_id']
                            };

                            component.getDisqusInstanceId();
                        });

                        it('should use siteId, pageId and postId for disqusIdentifier generation', function() {
                            expect(component.getHash.calls.mostRecent().args.length).toEqual(3);
                            expect(component.getHash.calls.mostRecent().args[0]).toEqual('bac442c8-b7fd-4bd1-ac7e-096fec2fc800');
                            expect(component.getHash.calls.mostRecent().args[1]).toEqual('currentPage');
                            expect(component.getHash.calls.mostRecent().args[2]).toEqual('test_post_id');
                        });
                    });

                    describe('when component not on master page or on single post page', function() {
                        beforeEach(function () {
                            spyOn(component, 'isComponentInMasterPage').and.returnValue(false);
                            spyOn(component, 'getSinglePostComponent').and.returnValue(undefined);

                            component.getDisqusInstanceId();
                        });

                        it('should use siteId and pageId for disqusIdentifier generation', function() {
                            expect(component.getHash.calls.mostRecent().args.length).toEqual(2);
                            expect(component.getHash.calls.mostRecent().args[0]).toEqual('bac442c8-b7fd-4bd1-ac7e-096fec2fc800');
                            expect(component.getHash.calls.mostRecent().args[1]).toEqual('currentPage');
                        });

                        it('should search for single post component', function () {
                            expect(component.getSinglePostComponent).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('when disqusId is not defined', function() {
                var component;

                beforeEach(function () {
                    component = createDisqusComponent({disqusId: ''});
                });

                describe('getIframeSrc()', function() {

                    beforeEach(function() {
                        spyOn(utils.urlUtils, 'toQueryString').and.callThrough();
                        component.getIframeSrc();
                    });

                    it('should use default wix disqusId', function() {
                        expect(utils.urlUtils.toQueryString).toHaveBeenCalled();
                        expect(utils.urlUtils.toQueryString.calls.mostRecent().args[0]).toContain({
                            disqusId : 'wixdemo123'
                        });
                    });
                });
            });
        });
    });
