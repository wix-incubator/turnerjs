define(["lodash", "Squire"], function (_, Squire) {
    "use strict";

    var injector = new Squire();

    var builder = injector.mock({
        'react': {
            createClass: _.clone,
            createFactory: _.clone
        }
    });

    var mixin = {
        mixinFunc: _.noop
    };

    var proxyDef = {
        displayName: "MyProxy",
        mixins: [mixin],
        proxyFunc: _.noop
    };

    var viewProxyDef = {
        displayName: "View",
        viewFunc: _.noop
    };

    describe("proxy factory", function () {

        beforeEach(function (done) {
            var self = this;
            builder.require(['wixappsCore/core/proxyFactory'], function (proxyFactory) {
                self.proxyFactory = proxyFactory;
                self.proxyFactory.register("View", viewProxyDef);
                done();
            });
        });

        describe("register and getProxyClass", function () {
            it("should return the proxy if it was registered", function () {
                this.proxyFactory.register("MyProxy", proxyDef);
                var proxy = this.proxyFactory.getProxyClass("MyProxy");

                expect(proxy).not.toBe(proxyDef);
                expect(proxy).toEqual(proxyDef);
            });
            it("should return the View proxy if the proxy wasn't registered", function () {
                var proxy = this.proxyFactory.getProxyClass("MyProxy2");

                expect(proxy).not.toBe(viewProxyDef);
                expect(proxy).toEqual(viewProxyDef);
            });
            it("should return a cached proxy if already requested", function () {
                this.proxyFactory.register("MyProxy3", proxyDef);
                var proxy = this.proxyFactory.getProxyClass("MyProxy3");
                var cacheProxy = this.proxyFactory.getProxyClass("MyProxy3");

                expect(cacheProxy).toBe(proxy);
                expect(cacheProxy).not.toBe(proxyDef);
                expect(cacheProxy).toEqual(proxyDef);
            });
        });

        describe("extend and invalidate", function () {
            it("should extend proxy if called before it was requested", function () {
                this.proxyFactory.register("MyProxy4", _.clone(proxyDef));

                var extension = {
                    extFunc: function () {
                    }
                };

                this.proxyFactory.extend("MyProxy4", extension);

                var proxy = this.proxyFactory.getProxyClass("MyProxy4");

                expect(proxy.mixins).toContain(extension);
            });
            it("should not extend proxy if called after it was requested", function () {
                this.proxyFactory.register("MyProxy5", _.clone(proxyDef));

                var proxy = this.proxyFactory.getProxyClass("MyProxy5");

                this.proxyFactory.extend("MyProxy5", {
                    extFunc: function () {}
                });

                var proxy2 = this.proxyFactory.getProxyClass("MyProxy5");

                expect(proxy2).toBe(proxy);
                expect(proxy.extFunc).not.toBeDefined();
                expect(proxy2.extFunc).not.toBeDefined();
            });
            it("should recreate the proxy after calling invalidate", function () {
                this.proxyFactory.register("MyProxy6", _.clone(proxyDef));

                var proxy = this.proxyFactory.getProxyClass("MyProxy6");

                var extension = {
                    extFunc: function () {
                    }
                };
                this.proxyFactory.extend("MyProxy6", extension);

                this.proxyFactory.invalidate("MyProxy6");

                var proxy2 = this.proxyFactory.getProxyClass("MyProxy6");

                expect(proxy2).not.toBe(proxy);
                expect(proxy.mixins).not.toContain(extension);
                expect(proxy2.mixins).toContain(extension);
            });
        });

    });

});
