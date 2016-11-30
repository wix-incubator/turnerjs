/**
 * Created by alexandergonchar on 10/27/14.
 */
define(['lodash',
        'zepto',
        'utils',
        'documentServices/documentMode/documentMode',
        'documentServices/documentMode/documentModeInfo',
        'documentServices/page/pageData',
        'documentServices/page/popupUtils',
        'documentServices/structure/structure',
        'documentServices/component/componentStructureInfo',
        'documentServices/component/component',
        'documentServices/structure/utils/windowScroll'],
    function (_, $, utils, documentMode, documentModeInfo, pageData, popupUtils, structure, componentStructureInfo, component, windowScroll) {
        'use strict';

        function isClickOnHorizontalComponent(pos, rect) {
            return pos.x > rect.left && pos.x < rect.right &&
                pos.y > rect.top && pos.y < rect.bottom;
        }

        function degreesToRadians(angleInDegrees) {
            return angleInDegrees * Math.PI / 180;
        }

        // TODO: refactor this (copied from html-client)
        function isClickOnRotatedComponent(pos, rect, rotationInDegrees) {
            var compWidth = rect.right - rect.left + 1,
                compHeight = rect.bottom - rect.top + 1,
                compCenter = {
                    x: rect.left + compWidth / 2,
                    y: rect.top + compHeight / 2
                };

            var clickCalculationTriangle = {
                A: pos,
                B: compCenter
            };

            var dy = pos.y - compCenter.y;
            var dx = pos.x - compCenter.x;
            clickCalculationTriangle.hypotenuse = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
            if (dx === 0) {
                clickCalculationTriangle.ABHorizontalXangle = (dy > 0) ? Math.PI / 2 : -Math.PI / 2;
            } else {
                clickCalculationTriangle.ABHorizontalXangle = Math.atan(dy / dx);
            }
            var compRotationAngel = degreesToRadians(rotationInDegrees);
            clickCalculationTriangle.ABComponentXangle = clickCalculationTriangle.ABHorizontalXangle - compRotationAngel;
            var clickComponentDx = Math.abs(clickCalculationTriangle.hypotenuse * Math.cos(clickCalculationTriangle.ABComponentXangle));
            var clickComponentDy = Math.abs(clickCalculationTriangle.hypotenuse * Math.sin(clickCalculationTriangle.ABComponentXangle));

            if (clickComponentDx < compWidth / 2 && clickComponentDy < compHeight / 2) {
                return true;
            }
            return false;
        }

        function getComponentLayout(ps, compPointer, layoutGetter) {
            return layoutGetter(ps, compPointer);
        }

        function compAtPosition(ps, x, y, margin, scrollTop, layoutGetter, compPointer) {
            var cursorPosition = {
                x: x,
                y: structure.isShowOnFixedPosition(ps, compPointer) ? y - scrollTop : y,
                margin: margin
            };

            var layout = getComponentLayout(ps, compPointer, layoutGetter); // structure.getCompLayoutRelativeToScreen(ps, compPointer);
            var rotationInDegrees = layout.rotationInDegrees;
            var isRotated = rotationInDegrees > 0;

            if (!isRotated) {
                layout = layout.bounding;
            }

            var extendBy = isNaN(margin) ? 0 : margin;
            var boundingRect = composeBoundingRectObj(layout.width, layout.height, layout.x, layout.y, extendBy);

            return isRotated ?
                isClickOnRotatedComponent(cursorPosition, boundingRect, rotationInDegrees) :
                isClickOnHorizontalComponent(cursorPosition, boundingRect);
        }

        function composeBoundingRectObj(width, height, left, top, extendBy) {
            return {
                left: left - extendBy,
                top: top - extendBy,
                right: left + width + extendBy,
                bottom: top + height + extendBy
            };
        }


        function getSiteScroll(ps) {
            return windowScroll.getScroll(ps);
        }

        /**
         *
         * @param privateServices
         * @param {jsonDataPointer[]} rootComps in the correct dom order (top to bottom)
         * @param {function(jsonDataPointer): boolean}predicate
         * @returns {jsonDataPointer[]}
         */
        function getComponentsByZOrder(privateServices, rootComps, predicate) {
            var measureMap = privateServices.siteAPI.getSiteMeasureMap();
            var orderedRootComps = rootComps.reverse();
            var allComponentObjects = _(orderedRootComps)
                .map(function (rootComp) {
                    return privateServices.pointers.components.getChildrenRecursivelyRightLeftRootIncludingRoot(rootComp);
                })
                .flattenDeep()
                .filter(predicate)
                .sortBy(function(compPointer){
                    var zIndex = _.get(measureMap, ["zIndex", compPointer.id], 0);
                    var isFixed = structure.isFixedPosition(privateServices, compPointer) || structure.isAncestorFixedPosition(privateServices, compPointer);
                    return isFixed ? -1 : (1000 - zIndex);
                })
                .value();

            return allComponentObjects;
        }

        /**
         * @param privateServices
         * @param {jsonDataPointer[]} rootComps
         * @param {function} [predicate]
         * @returns {jsonDataPointer[]} compPointers
         */
        function getComponentsRecursive(privateServices, rootComps) {
            var allComponentObjects = _(rootComps)
                .map(function (rootComp) {
                    return privateServices.pointers.components.getChildrenRecursively(rootComp);
                })
                .flattenDeep()
                .value();

            return allComponentObjects;
        }

        function getRootComponents(privateServices, pageId, viewMode) {
            viewMode = viewMode || documentMode.getViewMode(privateServices);
            var pagesContainer;

            var masterPage = privateServices.pointers.components.getMasterPage(viewMode);
            var rootComponents = privateServices.pointers.components.getChildren(masterPage);

            if (pageId === masterPage.id) {
                return rootComponents;
            }

            var pageIds = pageId ? [pageId] : pageData.getPagesList(privateServices, false, true);

            var pages = _.map(pageIds, function (id) {
                return privateServices.pointers.components.getPage(id, viewMode);
            });

            if (pageId && privateServices.siteAPI.isPageLandingPage(pageId)) {
                pagesContainer = privateServices.pointers.components.getPagesContainer(viewMode);
                return [pagesContainer].concat(pages);
            }

            if (pageId && popupUtils.isPopup(privateServices, pageId)) {
                return pages;
            }

            var indexToInsertPage = _.findIndex(rootComponents, {id: "PAGES_CONTAINER"}) + 1;
            rootComponents.splice.apply(rootComponents, [indexToInsertPage, 0].concat(pages));

            return rootComponents;
        }

        /**
         * @name Predicate
         * @function
         * @param {AbstractComponent} compRef the reference to a component upon which the predicate will be tested
         */

        /**
         * @function
         * @param privateServices
         * @param {string} pageId - the pageId of the page for which to get all the components
         * @param {Predicate} [predicate] a predicate function used to filter components
         * @returns {Array.<AbstractComponent>} all the components in site that fit the prediacte, ordered by the dom - auto - z index, in other words, if you were to click, then comps[0] is the first candidate to have been clicked
         */
        function getAllComponents(privateServices, pageId, predicate) {
            var rootComponents = getRootComponents(privateServices, pageId);
            return getComponentsByZOrder(privateServices, rootComponents, predicate);
        }

        /**
         * Retrieve all components under some ancestor
         * @param privateServices
         * @param {AbstractComponent} ancestor - comp pointer to ancestor in which to search
         * @returns {Array.<AbstractComponent>} pointers to components under ancestor or an empty array
         */
        function getComponentsUnderAncestor(privateServices, ancestor) {
            return privateServices.pointers.components.getChildrenRecursively(ancestor);
        }

        /**
         * Finds all components in a specific point
         * @param {integer} x is mouse x coord relative to a site structure
         * @param {integer} y is mouse y coord relative to a site structure
         * @param {integer} margin - components will be extended in size by this value
         * @param {String} (pageId) - the page to search the components in. The default value will be the current page.
         * @returns {jsonDataPointer[]} component paths from top to bottom (i.e. the top most component will be in index 0)
         */
        function getComponentsAtXYRelativeToStructure(privateServices, x, y, margin, pageId) {
            return getComponentsAtXY(privateServices, x, y, margin, pageId, structure.getCompLayoutRelativeToStructure, false);
        }

        /**
         * Finds all components in a specific point
         * @param {integer} x is mouse x coord relative to a screen
         * @param {integer} y is mouse y coord relative to a screen
         * @param {integer} margin - components will be extended in size by this value
         * @param {String} (pageId) - the page to search the components in. The default value will be the current page.
         * @returns {jsonDataPointer[]} component paths from top to bottom (i.e. the top most component will be in index 0)
         */
        function getComponentsAtXYRelativeToScreen(privateServices, x, y, margin, pageId) {
            return getComponentsAtXY(privateServices, x, y, margin, pageId, structure.getCompLayoutRelativeToScreen, true);
        }

        function getComponentsAtXY(privateServices, x, y, margin, pageId, layoutGetter, shouldAddSiteScroll) {
            var xCoord = x;
            var yCoord = y;
            var siteScroll = getSiteScroll(privateServices);
            if (shouldAddSiteScroll){
                var siteScaleFlagPointer = privateServices.pointers.general.getRenderFlag('siteScale');
                var siteScale = privateServices.dal.get(siteScaleFlagPointer);

                xCoord += siteScroll.x;
                yCoord += (siteScroll.y / siteScale);
            }

            var doesCompMatchPosition = _.partial(compAtPosition, privateServices, xCoord, yCoord, margin, siteScroll.y, layoutGetter);

            pageId = pageId || privateServices.siteAPI.getFocusedRootId();

            var rootComponents = getRootComponents(privateServices, pageId);

            var comps = getComponentsByZOrder(privateServices, rootComponents, doesCompMatchPosition);
            var currPageId = privateServices.siteAPI.getCurrentUrlPageId();
            if (pageId === currPageId) {
                comps = _.reject(comps, function (comp) {
                    return !componentStructureInfo.isRenderedOnSite(privateServices, comp);
                });
            }
            return comps;
        }

        /**
         * Gets all the components of the given type/s in the entire site or descendants of the rootComp.
         * @param {String|<Array{String}>} compType a single component type or an array of multiple component types
         * @param {AbstractComponent} [rootComp] rootComp The root parent component ref that will be used for the search
         * @returns {AbstractComponent[]} an array of component refs of the passed component type/s
         */

        function getComponentByType(privateServices, compType, rootComp) {
            var compTypes = _.isArray(compType) ? compType : [compType];
            var rootComponents = rootComp ? [rootComp] : getRootComponents(privateServices);
            var comps = getComponentsRecursive(privateServices, rootComponents);
            comps = comps.concat(rootComponents);
            return _.filter(comps, function (compPointer) {
                var compTypeToTest = privateServices.dal.get(privateServices.pointers.getInnerPointer(compPointer, 'componentType'));
                return _.includes(compTypes, compTypeToTest);
            });
        }

        /**
         * Gets component by given id ,pageId (if pageId isn't passed takes the current pageId) and view mode (if view mode not passed takes the current view mode).
         * @param {String} id component full id
         * @param {String} [pageId] id of the page that the component is in
         * @param {String} [viewMode] mobile/desktop
         * @returns {AbstractComponent} a ref to the component with the passed id
         */
        function getComponentById(privateServices, id, pageId, viewMode) {
            pageId = pageId || privateServices.siteAPI.getCurrentUrlPageId();
            viewMode = viewMode || documentModeInfo.getViewMode(privateServices);
            var page = privateServices.pointers.full.components.getPage(pageId, viewMode);
            return page && privateServices.pointers.full.components.getComponent(id, page);
        }

        /**
         * Gets site header if view mode not passed takes the current view mode.
         * @param {String} id component full id
         * @param {String} [pageId] id of the page that the component is in
         * @param {String} [viewMode] mobile/desktop
         * @returns {AbstractComponent} a ref to the component with the passed id
         */
        function getSiteHeader(privateServices, viewMode) {
            return getComponentById(privateServices, 'SITE_HEADER', 'masterPage', viewMode);
        }

        function isDescendantOfComp(privateServices, comp, possibleAncestor){
            return possibleAncestor && privateServices.pointers.full.components.isDescendant(comp, possibleAncestor);
        }

        return {
            /**
             * @function
             * @memberof documentServices.componentDetectorAPI
             *
             * TODO 12/31/14 3:59 PM - JSDocs not yet implemented
             */
            getComponentsAtXYRelativeToStructure: getComponentsAtXYRelativeToStructure,
            /**
             * @function
             * @memberof documentServices.componentDetectorAPI
             *
             * TODO 12/31/14 3:59 PM - JSDocs not yet implemented
             */
            getComponentsAtXYRelativeToScreen: getComponentsAtXYRelativeToScreen,
            /**
             * @function
             * @memberof documentServices.componentDetectorAPI
             *
             * TODO 12/31/14 3:59 PM - JSDocs not yet implemented
             */
            getComponentByType: getComponentByType,
            /**
             * @function
             * @param privateServices
             * @param {string} pageId - the pageId of the page for which to get all the components
             * @returns {Array.<AbstractComponent>} all the components in the masterPage and the given pageId, ordered by the dom - auto - z index, in other words, if you were to click, then comps[0] is the first candidate to have been clicked
             */
            getAllComponents: getAllComponents,

            getComponentsUnderAncestor: getComponentsUnderAncestor,

            getComponentById: getComponentById,

            getSiteHeader: getSiteHeader,

            isDescendantOfComp: isDescendantOfComp
        };
    });
