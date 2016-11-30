/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/24/12
 * Time: 11:49 AM
 */

define.utils('debug:this', function(){

    return ({
        /**
         * return stacktrace as string
         */
        getStackTrace: function(ignoreLastXCalls) {
            // Set default line removal amount
            ignoreLastXCalls = (!isNaN(ignoreLastXCalls) && ignoreLastXCalls > 0) ? ignoreLastXCalls : 1;
            // Get stack trace
            var e = new Error();
            var stack = '(no stack)';
            if (e.stack) { //Firefox and Webkit
                stack = e.stack;
            } else if (window.opera && e.message) { //Opera
                stack = e.message;
//            } else {
//                var currentFunction = this.getStackTrace.caller || arguments.callee.caller || arguments.caller;
//                var counter = 20;
//                while (typeof currentFunction == "function" && --counter) {
//                    var fn = currentFunction.toString();
//                    var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('\n')) || 'anonymous';
//                    callstack.push(fname);
//                    currentFunction = currentFunction.caller;
//                }
            }
            // Remove garbage
            stack = stack.split('[object Object]').join('{}');
            stack = stack.split('[object Array]').join('[]');
            stack = stack.replace(/at/g, '');
            stack = stack.split(window.serviceTopology.scriptsLocationMap.web + '/javascript/').join('');
            // Remove first X lines
            var stackLines = stack.split('\n');
            if(stackLines[0].toLowerCase() == 'error') { // chrome adds Error as first line
                ignoreLastXCalls++;
            }
            stackLines = stackLines.splice(ignoreLastXCalls);
            // Return stack result
            return stackLines.join('<<').replace(/\s{2,}/g, ' ');
        }


    });

});
