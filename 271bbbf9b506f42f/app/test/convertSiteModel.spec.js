/* globals movePageDataToMaster:true */
describe('test convertSiteModel', function() {
    "use strict";

    describe('test moving pages data from page structure to master page', function() {

        it('should do no change to json if it is converted', function(){
            var clone = JSON.parse(JSON.stringify(convertedJson));
            movePageDataToMaster(convertedJson);
            expect(clone).toEqual(convertedJson);
        });

        it('should move bg items and remove pages from old type json', function(){
            movePageDataToMaster(siteWithBgImageJson);
            var pageDataAndLinked = ['page1', 'page2', 'bg1', 'bg2', 'bg1m', 'bg2m'];
            var existing = [];
            siteWithBgImageJson.pages.forEach(function(page){
                pageDataAndLinked.forEach(function(key){
                    if (page.data.document_data[key]){
                        existing.push(key);
                    }
                });
            });

            expect(existing.length).toBe(0);

            existing.forEach(function(key){
                expect(siteWithBgImageJson.masterPage.data.document_data[key]).toBeDefined();
            });

            expect(siteWithBgImageJson.pages[0].data.document_data.someComp).toBeDefined();
            expect(siteWithBgImageJson.pages[1].data.document_data.someComp2).toBeDefined();

            expect(siteWithBgImageJson.masterPage.data.document_data.someComp).not.toBeDefined();
            expect(siteWithBgImageJson.masterPage.data.document_data.someComp2).not.toBeDefined();
        });

        it('should move bg items and linked items and remove pages from new type json', function(){
            movePageDataToMaster(siteWithBgMediaJson);
            var pageDataAndLinked = ['page1', 'page2', 'bg1', 'bg2', 'bg1m', 'bg2m',
                                     'media1', 'media2', 'media1m', 'media2m',
                                     'poster1', 'poster2', 'poster1m', 'poster2m'];
            var existing = [];
            siteWithBgMediaJson.pages.forEach(function(page){
                pageDataAndLinked.forEach(function(key){
                    if (page.data.document_data[key]){
                        existing.push(key);
                    }
                });
            });
            expect(existing.length).toBe(0);
            existing.forEach(function(key){
                expect(siteWithBgMediaJson.masterPage.data.document_data[key]).toBeDefined();
            });

            expect(siteWithBgImageJson.pages[0].data.document_data.someComp).toBeDefined();
            expect(siteWithBgImageJson.pages[1].data.document_data.someComp2).toBeDefined();

            expect(siteWithBgImageJson.masterPage.data.document_data.someComp).not.toBeDefined();
            expect(siteWithBgImageJson.masterPage.data.document_data.someComp2).not.toBeDefined();
        });

        it('should only remove page items from pages if site is old one-background site', function(){
            movePageDataToMaster(siteWithoutBgJson);

            expect(siteWithBgImageJson.pages[0].data.document_data.page1).not.toBeDefined();
            expect(siteWithBgImageJson.pages[1].data.document_data.page2).not.toBeDefined();
        });

        var convertedJson = {
            masterPage: {
                data: {
                    document_data: {
                        'page1': {
                            pageBackgrounds: {
                                desktop: {
                                    ref: 'bg1'
                                },
                                mobile: {
                                    ref: 'bg1m'
                                }
                            }
                        },
                        bg1: {
                            mediaRef: 'media1',
                            imageOverlay: 'image1'
                        },
                        bg1m: {
                            mediaRef: 'media1m',
                            imageOverlay: 'image1m'
                        },
                        media1: {
                            posterImageRef: 'poster1'
                        },
                        media1m: {
                            posterImageRef: 'poster1m'
                        },
                        'page2': {
                            pageBackgrounds: {
                                desktop: {
                                    ref: 'bg2'
                                },
                                mobile: {
                                    ref: 'bg2m'
                                }
                            }
                        },
                        bg2: {
                            mediaRef: 'media2',
                            imageOverlay: 'image2'
                        },
                        bg2m: {
                            mediaRef: 'media2m',
                            imageOverlay: 'image2m'
                        },
                        media2: {
                            posterImageRef: 'poster2'
                        },
                        media2m: {
                            posterImageRef: 'poster2m'
                        }
                    }
                }
            },
            pages: [
                {
                    structure: {id: 'page1'},
                    data: {
                        document_data: {
                            someComp: {}
                        }
                    }
                },
                {
                    structure: {id: 'page2'},
                    data: {
                        document_data: {
                            someComp2: {}
                        }
                    }
                }
            ]
        };
        var siteWithBgImageJson = {
            masterPage: {
                data: {
                    document_data: {
                        'page1': {
                            pageBackgrounds: {
                                desktop: {
                                    ref: 'bg1'
                                },
                                mobile: {
                                    ref: 'bg1m'
                                }
                            }
                        },
                        bg1: {
                            mediaRef: 'media1',
                            imageOverlay: 'image1'
                        },
                        bg1m: {
                            mediaRef: 'media1m',
                            imageOverlay: 'image1m'
                        },
                        'page2': {
                            pageBackgrounds: {
                                desktop: {
                                    ref: 'bg2'
                                },
                                mobile: {
                                    ref: 'bg2m'
                                }
                            }
                        }
                    }
                }
            },
            pages: [
                {
                    structure: {id: 'page1'},
                    data: {
                        document_data: {
                            'page1': {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: 'bg1'
                                    },
                                    mobile: {
                                        ref: 'bg1m'
                                    }
                                }
                            },
                            bg1: {},
                            bg1m: {},
                            someComp: {}
                        }
                    }
                },
                {
                    structure: {id: 'page2'},
                    data: {
                        document_data: {
                            'page2': {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: 'bg2'
                                    },
                                    mobile: {
                                        ref: 'bg2m'
                                    }
                                }
                            },
                            bg2: {},
                            bg2m: {},
                            someComp2: {}
                        }
                    }
                }
            ]
        };
        var siteWithBgMediaJson = {
            masterPage: {
                data: {
                    document_data: {
                        'page1': {
                            pageBackgrounds: {
                                desktop: {
                                    ref: 'bg1'
                                },
                                mobile: {
                                    ref: 'bg1m'
                                }
                            }
                        },
                        bg1: {
                            mediaRef: 'media1',
                            imageOverlay: 'image1'
                        },
                        bg1m: {
                            mediaRef: 'media1m',
                            imageOverlay: 'image1m'
                        },
                        media1: {
                            posterImageRef: 'poster1'
                        },
                        media1m: {
                            posterImageRef: 'poster1m'
                        },
                        'page2': {
                            pageBackgrounds: {
                                desktop: {
                                    ref: 'bg2'
                                },
                                mobile: {
                                    ref: 'bg2m'
                                }
                            }
                        }
                    }
                }
            },
            pages: [
                {
                    structure: {id: 'page1'},
                    data: {
                        document_data: {
                            'page1': {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: 'bg1'
                                    },
                                    mobile: {
                                        ref: 'bg1m'
                                    }
                                }
                            },
                            bg1: {
                                mediaRef: 'media1',
                                imageOverlay: 'image1'
                            },
                            bg1m: {
                                mediaRef: 'media1m',
                                imageOverlay: 'image1m'
                            },
                            media1: {
                                posterImageRef: 'poster1'
                            },
                            media1m: {
                                posterImageRef: 'poster1m'
                            },
                            poster1: {},
                            poster1m: {},
                            image1: {},
                            image1m: {},
                            someComp: {}
                        }
                    }
                },
                {
                    structure: {id: 'page2'},
                    data: {
                        document_data: {
                            'page2': {
                                pageBackgrounds: {
                                    desktop: {
                                        ref: 'bg2'
                                    },
                                    mobile: {
                                        ref: 'bg2m'
                                    }
                                }
                            },
                            bg2: {
                                mediaRef: 'media2',
                                imageOverlay: 'image2'
                            },
                            bg2m: {
                                mediaRef: 'media2m',
                                imageOverlay: 'image2m'
                            },
                            media2: {
                                posterImageRef: 'poster2'
                            },
                            media2m: {
                                posterImageRef: 'poster2m'
                            },
                            poster2: {},
                            poster2m: {},
                            image2: {},
                            image2m: {},
                            someComp2: {}
                        }
                    }
                }
            ]
        };
        var siteWithoutBgJson = {
            masterPage: {
                data: {
                    document_data: {
                        'page1': {},
                        'page2': {}
                    }
                }
            },
            pages: [
                {
                    structure: {id: 'page1'},
                    data: {
                        document_data: {
                            'page1': {},
                            someComp: {}
                        }
                    }
                },
                {
                    structure: {id: 'page2'},
                    data: {
                        document_data: {
                            'page2': {},
                            someComp2: {}
                        }
                    }
                }
            ]
        };
    });
});
