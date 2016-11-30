xdescribe("PreviewBase", function() {
    testRequire().classes('wysiwyg.editor.managers.preview.PreviewBase').
        resources('W.Viewer');

    describe("constructor (and _buildIFrame)", function() {
        it("should use _buildIFrame to create an iframe and save it as _preview", function() {
            expect(new this.PreviewBase()._preview).toBeDefined();
            try {
                if (HTMLIFrameElement) {
                    expect(new this.PreviewBase()._preview).toBeInstanceOf(HTMLIFrameElement);
                } else {
                    // ie 7
                    expect(new this.PreviewBase()._preview.nodeName).toBe("IFRAME");
                }
            } catch(err) {
                // ie 7
                expect(new this.PreviewBase()._preview.nodeName).toBe("IFRAME");
            }
        });
        it("should set _siteReadyTimeout", function() {
            expect(new this.PreviewBase()._siteReadyTimeout).toBeInstanceOf(Number);
        });
    });

    var validateCallback = function (preview, url, expectedCallback) {
        var expected = {
            load: false,
            error: false,
            pageChange: false
        };

        runs(function() {
            spyOn(W.ServerFacade, "getPreviewUrl").andCallFake(function() {
                return url;
            });

            spyOn(W.Viewer, "_getUrlSearchParameters").andCallFake(function() {
                return '';
            });
            preview._preview.insertInto(getPlayGround());
            preview._siteReadyTimeout = 100;
            preview.loadSite("56eecec0-6ca7-4039-a95d-db9430d3d2af", function() {
                expected['load'] = true;
            },  function(message) {
                expected['error'] = message;
            });
        });
        waitsFor(function() {
            return Object.some(expected, function(item) {
                return item;
            });
        }, "load handler timeout", 1000);
        runs(function() {
            expect(expected[expectedCallback]).toBeTruthy();
        });
    };

    describe("after init", function(){
        beforeEach(function(){
            this.preview = new this.PreviewBase();
            window.setPreloaderState = function(){};
        });

        afterEach(function(){
            delete window.setPreloaderState;
        });

        describe("loadSite", function() {
            it("should change the source of _preview", function() {
                this.preview.loadSite("56eecec0-6ca7-4039-a95d-db9430d3d2af", function() {
                }, function() {
                }, function() {
                });
                expect(this.preview._preview.src.replace(/\?.*$/, "")).toBe(W.ServerFacade.getPreviewUrl("56eecec0-6ca7-4039-a95d-db9430d3d2af"));
                expect(this.preview._preview.src).toContain('isEdited=true');
            });

            it("should call error for invalid sites", function() {
                validateCallback(this.preview, "../mock/PreviewMockNotReady.html", "error");
            });

            it("should call error for invalid sites", function() {
                validateCallback(this.preview, "../mock/PreviewMockReady.html", "load");
            });
        });

        var mockInitIframe = function(preview) {
            preview._preview = {
                'contentWindow':{
                    '$': function() {
                    },
                    'W':{
                        Managers: {
                            getManagers:function() {
                            }
                        },
                        Viewer:{

                        },
                        Data: {
                            clearDirtyObjectsMap:function() {
                            }
                        },
                        Theme: {
                            clearDirtyObjectsMap:function() {
                            }
                        },
                        ComponentData: {
                            clearDirtyObjectsMap:function() {
                            }
                        }
                    }
                },
                'style':{
                    'visibility': 'hidden'
                }
            };
            preview._previewReady = true;
        };

        describe("goToPage", function() {
//            itShouldThrowAnExceptionIfNotReady("goToPage", ["somePageId"]);
            it("should set _targetPageId to the target page id call _preview.contentWindow.W.Viewer.goToPage and pass pageId as arg", function() {
                mockInitIframe(this.preview);
                getSpy("goToPage", undefined, this.preview._preview.contentWindow.W.Viewer);
                this.preview._targetPageId = "this string should be overridden";
                this.preview.goToPage("somePageId");
                expect(this.preview._targetPageId).toBe("somePageId");
                expect(this.preview._preview.contentWindow.W.Viewer.goToPage).toHaveBeenCalledWith("somePageId");
            });
        });

        describe("getPreviewCurrentPageId", function() {
//               itShouldThrowAnExceptionIfNotReady("getPreviewCurrentPageId");
            it("should return _preview.contentWindow.W.Viewer.getCurrentPageId()", function() {
                mockInitIframe(this.preview);
                getSpy("getCurrentPageId",
                    function() {
                        return "fakeValidResponse";
                    }, this.preview._preview.contentWindow.W.Viewer).andCallThrough();
                expect(this.preview.getPreviewCurrentPageId()).toBe("fakeValidResponse");
                expect(this.preview._preview.contentWindow.W.Viewer.getCurrentPageId).toHaveBeenCalled();
            });
        });

        describe("getHtmlElement", function() {
            it("should use _preview.contentWindow.$ to locate the target element", function(){
                // mock the iframe's behaviour
                mockInitIframe(this.preview);
                var someObj = {};
                spyOn(this.preview._preview.contentWindow, "$").andReturn(someObj);
                expect(this.preview.getHtmlElement('whatever')===someObj).toBe(true);
            });
        });

        describe("getPreviewSite", function() {
            /*Lior - error reporting does not throw errors anymore*/
            //        itShouldThrowAnExceptionIfNotReady("getPreviewSite");

            it("should return this._preview.contentWindow", function() {
                mockInitIframe(this.preview);
                expect(this.preview.getPreviewSite()).toBe(this.preview._preview.contentWindow);
            });
        });

        describe("getIFrame", function() {
            it("should return this._preview", function() {
                mockInitIframe(this.preview);
                expect(this.preview.getIFrame()).toBe(this.preview._preview);
            });
        });

        describe("_previewLoadedHandler", function() {
            beforeEach(function() {
                mockInitIframe(this.preview);
                spyOn(this.preview, '_isSiteReadyDelay');
            });

            it("should set _loadTime to the current time (new Date().getTime())", function() {
                //Create mock world
                var orgDateObject = Date;
                Date = function() {
                    return {'getTime': function() {
                        return 333;
                    }}
                };

                //Call tested method
                this.preview._previewLoadedHandler();

                //Assertions
                expect(this.preview._loadTime).toBe(333);

                //Return Data to it's original state
                Date = orgDateObject;
            });

            it("should call _isSiteReadyDelay, if contentWindow and contentWindow.W are set", function() {
                //Call tested method
                this.preview._previewLoadedHandler();

                var self = this;
                //Assertions
                waitsFor(function() {
                    return (self.preview._isSiteReadyDelay.callCount > 0);
                }, 'W.Preview._isSiteReadyDelay to be called', 15);
            });

            it("should call _siteErrorCallback, if contentWindow and contentWindow.W are NOT set", function() {
                //Create mock world
                this.preview._preview.contentWindow = null;
                this.preview._siteErrorCallback = jasmine.createSpy();
                spyOn(LOG, 'reportError');


                //Call tested method
                this.preview._previewLoadedHandler();

                var self = this;
                waitsFor(function() {
                    var callbackCalled = (self.preview._siteErrorCallback.callCount > 0);
                    if(callbackCalled) {
                        clearTimeout(self.preview._previewLoadTimeoutId);
                    }
                    return callbackCalled;
                }, 'W.Preview._siteErrorCallback to be called', 1500);
            });
        });

        describe("getPages", function() {
            beforeEach(function() {
                //Create mock world
                mockInitIframe(this.preview);

                this.preview.getPreviewManagers = function() {
                    return W;
                };

                spyOn(this.preview.getPreviewManagers().Data, 'getDataByQuery').andCallFake(function(query, callback) {
                    var data = W.Data.createDataItem(
                        {
                            type: "Document",
                            name: "testDocument",
                            mainPage: "#testPage0",
                            pages: ["#testPage0", "#testPage1", "#testPage2"]
                        });

                    callback(data);
                });

                spyOn(this.preview.getPreviewManagers().Data, 'getDataByQueryList').andCallFake(function(queryList, callback) {
                    var data = {};

                    for (var i = 0; i < 3; i++) {
                        data['testPage' + i] = W.Data.createDataItem(
                            {
                                type: "Page",
                                title: "Test Page " + i,
                                htmlId: "testId" + i,
                                uri: "test-uri-" + i,
                                hideTitle : false,
                                icon: "testi.con"
                            });
                    }

                    callback(data);
                });

                //Call tested method
                this.preview.getPages(function(pages){});
            });
            it("get the list of pages data from the preview DataManager", function() {
                //Assertions
                expect(this.preview.getPreviewManagers().Data.getDataByQuery).toHaveBeenCalledWithFollowingPartialArguments('#SITE_STRUCTURE');
                expect(this.preview.getPreviewManagers().Data.getDataByQueryList).toHaveBeenCalledWithFollowingPartialArguments(["#testPage0", "#testPage1", "#testPage2"]);
            });

        });

        describe("_isSiteReadyDelay", function() {
            beforeEach(function() {
                //Create mock world
                mockInitIframe(this.preview);
                spyOn(this.preview, 'getPreviewManagers').andReturn(W);
                this.preview._preview.contentWindow.W.Viewer.setLinkTipFunc = jasmine.createSpy();
                this.preview._preview.contentWindow.W.Viewer.isSiteReady = function() {
                    return true;
                };
            });




            it("should set it's _previewReady field to true", function() {
                this.preview._previewReady = false;

                //Call tested method
                this.preview._isSiteReadyDelay();

                //Assertions
                expect(this.preview._previewReady).toBe(true);
            });

            it("should set a 10 ms delay and call itself again if preview site isn't ready and timeout haven't been reached", function() {
                //Create mock world
                spyOn(this.preview, '_isSiteReadyDelay').andCallThrough();
                this.preview._siteErrorCallback = jasmine.createSpy();
                this.preview._preview.contentWindow.W.Viewer.isSiteReady = function() {
                    return false;
                };
                this.preview._loadTime = 1;
                this.preview._siteReadyTimeout = 3;

                var orgDateObject = Date;

                Date = function() {
                    return {'getTime': function() {
                        return 3;
                    }}
                };

                //Call tested method
                this.preview._isSiteReadyDelay();

                var self = this;
                //Assertions
                waitsFor(function() {
                    return (self.preview._isSiteReadyDelay.callCount > 1);
                }, 'W.Preview._isSiteReadyDelay to be called again', 15);

                //Return Data to it's original state
                Date = orgDateObject;
            });

            it("should throw a time-out error if preview site isn't ready in time", function() {
                //Create mock world
                this.preview._siteErrorCallback = jasmine.createSpy();
                this.preview._preview.contentWindow.W.Viewer.isSiteReady = function() {
                    return false;
                };
                this.preview._loadTime = 1;
                this.preview._siteReadyTimeout = 1;

                var orgDateObject = Date;

                Date = function() {
                    return {'getTime': function() {
                        return 3;
                    }}
                };

                //Call tested method
                this.preview._isSiteReadyDelay();

                //Assertions
                expect(this.preview._siteErrorCallback).toHaveBeenCalled();

                //Return Data to it's original state
                Date = orgDateObject;
            });
        });

    });

});