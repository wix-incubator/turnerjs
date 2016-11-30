describe('bootstrap.bootstrap.scriptloader.ManifestContext', function () {
    function compFunc(a, b) {
        return a.url > b.url ? 1 : -1;
    }

    describe("manifest parsing", function () {
        var manifest = [
            {"id":"jquery", "url":"http://other.external.libs/like/jquery.js"},
            {"id":"myJson", "url":"http://some.random.url/index.json"},
            {
                "id":"artifact name",
                "url":"http://artifact/scripts/base",
                "resources":[
                    {"id":"resource1", "url":"resources/path/relative/to/artifact/url"},
                    {"id":"resource2", "url":"otherUrl"}
                ]
            }
        ];
        var expectedUrls = [
            {"url":"http://other.external.libs/like/jquery.js"},
            {"url":"http://some.random.url/index.json"},
            {"id":"artifact name.resource1", "url":"http://artifact/scripts/base/resources/path/relative/to/artifact/url"},
            {"id":"artifact name.resource2", "url":"http://artifact/scripts/base/otherUrl"}
        ].sort(compFunc);

        it("should parse a manifest and extract scripts URLS", function () {
            /** @type {bootstrap.bootstrap.scriptloader.ManifestContext}*/
            var manifestContext = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ManifestContext');
            manifestContext.init('', manifest);

            var actual = manifestContext.requested.sort(compFunc);
            expect(actual).toEqual(expectedUrls);
        });

        it("should filter urls if a filter was provided", function () {
            expectedUrls = [
                {"id":"artifact name.resource1", "url":"http://artifact/scripts/base/resources/path/relative/to/artifact/url"},
            ];
            /** @type {bootstrap.bootstrap.scriptloader.ManifestContext}*/
            var manifestContext = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ManifestContext');

            manifestContext.init('', manifest, null, null, function filter(resource) {
                return resource.url.indexOf('base/resources') > -1;
            });
            var actual = manifestContext.requested.sort(compFunc);

            expect(actual).toEqual(expectedUrls);
        });
    });

    describe("callbacks behavior", function () {
        var manifest = [
            {
                "id":"artifact1",
                "url":"http://base1/",
                "resources":[
                    {"id":"json", "url":"json/1.json"},
                    {"id":"js", "url":"javascript/1.js"}
                ]
            }
        ];

        beforeEach(function () {
            this.onAllScriptsLoaded = jasmine.createSpy('onAllScriptsLoaded');
            this.onSomeScriptsFailed = jasmine.createSpy('onSomeScriptsFailed');

            /** @type {bootstrap.bootstrap.scriptloader.ManifestContext}*/
            this.manifestContext = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ManifestContext');
            this.manifestContext.init('', manifest, this.onAllScriptsLoaded, this.onSomeScriptsFailed);
        });

        it("should not call onAllScriptsLoaded until all the scripts are loaded", function () {
            this.manifestContext.onLoad(null, manifest[0].resources[0]);

            expect(this.onAllScriptsLoaded).not.toHaveBeenCalled();
        });

        it("should call onAllScriptsLoaded when all the scripts are loaded", function () {
            this.manifestContext.onLoad(null, manifest[0].resources[0]);
            this.manifestContext.onLoad(null, manifest[0].resources[1]);

            expect(this.onAllScriptsLoaded).toHaveBeenCalled();
        });

        it("should add loaded scripts to be added to manifestContext.loaded", function () {
            this.manifestContext.onLoad(null, manifest[0].resources[0]);
            this.manifestContext.onLoad(null, manifest[0].resources[1]);

            expect(this.manifestContext.loaded).toEqual([manifest[0].resources[0], manifest[0].resources[1]]);
        });

        it("should call onSomeScriptsFailed if any script loading failed", function () {
            this.manifestContext.onFailed(null, null);

            expect(this.onSomeScriptsFailed).toHaveBeenCalledWith(this.manifestContext);
        });

        it("should not call onSomeScriptsFailed more then once", function () {
            this.manifestContext.onFailed(null, null);
            this.manifestContext.onFailed(null, null);

            expect(this.onSomeScriptsFailed).toHaveBeenCalledXTimes(1);
        });

        it("should add failed scripts to be added to manifestContext.failed", function () {
            this.manifestContext.onFailed(null, 1);
            this.manifestContext.onFailed(null, 2);

            expect(this.manifestContext.failed).toEqual([1, 2]);
        });

        describe("internal callbacks", function () {
            it("should define loaded resources by they id", function () {
                this.manifestContext.onLoad('passed', {id:'test.name', url:'bs'});
                var test;
                this.resource.getResourceValue('test.name', function (value) {
                    test = value;
                });
                expect(test).toBe('passed');
            });
        });
    });
});