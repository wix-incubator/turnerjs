/**
 * removes social bar skin
 * removes undefined styles
 * migrateSocialAllSites({site collection});
 */
function migrateSocialBar(site){
      if(!site) return false;
    var document = getDocument(site);
    if(!document) return false;
    var themeData = document.themeData;
    if(!themeData) return false;
    var dirty = false;
    if(themeData.undefined){
        var skinName = themeData.undefined.skinName ? themeData.undefined.skinName : 'none';
        delete themeData['undefined'];
        dirty = true;
        print('found undefined in site ' + site._id + ' skin is ' + skinName);
    }
    dirty = migrateSocialBarComponents(document) || dirty;
    return updateSocialBarStyles(themeData, dirty) || dirty;
}

function migrateSocialBarComponents(element){
    var dirty = false;
    var children = element.components ||  element.children;

    if(element.componentType && element.componentType == 'comp.LinkBar' && element.styleId && element.styleId.toLowerCase() == 'lb2' ){
        element.styleId = 'lb1';
        dirty = true;
    }
    if(children){
        for(var i = 0; i< children.length; i++){
            dirty = migrateSocialBarComponents(children[i]) || dirty;
        }
    }
    return dirty;
}

function updateSocialBarStyles(themeData, isStyleNeeded){
    var dirty = false;
    if(themeData.lb1 && themeData.lb1.skinName && themeData.lb1.skinName != 'skin.LinkBarNoBGSkin'){
        themeData.lb1.skinName = 'skin.LinkBarNoBGSkin';
        dirty = true;
    }
    else if(isStyleNeeded){
        themeData.lb1 = {
            "className" : "data.MGTopLevelStyle",
            "skinName" : "skin.LinkBarNoBGSkin",
            "style" : {
                    "innerGroups" : {
                            "displayer" : {

                            }
                    }
            },
            "id" : "lb1",
            "metaData" : {
                    "preset" : false,
                    "schemaVersion" : "1.0",
                    "hidden" : false
            }

        };
        dirty = true;
    }
    if(themeData.lb2){
        delete themeData.lb2;
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

function migrateSocialAllSites(coll, siteId) {
    if(siteId){
        var site = coll.findOne({ '_id' : siteId });
        if (migrateSocialBar(site)) {
            coll.save(site);
            print("site with id " + site._id + " was migrated.");
        }
    }else{
        var sites = coll.find();
        sites.forEach(function(site) {
            if (migrateSocialBar(site)) {
                coll.save(site);
                print("site with id " + site._id + " was migrated.");
            }
        });
    }
}
