describe("bootstrap.bootstrap.scriptloader.ScriptLoader integration tests", function () {
    /** @type {bootstrap.bootstrap.scriptloader.ScriptLoader} */
    var scriptLoader;

    beforeEach(function () {
        scriptLoader = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoader');
        console.groupCollapsed && console.groupCollapsed();
    });
    afterEach(function(){
        console.groupEnd && console.groupEnd();
    });

    describe("loadManifest", function () {
        var manifest = [
            {tags:['test'],"id":"jquery", "url":"http://other.external.libs/like/jquery.js"},
            {tags:['test'],"id":"myJson", "url":"http://some.random.url/index.json"},
            {
                tags:['test'],
                "id":"artifact name",
                "url":"http://artifact/scripts/base",
                "resources":[
                    {"id":"resource1", "url":"resources/path/relative/to/artifact/url"},
                    {"id":"resource2", "url":"otherUrl"}
                ]
            }
        ];

       it("should define loaded resources using define.resource", function () {
            // see ManifestContextSpec.js for internal tests
            var manifest = [
                {
                    "id":"loaded",
                    "url":"../mock/scriptloader",
                    "tags": ['test'],
                    "resources":[
                        {"id":"js", "url":"plugins/test.js"},
                        {"id":"class", "url":"plugins.ClassTest"},
                        {"id":"json", "url":"plugins/test.json"}
                    ]
                }
            ];
//            this.define.resource('topology', {bootstrap:'loaded'});
           this.define.resource('topology', {plugins: '../mock/scriptloader'});
           this.define.resource('artifacts', [
               {id:'manifest', url:'../mock/scriptloader'}
           ]);

            var loaded = false;
            var failed = false;
           scriptLoader.loadManifest('', manifest, function () {
                loaded = true;
            }, function () {
                //fail('Resources loading failed');
                failed = true;
            });

            var fetchedResources;

            waitsFor(function () {
                if (loaded || failed) {
                    this.resource.getResources(['loaded.js', 'loaded.json', 'loaded.class'], function (resources) {
                        fetchedResources = resources;
                    });
                    return true;
                }
            }, 'manifest scripts load', 2000);

            waitsFor(function () {
                if (fetchedResources) {
                    expect(fetchedResources.loaded.json).toEqual({"test":"passed"});
                    expect(fetchedResources.loaded.js).toBeInstanceOf(HTMLScriptElement);
                    expect(fetchedResources.loaded.class).toBeInstanceOf(HTMLScriptElement);
                    return true;
                }
            }, 'new resources to be defined', 10);


        });

        it("should use loadUrl to load manifest resources", function () {
            // see ManifestContextSpec.js for internal tests
            var s = spyOn(scriptLoader, 'loadResource');

            var context = scriptLoader.loadManifest('', manifest);

            var requsted = [
                {
                    url:"http://other.external.libs/like/jquery.js"
                },
                {
                    url:"http://some.random.url/index.json"
                },
                {
                    id:"artifact name.resource1",
                    url:"http://artifact/scripts/base/resources/path/relative/to/artifact/url"
                },
                {
                    id:"artifact name.resource2",
                    url:"http://artifact/scripts/base/otherUrl"
                }
            ];

            expect(context.requested).toEqual(requsted);

        });
    });

    describe("loadResource", function () {
        describe("Resource loading by predefined plugings (see Plugins.js)", function () {
            describe("javascript", function () {
                var resource;
                var context;

                beforeEach(function () {
                    delete window['javascript load plugin'];
                    context = {
                        onLoad:jasmine.createSpy(),
                        onFailed:jasmine.createSpy()
                    };
                    resource = {
                        id:'js',
                        url:'../mock/scriptloader/plugins/test.js'
                    };
                });
                afterEach(function () {
                    delete window['javascript load plugin'];
                });

                it("should load and evaluate a javascript resource", function () {
                    scriptLoader.loadResource(resource, context);

                    waitsFor(function () {
                        return context.onLoad.callCount > 0
                    }, '"../mock/scriptloader/plugins/test.js" to load', 5000);

                    runs(function () {
                        expect(window['javascript load plugin']).toBe('working');
                    });
                });

                it("should call onLoad of context", function () {
                    scriptLoader.loadResource(resource, context);
                    waitsFor(function () {
                        return context.onLoad.callCount > 0
                    }, '"../mock/scriptloader/plugins/test.js" to load', 5000);

                    runs(function () {
                        expect(context.onLoad.mostRecentCall.args[0].src = resource.url);
                        expect(context.onLoad.mostRecentCall.args[1] = resource);
                    });
                });

                it("should call onFailed of context", function () {
                    resource.url = "../../../../../invalid url.js";
                    scriptLoader.loadResource(resource, context);
                    waitsFor(function () {
                        return context.onFailed.callCount > 0;
                    }, 'invalid url load to fail', 5000);

                    runs(function () {
                        expect(context.onFailed.mostRecentCall.args[0].src = resource.url);
                        expect(context.onFailed.mostRecentCall.args[1] = resource);
                    });
                });
            });

            describe("classes", function () {
                var resource;
                var context;

                beforeEach(function () {
                    delete window['class load plugin'];
                    context = {
                        onLoad:jasmine.createSpy(),
                        onFailed:jasmine.createSpy()
                    };
                    resource = {
                        id:'js',
                        url:'plugins.ClassTest'
                    };
                    this.define.resource('topology', {plugins: '../mock/scriptloader'});
                    this.define.resource('artifacts', [
                        {id:'manifest', url:'../mock/scriptloader'}
                    ]);
                });
                afterEach(function () {
                    delete window['class load plugin'];
                });

                it("should load and evaluate a javascript class resource", function () {
                    scriptLoader.loadResource(resource, context);

                    waitsFor(function () {
                        return context.onLoad.callCount > 0
                    }, 'plugins.ClassTest to load', 2000);

                    runs(function () {
                        expect(window['class load plugin']).toBe('working');
                    });
                });

                it("should call onLoad of context", function () {
                    scriptLoader.loadResource(resource, context);
                    waitsFor(function () {
                        return context.onLoad.callCount > 0;
                    }, 'plugins.ClassTest to load', 2000);

                    runs(function () {
                        expect(context.onLoad.mostRecentCall.args[0].src = '../mock/scriptloader/plugins/ClassTest.js');
                        expect(context.onLoad.mostRecentCall.args[1] = resource);
                    });
                });

                it("should call onFailed of context", function () {
                    resource.url = 'http://invalid.url/plugins/invalid/ClassName.js';
                    scriptLoader.loadResource(resource, context);
                    waitsFor(function () {
                        return context.onFailed.callCount > 0
                    }, 'invalid url load to fail', 5000);

                    runs(function () {
                        expect(context.onFailed.mostRecentCall.args[0].src = 'http://invalid.url/plugins/invalid/ClassName.js');
                        expect(context.onFailed.mostRecentCall.args[1] = resource);
                    });
                });
            });

            describe("json", function () {
                var resource;
                var context;

                beforeEach(function () {
                    context = {
                        onLoad:jasmine.createSpy(),
                        onFailed:jasmine.createSpy()
                    };
                    resource = {

                        url:'../mock/scriptloader/plugins/test.json'
                    };
                });

                it("should load and parse a JSON resource", function () {
                    scriptLoader.loadResource(resource, context);

                    waitsFor(function () {
                        return context.onLoad.callCount > 0;
                    }, '"../mock/scriptloader/plugins/test.json" to load', 5000);

                    runs(function () {
                        expect(context.onLoad.mostRecentCall.args[0]).toEqual({"test":"passed"});
                    });
                });

                it("should call onFailed of context", function () {
                    resource.url = "http://invalid.url/plugins//invalid_url.json";
                    scriptLoader.loadResource(resource, context);
                    waitsFor(function () {
                        return context.onFailed.callCount > 0
                    }, 'invalid url load to fail', 5000);

                    runs(function () {

                        expect(context.onFailed.mostRecentCall.args[0].src = resource.url);
                        expect(context.onFailed.mostRecentCall.args[1] = resource);
                    });
                });
            });
        });
    });
});
