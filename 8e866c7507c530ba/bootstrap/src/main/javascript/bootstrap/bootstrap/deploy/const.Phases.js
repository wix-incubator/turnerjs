var PHASES = {
    BOOTSTRAP:     0,
    LIBS:          1,
    CLASSMANAGER:  2,
    UTILS:         3,
    MANAGERS:      4,
    INIT_ANGULAR:  5,
    LOAD_ANGULAR:  6,
    INIT:          7,
    POST_DEPLOY:   8,
    TEST:          9
};


PHASES.getPhaseFormIndex = function(index){
    for(var phaseName in this) {
        if(this[phaseName] === index){
            return phaseName;
        }
    }
};


PHASES.isPhaseExist = function(phase){
    return this[phase.split('PHASES.').pop()] >= 0;
};

PHASES.lastPhaseIndex = function(){
    var max = 0;
    for(var phaseName in this) {
        max = this[phaseName] > max ? this[phaseName] : max;
    }
    return max;
};
