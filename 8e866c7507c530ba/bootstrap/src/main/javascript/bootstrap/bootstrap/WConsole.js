(function () {
    "use strict";

    var WConsoleClass = function(loggerFunc, originalConsole, shouldAlsoCallOriginalConsole, dependencies) {
        dependencies = dependencies || {};

        this._isWConsole = true;

        if (originalConsole) {
            this._oldConsole = originalConsole;
        }

        loggerFunc = typeof loggerFunc === 'function' && loggerFunc;

        var consoleFunctionNames = dependencies.consoleFunctionNames || WConsoleClass.CONSOLE_FUNCTION_NAMES;

        var isIE8Or9 = /MSIE [89]/.test(dependencies.userAgent);

        function log(originalFuncName) {
            if (loggerFunc) {
                loggerFunc.apply(null, arguments);
            }

            if (originalConsole && shouldAlsoCallOriginalConsole) {
                var originalFunc = originalConsole[originalFuncName];

                var args = Array.prototype.slice.call(arguments, 1);
                var originalFuncType = typeof originalFunc;

                if (originalFuncType === 'function' || (isIE8Or9 && originalFuncType === 'object')) {
                    return tryLog(originalConsole, originalFunc, args);
                }
            }
        }

        function tryLog(console, consoleFunc, args) {
            try {
                // IE8/9: see https://github.com/bitovi/canjs/issues/109
                // Safari 6.0 and 7.0 on OSX throws TypeError (does not happen in 7.0.3)
                return Function.prototype.call.apply(consoleFunc, [console].concat(args));
            } catch(e) {
                // for the unit tests
                if (typeof dependencies.onLogException === 'function') {
                    dependencies.onLogException(e);
                }
            }
        }

        consoleFunctionNames.forEach(function(funcName) {
            this[funcName] = log.bind(this, funcName);
        }, this);
    };

    WConsoleClass.CONSOLE_FUNCTION_NAMES =
        [
            'debug', 'error', 'info', 'log', 'warn', 'dir', 'dirxml', 'trace', 'assert', 'count',
            'markTimeline', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp',
            'group', 'groupCollapsed', 'groupEnd'
        ];

    var LogStoreClass = function (dependencies) {
        dependencies = dependencies || {};
        dependencies.Date = dependencies.Date || window.Date;

        var log = [];
        this.add = function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(new dependencies.Date());
            log.push(args);
        };

        this.get = function () {
            return log;
        };

        this.clear = function() {
            log = [];
        };

        this.pop = function() {
            var result = this.get();
            this.clear();
            return result;
        };
    };

    var ConsoleStoreClass = function(dependencies) {
        LogStoreClass.apply(this, arguments);
    };

    var WindowErrorsStoreClass = function(dependencies) {
        dependencies = dependencies || {};
        LogStoreClass.apply(this, arguments);
        var w = dependencies.window = dependencies.window || window;

        var started = false;
        var oldOnError = null;

        var self = this;

        this.start = function() {
            if (started) {
                return;
            }

            started = true;
            oldOnError = w.onerror;

            w.onerror = function() {
                self.add.apply(self, arguments);

                if (oldOnError) {
                    return oldOnError.apply(this, arguments);
                }

                return false;
            };
        };

        this.stop = function() {
            if (!started) {
                return;
            }

            w.onerror = oldOnError;
            oldOnError = null;
            started = false;
        };
    };

    var PopupLoggerClass = function(containerNode) {
        function createNodes(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return div.childNodes;
        }

        var SUPPORT_LINK = 'http://www.wix.com/support/forum/html5/error-messages-and-known-bugs/live-website-errors/known-issue-when-i-view-my-site';

        var POPUP_HTML =
            //border not working. check
            '<div id="logTextAreaContainer" style="position:fixed;top:40px;left:40px;width:80%;height:80%;background:yellow;border:1px;z-index:2000;">' +
                '<div style="font-size: 16px; padding: 10px; color: black;">' +
                    'Please copy the following (click in the text box, then CTRL+A and CTRL+C) ' +
                    'and paste it ' +
                    '<a href="' + SUPPORT_LINK + '" target="_blank">here</a> ' +
                    '(you can use CTRL+V to paste)' +
                '</div>' +
                '<textarea id="logTextArea" style="width:100%;height:100%;" value=""></textarea>' +
            '</div>';


        var nodes = createNodes(POPUP_HTML);
        while(nodes[0]) {
            containerNode.appendChild(nodes[0]);
        }

        var textAreaNode = containerNode.querySelector('#logTextArea');

        this.getTextAreaNode = function() {
            return textAreaNode;
        };

        this.addLogLine = function(line) {
            textAreaNode.value += line + '\n';
        };

        this._formatConsoleCall = function(consoleFuncName) {
            var args = Array.prototype.slice.call(arguments, 1);
            return '' + consoleFuncName + ': ' + args;
        };

        this.logConsoleCall = function() {
            var line = this._formatConsoleCall.apply(this, arguments);
            this.addLogLine(line);
        };
    };

    // inspired by:
    // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    PopupLoggerClass.isAppendableDom = function(o){
        if (typeof HTMLElement === 'object') {   // DOM2
            return o instanceof HTMLElement;
        }

        return o && typeof o.nodeName === 'string' &&
            [1 /* Element */, 11 /* Document fragment */].indexOf(o.nodeType) !== -1 &&
            ['function', 'object' /* IE8 */].indexOf(typeof o.appendChild) !== -1;
    };

    var WConsoleBuilderClass = function(dependencies) {
        //for a good review of the various url params, go to http://kb.wixpress.com/pages/viewpage.action?pageId=10815914
        this._isUrlParamSpecified = function(nameValue) {
            var regex = new RegExp('[?&]' + nameValue + '($|&)', 'i');
            return regex.test(dependencies.urlQuery);
        };

        var isLogSpecified = this._isUrlParamSpecified('log(bi)?=true');
        var isStoreSpecified = this._isUrlParamSpecified('wconsole=store');

        var isIE = typeof dependencies.userAgent === 'string' && dependencies.userAgent.indexOf('MSIE') !== -1;

        this._shouldEnableWConsole = function() {
            var serviceTopology = dependencies.serviceTopology;
            var enableWConsole = (serviceTopology && !serviceTopology.developerMode) ||
                isLogSpecified ||
                isStoreSpecified ||
                this._isUrlParamSpecified('wconsole=true') ||
                isIE;

            if (!enableWConsole) {
                return false;
            }

            var disableWConsole = this._isUrlParamSpecified('wconsole=false');

            return !disableWConsole;
        };

        function mapObject(obj, callback) {
            var result = [];
            for(var propName in obj) {
                if (obj.hasOwnProperty(propName)) {
                    var value = callback(obj[propName], propName);
                    if (value) {
                        result.push(value);
                    }
                }
            }

            return result;
        }

        this._getInitialLogLines = function() {
            function toLogLine(value, name) {
                return '' + name + ': ' + (typeof value === 'string' ? value : JSON.stringify(value));
            }

            function toLogLineIfTruthy(value, name) {
                return value ? toLogLine(value, name) : null;
            }

            var logDeps = dependencies.initialLog || {};
            return mapObject(logDeps.alwaysPrint || {}, toLogLine)
                .concat(mapObject(logDeps.printOnlyIfNonNull || {}, toLogLineIfTruthy));
        };

        this._shouldAlsoCallOriginalConsole = function() {
            return isLogSpecified ||
                isStoreSpecified ||
                ['mode=debug','debugartifacts?(=[^&]+)?'].some(this._isUrlParamSpecified);
        };

        this._shouldLogTextAreaBeEnabled = function() {
            return this._isUrlParamSpecified('log=true') &&
                dependencies.popupContainer &&
                PopupLoggerClass.isAppendableDom(dependencies.popupContainer);
        };

        this._getLoggerFunc = function() {
            var logStoreContainer = dependencies.logStoreContainer;
            if (isStoreSpecified && logStoreContainer && logStoreContainer.length === 2) {

                var consoleStore = new ConsoleStoreClass();
                var scope = logStoreContainer[0];
                var propertyName = logStoreContainer[1];
                scope[propertyName] = consoleStore;
                return consoleStore.add.bind(consoleStore);

            } else if (this._shouldLogTextAreaBeEnabled()) {

                var popupLogger = new PopupLoggerClass(dependencies.popupContainer);

                // add initial log lines
                this._getInitialLogLines().forEach(popupLogger.addLogLine, popupLogger);

                return popupLogger.logConsoleCall.bind(popupLogger);

            }
        };

        this.build = function() {
            var originalConsole = dependencies.originalConsole;

            if (!this._shouldEnableWConsole()) {
                return originalConsole;
            }

            var loggerFunc = this._getLoggerFunc();

            var shouldAlsoCallOriginalConsole = this._shouldAlsoCallOriginalConsole();

            return new WConsoleClass(
                loggerFunc,
                originalConsole,
                shouldAlsoCallOriginalConsole,
                {
                    userAgent: dependencies.userAgent,
                    onLogException: dependencies.onLogException
                }
            );
        };

        this.startCapturingWindowErrorsIfSpecified = function() {
            var container = dependencies.windowErrorsStoreContainer;
            var Class = dependencies.WindowErrorsStoreClass;
            if (!isStoreSpecified || !container || container.length !== 2 ||
                typeof Class !== 'function') {

                return;
            }

            var windowErrorsStore = new Class();
            var scope = container[0];
            var propertyName = container[1];
            scope[propertyName] = windowErrorsStore;
            windowErrorsStore.start();
        };
    };

    WConsoleBuilderClass._WConsoleClass = WConsoleClass;
    WConsoleBuilderClass._PopupLoggerClass = PopupLoggerClass;
    WConsoleBuilderClass._ConsoleStoreClass = ConsoleStoreClass;
    WConsoleBuilderClass._WindowErrorsStoreClass = WindowErrorsStoreClass;

    if (window.W && window.W.isUnitTestMode) {
        window.W.WConsoleBuilderClass = WConsoleBuilderClass;

        // workaround until html-test-framework is updated to not remove WConsoleBuilderClass
        window.WT = window.WT || {};
        window.WT.WConsoleBuilderClass = WConsoleBuilderClass;
    } else {
        var wConsoleBuilder = new WConsoleBuilderClass({
            urlQuery: window.location.search,
            userAgent: window.navigator.userAgent,
            serviceTopology: window.serviceTopology,
            popupContainer: document.body,
            logStoreContainer: [window, '_consoleLogStore'],
            windowErrorsStoreContainer: [window, '_windowErrorsStore'],
            WindowErrorsStoreClass: WConsoleBuilderClass._WindowErrorsStoreClass,
            originalConsole: window.console,
            initialLog: {
                alwaysPrint: {
                    'User Agent (Browser)': navigator.userAgent,
                    'Site ID': window.siteHeader && window.siteHeader.userId,
                    'User ID': window.siteId
                },
                printOnlyIfNonNull: {
                    rendererModel: window.rendererModel,
                    editorModel: window.editorModel,
                    publicModel: window.publicModel,
                    serviceTopology: window.serviceTopology
                }
            }
        });

        window.console = wConsoleBuilder.build();
        wConsoleBuilder.startCapturingWindowErrorsIfSpecified();
    }
}());
