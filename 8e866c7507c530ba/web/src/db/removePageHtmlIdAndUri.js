/**
 * Created by IntelliJ IDEA.
 * User: alissav
 * Date: 3/14/12
 * Time: 8:08 PM
 * To change this template use File | Settings | File Templates.
 */

function removePageHtmlIdAndUriFields(coll, siteId){


    if(siteId){
        var site = coll.findOne({ '_id' : siteId });

        if (removeFieldsFromSite(site)) {
            //coll.save(site);
            print("site with id " + site._id + " was migrated.");
        }
    }else{
        var sites = coll.find();
        sites.forEach(function(site) {
            if (removeFieldsFromSite(site)) {
                //coll.save(site);
                print("site with id " + site._id + " was migrated.");
            }
        });
    }

    function removeFieldsFromSite(site){
        var dataNodes = site.dataNodes;
        if(!dataNodes) return false;

        var dirty = false;
        for(var key in dataNodes){
            var node = dataNodes[key];
            if(node.className && node.className == 'data.MGPageData'){
                if(node.uri)
                    delete node.uri;
                if(node.htmlId)
                    delete node.htmlId;
                dirty = true;
            }
        }
        return dirty;
    }
}

function findPagesWithUriOrHtmlId(site){
    var dataNodes = site.dataNodes;
    if(!dataNodes) return false;

    var dirty = false;
    for(var key in dataNodes){
        var node = dataNodes[key];
        if(node.className && node.className == 'data.MGPageData'){
            dirty = node.uri || node.htmlId || false;
        }
    }
    return dirty;
}
