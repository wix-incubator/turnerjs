function findIllegalTexts(site){
    if(!site)
        return false;
    var data = site.dataNodes;
    if(!data)
        return false;

    var counter = 0;
    for(var i in data){
        if(data[i].className == 'data.MGRichText' && data[i].text
            && / comp=| skinpart=/.test(data[i].text)){
           // print(data[i].text);
            counter++;
        }
    }
    return counter;
}

function findAllIllegalTexts(coll){
    var sites = coll.find();
    var counter = 0;
    sites.forEach(function(site) {
        var siteCount = findIllegalTexts(site);
        if (siteCount > 0) {
            counter += siteCount;
            print("site with id " + site._id + " has " + siteCount + " illegal texts");
        }
    });
    print("total " + counter);
}
