/**
 * This file is a combo of all extra mousetrap extensions including Wix.com specific tweaks
 * https://gist.github.com/3154320
 * https://gist.github.com/3747509
 * https://gist.github.com/3885446
 */

Mousetrap = (function(Mousetrap){
    var self = Mousetrap,
        args,
        enabled = true,
        _original_bind = self.bind,
        _original_stop_callback = self.stopCallback,
        _original_unbind = self.unbind,
        _global_callbacks = {};

    /**
     * Overwrites default Mousetrap.bind method to optionally accept
     * an object to bind multiple key events in a single call
     *
     * You can pass it in like:
     *
     * Mousetrap.bind({
     *     'a': function() { console.log('a'); },
     *     'b': function() { console.log('b'); }
     * });
     *
     * And can optionally pass in 'keypress', 'keydown', or 'keyup'
     * as a second argument
     */
    self.bind = function(){
        args = arguments;
        var key;

        // normal call
        if(typeof args[0] == 'string' || Array.isArray(args[0])){
            return _original_bind(args[0], args[1], args[2]);
        }

        // object passed in
        for(key in args[0]){
            if(args[0].hasOwnProperty(key)){
                _original_bind(key, args[0][key], args[1]);
            }
        }
    };

    /**
     * Added fourth param {Boolean} forceCheck
     * that adds a switch to force calling the original callback even if in pause mode
     * @return {Boolean}
     */
    self.stopCallback = function(e, element, combo, forceCheck){
        if(!enabled && !forceCheck){
            return true;
        }

        if (_global_callbacks[combo]) {
            return false;
        }

        return _original_stop_callback(e, element, combo);
    };

    /**
     * adds a pause and unpause method to Mousetrap
     * this allows you to enable or disable keyboard shortcuts
     * without having to reset Mousetrap and rebind everything
     */
    self.pause = function(){
        enabled = false;
    };

    self.unpause = function(){
        enabled = true;
    };

    self.isPaused = function(){
        return !enabled;
    };

    self.isEnabled = function(){
        return enabled;
    };

    /**
     * adds a bindGlobal method to Mousetrap that allows you to
     * bind specific keyboard shortcuts that will still work
     * inside a text input field
     *
     * usage:
     * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
     */
    self.bindGlobal = function(keys, callback, action) {
        self.bind(keys, callback, action);
        var i;
        if (Array.isArray(keys)){
            for (i = 0; i < keys.length; i++){
                _global_callbacks[keys[i]] = true;
            }
        }else{
            _global_callbacks[keys] = true;
        }
    };

    self.unbind = function(keys, action) {
        _original_unbind(keys, action);
        var i;
        if (Array.isArray(keys)){
            for (i = 0; i < keys.length; i++){
                delete _global_callbacks[keys[i]];
            }
        }else{
            delete _global_callbacks[keys];
        }

    };

    return self;
}(Mousetrap));
