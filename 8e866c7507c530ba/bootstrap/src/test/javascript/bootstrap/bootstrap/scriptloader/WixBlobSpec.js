describe("RequestsAggregator", function () {


    var old_topology;
    var blobUrl = '//static.wixstatic.com/wix_blob';
    var NEW_TOPOLOGY = {
        skins: '//static.wixstatic.com',
        mock: '../mock'
    };

    beforeEach(function () {
        var self = this;
        old_topology = undefined;
        resource.getResources(['topology', 'scriptLoader'], function (topology) {
            old_topology = topology.topology;
            define.resource('topology', NEW_TOPOLOGY);
            self.wixBlob = define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.WixBlob').init(blobUrl, [NEW_TOPOLOGY.skins, NEW_TOPOLOGY.mock]);
        });

        waitsFor(function () {
            return old_topology;
        }, 'topology to be defined', 100);
    });

    beforeEach(function () {
        this.addMatchers({
            toHaveBeenCalledWithSrc: function (expected) {
                this.message = function () {
                    return "expected source to be " + expected + ", actual is " + this.actual.argsForCall[0][0].src;
                }
                return this.actual.argsForCall[0][0].src === expected;
            },
            toHaveBeenCalledWithSrcShorterThen: function (expected) {
                var message;
                this.message = function () {
                    return message;
                };
                return this.actual.argsForCall.every(function (args) {
                    var scriptElement = args[0];
                    if (scriptElement.src.length < expected) {
                        return true;
                    } else {
                        message = 'the request src "' + scriptElement.src + '" is too long';
                    }
                });
            },
            toHaveBeenCallWithAllPaths: function (expected) {
                var self = this;

                function itemIsIncludedInSrc(str) {
                    function srcContainsStr(args) {
                        return args[0].src.indexOf(str) >= 0;
                    }
                    return self.actual.argsForCall.some(srcContainsStr);
                }

                return expected.every(itemIsIncludedInSrc);
            }
        });
    });

    afterEach(function () {
        define.resource('topology', old_topology);

        this.wixBlob.cancel();
    });

    describe('acceptance', function () {
        describe('when topology is defined', function () {
            it('should aggregate a few request into on wixblob script tag', function () {
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin2.js');

                var head = document.getElementsByTagName('head')[0];
                spyOn(head, 'appendChild');
                spyOn(this.wixBlob, "_getGzipQueryValue").andReturn("");

                var expectedBlobUrl = '//static.wixstatic.com/wix_blob?base=/&flist=services/skins/1.68.2/skin/myskin/Skin1.js,services/skins/1.68.2/skin/myskin/Skin2.js&sep=3';

                waitsFor(function () {
                    return head.appendChild.callCount;
                }, "script tag to be added", 2000);

                runs(function () {
                    expect(head.appendChild).toHaveBeenCalledWithSrc(expectedBlobUrl);
                });
            });

            //legacy!
            xdescribe('once the wix_blob is loaded', function () {

                xit('should call the onLoad of successfully loaded scripts', function () {
//                    jasmine.Clock.useMock();
                    var mockScriptLoaded;
                    spyOn(this.wixBlob, '_addScriptElement').andCallFake(_addScriptElementMock);

                    var onLoad = [
                        jasmine.createSpy(),
                        jasmine.createSpy(),
                        jasmine.createSpy()
                    ];

                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js', onLoad[0]);
                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin2.js', onLoad[1]);
                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/404', onLoad[2]);

                    //jasmine.Clock.tick(this.wixBlob.throttleTimeout);

                    waitsFor(function () {
                        if (mockScriptLoaded) {
                            expect(onLoad[0]).toHaveBeenCalled();
                            expect(onLoad[1]).toHaveBeenCalled();
                            expect(onLoad[2]).not.toHaveBeenCalled();
                            return true;
                        }
                    }, 'mock script to be loaded', 2000);

                    function _addScriptElementMock(data) {
                        var script = document.createElement('script');
                        if (typeof data === 'string') {
                            script.appendChild(document.createTextNode(data));
                        } else {
                            script.src = '../mock/scriptloader/wixBlob/expectedServerResponse.js';
                            script.onload = function () {
                                mockScriptLoaded = true;
                            };
                        }
                        var head = document.getElementsByTagName('head')[0];
                        head.appendChild(script);
                    }

                });

                xit('should call the onFail of failed scripts', function () {
                    var mockScriptLoaded;
                    spyOn(this.wixBlob, '_addScriptElement').andCallFake(_addScriptElementMock);

                    var onFail = [
                        jasmine.createSpy(),
                        jasmine.createSpy(),
                        jasmine.createSpy()
                    ]

                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js', undefined, onFail[0]);
                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin2.js', undefined, onFail[1]);
                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/404', undefined, onFail[2]);


                    waitsFor(function () {
                        if (mockScriptLoaded) {
                            expect(onFail[0]).not.toHaveBeenCalled();
                            expect(onFail[1]).not.toHaveBeenCalled();
                            expect(onFail[2]).toHaveBeenCalled();
                            return true;
                        }
                    }, 'callbacks to be called', 2000);

                    function _addScriptElementMock(data) {
                        var script = document.createElement('script');
                        if (typeof data === 'string') {
                            script.appendChild(document.createTextNode(data));
                        } else {
                            script.src = '../mock/scriptloader/wixBlob/expectedServerResponse.js';
                            script.onload = function () {
                                mockScriptLoaded = true;
                            };
                        }
                        var head = document.getElementsByTagName('head')[0];
                        head.appendChild(script);
                    }

                });

            });
        });

        describe('when topology is NOT defined', function () {
            it('should NOT add a script element before topology is defined', function () {
                jasmine.Clock.useMock();
                var head = document.getElementsByTagName('head')[0];
                spyOn(head, 'appendChild');

                define.resource('topology', undefined);
                this.wixBlob = define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.WixBlob').init();
                this.wixBlob.addRequest('/services/skins/1.68.2/skin/myskin/Skin1.js');
                jasmine.Clock.tick(this.wixBlob.throttleTimeout);

                expect(head.appendChild).not.toHaveBeenCalled();
            });

            //TOPOLOGY IS NO LONGER NEEDED
            xit('once topology is defined, should add all script elements', function () {
                jasmine.Clock.useMock();
                var head = document.getElementsByTagName('head')[0];
                spyOn(head, 'appendChild');

                define.resource('topology', undefined);
                this.wixBlob = define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.WixBlob').init();
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                jasmine.Clock.tick(this.wixBlob.throttleTimeout);
                define.resource('topology', NEW_TOPOLOGY);
                jasmine.Clock.tick(this.wixBlob.throttleTimeout);
                expect(head.appendChild).toHaveBeenCalled();
            })
        });

        describe('when hashMethod is defined', function () {
            var fnvHash;
            beforeEach(function () {
                fnvHash = undefined;
                resource.getResourceValue('fnvHash', function (_fnvHash) {
                    fnvHash = _fnvHash;
                });

                waitsFor(function () {
                    return fnvHash;
                }, 'fnvHash to be ready', 10);

            });


            it('should hash the file names', function () {
                this.wixBlob.hashMethod = fnvHash.hash;
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin2.js');

                var head = document.getElementsByTagName('head')[0];
                spyOn(head, 'appendChild');
                spyOn(this.wixBlob, "_getGzipQueryValue").andReturn("");

                var hashedFiles = [fnvHash.hash('services/skins/1.68.2/skin/myskin/Skin2.js'),
                    fnvHash.hash('services/skins/1.68.2/skin/myskin/Skin1.js')];
                var expectedBlobUrl = '//static.wixstatic.com/wix_blob?base=/&flist=' + hashedFiles.join() + '&sep=3';

                waitsFor(function () {
                    if (head.appendChild.callCount) {
                        expect(head.appendChild).toHaveBeenCalledWithSrc(expectedBlobUrl);
                        return true;
                    }
                }, "script tag to be added", 2000);
            });


        });

    });

    describe('build url', function(){
        it("should add zip query to the blob url",function(){
            var fakeGroup = {
                base : "fakebase",
                files : ['fakefile']
            };
            var zipQuery = this.wixBlob._getGzipQueryValue();
            var url = this.wixBlob._buildUrl(fakeGroup);
            expect(url).toContain(zipQuery);
            expect(url.indexOf(zipQuery)).not.toBe(-1);
        });
    })

    describe('request throttling', function () {
        describe("when a single call is made", function () {

            it('should create throttle.timeoutId upon request', function () {
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');

                expect(this.wixBlob._throttle.timeoutId).toBeGreaterThan(0);
            });

            it('should call _sendBlobRequest after the minimal throttle timeout', function () {
                jasmine.Clock.useMock();
                spyOn(this.wixBlob, '_sendBlobRequest');
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');

                jasmine.Clock.tick(this.wixBlob.throttleTimeout);

                expect(this.wixBlob._sendBlobRequest).toHaveBeenCalled();
            });
        });


        describe("when multiple calls are made in less then the minimal throttle timeout", function () {

            it('create update the throttle upon anther request', function () {
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                var firstTimeoutId = this.wixBlob._throttle.timeoutId;

                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin2.js');
                var secondTimeoutId = this.wixBlob._throttle.timeoutId;

                expect(secondTimeoutId).not.toBe(firstTimeoutId);
            });

            it('should call _sendBlobRequest after the minimal throttle timeout', function () {
                jasmine.Clock.useMock();
                spyOn(this.wixBlob, '_sendBlobRequest');
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                jasmine.Clock.tick(this.wixBlob.throttleTimeout - 1);
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                jasmine.Clock.tick(this.wixBlob.throttleTimeout - 1);

                expect(this.wixBlob._sendBlobRequest).not.toHaveBeenCalled();
                jasmine.Clock.tick(this.wixBlob.throttleTimeout);

                expect(this.wixBlob._sendBlobRequest).toHaveBeenCalledXTimes(1);
            });
        });

        describe("when multiple calls are made in over the minimal throttle timeout", function () {
            it('should call _sendBlobRequest after the minimal throttle timeout', function () {
                jasmine.Clock.useMock();
                spyOn(this.wixBlob, '_sendBlobRequest');

                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                jasmine.Clock.tick(this.wixBlob.throttleTimeout);
                this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                jasmine.Clock.tick(this.wixBlob.throttleTimeout);

                expect(this.wixBlob._sendBlobRequest).toHaveBeenCalledXTimes(2);
            });
        });


    });

    describe('_createWixBlobGroups', function () {


        describe('a small number of buffered requests (url length not an issue)', function () {
            describe('when all the buffered requests origin from the same artifact', function () {
                it('should return a single group', function () {
                    // mock _throttle to prevent side-effects
                    spyOn(this.wixBlob, '_throttle');
                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin1.js');
                    this.wixBlob.addRequest('//static.parastorage.com/services/skins/1.68.2/skin/myskin/Skin2.js');

                    var groups = this.wixBlob._createBlobGroups();
                    expect(groups[0].base).toEqual('/');
                    expect(groups[0].files).toEqual(['services/skins/1.68.2/skin/myskin/Skin1.js', 'services/skins/1.68.2/skin/myskin/Skin2.js']);
                });
            });
        });

        describe('large number of buffer request (url is too long)', function () {
            beforeEach(function () {
                this.requestedUrls = ['../mock/file1', '../mock/file2', '../mock/file3', '../mock/file4', '../mock/file5', '../mock/file6', '../mock/file7', '../mock/file8', '../mock/file9', '../mock/file10'];
                this.wixBlob.maxUrlLength = 200;
                this.head = document.getElementsByTagName('head')[0];
                spyOn(this.head, 'appendChild');
            });

            it('should split requests that are too long to smaller requests', function () {

                jasmine.Clock.useMock();

                this.requestedUrls.forEach(function(url){
                    this.wixBlob.addRequest(url,null,null);
                }, this);

                jasmine.Clock.tick(this.wixBlob.throttleTimeout);

                expect(this.head.appendChild.callCount).toBeGreaterThan(1);
                expect(this.head.appendChild).toHaveBeenCalledWithSrcShorterThen(this.wixBlob.maxUrlLength);
            });

            it('should make a request for each of requested files', function () {

                jasmine.Clock.useMock();

                this.requestedUrls.forEach(function(url){
                    this.wixBlob.addRequest(url,null,null);
                }, this);

                jasmine.Clock.tick(this.wixBlob.throttleTimeout);


                var requestedFiles = ['file1', 'file2', 'file3', 'file4', 'file5', 'file6', 'file7', 'file8', 'file9', 'file10'];;
                expect(this.head.appendChild).toHaveBeenCallWithAllPaths(requestedFiles);

            });


        })

    });


})