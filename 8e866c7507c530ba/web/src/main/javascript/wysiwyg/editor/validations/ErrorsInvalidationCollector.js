define.Class('wysiwyg.editor.validations.ErrorsInvalidationCollector', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    function getAggregatedErrorDescriptionFromParams(count, aggregatedParams){
        var params = _.compact(aggregatedParams);
        var description = 'count: ' + count;
        if(params.length){
            description += " , additional data: ";
            var paramsDescription = _.map(params, function(errorData){
                return _.reduce(errorData, function(desc, val, key){
                    return desc + key + ': ' + val + ' ';
                }, '');
            });
            description += paramsDescription.join(', ');
        }
        return description;
    }

    def.methods(/** @lends wysiwyg.editor.validations.ErrorsInvalidationCollector*/{
        /**
         * @constructs
         */
        initialize: function() {
            this._invalidations = {};
        },

        /**
         *
         * @param {String} type - the type, i.e. 'missingContainers' or the path to type, such as 'dataReference.mismatch' or 'dataReference.missing'
         * @param {Object} data
         */
        invalidate: function (type, data) {
            this._invalidate(type, data);
        },
        /**
         * for javascript basic data types, this will not mark duplicates
         * @param type
         * @param data
         */
        invalidateUnique: function(type, data){
            this._invalidate(type, data, true);
        },
        /**
         * this should only be used to temporarily hold data as valid when dealing with a specific error
         * @param data
         */
        markValid: function(data){
            var validDataArr = this._getInvalidationByType('valid');
            validDataArr.push(data);
        },
        /**
         *
         * @param newArray
         */
        overrideMarkedValid: function(newArray){
            this.clearInvalidationType('valid');
            this._invalidations.valid = newArray;
        },
        /**
         *
         * @returns {Array} a COPY of the array of valid components.
         */
        getMarkedValid: function(){
            return this.getInvalidationByType('valid');
        },
        /**
         *
         * @param {String} type - the type, i.e. 'missingContainers' or the path to type, such as 'dataReference.mismatch' or 'dataReference.missing'
         */
        clearInvalidationType: function(type) {
            var isDeepPath = _.contains(type,'.');
            if(isDeepPath){
                this._clearMostInnerInvalidation(type);
            } else{
                delete this._invalidations[type];
            }
        },
        /**
         *
         * @param {String} type
         * @returns {Array} a COPY of the array of invalidations
         */
        getInvalidationByType: function(type) {
            var invalidations = this._getInvalidationByType(type);
            return _.clone(invalidations); //we dont want a deep clone, since we do not want to clone actual components!
        },
        /**
         * resets our invalidations, either to an empty object or to a given schema
         * @param schemaToInitializeTo
         */
        resetInvalidations: function(schemaToInitializeTo){
            if(schemaToInitializeTo){
                this._invalidations = schemaToInitializeTo;
            } else{
                this._invalidations = {};
            }
        },


        /**
         * aggregates the errors that it encounters (and of which type) so that they can be sent later at once.
         * @param wixErrorName
         * @param {object} [params]
         */
        saveErrorToAggregation: function(wixErrorName, params){
            this._cachedErrors = this._cachedErrors || {};

            if(!this._cachedErrors[wixErrorName]){
                this._cachedErrors[wixErrorName] = {count: 1, params: [params]};
            } else{
                this._cachedErrors[wixErrorName].count ++;
                this._cachedErrors[wixErrorName].params.push(params);
            }
        },

        /**
         * Sends all the aggregated errors (if they exist).
         * @param {String} [mode] - the fix mode.
         * @param {boolean} [dontClearAfterSending]
         */
        sendAllAggregatedErrors: function(mode, dontClearAfterSending){
            mode = mode || '';
            if(this._cachedErrors){
                _.forOwn(this._cachedErrors, function(errorParams, errorName){
                    var description = getAggregatedErrorDescriptionFromParams(errorParams.count, errorParams.params);
                    LOG.reportError(wixErrors[errorName], 'ServerFacadeErrorHandler', '_sendAllAggregatedErrors: ' + mode, description);
                }, this);

                if(!dontClearAfterSending){ //so that this can be used for debug purposes
                    this._cachedErrors = {};
                }
            } else if(mode === "DATA_REFERENCE_MISMATCHES"){ //there are no aggregated errors, so this means the merge fixed the problem!
                LOG.reportError(wixErrors.MERGE_FIXED_ERROR_10104, 'ServerFacadeErrorHandler', '_sendAllAggregatedErrors: ' + mode, '');
            }
        },
        

        /**
         *
         * @param {String} type - the type, i.e. 'missingContainers' or the path to type, such as 'dataReference.mismatch' or 'dataReference.missing'
         * @param {Object} data
         * @param {boolean} [onlyMarkUnique] - can ensure that only one instance is in the array. For non-primitive data types, if the collection is large, this can be expensive to check
         * @private
         */
        _invalidate: function (type, data, onlyMarkUnique) {
            var invalidationArray = this._getInvalidationByType(type);
            var primitiveTypes = ["string", "number", "boolean"];
            if(onlyMarkUnique){
                var isPrimitiveType = _.contains(primitiveTypes, typeof data),
                    isAlreadyPresent;
                if(isPrimitiveType){
                    isAlreadyPresent =_.contains(invalidationArray, data);
                } else{
                    isAlreadyPresent = _.some(invalidationArray, function(val){
                        return _.isEqual(val, data);
                    });
                }
                if(isAlreadyPresent){
                    return;
                }
            }
            invalidationArray.push(data);
        },
        /**
         *
         * @param type
         * @returns {Array} array of invalidations
         * @private
         */
        _getInvalidationByType: function(type) {
            var isDeepPath = _.contains(type,'.');
            if(isDeepPath){
                return this._getInnerInvalidation(type);
            }
            this._invalidations[type] = this._invalidations[type] || [];
            return this._invalidations[type];
        },
        /**
         *
         * @param {String} invalidationPath - the path to the invalidation type, such as 'dataReference.mismatch' or 'dataReference.missing'
         * @returns {Array} returns the array of invalidations.
         *          If it does not exist, it creates and returns an empty array, so that it can immediately be used to invalidate.
         * @private
         */
        _getInnerInvalidation: function(invalidationPath){
            var invalidationSupertype = this._getInvalidationSupertype(invalidationPath);
            var subtype = this._getInvalidationSubtypeName(invalidationPath);
            invalidationSupertype[subtype] = invalidationSupertype[subtype] || [];
            return invalidationSupertype[subtype];
        },
        /**
         *
         * @param {String} invalidationPath - the path to the invalidation type, such as 'dataReference.mismatch' or 'dataReference.missing'
         * @private
         */
        _clearMostInnerInvalidation: function(invalidationPath){
            var invalidationSupertype = this._getInvalidationSupertype(invalidationPath);
            var subtype = this._getInvalidationSubtypeName(invalidationPath);
            delete invalidationSupertype[subtype];
        },
        /**
         *
         * @param {String} invalidationPath - the path to the invalidation type, such as 'dataReference.mismatch' or 'dataReference.missing'
         * @returns {Object} the last 'parent' of the specific invalidation path
         * @private
         */
        _getInvalidationSupertype: function(invalidationPath){
            var lastParamIndex = invalidationPath.lastIndexOf('.'),
                parentObjectPath = invalidationPath.substring(0, lastParamIndex);
            return _.inner(this._invalidations, parentObjectPath);
        },
        /**
         *
         * @param {String} invalidationPath - the path to the invalidation type, such as 'dataReference.mismatch' or 'dataReference.missing'
         * @returns {String}
         * @private
         */
        _getInvalidationSubtypeName: function(invalidationPath){
            return _.last(invalidationPath.split('.'));
        }

    });
});
