//describe('FontSelectorButtonSpec', function () {
//
//        testRequire()
//        .components('wysiwyg.editor.components.FontSelectorButton')
//        .classes('core.managers.components.ComponentBuilder','core.utils.css.Font')
//        .resources('W.Data', 'W.ComponentLifecycle')
//    ;
//
//    function createComponent(){
//        var that = this;
//        this.cb = function (){
//        };
//        this.args = {
//            currentFont : "font_0",
//            cbFunc : this.cb
//        };
//        var builder = new this.ComponentBuilder(document.createElement('div'));
//        builder
//            .withType('wysiwyg.editor.components.FontSelectorButton')
//            .withSkin('wysiwyg.editor.skins.FontSelectorButtonSkin')
//            .withArgs(this.args)
//            .onWixified(function (component) {
//                that.componentLogic = component;
//            })
//            .create();
//    }
//
//    beforeEach(function () {
//        createComponent.call(this);
//
//        waitsFor(function () {
//            return this.componentLogic !== null;
//        }, 'FontSelectorButton component to be ready', 1000);
//    });
//
//    describe('Component structure', function () {
//        it('Skin parts should be defined', function () {
//            expect(this.componentLogic._skinParts.font).toBeDefined();
//            expect(this.componentLogic._skinParts.fontSelection).toBeDefined();
//        });
//    });
//
//    describe('Component functionality', function () {
//     it ('check font list was created on obj init',function (){
//        var fontObj =this.componentLogic._fontObj;
//         var expectedSize= 12;
//         var size = 0, key;
//         for (key in fontObj) {
//             if (fontObj.hasOwnProperty(key)) size++;
//         }
//         expect(size).toEqual(expectedSize);
//     });
//
//        it ('on mouse over state should be overFont',function (){
//            var expectedState= "overFont";
//            this.componentLogic._onMouseOver();
//            var currState = this.componentLogic._skinParts.view.getAttribute("state");
//            expect(currState).toEqual(expectedState);
//        });
//
//        it ('on mouse over state should be empty',function (){
//            var expectedState= "";
//            this.componentLogic._onMouseOut();
//            var currState = this.componentLogic._skinParts.view.getAttribute("state");
//            expect(currState).toEqual(expectedState);
//        });
//
//        it ('on mouse down state should be pressedFont',function (){
//            var expectedState= "pressedFont";
//            this.componentLogic._onMouseDown();
//            var currState = this.componentLogic._skinParts.view.getAttribute("state");
//            expect(currState).toEqual(expectedState);
//        });
//
////        it ('Initial Font should be font_0 (passed on init)',function (){
////            var self=this;
////            spyOn(W.Preview,"getPreviewManagers").andCallFake(function(){
////                return {
////                   "Theme":{
////                       "getProperty":function(font){
////                          return new self.componentLogic.imports.Font( "normal normal bold 36px/1.1em enriqueta,serif");
////
////                       }
////                   }
////                }
////            });
////            this.componentLogic._setInitialFont();
////
////            var expectedVal = "Title"
////            var val = this.componentLogic._skinParts.font.innerHTML;
////            expect(val).toEqual(expectedVal);
////        });
//
//        it ('check intial Font Style applied on fontSkinPart',function (){
//            var fontObj = {
//                _style : "normal",
//                _variant :"normal",
//                _weight : "bold",
//                _fontFamily :"Enriqueta",
//                _fontSize: 20
//
//
//            };
//            this.componentLogic._setFontNodeStyle(fontObj);
//            var CurrStyle =  this.componentLogic._skinParts.font.getStyle("font-style");
//            var CurrVariant =  this.componentLogic._skinParts.font.getStyle("font-variant");
//            var CurrWeight =  this.componentLogic._skinParts.font.getStyle("font-weight");
//            var CurrFontFaimly =  this.componentLogic._skinParts.font.getStyle("font-family");
//            var CurrSize =  this.componentLogic._skinParts.font.getStyle("font-size");
//            expect(CurrStyle).toEqual(fontObj._style);
//            expect(CurrVariant).toEqual(fontObj._variant);
//            expect(CurrWeight).toEqual(fontObj._weight);
//            expect(CurrFontFaimly).toEqual(fontObj._fontFamily);
//            expect(CurrSize).toEqual(fontObj._fontSize+"px");
//        });
//
//
//        it ('check style is changed on font changed',function (){
//            var event = {"value":"italic normal bold 20px/1.3em braggadocio-w01"};
//            var fontObj = new this.componentLogic.imports.Font(event.value);
//            var fontName = "Custom";
//            var fontValue = "customized";
//
//
//            this.componentLogic._fontChangedFromAdvancedSettings(event,fontName,fontValue);
//            var fontInnerHtml = this.componentLogic._skinParts.font.innerHTML;
//            var CurrStyle =  this.componentLogic._skinParts.font.getStyle("font-style");
//            var CurrVariant =  this.componentLogic._skinParts.font.getStyle("font-variant");
//            var CurrWeight =  this.componentLogic._skinParts.font.getStyle("font-weight");
//            var CurrFontFaimly =  this.componentLogic._skinParts.font.getStyle("font-family");
//            var CurrSize =  this.componentLogic._skinParts.font.getStyle("font-size");
//            expect(fontInnerHtml).toEqual(fontName);
//            expect(CurrStyle).toEqual(fontObj._style);
//            expect(CurrVariant).toEqual(fontObj._variant);
//            expect(CurrWeight).toEqual(fontObj._weight);
//            expect(CurrFontFaimly).toEqual(fontObj._fontFamily);
//            expect(CurrSize).toEqual(fontObj._fontSize+"px");
//        });
//
//
//    });
//
//
//
//});