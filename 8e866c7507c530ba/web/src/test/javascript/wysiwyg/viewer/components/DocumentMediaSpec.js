describe("DocumentMedia", function () {
    it('Just a dummy test so something will run', function () {
        expect(1).toBe(1);
    });

    describe("DocumentMedia", function () {
        var documentMediaId = 'test';

        testRequire()
            .classes('core.managers.components.ComponentBuilder')
            .components('wysiwyg.viewer.components.documentmedia.DocumentMedia', 'core.components.image.ImageNew')
            .resources('W.Data', 'W.ComponentLifecycle', 'W.Utils', 'W.Config');

        var componentLogic,
            data,
            props,
            view,
            createSkin = function () {
                this.define.skin('internal.skins.MockSkin', function (def) {
                    def.inherits('core.managers.skin.BaseSkin2');
                    def.compParts({
                        'img': { skin: 'mock.viewer.skins.ImageNewMockSkin' }
                    });
                    def.skinParams([
                        {'id': 'txth', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_13'},
                        {'id': 'txt', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_15'},
                        {'id': 'fnt', 'type': Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_8'},
                        {'id': 'brw', 'type': Constants.SkinParamTypes.SIZE, 'defaultValue': '5px', 'noshow': true},
                        {'id': 'contentPaddingLeft', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true},
                        {'id': 'contentPaddingRight', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true},
                        {'id': 'contentPaddingTop', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true}
                    ]);

                    def.html(
                        '<a skinPart="link">' +
                            '<div skinPart="img" skin="mobile.core.skins.ImageNewSkin"></div>' +
                            '<span skinPart="label"></span>' +
                            '</a>'
                    );
                });
            },
            createComponentSpies = function () {
                spyOn(this.DocumentMedia.prototype, '_setDefaultImage').andCallFake(function () {
                    // Do nothing: this.resources.topology.skins + '/images/wysiwyg/core/themes/editor_web/add_image_thumb.png fails on testicle
                });
            },
            createComponent = function () {
                data = this.W.Data.createDataItem({type: 'Image'});
                props = this.W.Data.createDataItem({type: 'DocumentMediaProperties'});
                componentLogic = null;

                var viewNode = document.createElement('div');
                this.builder = new this.ComponentBuilder(viewNode);

                this.builder
                    .withType('wysiwyg.viewer.components.documentmedia.DocumentMedia')
                    .withSkin('internal.skins.MockSkin')
                    .withData(data)
                    ._with("htmlId", "mockId")
                    .onWixified(function (component, node) {
                        componentLogic = component;
                        componentLogic.setComponentProperties(props);
                        componentLogic.getViewNode().setProperty('id', documentMediaId);
                        getPlayGround().adopt(componentLogic.$view);
                    })
                    .create();

                waitsFor(function () {
                    return componentLogic !== null && componentLogic.$view.$measure;
                }, 'DocumentMedia component to be ready', 1000);

                runs(function () {
                    this.expect(componentLogic).not.toBeNull();
                    view = componentLogic.getViewNode();
                    this.expect(view).not.toBeNull();
                });

            };

        beforeEach(function () {
            createSkin.call(this);
            createComponentSpies.call(this);
            createComponent.call(this);
        });

        afterEach(function(){
            clearPlayGround();
        });

        describe('Test the component functionality', function () {
            it('Changing Document Title should call _setLabelAccordingToData()', function () {
                var newTitle = 'Lorem ipsum Title';

                spyOn(componentLogic, '_setLabelAccordingToData');
                data.set('title', newTitle);
                this.ComponentLifecycle["@testRenderNow"](componentLogic);

                expect(componentLogic._setLabelAccordingToData).toHaveBeenCalled();
            });

            it('Changing Document Title Display should call _toggleTitleDisplay()', function () {
                var showTitle = false;

                spyOn(componentLogic, '_toggleTitleDisplay');
                componentLogic.setComponentProperty('showTitle', showTitle);
                this.ComponentLifecycle["@testRenderNow"](componentLogic);

                expect(componentLogic._toggleTitleDisplay).toHaveBeenCalled();
            });
        });

        describe('Test the component properties and data', function () {
            it('The document title should change to the same text that was set in the data', function () {
                var newTitle = 'Lorem ipsum Title',
                    actualTitle;

                data.set('title', newTitle);
                this.ComponentLifecycle["@testRenderNow"](componentLogic);
                actualTitle = componentLogic.$view.textContent;

                expect(actualTitle).toEqual(newTitle);
            });

            it('The showTitle should change to the display value accordingly', function () {
                var showTitle = false;
                var actualShowTitle;

                componentLogic.setComponentProperty('showTitle', showTitle);
                this.ComponentLifecycle["@testRenderNow"](componentLogic);
                actualShowTitle = componentLogic.getComponentProperty('showTitle');

                expect(actualShowTitle).toEqual(showTitle);
            });
        });

        describe('Test document & image galleries related functionality', function () {
            describe('Test _getThumbnailUri', function () {
                it('should return the thumbnail url', function () {
                    var url = 'http://wwww.wix.com/dir1/fileuri',
                        expectedUri = 'dir1/fileuri',
                        actualUri = componentLogic._getThumbnailUri(url);

                    expect(actualUri).toEqual(expectedUri);
                });
            });

            describe('Test _createDocumentObject', function () {
                it('should return a Document object', function () {
                    var title = 'clean_code.pdf',
                        href = '//static.wixstatic.com/media/d6e20a_5cdfd19bee341df3e51d051fffe6ff55.pdf',
                        uri = 'micons/dbb8a86ae473275eee143da611a12717.wix_ico_mp',
                        expectedDocumentObject = {
                            'title': 'clean_code.pdf',
                            'text': 'clean_code.pdf',
                            'linkType': 'DOCUMENT',
                            'href': '//static.wixstatic.com/media/d6e20a_5cdfd19bee341df3e51d051fffe6ff55.pdf',
                            'target': '_blank',
                            'uri': 'micons/dbb8a86ae473275eee143da611a12717.wix_ico_mp'
                        },

                        actualDocumentObject = componentLogic._createDocumentObject(title, uri, href);

                    expect(actualDocumentObject).toEqual(expectedDocumentObject);
                });
            });

            describe('Test images gallery callback mediaGalleryCallback)', function () {
                it('should control the flow after selecting an image', function () {
                    var rawData = {
                        fileName: 'd6e20a_7c41de0242bf37c58ed9015383fe3107.png',
                        height: 646,
                        mediaType: 'picture',
                        thumbnailUrl: '//static.wixstatic.com/media/d6e20a_7c41de0242bf37c58ed9015383fe3107.png_srz_133_133_75_22_0.50_1.20_0.00_jpg_srz',
                        uri: 'd6e20a_7c41de0242bf37c58ed9015383fe3107.png',
                        url: '//static.wixstatic.com/media/d6e20a_7c41de0242bf37c58ed9015383fe3107.png',
                        width: 972
                    };

                    spyOn(componentLogic, '_createImageObject');
                    componentLogic.mediaGalleryCallback(rawData);

                    expect(componentLogic._createImageObject).toHaveBeenCalledWith('', rawData.height, rawData.width, rawData.fileName);
                });
            });

        });
    });
});