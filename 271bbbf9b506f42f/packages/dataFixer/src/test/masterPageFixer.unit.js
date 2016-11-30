define(['lodash', 'testUtils', 'dataFixer/plugins/masterPageFixer'], function (_, testUtils, masterPageFixer) {
    'use strict';
   describe('masterPageFixer', function () {
        function normalSiteStructureLayout(width) {
            return {x: 0, y: 0, width: width || 980, height: 200};
        }

        function getMasterPage() {
            var siteData = testUtils.mockFactory.mockSiteData();
            return siteData.pagesData.masterPage;
        }

        describe("ids and component types", function () {
            it('should fix pages container id on desktop components', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        type: 'Document',
                        children: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'DUMMY'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'SITE_FOOTER'},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'SITE_HEADER'}
                        ],
                        mobileComponents: []
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.children, 'componentType', 'wysiwyg.viewer.components.PagesContainer');
                expect(pc.id).toBe('PAGES_CONTAINER');
            });

            it('should fix site header id on desktop components', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        type: 'Document',
                        children: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'PAGES_CONTAINER'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'SITE_FOOTER'},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'DUMMY'}
                        ],
                        mobileComponents: []
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.children, 'componentType', 'wysiwyg.viewer.components.HeaderContainer');
                expect(pc.id).toBe('SITE_HEADER');
            });

            it('should fix site footer id on desktop components', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        type: 'Document',
                        children: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'PAGES_CONTAINER'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'DUMMY'},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'SITE_HEADER'}
                        ],
                        mobileComponents: []
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.children, 'componentType', 'wysiwyg.viewer.components.FooterContainer');
                expect(pc.id).toBe('SITE_FOOTER');
            });

            it('should fix pages container id on mobile components', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        type: 'Document',
                        children: [],
                        mobileComponents: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'DUMMY'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'SITE_FOOTER'},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'SITE_HEADER'}
                        ]
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.mobileComponents, 'componentType', 'wysiwyg.viewer.components.PagesContainer');
                expect(pc.id).toBe('PAGES_CONTAINER');
            });

            it('should fix distance between anchor and masterPage', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        type: 'Document',
                        id: 'masterPage',
                        children: [],
                        mobileComponents: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'DUMMY'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'SITE_FOOTER', layout: {
                                anchors: [
                                    {
                                        distance: 10,
                                        locked: true,
                                        originalValue: 500,
                                        targetComponent: 'masterPage',
                                        topToTop: 500,
                                        type: 'BOTTOM_PARENT'
                                    }
                                ]
                            }},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'SITE_HEADER'}
                        ]
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.mobileComponents, 'componentType', 'wysiwyg.viewer.components.FooterContainer');
                expect(pc.layout.anchors[0].distance).toBe(0);
            });

            it('should fix site header id on mobile components', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        children: [],
                        type: 'Document',
                        mobileComponents: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'PAGES_CONTAINER'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'SITE_FOOTER'},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'DUMMY'}
                        ]
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.mobileComponents, 'componentType', 'wysiwyg.viewer.components.HeaderContainer');
                expect(pc.id).toBe('SITE_HEADER');
            });

            it('should fix site footer id on mobile components', function () {
                var mockMasterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        children: [],
                        type: 'Document',
                        mobileComponents: [
                            {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'PAGES_CONTAINER'},
                            {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'DUMMY'},
                            {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'SITE_HEADER'}
                        ]
                    }
                };
                masterPageFixer.exec(mockMasterPage);
                var pc = _.find(mockMasterPage.structure.mobileComponents, 'componentType', 'wysiwyg.viewer.components.FooterContainer');
                expect(pc.id).toBe('SITE_FOOTER');
            });
        });

        describe("corrupted width and height due to bug SE-15940", function () {


            function corruptedCompWidth(id) {
                return {
                    componentType: 'someCompType',
                    id: id || 'someComp',
                    layout: {x: 0, y: 0, width: 0, height: 200},
                    components: []
                };
            }

            function corruptedCompHeight(id) {
                return {
                    componentType: 'someCompType',
                    id: id || 'someComp',
                    layout: {x: 0, y: 0, width: 200, height: 0},
                    components: []
                };
            }

            function nonCorruptedComp(id) {
                return {
                    componentType: 'someCompType',
                    id: id || 'someComp',
                    layout: {x: 0, y: 0, width: 200, height: 200},
                    components: []
                };
            }

            beforeEach(function () {
                this.header = {
                    componentType: 'wysiwyg.viewer.components.HeaderContainer',
                    id: 'SITE_HEADER',
                    layout: normalSiteStructureLayout(),
                    components: []
                };
                this.footer = {
                    componentType: 'wysiwyg.viewer.components.FooterContainer',
                    id: 'SITE_FOOTER',
                    layout: normalSiteStructureLayout(),
                    components: []
                };
                this.mobileFooter = {
                    componentType: 'wysiwyg.viewer.components.FooterContainer',
                    id: 'SITE_FOOTER',
                    layout: normalSiteStructureLayout(320),
                    components: []
                };
                this.mobileHeader = {
                    componentType: 'wysiwyg.viewer.components.HeaderContainer',
                    id: 'SITE_HEADER',
                    layout: normalSiteStructureLayout(320),
                    components: []
                };

                this.masterPage = {
                    data: {
                        document_data: {}
                    },
                    structure: {
                        type: 'Document',
                        children: [
                            {
                                componentType: 'wysiwyg.viewer.components.PagesContainer',
                                id: 'PAGES_CONTAINER',
                                layout: normalSiteStructureLayout(),
                                components: []
                            },
                            this.footer,
                            this.header
                        ],
                        mobileComponents: [
                            {
                                componentType: 'wysiwyg.viewer.components.PagesContainer',
                                id: 'PAGES_CONTAINER',
                                layout: normalSiteStructureLayout(),
                                components: []
                            },
                            this.mobileFooter,
                            this.mobileHeader
                        ]
                    }
                };
            });

            describe("desktop", function () {
                it("should fix corrupted header", function () {
                    this.header.layout.width = 0;
                    this.header.layout.height = 0;
                    masterPageFixer.exec(this.masterPage);
                    expect(this.header.layout.width).toBe(980);
                    expect(this.header.layout.height).toBe(100);
                });
                it("should fix corrupted footer", function () {
                    this.footer.layout.width = 0;
                    this.footer.layout.height = 0;
                    masterPageFixer.exec(this.masterPage);
                    expect(this.footer.layout.width).toBe(980);
                    expect(this.footer.layout.height).toBe(100);
                });
                describe("when there is a corrupted header", function () {
                    it("should fix other corrupted components in the masterpage and header/footer if there was a corrupted header or footer", function () {
                        var compInHeader = corruptedCompWidth('compInHeader');
                        var compInFooter = corruptedCompHeight('compInFooter');
                        var compInMasterPage = corruptedCompHeight('compInMasterPage');
                        var normalComp = nonCorruptedComp('notCorrupted');
                        this.header.components.push(compInHeader);
                        this.footer.components.push(compInFooter);
                        this.masterPage.structure.children.push(compInMasterPage, normalComp);
                        this.header.layout.width = 0;
                        masterPageFixer.exec(this.masterPage);
                        expect(compInHeader.layout.width).toBe(100);
                        expect(compInFooter.layout.height).toBe(100);
                        expect(compInMasterPage.layout.height).toBe(100);
                        expect(normalComp.layout.width).toBe(200);
                        expect(normalComp.layout.height).toBe(200);
                    });
                });

                describe("when there is a corrupted footer", function () {
                    it("should fix other corrupted components in the masterpage and header/footer if there was a corrupted header or footer", function () {
                        var compInHeader = corruptedCompWidth('compInHeader');
                        var compInFooter = corruptedCompHeight('compInFooter');
                        var compInMasterPage = corruptedCompHeight('compInMasterPage');
                        var normalComp = nonCorruptedComp('notCorrupted');
                        this.header.components.push(compInHeader, normalComp);
                        this.footer.components.push(compInFooter);
                        this.masterPage.structure.children.push(compInMasterPage);
                        this.footer.layout.width = 0;
                        masterPageFixer.exec(this.masterPage);
                        expect(compInHeader.layout.width).toBe(100);
                        expect(compInFooter.layout.height).toBe(100);
                        expect(compInMasterPage.layout.height).toBe(100);
                        expect(normalComp.layout.width).toBe(200);
                        expect(normalComp.layout.height).toBe(200);

                    });
                });
                describe("when there is no corrupted header or footer", function () {
                    it("should not fix components which may have been corrupted in the past - since header and footer are fine, they are not corrupted from SE-15940", function () {
                        var compInHeader = corruptedCompWidth('compInHeader');
                        var compInFooter = corruptedCompHeight('compInFooter');
                        var compInMasterPage = corruptedCompHeight('compInMasterPage');
                        this.header.components.push(compInHeader);
                        this.footer.components.push(compInFooter);
                        this.masterPage.structure.children.push(compInMasterPage);
                        masterPageFixer.exec(this.masterPage);
                        expect(compInHeader.layout.width).toBe(0);
                        expect(compInFooter.layout.height).toBe(0);
                        expect(compInMasterPage.layout.height).toBe(0);
                    });
                });

            });

            describe("mobile", function () {
                it("should fix corrupted header", function () {
                    this.mobileHeader.layout.width = 0;
                    this.mobileHeader.layout.height = 0;
                    masterPageFixer.exec(this.masterPage);
                    expect(this.mobileHeader.layout.width).toBe(320);
                    expect(this.mobileHeader.layout.height).toBe(100);
                });

                it("should fix corrupted footer", function () {
                    this.mobileFooter.layout.width = 0;
                    this.mobileFooter.layout.height = 0;
                    masterPageFixer.exec(this.masterPage);
                    expect(this.mobileFooter.layout.width).toBe(320);
                    expect(this.mobileFooter.layout.height).toBe(100);
                });

            });

        });

        describe("header and/or footer have width which is not equal to the siteWidth (CLNT-5210)", function () {
            beforeEach(function () {
                this.header = {
                    componentType: 'wysiwyg.viewer.components.HeaderContainer',
                    id: 'SITE_HEADER',
                    layout: normalSiteStructureLayout(),
                    components: []
                };
                this.footer = {
                    componentType: 'wysiwyg.viewer.components.FooterContainer',
                    id: 'SITE_FOOTER',
                    layout: normalSiteStructureLayout(),
                    components: []
                };
                this.mobileFooter = {
                    componentType: 'wysiwyg.viewer.components.FooterContainer',
                    id: 'SITE_FOOTER',
                    layout: normalSiteStructureLayout(320),
                    components: []
                };
                this.mobileHeader = {
                    componentType: 'wysiwyg.viewer.components.HeaderContainer',
                    id: 'SITE_HEADER',
                    layout: normalSiteStructureLayout(320),
                    components: []
                };

                this.masterPage = {
                    data: {
                        document_data: {
                            masterPage: {}
                        }
                    },
                    structure: {
                        type: 'Document',
                        children: [
                            {
                                componentType: 'wysiwyg.viewer.components.PagesContainer',
                                id: 'PAGES_CONTAINER',
                                layout: normalSiteStructureLayout(),
                                components: []
                            },
                            this.footer,
                            this.header
                        ],
                        mobileComponents: [
                            {
                                componentType: 'wysiwyg.viewer.components.PagesContainer',
                                id: 'PAGES_CONTAINER',
                                layout: normalSiteStructureLayout(),
                                components: []
                            },
                            this.mobileFooter,
                            this.mobileHeader
                        ]
                    }
                };
            });
            describe("when the site has no renderModifier for the siteWidth", function () {
                it("should fix the width to be the default site width (980)", function () {
                    this.header.layout.width = 1000;
                    this.footer.layout.width = 700;

                    masterPageFixer.exec(this.masterPage);

                    expect(this.header.layout.width).toBe(980);
                    expect(this.footer.layout.width).toBe(980);
                });
            });

            describe("when the site has a renderModifier for the siteWidth", function () {
                it("should fix the width to be the default site width (980)", function () {
                    this.header.layout.width = 1000;
                    this.footer.layout.width = 700;
                    this.masterPage.data.document_data.masterPage.renderModifiers = {
                        siteWidth: 2000
                    };

                    masterPageFixer.exec(this.masterPage);

                    expect(this.header.layout.width).toBe(2000);
                    expect(this.footer.layout.width).toBe(2000);
                });
            });
        });

        describe('masterPage id refactor', function () {
            beforeEach(function(){
                var masterPage = getMasterPage();
                masterPage.data.document_data.SITE_STRUCTURE = masterPage.data.document_data.masterPage;
                masterPage.data.document_data.masterPage = undefined;
                this.masterPage = masterPage;
            });

            it('should replace SITE_STRUCTURE data node with masterPage dataNode', function () {
                var siteStructureNode = this.masterPage.data.document_data.SITE_STRUCTURE;

                masterPageFixer.exec(this.masterPage);

                expect(siteStructureNode).toBeTruthy();
                expect(this.masterPage.data.document_data.SITE_STRUCTURE).not.toBeDefined();
                expect(this.masterPage.data.document_data.masterPage).toEqual(siteStructureNode);
            });
        });
    });
});
