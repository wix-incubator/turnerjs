define(['core/siteRender/WixSiteHeadRenderer'], function(wixSiteHeadRenderer) {
    'use strict';

    describe('WixSiteHeadRenderer Tests', function() {

        beforeEach(function() {
            this.siteData = {
                rendererModel: {
                    premiumFeatures: ['PremiumDeal#1', 'AdsFree']
                },
                serviceTopology: {
                    mediaRootUrl: "protocol://mock.media.root.url/"
                },
                isPremiumUser: function() {return true;},
                getFavicon: function(){
                    return "default.png";
                },
                getMediaFullStaticUrl: function(image) {
                    return 'http://static.wixstatic.com/media/' + image;
                }
            };
            this.wixSiteHeadRenderer = wixSiteHeadRenderer;
        });

        describe('getGoogleTagManagerScript', function() {
            it('Should return async script tag for GTM', function() {
                var gtmScript = this.wixSiteHeadRenderer.getGoogleTagManagerScript();

                expect(gtmScript).toContain('<script async>');
                expect(gtmScript).toContain('//www.googletagmanager.com/gtm.js');
            });
        });

        describe("Favicons for a Non-Premium/Freemium user", function() {

            beforeEach(function() {
                this.siteData.isPremiumUser = function() {
                    return false;
                };
            });

            it("should get the default favicon for a non-premium user", function() {
                var faviconLink1 = {rel: "shortcut icon", href: "http://www.wix.com/favicon.ico", type: "image/x-icon"};
                var faviconLink2 = {rel: "apple-touch-icon", href: "http://www.wix.com/favicon.ico", type: "image/x-icon"};

                var favicons = this.wixSiteHeadRenderer.getFavicons(this.siteData);

                expect(favicons).toBeDefined();
                expect(favicons[0]).toEqual(faviconLink1);
                expect(favicons[1]).toEqual(faviconLink2);
            });
        });

        describe("Favicons for a Premium user", function() {
//            it("should get two empty favicon links for a non PNG/ICON/GIF images.", function() {
//                var $this = this;
//                var imgExtensionsNotToServeAsFavicon = ["jpg", "jpeg", "bmp", "tif"];
//                _.forEach(imgExtensionsNotToServeAsFavicon, function(extension) {
//                    $this.siteData.publicModel.favicon = "abcdefg." + extension;
//
//                    var favicons = $this.wixSiteHeadRenderer.getFavicons($this.siteData);
//
//                    expect(favicons).toBeDefined();
//                    expect(favicons.length).toBe(2);
//                });
//            });

            it("Should render the default favicon if the user doesn't have the proper favicon permissions", function() {

                spyOn(this.wixSiteHeadRenderer, '_getDefaultWixFavicon');

                var premiumPackagePermissions = [];

                this.siteData.rendererModel.premiumFeatures = premiumPackagePermissions;
                this.wixSiteHeadRenderer.getFavicons(this.siteData);
                expect(this.wixSiteHeadRenderer._getDefaultWixFavicon).toHaveBeenCalled();

                premiumPackagePermissions.push('PremiumDeal#2');
                this.siteData.rendererModel.premiumFeatures = premiumPackagePermissions;
                this.wixSiteHeadRenderer.getFavicons(this.siteData);
                expect(this.wixSiteHeadRenderer._getDefaultWixFavicon).toHaveBeenCalled();
            });

            it("should get PNG favicon links to the site", function() {
                var imgName = "abcdefg.png";
                spyOn(this.siteData, 'getFavicon').and.returnValue(imgName);

                var favicons = this.wixSiteHeadRenderer.getFavicons(this.siteData);

                var expectedFaviconPath = "http://static.wixstatic.com/media/" + imgName;

                var link1 = {rel: "shortcut icon", href: expectedFaviconPath, type: "image/png"};
                var link2 = {rel: "apple-touch-icon", href: expectedFaviconPath, type: "image/png"};
                expect(favicons.length).toBe(2);
                expect(favicons[0]).toEqual(link1);
                expect(favicons[1]).toEqual(link2);
            });

            it("should get GIF favicon links to the site", function() {
                var imgName = "gifgifgif.gif";
                spyOn(this.siteData, 'getFavicon').and.returnValue(imgName);

                var favicons = this.wixSiteHeadRenderer.getFavicons(this.siteData);

                var expectedFaviconPath = 'http://static.wixstatic.com/media/' + imgName;
                var link1 = {rel: "shortcut icon", href: expectedFaviconPath, type: "image/gif"};
                var link2 = {rel: "apple-touch-icon", href: expectedFaviconPath, type: "image/gif"};
                expect(favicons.length).toBe(2);
                expect(favicons[0]).toEqual(link1);
                expect(favicons[1]).toEqual(link2);
            });

            it("should get ICON favicon links to the site", function() {
                var imgName = "favicon.ico";
                spyOn(this.siteData, 'getFavicon').and.returnValue(imgName);

                var favicons = this.wixSiteHeadRenderer.getFavicons(this.siteData);

                var expectedFaviconPath = 'http://static.wixstatic.com/media/' + imgName;
                var link1 = {rel: "shortcut icon", href: expectedFaviconPath, type: "image/x-icon"};
                var link2 = {rel: "apple-touch-icon", href: expectedFaviconPath, type: "image/x-icon"};
                expect(favicons.length).toBe(2);
                expect(favicons[0]).toEqual(link1);
                expect(favicons[1]).toEqual(link2);
            });

            it("should get JPG favicon links to the site", function() {
                var imgName = "favicon.jpg";
                spyOn(this.siteData, 'getFavicon').and.returnValue(imgName);

                var favicons = this.wixSiteHeadRenderer.getFavicons(this.siteData);

                var expectedFaviconPath = 'http://static.wixstatic.com/media/' + imgName;
                var link1 = {rel: "shortcut icon", href: expectedFaviconPath, type: "image/jpg"};
                var link2 = {rel: "apple-touch-icon", href: expectedFaviconPath, type: "image/jpg"};
                expect(favicons.length).toBe(2);
                expect(favicons[0]).toEqual(link1);
                expect(favicons[1]).toEqual(link2);
            });

            it("should not return two blank favicons when asking for them.", function() {
                var blankFavicons = this.wixSiteHeadRenderer.createBlankFavicons();
                var blankFavicons2 = this.wixSiteHeadRenderer.createBlankFavicons();

                expect(blankFavicons.length).toBe(0);
                expect(blankFavicons).toBe(blankFavicons2);
            });

            it("should detect the extension of a filename", function() {
                var fileName = "fileabc.abc.abcd";
                var extension = this.wixSiteHeadRenderer._getExtension(fileName);
                expect(extension).toBe("abcd");

                fileName = "fileabcabc.xyz";
                extension = this.wixSiteHeadRenderer._getExtension(fileName);
                expect(extension).toBe("xyz");

                fileName = "fileabcabcxyz";
                extension = this.wixSiteHeadRenderer._getExtension(fileName);
                expect(extension).toBe("");

                fileName = null;
                extension = this.wixSiteHeadRenderer._getExtension(fileName);
                expect(extension).toBe("");
            });
        });
    });

});
