var W = {
    alertGay: function() {
        alert("GAY!!!!");
    },

    setViewportAttribute: function(attribute, value){
        console.log('------------------------------------');
        console.log('setViewportAttribute');
        var viewPort = document.getElementById('viewport');
        console.log('before change');
        console.log(viewPort);
        var contentAttribute = viewPort.getAttribute('content');
        var contentAttributeKeyValPairs = contentAttribute.split(/ *,/);
        var newContent = '';
        var foundAttribute = false;
        for (var i=0;i<contentAttributeKeyValPairs.length; i++) {
            var keyValPair = contentAttributeKeyValPairs[i];
            if (keyValPair.indexOf(attribute)>-1) {
                foundAttribute = true;
                if (!value) { // remove the key
                    continue;
                }
                keyValPair = keyValPair.replace(/\ *=.*/,'='+value);
            }
            newContent+=keyValPair + ",";
        }
        newContent = newContent.substring(0, newContent.length - 1);

        if (foundAttribute) {
            viewPort.setAttribute('content',newContent);
        } else {
            viewPort.setAttribute('content',newContent + ',' + attribute + '=' + value);
        }

        console.log('after change:');
        console.log(viewPort);
    }

};