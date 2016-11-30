define.bootstrapClass('bootstrap.bootstrap.XClass', function () {

    function XClass(isDebug){
        this._isDebug = !!isDebug;
        this._createConstructor = (this._isDebug) ? this._createNamedConstructor : this._createAnonymousConstructor;
    }

    XClass.extendPrototype({
        constructor:window.XClass,

        /**
         * XClass is used to define new classmanager
         * the classDef param is used pretty much like the mootools Class type:
         * - initialize: {Function} is used as a init method (post - construct method)
         * - Extends: {Function} defines the class parent. only functions may be used, for non-functions will be ignored
         * - Implements: {Array} an array of implemented traits. objects and functions may be used as array items.
         * - Binds: {Array of Strings} a list of functions to bind to "this" scope
         * - className: {String} class identifier <b>Note:</b> uniqueness is NOT enforced
         * - Static: {Object} a key value map of static variables.
         *      these vars are accessible both on the instance scope level (this.MY_STATIC) and the class def (MyClass.MY_STATIC)
         * - parent: RESERVED, used in methods to run their super method
         * - $parentPrototype: RESERVED
         * - $className: RESERVED
         *
         * @class XClass
         * @param classDef class definition object
         */
        createClass: function createClass(classDef, className) {
            // make sure there's a classDef object and override className
            classDef = classDef || {};
            className = className || classDef.className;
            classDef.$className = classDef.className = className;

            // create class prototype & constructor
            var classConstructor = this._createConstructor(className, this._WClassConstructor);
            var classPrototype = {};

            // clone the parent prototype (if any)
            var parentClass = classDef._fields_ && classDef._fields_._extends_;
            var parentPrototype = this.clonePrototype(parentClass);

            this._setPrototypeFieldsAndMethods(classDef, classConstructor, classPrototype, parentClass, parentPrototype);
            this._setPrototypeClassSystemMembers(classDef, classConstructor, classPrototype, parentClass, parentPrototype);
            this._setClassMetaData(classDef, classConstructor, classPrototype, parentClass, parentPrototype);
            this._createStaticsAndCreateNoneStaticFieldJson(classDef, classConstructor, classPrototype);

            classPrototype.constructor = classPrototype.$class = classConstructor;
            classConstructor.prototype = classPrototype;

            return classConstructor;
        },

        _createNamedConstructor: function (className, wcConstructor) {
            return (new Function('_', 'return function ' + className.split('.').pop() + ' (){ return _.apply(this,arguments); };'))(wcConstructor);
        },

        _createAnonymousConstructor: function (className, wcConstructor) {
            return function WClassConstructor(){
                wcConstructor.apply(this, arguments);
            };
        },

        _setPrototypeFieldsAndMethods: function _setPrototypeFieldsAndMethods(classDef, classConstructor, classPrototype, parentClass, parentPrototype){
            // copy the parent prototype to create a flat model (shallow copy)
            this._copyParent(classConstructor, classPrototype, parentClass, parentPrototype);
            // implement the traits on classPrototype
            this.implementTraits(classDef._fields_ && classDef._fields_._traits_, classPrototype);

            // copy methods and fields to class prototype
            _.forEach(classDef._methods_, function(method, methodName) {
                classPrototype[methodName] = method;
            });
            _.forEach(classDef._fields_, function(fieldValue, fieldName) {
                classPrototype[fieldName] = fieldValue;
            });
        },

        _copyParent: function(classConstructor, classPrototype, parentConstructor, parentPrototype) {
            var key;
            // copy statics from the base class
            if (parentConstructor && typeof parentConstructor == "function") {
                for (key in parentConstructor) {
                    if (parentConstructor.hasOwnProperty(key)) {
                        classConstructor[key] = parentConstructor[key];
                    }
                }
            }
            for (key in parentPrototype) {
                classPrototype[key] = parentPrototype[key];
            }
        },

        _setPrototypeClassSystemMembers: function _setPrototypeClassSystemMembers(classDef, classConstructor, classPrototype, parentClass, parentPrototype){
            classPrototype.parent = this._WClassParent;
            classPrototype._super = this._WClassSuper;
            classPrototype.$className = classPrototype.className = classDef.$className;
            classPrototype.$parentPrototype = parentPrototype;
            classPrototype.$wc_getMethodParent = this._WClassGetMethodParent;
            classPrototype.$wc_realParent = this.realParent;
            classPrototype.setStaticPropertyValue = this._WClassSetStaticValue;

            if (classDef.$extendsName) {
                classConstructor.$extendsName = classDef.$extendsName;
            } else {
                delete classConstructor.$extendsName;
            }

            if (!parentClass) {
                // STUPID IE FIX - toString is not enumerable and need to be copied manually
                if (classDef._methods_ && classDef._methods_.hasOwnProperty('toString') && typeof classDef._methods_.toString == 'function') {
                    classPrototype.toString = classDef._methods_.toString;
                } else {
                    classPrototype.toString = this._$wclassToString;
                }
                classPrototype.hasClassAncestor = this._hasClassAncestor;
            }
            /**
             * this was needed for the old experiment system. its still widely used, but unneccesry,
             * because $className and $originalClassName are ALWAYS identical.
             * ToDo: remove.
             */
            classConstructor.$originalClassName = classPrototype.$className;
            classPrototype.getOriginalClassName = this._WClassGetOriginalStupidClassNamePleaseKillMe;
        },

        _setClassMetaData: function _setClassMetaData(classDef, classConstructor, classPrototype, parentClass, parentPrototype){
            // add Implements, if any. this is just for keeping an updated
            if (parentPrototype._traits_ instanceof Array) {
                if (!classPrototype._traits_) {
                    classPrototype._traits_ = parentPrototype._traits_;
                } else {
                    classPrototype._traits_.combine(parentPrototype._traits_);
                }
            }

            classPrototype._binds_ = this.aggregateBinds(classPrototype._binds_, parentPrototype._binds_, classPrototype._traits_);
        },

        _createStaticsAndCreateNoneStaticFieldJson: function _createStaticsAndCreateNoneStaticFieldJson(classDef, classConstructor, classPrototype){
            var statics = classDef._statics_;
            this.copyStatic(classConstructor, classPrototype, statics);
            // create the fieldFactory function
            this.createFieldFactoryFunction(classPrototype, classConstructor);
        },

        _WClassGetOriginalStupidClassNamePleaseKillMe: function() {
            return this.$class.$originalClassName;
        },

        _WClassConstructor: function() {
            var WCP = window.XClass.prototype;
            // validate usage of the "new" keyword
            if(this._isDebug) {
                WCP.validateScope(this);
            }
            var classPrototype = this.constructor.prototype;
            // apply  Binds
            WCP.bindMethods(classPrototype._binds_, this);

            WCP.initializeFieldsThatNeedToBeDeepCopied(this, classPrototype._$fieldsToCopy);

            // call the constructor
            if (classPrototype.initialize && typeof classPrototype.initialize == 'function') {
                classPrototype.initialize.apply(this, arguments);
            }

            // Call traits setup
            WCP.initializeTraits(classPrototype._traits_, this, arguments);
        },

        _WClassSetStaticValue: function(key, value){
            var classConstructor = this.constructor;
            var classPrototype = classConstructor.prototype;
            if(classPrototype[key] && !classConstructor[key]){
                throw new Error("you tried to add a static property with an existing field/method name " + key );
            }
            classConstructor[key] = classPrototype[key] = value;
        },

        _WClassParent: function () {
            var classPrototype = this.constructor.prototype;
            // trace the caller
            var callerMethod = classPrototype.parent.caller || arguments.callee.caller || arguments.caller;
            while(callerMethod.$wrapperFunction){
                callerMethod = callerMethod.$wrapperFunction;
            }
            if (!callerMethod) {
                throw new Error("no caller!");
            }

            if (!callerMethod.$parent) {
                // calculate and cache the result
                callerMethod.$parent = this.$wc_getMethodParent(classPrototype, callerMethod, this.$wc_realParent) || 1;
            }

            // old smelly behavior - simply return if the parent was not found
            // TODO: replace with exception
            if (callerMethod.$parent === 1) {
                return;
            }

            // finally, apply the parent method on "this"
            return callerMethod.$parent.apply(this, arguments);
        },

        _WClassGetMethodParent: function(classPrototype, callerMethod, realParentFunc) {
            var proto;
            var methodName;
            // look for the caller up the inheritance chain
            do {
                // start with the classPrototype, and move up the chain for each iteration
                proto = proto ? proto.$parentPrototype : classPrototype;
                if (!proto) {
                    return;
                }
                for (methodName in proto) {
                    if (proto[methodName] === callerMethod) {
                        // once the method name and origin was located, exit the loop
                        break;
                    }
                }
                // keep scanning until a match is found
            } while (proto[methodName] !== callerMethod);

            if (!proto || !proto[methodName] || !proto.$parentPrototype) {
                return;
            }
            // go up the inheritance chain, to find the first implementation of the method
            var _realParent = realParentFunc(proto);
            while (proto[methodName] === _realParent[methodName]) {
                proto = _realParent;
                _realParent = realParentFunc(proto);
            }
            // then grab the parent prototype, and make sure the method exists in it
            proto = realParentFunc(proto);
            if (!proto || !proto[methodName] || typeof proto[methodName] != 'function') {
                return;
            }

            return proto[methodName];
        },

        _WClassSuper: function(methodName) {
            var classPrototype = this.constructor.prototype;

            function findProtoWithMethodNameInChain(originalClassForErrorMessage, methodName, proto) {
                if (proto == null) {
                    throw new Error('no method "' + methodName + '" in the prototype chain above "' + originalClassForErrorMessage + '"');
                }

                var result = proto[methodName];
                if (result === undefined) {
                    return findProtoWithMethodInChain(originalClassForErrorMessage, methodName, proto.$parentPrototype);
                }

                if (typeof result !== 'function') {
                    throw new Error('member "' + methodName + '" in prototype "' + proto + '" is not a function');
                }

                return proto;
            }

            this.__super_scope = this.__super_scope || {};
            this.__super_scope[methodName] = this.__super_scope[methodName] || classPrototype;
            var proto = findProtoWithMethodNameInChain(classPrototype.$className, methodName, this.__super_scope[methodName].$parentPrototype);
            this.__super_scope[methodName] = proto;
            var args = Array.prototype.slice.call(arguments, 1);
            var method = proto[methodName];
            var result = method.apply(this, args);
            delete this.__super_scope[methodName];
            return result;
        },

        /**
         * Returns a prototype parent class according to the extendsName property
         * @param {Object}proto
         * @return parent class object
         */
        realParent:function (proto) {
            var _parent = proto.$parentPrototype;

            while (_parent && _parent.$className && proto.$class.$extendsName && (proto.$class.$extendsName != _parent.$className)) {
                _parent = _parent.$parentPrototype;
            }

            return _parent;
        },

        /**
         * validates use of the "new" keyword by checking "this"
         * @param scope
         */
        validateScope:function (scope) {
            if (scope === window || !scope) {
                LOG.reportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope')();
            }
            for (var key in scope) {
                if (scope.hasOwnProperty(key)) {
                    LOG.reportError(wixErrors.WCLASS_CLASS_MUST_USE_NEW_OP, 'XClass', 'validateScope')();
                }
            }
        },

        /**
         * shallow copies a function's prototype
         * ignores non functions
         * @param {Function} func
         * @returns {Object} a shallow copy of func's prototype, empty Object for non-functions or undefined prototypes
         */
        clonePrototype:function (func) {
            var cloneProto = {};
            if (typeof func != "function") {
                return cloneProto;
            }

            var proto = func.prototype || {};

            if (proto === Function.prototype || proto === Function) {
                return cloneProto;
            }

            for (var key in proto) {
                // stupid IE toString issue work around
                if (proto.hasOwnProperty(key) || key == 'toString') {
                    cloneProto[key] = proto[key];
                }
            }
            return cloneProto;
        },

        /**
         * validates a classDef object (throws an error for any invalid data)
         * @param classDef
         */
        validateClassData:function (classDef) {
            var key;
            if (typeof classDef != "object") {
                return LOG.reportError(wixErrors.WCLASS_CLASS_DATA_INVALID, 'XClass', 'validateClassData', key)();
            }
            // validates a valid className
            if (typeof classDef.className != "string" || classDef.className.length === 0) {
                return LOG.reportError(wixErrors.WCLASS_CLASS_EMPTY_STRING, 'XClass', 'validateClassData')();
            }
            // validates reserved XClass words
            for (key in classDef) {
                if (this.reservedWords.indexOf(key) !== -1) {
                    return LOG.reportError(wixErrors.WCLASS_CLASS_RESERVED, 'XClass', 'validateClassData', key)();
                }
            }
            if (classDef._traits_ && !(classDef._traits_ instanceof Array)) {
                return LOG.reportError(wixErrors.WCLASS_CLASS_DATA_INVALID, 'XClass', 'validateClassData', "Implements is not an array")();
            }
            if (classDef._binds_ && !(classDef._binds_ instanceof Array)) {
                return LOG.reportError(wixErrors.WCLASS_CLASS_DATA_INVALID, 'XClass', 'validateClassData', "Binds is not an array")();
            }
            return true;
        },

        reservedWordsForTraits:['initialize', 'parent', '_extends_', '_traits_', '_binds_', '$parentPrototype', '$className'],
        reservedWords:['parent', '$parentPrototype', '$className'],
        excludeFromClone:['define', '_traits_', '_binds_', 'Resources', 'imports', 'resource', 'resources', '__super_scope', 'jsonOfFieldsThatNeedToBeDeepCopied'],

        /**
         * binds an array of methods (by names) to a scope
         * @param {Array<String>} methods method names to be bound to scope
         * @param scope
         */
        bindMethods:function (methods, scope) {
            var i, l, method;
            if (methods instanceof Array) {
                for (i = 0, l = methods.length; i < l; i++) {
                    method = methods[i];
                    if (typeof scope[method] == 'function') {
                        scope[method] = scope[method].bind(scope);
                    } else {
                        LOG.reportError(wixErrors.WCLASS_INVALID_BIND, 'XClass', 'bindMethods', method);
                    }
                }
            }
        },

        /**
         * implements a traits array
         * @param traits {Array} list of trait objects to implement (Objects/Functions)
         * @param scope {Object} a scope to add the methods to
         */
        implementTraits:function (traits, scope) {
            var i, l, trait, key;
            scope._traits_ = [];
            if (traits instanceof Array) {
                // for each item in the Implements array
                for (i = 0, l = traits.length; i < l; i++) {
                    trait = traits[i];
                    // add the trait to the Implements prop
                    scope._traits_.push(trait);
                    // for functions, use the prototype
                    if (typeof trait == "function") {
                        trait = trait.prototype;
                    }
                    // for objects, copy the methods
                    for (key in trait) {
                        // note that "this" is actually 'XClass' scope
                        if (key && this.reservedWordsForTraits.indexOf(key) === -1) {
                            scope[key] = trait[key];
                        }
                    }
                }
            }
        },
        /** Function initializeTraits
         * runs the setup for each trait in the array
         * @param traits {Array} list of trait objects (Objects/Functions)
         * @param scope {Object} a scope to run the setup on
         * @param args {Array} list of arguments to pass to setup
         */
        initializeTraits:function (traits, scope, args) {
            var i, l, trait;
            if (traits instanceof Array) {
                // for each item in the Implements array
                for (i = 0, l = traits.length; i < l; i++) {
                    trait = traits[i];
                    // for functions, use the prototype
                    if (typeof trait == "function") {
                        trait = trait.prototype;
                    }
                    var initialize = trait['initialize'];
                    if (initialize && typeof initialize == "function") {
                        initialize.apply(scope, args);
                    }
                }
            }
        },

        /**
         * Creates a function that returns a copy of the non-static, non-function members (i.e., fields).
         * Only objects are considered, since strings and numbers do not need to be deep copied.
         */
        createFieldFactoryFunction: function(prototype, classConstructor) {
            var statics = classConstructor;
            var key, value;
            var fields = {};
            var hasFields = false;

            for(key in prototype) {
                value = prototype[key];
                if (this._doesFieldNeedToBeDeepCopied(key, value, statics)) {
                    fields[key] = value;
                    hasFields = true;
                }
            }

            if(!hasFields){
                return;
            }

            var json = JSON.stringify(fields);
            prototype._$fieldsToCopy = json;
        },

        /**
         *
         * @param key
         * @param value
         * @param {function} classConstructor - so that we can filter out the statics, they are all on the constructor
         * @returns {*|boolean}
         * @private
         */
        _doesFieldNeedToBeDeepCopied: function(key, value, classConstructor){
            return value &&
                typeof value == "object" &&
                key.charAt(0) !== '$' &&
                this.excludeFromClone.indexOf(key) === -1 &&
                !classConstructor.hasOwnProperty(key);
        },

        initializeFieldsThatNeedToBeDeepCopied: function(target, fieldsString) {
            if (!fieldsString) {
                return;
            }

            var fields = JSON.parse(fieldsString);

            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    target[key] = fields[key];
                }
            }
        },

        getStaticsAsObject: function(statics) {
            if (!statics) {
                return {};
            }

            if (statics instanceof Function) {
                statics = statics();
            }

            return statics;
        },

        /**
         * copies properties and methods from statics and baseClass onto the prototype and actual class constructor instance
         * @param classConstructor {function} the new class constructor
         * @param classPrototype {object}
         * @param statics {object}
         */
        copyStatic:function (classConstructor, classPrototype, statics) {
            var key;
            // copy directly declared statics
            if (statics) {
                var isStaticFunc = (statics instanceof Function);
                statics = isStaticFunc ? statics() : statics;
                for (key in statics) {
                    //should not allow a static to override field but should allow a static to override static
                    if(classPrototype[key] && !classConstructor[key] && !isStaticFunc){
                        throw new Error("The property " + key + " conflicts with a static property");
                    }
                    classConstructor[key] = classPrototype[key] = statics[key];
                }
            }
        },

        /**
         *
         * @param selfBinds {Array}
         * @param parentBinds {Array}
         * @param implementedTraits {Array}
         * @return an array that includes all the binds from selfBinds, parentBinds and all the implemented traits "Binds" array
         */
        aggregateBinds:function (selfBinds, parentBinds, implementedTraits) {
            var binds = [];
            if (selfBinds instanceof Array) {
                binds.combine(selfBinds);
            }
            if (parentBinds instanceof Array) {
                binds.combine(parentBinds);
            }
            implementedTraits && implementedTraits.forEach(function (item) {
                if (item._binds_ instanceof Array) {
                    binds.combine(item._binds_);
                } else {
                    if (item.prototype && item.prototype._binds_ instanceof Array) {
                        binds.combine(item.prototype._binds_);
                    }
                }
            });

            return binds;
        },

        /**
         * returns true if the inheritence chain contains the provided ancestor class name
         * @param ancestorName
         * @param usePartialName if true, settle for a string match (e.g. BaseComponent will match "mobile.core.components.base.BaseComponent"
         */
        _hasClassAncestor:function (ancestorName, usePartialName) {
            var scope = this;
            do {
                var cname = scope.className;
                var match;
                if (usePartialName) {
                    var regex = new RegExp("\\.?" + ancestorName + "(\\.|$)");
                    match = cname && cname.match(regex);
                }
                else {
                    match = (cname == ancestorName);
                }
                if (match) {
                    return true;
                }
                scope = scope._extends_ && scope._extends_.prototype;
            }
            while (scope);

            return false;
        },

        _$wclassToString:function () {
            return "[wclass " + (this.$className || "") + "]";
        },

        InvalidWClass:function () {
            throw new Error('invalid XClass');
        },

        isReady:function () {
            return true;
        }
    });

    /**
     * this is not nice and I dont believe it does what its ment to,
     * but the system need it to function correctly...
     */
    var $originalInstanceOf = window.instanceOf;
    var wInstanceOf;
    // stupid IE 8 workaround: window.instanceOf !== instanceOf, hence window.instanceOf is used to allow spies
    var w = window;
    w.instanceOf = wInstanceOf = function(item, type) {
        if (type === XClass && item && typeof item == 'function' && item.prototype && item.prototype.$className) {
            return true;
        }
        // for WClasses, check teh $className identifier
        if (item && item.$className && typeof type == "function" && type.prototype && type.prototype.$className) {
            return item.getOriginalClassName() == type.prototype.getOriginalClassName() || instanceOf(item.$parentPrototype, type);
        } else {
            // for falsy items and non XClass instances, return the mootools instanceOf result
            // swap instanceOf to the original on for internal mootools recursion
            w.instanceOf = $originalInstanceOf;
            var res = instanceOf(item, type);
            // swap instanceOf back to the XClass version
            w.instanceOf = wInstanceOf;
            return res;
        }
    };

    return XClass;
});
