// .bind polyfill for phantomjs
/*eslint santa/enforce-package-access:0, no-extend-native:0*/
/*eslint-env broswer*/
console.log('Executing karma test utils');

//The .bind method from Prototype.js
if (!Function.prototype.bind) {
    Function.prototype.bind = function () {
        'use strict';
        var self = this, args = Array.prototype.slice.call(arguments), object = args.shift();
        return function () {
            return self.apply(object,
                args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

// Patch since PhantomJS does not implement click() on HTMLElement. In some
// cases we need to execute the native click on an element. However, jQuery's
// $.fn.click() does not dispatch to the native function on <a> elements, so we
// can't use it in our implementations: $el[0].click() to correctly dispatch.
if (!HTMLElement.prototype.click) {
    HTMLElement.prototype.click = function() {
        'use strict';
        var ev = document.createEvent('MouseEvent');
        ev.initMouseEvent(
            'click',
            /*bubble*/true, /*cancelable*/true,
            window, null,
            0, 0, 0, 0, /*coordinates*/
            false, false, false, false, /*modifier keys*/
            0, /*button=left*/null
        );
        this.dispatchEvent(ev);
    };
}

/*eslint-enable no-extend-native*/
//////////////////////////////////
