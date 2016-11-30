/**
 * Created with IntelliJ IDEA.
 * User: baraki
 * Date: 11/15/12
 * Time: 5:00 PM
 * To change this template use File | Settings | File Templates.
 */
Function.prototype.extendPrototype = function(namespace/*[objs...]*/){
    var i,
        prop,
        extender,
        extended,
        args = arguments;

    extended = (typeof this === 'function') ? this.prototype : this;
    extended.constructor = this;

    if (typeof namespace === "string") {
        args = [].slice.call(arguments, 1);
        extended = extended[namespace] = extended[namespace] || {};
    }

    var isProfileOn = window.__profiler && window.__profiler._isProfiling ;
    for (i = 0; i < args.length; i++) {
        extender = args[i];
        for(prop in extender){
            if(extender.hasOwnProperty(prop)){
                var exFunc = extender[prop];
                if (isProfileOn && typeof extender[prop] === 'function') {
                    extended[prop] = window.__profiler.___profileFunction(exFunc, prop, this.name);
                } else {
                    extended[prop] = exFunc;
                }
            }
        }
    }
};

