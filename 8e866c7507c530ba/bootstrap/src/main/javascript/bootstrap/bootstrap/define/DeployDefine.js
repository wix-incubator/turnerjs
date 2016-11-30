window.deployStatus = function(name, logObj){
    if(window.deployStatus._logAll_){
        window.deployStatus.logs[name] = window.deployStatus.logs[name] || [];
        window.deployStatus.logs[name].push(logObj);
    }
};
window.deployStatus._logAll_ = true;
window.deployStatus.logs = {};
window.deployStatus.files = {};
window.deployStatus.notReady = function(){
    try{
    return window.deployStatus.logs.phases[deployStatus.logs.phases.length-1].phaseExecuter._deployedInstances.filter(function(i){return !i.isReady();});
    }catch(e){
        throw 'phases are not started yet.';
    }
};
window.deployStatus.notRequsted = function(){
    return deployStatus.logs.addDefinition.slice().filter(function(i){return !~deployStatus.logs.callDefinition.indexOf(i);});
};
window.deployStatus.getLoadedScripts = function (reg){
    if(typeof reg === 'string'){reg = new RegExp(reg);}
    return [].filter.call(document.querySelectorAll('script'), function(s){return reg.test(s.src);});
};

/** @type {Define} */
var define = new Define();

