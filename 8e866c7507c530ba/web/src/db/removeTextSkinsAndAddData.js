/**
 * removes the 2 extra skins of rich text and their styles
 * adds default style to the text data.
 * migrateTextAllSites({site collection})
 */
function migrateTextSkins(site){
    if(!site) return false;
    var data = site.dataNodes;
    var document = getDocument(site);
    if(!data || !document) return false;
    var themeData = document.themeData;
    if(!themeData) return false;

    var dirty = false;
    var dataMap = {};
    for(var i =0; i< data.length; i++){
        if(data[i].className == 'data.MGRichText'){
            dataMap[data[i].id] = data[i];
        }
    }
    dirty = migrateTextSkinsRecursively(document, dataMap, themeData);
    return updateTextStyles(themeData, dirty) || dirty;
}

function migrateTextSkinsRecursively(element, dataMap, themeData){
    var dirty = false;
    var children = element.components ||  element.children;

    if(element.componentType && element.styleId && element.componentType == 'comp.WRichText'){
        var styleId = element.styleId;
        var dataId = element.dataReference.dataNodeId;
        if(updateTextData(dataMap[dataId], themeData[styleId])){
            element.styleId = 'tx1';
            dirty = true;
        }
    }
    if(children){
        for(var i = 0; i< children.length; i++){
            dirty = migrateTextSkinsRecursively(children[i], dataMap, themeData) || dirty;
        }
    }
    return dirty;
}

var updateTextData = function(){
    var skinToDataMap = {
        'skin.WRichTextSkin' : 'font_6',
        'skin.WRichTextTitleSkin' : 'font_0',
        'skin.WRichTextSubTitleSkin' : 'font_2'
    };
    return function (data, compStyle){

        if(compStyle && skinToDataMap[compStyle.skinName] && data){
            data.defaultStyle = skinToDataMap[compStyle.skinName];
            return true;
        }
        return false;
    }
}();

function updateTextStyles(themeData, needToHaveTxt1){
    var dirty = false;
    var textStyle = themeData.tx1;
    if(textStyle && textStyle.skinName != 'skin.WRichTextSkin'){
        textStyle.skinName = "skin.WRichTextSkin";
        dirty = true;
    }
    else if(!textStyle && needToHaveTxt1){
        themeData.tx1 = {

            "className" : "data.MGTopLevelStyle",
            "skinName" : "skin.WRichTextSkin",
            "style" : {
                "skinToThemePropertiesMapping" : {
                    "f0" : "font0",
                    "f6" : "font6",
                    "f7" : "font7",
                    "f8" : "font8",
                    "f9" : "font9",
                    "f10" : "font10",
                    "f1" : "font1",
                    "f3" : "font3",
                    "f2" : "font2",
                    "f5" : "font5",
                    "f4" : "font4"
                }
            },
            "id" : "tx1",
            "metaData" : {
                "preset" : false,
                "schemaVersion" : "1.0",
                "hidden" : false
            }
        };
        dirty = true;
    }
    if(themeData.txt2){
        delete themeData.txt2;
        dirty = true;
    }
    if(themeData.txt3){
        delete themeData.txt3;
        dirty = true;
    }
    if(themeData.txt1){
        delete themeData.txt1;
        dirty = true;
    }
    return dirty;
}

function getDocument(site) {
    if (site.document)
        return site.document;
    else if (site.documents)
        return site.documents[0];
    else
        return null;
}

function migrateTextAllSites(coll, siteId) {
    if(siteId){
        var site = coll.findOne({ '_id' : siteId });

        if (migrateTextSkins(site)) {
            coll.save(site);
            print("site with id " + site._id + " was migrated.");
        }
    }else{
        var sites = coll.find();
        sites.forEach(function(site) {
            if (migrateTextSkins(site)) {
                coll.save(site);
                print("site with id " + site._id + " was migrated.");
            }
        });
    }
}
