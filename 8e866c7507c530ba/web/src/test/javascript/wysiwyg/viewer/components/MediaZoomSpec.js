/**
 * Created by IntelliJ IDEA.
 * User: alissav
 * Date: 1/18/12
 * Time: 8:39 PM
 * To change this template use File | Settings | File Templates.
 */
describe('MediaZoomSpec', function() {
    testRequire().resources('W.Viewer');
    beforeEach(function(){
        this.img0 = W.Data.addDataItem('imgTest0', {type:'Image', title:'sss', uri:'sd.jpg' });
        this.img1 = W.Data.addDataItem('imgTest1', {type:'Image', title:'sss', uri:'sd.jpg' });
        this.img2 = W.Data.addDataItem('imgTest2', {type:'Image', title:'sss', uri:'sd.jpg' });

        spyOn(this.W.Viewer, 'getHomePageId').andReturn('mainPage');

        this.imgList = W.Data.createDataItem({'type':'ImageList', 'isPreset': true, items: ['#imgTest0', '#imgTest1', '#imgTest2']}, 'ImageList');

        W.Components.createComponent(
            'wysiwyg.viewer.components.MediaZoom',
            'mock.viewer.skins.MediaZoomSkin',
            null, null,null,
            function(logic){
                this.testZoom = logic;
                this.isComplete = true;
            }.bind(this)
        );

        waitsFor( function(){
                return this.isComplete;
            },
            'MediaZoom component creation',
            2000);
    });

    function getFunction (dataItem, maxSize, callback){
        W.Components.createComponent('wysiwyg.viewer.components.MediaZoomDisplayer',
            'mock.viewer.skins.displayers.MediaZoomDisplayerSkin',dataItem,
            {'maxWidth': maxSize.x, 'maxHeight': maxSize.y},
            null,
            function(logic){
                callback(logic.getViewNode());
            }
        );
    }
    var getImageItem = function(dataItem, callback){
        if(typeof(dataItem) == 'string')
            W.Data.getDataByQuery(dataItem, callback);
        else
            callback(dataItem);
    };

    function getHashPartsFunction (dataItem, callback){
        getImageItem(dataItem, function(imageItem){
            callback({'id': imageItem.get('id'), 'title': imageItem.get('title')});
        });
    }

    describe("skin params", function(){
        it("skin should have $marginIncludingArrow param", function(){

            var param = this.testZoom.getSkin().getParams().first(function(param){
                    return param.id === '$marginIncludingArrow';
                });
            expect(param).not.toBeNull();
        });
    });

    describe("setting zoom data", function(){
        it("should change the data if the passed image is different from current item of the gallery", function(){
            this.testZoom.setGallery(this.imgList, 1, getFunction, getHashPartsFunction);
            this.testZoom.setImage(this.img0, getFunction, getHashPartsFunction);
            expect(this.testZoom.getDataItem().get("items").length).toBe(1);
        });
    });

    describe("changing the url hash 2", function(){
        var checkUrlHash = function(img){
            waitsFor(function(){
                return W.Utils.hash.getHash() === (img.get('id'));
            }, "url hash changed to image title|id", 200);
        };
        it("should change the hash when zoom first loaded", function(){
            this.testZoom.setGallery(this.imgList, 1, getFunction, getHashPartsFunction);
            checkUrlHash(this.img1);
        });
        it("should change the hash when moving to next image in the gallery", function(){
            this.testZoom.setGallery(this.imgList, 1, getFunction, getHashPartsFunction);
            this.testZoom.unlock(); // release lock manually since missing viewer causes code to crash and remain locked forever!
            this.testZoom.gotoNext();
            checkUrlHash(this.img2);
        });
    });

    xdescribe("flow", function(){
        beforeEach(function(){
            W.Viewer._onSiteReady(); // fake on site ready
            W.Viewer._zoomComp = this.testZoom.getViewNode();
        });

        it("showZoomImage should be called after hash change when changing gallery", function(){
            var hashAlreadySet = false;
            spyOn(this.testZoom, 'showZoomImage').andCallFake(function(){
                hashAlreadySet = W.Utils.hash.getHash() === (this.img1.get('id'));
            }.bind(this));
            this.testZoom.setGallery(this.imgList, 1, getFunction, getHashPartsFunction);
            waitsFor(function(){
                return hashAlreadySet;
            }, "start rendering zoom after hash change", 400);
        });

    });
});

