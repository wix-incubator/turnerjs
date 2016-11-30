define.resource('tags', getTags());

function getTags(){
    var tags = ['common', 'test'];
    var experiments = editorModel.runningExperiments;
    for(var expName in experiments){
        tags.push(expName.toLowerCase() + ':' + experiments[expName].toLowerCase());
    }
    return tags;
}

define.resource('mode', {
    debug : true,
    test : true
});
