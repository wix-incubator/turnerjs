define(['lodash',
        'documentServices/component/component',
        'documentServices/component/componentValidations',
        'documentServices/componentsMetaData/componentsMetaData',
        'documentServices/layouters/boxSlideShowLayouter'
    ],
    function (_, component, componentValidations, componentsMetaData, boxSlideShowLayouter) {
        'use strict';

        var LAYOUTER_TYPES = {
            'wysiwyg.viewer.components.BoxSlideShow': boxSlideShowLayouter,
            'wysiwyg.viewer.components.StripContainerSlideShow': boxSlideShowLayouter
        };

        function isLayouterComponent(ps, compPointer){
            return LAYOUTER_TYPES[componentsMetaData.getComponentType(ps, compPointer)];
        }

        function callLayouterParentFunction(ps, componentPointer, funcName) {
            if (!ps || !ps.dal.isExist(componentPointer) || !isLayouterComponent(ps, componentPointer)){
                throw new Error("invalid args");
            }

            var compType = componentsMetaData.getComponentType(ps, componentPointer);
            return LAYOUTER_TYPES[compType][funcName].call(this, ps, componentPointer, compType);
        }

        function callLayouterChildFunction(ps, componentPointer, parentType, funcName) {
            if (!ps || !ps.dal.isExist(componentPointer) || !LAYOUTER_TYPES[parentType]){
                throw new Error("invalid args");
            }

            return LAYOUTER_TYPES[parentType][funcName].call(this, ps, componentPointer, parentType);
        }

        function findParentLayouter(ps, componentPointer){
            if (ps.pointers.components.isPage(componentPointer)){
                return null;
            }
            var currParent = component.getContainer(ps, componentPointer);

            while (currParent){
                var parentCompType = componentsMetaData.getComponentType(ps, currParent);
                if (_.includes(_.keys(LAYOUTER_TYPES), parentCompType)) {
                    return parentCompType;
                }
                currParent = component.getContainer(ps, currParent);
            }
            return null;
        }

        /**
         * @param ps
         * @param componentPointer
         * @returns {componentPointer[]}
         */
        function getMasterChildren(ps, componentPointer) {
            return callLayouterParentFunction(ps, componentPointer, 'getMasterChildren');
        }

        /**
         * @param ps
         * @param componentPointer
         * @returns {componentPointer[]}
         */
        function getNonMasterChildren(ps, componentPointer) {
            return callLayouterParentFunction(ps, componentPointer, 'getNonMasterChildren');
        }

        /**
         * @param ps
         * @param componentPointer
         * @returns {Boolean}
         */
        function isMasterChild(ps, componentPointer, parentType) {
            return callLayouterChildFunction(ps, componentPointer, parentType, 'isMasterChild');
        }

        /**
         * @param ps
         * @param componentPointer
         */
        function toggleMasterChild(ps, componentPointer, parentType) {
            if (!canBeMasterChild(ps, componentPointer, parentType)){
                throw new Error("component can't be shown on all states");
            }
            return callLayouterChildFunction(ps, componentPointer, parentType, 'toggleMasterChild');
        }

        /**
         * @param ps
         * @param componentPointer
         */
        function canBeMasterChild(ps, componentPointer, parentType) {
            return callLayouterChildFunction(ps, componentPointer, parentType, 'canBeMasterChild');
        }

        function getParentCompWithOverflowHidden(ps, componentPointer) {
            var parentLayouterComponentType = findParentLayouter(ps, componentPointer);
            return parentLayouterComponentType ? callLayouterChildFunction(ps, componentPointer, parentLayouterComponentType, 'getParentCompWithOverflowHidden') : false;

        }

        /** @class documentServices.layouters */
        return {
            /**
             * Returns all children that behave as master components (i.e shown on all father component's changing states)
             * @param {jsonDataPointer} componentReference the reference to the component to get its master children.
             * @returns an array of components references
             *
             *      @example
             *      var masterChildren = documentServices.layouters.getMasterChildren(compReference);
             */
            getMasterChildren: getMasterChildren,
            /**
             * Returns all children that don't behave as master components (i.e shown on a specific father's state, and not on all states)
             * @param {jsonDataPointer} componentReference the reference to the component to get its non master children.
             * @returns an array of components references
             *
             *      @example
             *      var nonMasterChildren = documentServices.layouters.getNonMasterChildren(compReference);
             */
            getNonMasterChildren: getNonMasterChildren,
            /**
             * Returns whether or not the component behave as a master component relative to its ancestor parent with the corresponding type
             * @param {jsonDataPointer} componentReference the reference to the component to check if it's a master component
             * @param {String} parentType layouter component type
             * @returns true or false
             *
             *      @example
             *      var isMasterChild = documentServices.layouters.isMasterChild(compReference, 'wysiwyg.viewer.components.BoxSlideShow');
             */
            isMasterChild: isMasterChild,
            /**
             * Toggle the component to behave as a master component relative to its ancestor parent, or not, depending on the current state
             * @param {jsonDataPointer} componentReference the reference to the component to toggle as a master component
             * @param {String} parentType layouter component type - the ancestor's parent type
             *
             *      @example
             *      documentServices.layouters.toggleMasterChild(compReference, 'wysiwyg.viewer.components.BoxSlideShow');
             */
            toggleMasterChild: toggleMasterChild,
            /**
             * Returns whether or not the component can behave as a master component relative to its ancestor parent with the corresponding type
             * @param {jsonDataPointer} componentReference the reference to the component to check if it can be a master component
             * @param {String} parentType layouter component type
             * @returns true or false
             *
             *      @example
             *      var canBeMasterChild = documentServices.layouters.canBeMasterChild(compReference, 'wysiwyg.viewer.components.BoxSlideShow');
             */
            canBeMasterChild: canBeMasterChild,
            /**
             * Returns the parent container of the component that has an overflow flag
             * @param {jsonDataPointer} componentReference the reference to the component to check if it is hidden by an overflow flag
             * @returns true or false
             *
             *      @example
             *      var getParentCompWithOverflowHidden = documentServices.layouters.getParentCompWithOverflowHidden(compReference);
             */
            getParentCompWithOverflowHidden: getParentCompWithOverflowHidden
        };
    });
