describe("bootstrap.bootstrap.scriptloader.ScriptLoader", function () {
    /** @type {bootstrap.bootstrap.scriptloader.ScriptLoader} */
    var scriptLoader;

    beforeEach(function () {
        scriptLoader = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoader');
    });

    describe("loadResource", function () {
        describe("plugins system", function () {
            beforeEach(function () {
                scriptLoader.plugins = [];
                this.context = {};
                this.resourceToLoad = {id:'myResource', url:'http://some.url'};

                this.inactivePlugin = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin')
                    .init('test',
                    jasmine.createSpy().andReturn(false),
                    jasmine.createSpy()
                );
                this.activePlugin = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin')
                    .init('test',
                    jasmine.createSpy().andReturn(true),
                    jasmine.createSpy()
                );
                this.afterActivePlugin = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin')
                    .init('test',
                    jasmine.createSpy().andReturn(true),
                    jasmine.createSpy()
                );

                scriptLoader.addPlugin(this.inactivePlugin);
                scriptLoader.addPlugin(this.activePlugin);
                scriptLoader.addPlugin(this.afterActivePlugin);
            });

            it("should run the isMatch method of plugins until a plugin return true", function () {
                scriptLoader.loadResource(this.resourceToLoad, this.context);
                expect(this.inactivePlugin.isMatch).toHaveBeenCalledWith(this.resourceToLoad, scriptLoader, this.context);
                expect(this.activePlugin.isMatch).toHaveBeenCalledWith(this.resourceToLoad, scriptLoader, this.context);
                expect(this.afterActivePlugin.isMatch).not.toHaveBeenCalled();
            });

            it("should throw an error if no plugin can handle a resource", function () {
                scriptLoader.plugins = [/* No plugin to handle the resource */];
                var loadUrl = scriptLoader.loadResource.bind(scriptLoader, this.resourceToLoad, this.context);

                expect(loadUrl).toThrow('Unable to handle resource type of: http://some.url try to add a plugin in order to load this kind of file');
            });
        });
        describe("loadManifestFromUrl", function(){
            describe("tags", function(){
                it("should include manifests that one of their tags is in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","b"]);
                    var result = filter({
                        tags:["a"]
                    });
                    expect(result).toBe(true);
                });
                it("should excluded manifests that none of their tags is in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","b"]);
                    var result = filter({
                        tags:["c"]
                    });
                    expect(result).toBe(false);
                });
                it("should include manifests that have a tag formed with & (a&b) and both a and b are in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","b"]);
                    var result = filter({
                        tags:["a&b"]
                    });
                    expect(result).toBe(true);
                });
                it("should excluded manifests that have a tag formed with & (a&b) and a is present but b isn't in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","NOT B"]);
                    var result = filter({
                        tags:["a&b"]
                    });
                    expect(result).toBe(false);
                });
                it("should include manifests that have a tag formed with ! (a!b) and a is present but b isn't in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","b"]);
                    var result = filter({
                        tags:["a!NOT B"]
                    });
                    expect(result).toBe(true);
                });
                it("should exclude manifests that have a tag formed with ! (a!b) and both a and b are in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","b"]);
                    var result = filter({
                        tags:["a!b"]
                    });
                    expect(result).toBe(false);
                });
                it("should exclude manifests that have a tag formed with ! (a!b) and a isn't in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["NOT A","b"]);
                    var result = filter({
                        tags:["a!b"]
                    });
                    expect(result).toBe(false);
                });
                it("should exclude manifests that have a tag formed with ! (a!b!c) and a,c are present but b isn't in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a","c"]);
                    var result = filter({
                        tags:["a!b!c"]
                    });
                    expect(result).toBe(false);
                });
                it("should exclude manifest that have a tag formed like (a&b!c) if a is present but not a and c in the 'tags' resource", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a"]);
                    var result = filter({
                        tags:["a&b!c"]
                    });
                    expect(result).toBe(false);
                });
                it("should throw error if there is an & sign after !", function(){
                    var filter = scriptLoader._manifestsWithMatchingTags(["a"]);
                    expect( function(){
                        filter({
                            tags:["a&b!c&r"]
                        })
                    }).toThrow("malformed tag expression, there shouldn't be & after !. in tag a&b!c&r");
                });
            }) ;
        });
    });
});
