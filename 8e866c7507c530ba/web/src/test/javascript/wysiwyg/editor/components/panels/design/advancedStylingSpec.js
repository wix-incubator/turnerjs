/**
 * Created by IntelliJ IDEA.
 * User: sivanb
 * Date: 12/5/11
 * Time: 11:04 AM
 * To change this template use File | Settings | File Templates.
 */

//This will test Advanced Styling only for a component mode and not for general.
//Since the general use was cancelled for the time being, even though the code still exists.
//
//describe("AdvancedStyling", function(){
//   describe("Test Advanced Styling for a specific component", function(){
//
//        beforeEach(function() {
//             this.mockAdvancedStyling = new MockBuilder('AdvancedStyling')
//                .extendClass('wysiwyg.editor.components.panels.design.AdvancedStyling').mockMethodAndRun('initialize', function() {
//                     this._resetFieldTree = function(){};
//                     this._buildStyleGui = function(){};
//                 }).getInstance();
//
//            this.mockAdvancedStyling._skinItem = W.Data.createDataItem({'items':[], type:'list'});
//
//        });
//
//       it("should update skin data", function(){
//           runs(function(){
//               W.Config.getServiceTopologyProperty('staticSkinUrl') = "test";
//                var styleData = {getSkin:function(){return "testSkin"}};
//                W.Data.dataMap["SKIN_DESCRIPTION"] = W.Data.createDataItem({
//                    type:'list',
//                    skins: {'testSkin' : { 'description': 'test skin', 'iconUrl': 'xxx.png'},
//                            'testSkin1' : { 'description': 'test skin1', 'iconUrl': 'xxx.png'},
//                            'testSkin2' : { 'description': 'test skin2', 'iconUrl': 'xxx.png'},
//                            'testSkin3' : { 'description': 'test skin3', 'iconUrl': 'xxx.png'}}
//                });
//                this.mockAdvancedStyling._skinList = {testComp:["testSkin", "testSkin1", "testSkin2", "testSkin3"]};
//                this.mockAdvancedStyling._selectedCompName = "testComp";
//                this.mockAdvancedStyling._skinGallery = {selectItemAtIndex:function(i){}};
//                this.mockAdvancedStyling._updateSkinListDataItem(styleData);
//                waitsFor(function(){
//                    return this.mockAdvancedStyling._skinItem.get('items').length == 4;
//
//                }.bind(this),
//                'skin data item update',
//                1000);
//
//           })
//
//       })
//
//
//   })
//
//});
