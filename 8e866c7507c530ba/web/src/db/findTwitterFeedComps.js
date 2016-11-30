
var sites = coll.find();
sites.forEach(function(site) {
    if (isSiteHasTwitter(site)) {
        print("site with id " + site._id + " has twitter feed");
    }
});

function isSiteHasTwitter(site){
    if(!site) return false;
    var document = getDocument(site);
    if(!document) return false;

    var foundTwitter = false;

    foundTwitter = isElementHasTwitter(document);
    return foundTwitter;
}

function isElementHasTwitter(element){
    var found = false;
    var children = element.components ||  element.children;

    if(element.componentType && element.componentType == 'comp.TwitterFeed' ){
        found = true;
    }
    if(!found && children){
        for(var i = 0; !found && i < children.length; i++){
            found = isElementHasTwitter(children[i]) || found;
        }
    }
    return found;
}

function getDocument(site) {
    if (site.document)
        return site.document;
    else if (site.documents)
        return site.documents[0];
    else
        return null;
}
