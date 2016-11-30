define(['lodash', 'utils',
    'core/core/data/pointers/DataAccessPointers',
    'core/core/data/pointers/pointerGeneratorsRegistry',
    'core/core/data/pointers/jsonItemsFinders'], function (_, utils, DataAccessPointers, pointerGeneratorsRegistry, jsonItemsFinders) {
    "use strict";

    var pointers = new DataAccessPointers();
    var constants = utils.constants;
    var masterPageId = 'masterPage';
    //var masterPagePath = ['pagesData', 'masterPage', 'structure'];

    function getPagePath(pageId) {
        return ['pagesData', pageId, 'structure'];
    }

    function isPagePath(path) {
        return _.isArray(path) && path[path.length - 3] === 'pagesData';
    }

    function findCompInPage(getItemAtPath, pointer, pageId) {
        var page = getItemAtPath(getPagePath(pageId));
        if (!page) {
            return undefined;
        }
        var compPath = jsonItemsFinders.getComponentPath(page, pointer.id, pointer.type);
        if (compPath) {
            compPath = getPagePath(pageId).concat(compPath);
        }
        return compPath;
    }

    function findComponent(currentRootIds, getItemAtPath, pointer) {
        var compPath;
        _.forEach(currentRootIds, function(rootId){
            compPath = compPath || findCompInPage(getItemAtPath, pointer, rootId);
        });

        if (!compPath) {
            var currentRootIdsMap = _.indexBy(currentRootIds);
            _.forOwn(getItemAtPath(['pagesData']), function (page, pageId) {
                if (currentRootIdsMap[pageId]) {
                    return true;
                }
                compPath = findCompInPage(getItemAtPath, pointer, pageId);
                if (compPath) {
                    return false;
                }
            });
        }
        return compPath;
    }

    pointerGeneratorsRegistry.registerPointerType(constants.VIEW_MODES.DESKTOP, findComponent, jsonItemsFinders.isComponentWithId, true, true);
    pointerGeneratorsRegistry.registerPointerType(constants.VIEW_MODES.MOBILE, findComponent, jsonItemsFinders.isComponentWithId, true, true);

    var getterFunctions = {
        getMobilePointer: function (getItemAtPath, cache, pointer) {
            return _.assign(_.clone(pointer), {type: constants.VIEW_MODES.MOBILE});
        },

        getDesktopPointer: function (getItemAtPath, cache, pointer) {
            return _.assign(_.clone(pointer), {type: constants.VIEW_MODES.DESKTOP});
        },

        isMobile: function (getItemAtPath, cache, pointer) {
            return pointer.type === constants.VIEW_MODES.MOBILE;
        },

        isPage: function (getItemAtPath, cache, pointer) {
            var path = cache.getPath(pointer);
            return isPagePath(path);
        },

        isPagesContainer: function (getItemAtPath, cache, pointer) {
            return pointer.id === constants.COMP_IDS.PAGES_CONTAINER;
        },

        isMasterPage: function (getItemAtPath, cache, pointer) {
            var compPath = cache.getPath(pointer);
            if (!compPath) {
                return false;
            }
            var pageId = compPath[1];
            return pageId === masterPageId && this.isPage(getItemAtPath, cache, pointer);
        },

        isInMasterPage: function (getItemAtPath, cache, pointer) {
            var compPath = cache.getPath(pointer);
            var pageId = compPath[1];
            return pageId === masterPageId;
        },

        getViewMode: function (getItemAtPath, cache, pointer) {
            return this.isMobile(getItemAtPath, cache, pointer) ? constants.VIEW_MODES.MOBILE : constants.VIEW_MODES.DESKTOP;
        },

        getChildrenContainer: function (getItemAtPath, cache, pointer) {
            var path = cache.getPath(pointer);
            var comp = getItemAtPath(path);
            var childrenProperty = jsonItemsFinders.getChildrenPropertyName(comp, pointer.type);
            var newPointer = pointers.getOriginalPointerFromInner(pointer);
            newPointer.innerPath = [childrenProperty];
            return newPointer;
        },

        getChildren: function (getItemAtPath, cache, pointer) {
            var path = cache.getPath(pointer);
            var comp = getItemAtPath(path);
            var childrenProperty = jsonItemsFinders.getChildrenPropertyName(comp, pointer.type);

            var children = comp[childrenProperty];
            return _.map(children, function (child, index) {
                return cache.getPointer(child.id, pointer.type, path.concat([childrenProperty, index]));
            });
        },

        getChildrenRecursively: function (getItemAtPath, cache, pointer) {
            var comps = this.getChildren(getItemAtPath, cache, pointer);
            var index = 0;
            while (index < comps.length) {
                comps.push.apply(comps, this.getChildren(getItemAtPath, cache, comps[index]));
                index++;
            }
            return comps;
        },

        /**
         * will return the children, including root, the order is right left root, from the higher z order to lower
         * @param getItemAtPath
         * @param cache
         * @param pointer
         * @param {function(jsonDataPointer): boolean} predicate
         */
        getChildrenRecursivelyRightLeftRootIncludingRoot: function (getItemAtPath, cache, pointer) {
            var nodes = [pointer];
            var orderedNodes = [];
            while (nodes.length) {
                var current = nodes.shift();
                orderedNodes.unshift(current);

                var children = this.getChildren(getItemAtPath, cache, current);
                nodes = children.concat(nodes);
            }

            return orderedNodes;
        },

        getParent: function (getItemAtPath, cache, pointer) {
            var path = cache.getPath(pointer);
            if (!path || isPagePath(path)){
                return null;
            }
            var parentPath = _.dropRight(path, 2);
            var parent = getItemAtPath(parentPath);
            return parent && cache.getPointer(parent.id, pointer.type, parentPath);
        },

        getSiblings: function (getItemAtPath, cache, pointer) {
            var parent = this.getParent(getItemAtPath, cache, pointer);
            if (!parent) {
                return [];
            }
            var siblings = this.getChildren(getItemAtPath, cache, parent);
            _.remove(siblings, {id: pointer.id});
            return siblings;
        },

        getComponent: function (getItemAtPath, cache, id, pagePointer) {
            var mode = pagePointer.type;
            var pointer = cache.getPointer(id, mode);
            if (!pointer) {
                var pagePath = cache.getPath(pagePointer);
                var page = getItemAtPath(pagePath);
                var compInPage = jsonItemsFinders.getComponentPath(page, id, mode);
                if (compInPage) {
                    pointer = cache.getPointer(id, mode, pagePath.concat(compInPage));
                }
            }
            return pointer;
        },

        getMasterPage: function (getItemAtPath, cache, viewMode) {
            return this.getPage(getItemAtPath, cache, masterPageId, viewMode);
        },

        getPage: function (getItemAtPath, cache, id, viewMode) {
            var mode = viewMode;
            var pointer = cache.getPointer(id, mode);
            if (!pointer) {
                var path = getPagePath(id);
                var page = getItemAtPath(path);
                if (!page) {
                    return null;
                }
                pointer = cache.getPointer(id, mode, path);
            }
            return pointer;

        },

        getNewPage: function (getItemAtPath, cache, id, viewMode) {
            var mode = viewMode || constants.VIEW_MODES.DESKTOP;
            var path = getPagePath(id);
            var page = getItemAtPath(path);
            if (page) {
                throw new Error("there is already a page with id " + id);
            }
            return cache.getPointer(id, mode, path);
        },

        getPagesContainer: function (getItemAtPath, cache, viewMode) {
            var master = this.getMasterPage(getItemAtPath, cache, viewMode);
            return this.getComponent(getItemAtPath, cache, constants.COMP_IDS.PAGES_CONTAINER, master);
        },

        getFooter: function (getItemAtPath, cache, viewMode) {
            var master = this.getMasterPage(getItemAtPath, cache, viewMode);
            return this.getComponent(getItemAtPath, cache, constants.COMP_IDS.FOOTER, master);
        },

        getHeader: function (getItemAtPath, cache, viewMode) {
            var master = this.getMasterPage(getItemAtPath, cache, viewMode);
            return this.getComponent(getItemAtPath, cache, constants.COMP_IDS.HEADER, master);
        },

        getUnattached: function (getItemAtPath, cache, id, viewMode) {
            return cache.getPointer(id, viewMode, []);
        },

        getPageOfComponent: function (getItemAtPath, cache, compPointer) {
            var compPath = cache.getPath(compPointer);
            if (!compPath) {
                return null;
            }

            var pageId = compPath[1];
            return this.getPage(getItemAtPath, cache, pageId, compPointer.type);
        },

        isDescendant: function (getItemAtPath, cache, comp, possibleAncestor) {
            var compPath = cache.getPath(comp);
            var ancestorPath = cache.getPath(possibleAncestor);
            if (compPath && ancestorPath) {
                var ancestorLength = ancestorPath.length;
                var compLength = compPath.length;
                return compLength > ancestorLength && _.isEqual(compPath.slice(0, ancestorLength), ancestorPath);
            }
            return false;
        }
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator('components', getterFunctions, true);


});
