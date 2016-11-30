define([
    'lodash',
    'utils',
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel',
    'documentServices/component/component',
    'documentServices/page/page',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/connections/connections',
    'documentServices/documentMode/documentMode'
], function (_, utils, constants, dataModel, component, page, componentsDefinitionsMap, connections, documentMode) {
    'use strict';

    var MAX_NICKNAME_LENGTH = 128;

    var VALIDATIONS = {
        'VALID': 'VALID',
        'ALREADY_EXISTS': 'ALREADY_EXISTS',
        'TOO_SHORT': 'TOO_SHORT',
        'TOO_LONG': 'TOO_LONG',
        'INVALID_NAME': 'INVALID_NAME'
    };

    function getDefaultNickname(componentType) {
        var baseNicknameFromDefinitionsMap = _.get(componentsDefinitionsMap, [componentType, 'nickname']);
        if (baseNicknameFromDefinitionsMap) {
            return baseNicknameFromDefinitionsMap;
        }
        return _.camelCase(_.last(componentType.split('.')));
    }

    function getNextSuffixIndex(compNickname, comps) {
        var regex = new RegExp(compNickname + '(\\d+)'); //will match the number in the end of the nickname
        var maxSuffixOfDefaultNickname = _(comps)
            .map(function (comp, nickname) {
                var match = regex.exec(nickname);
                return match ? _.parseInt(match[1]) : null;
            })
            .max();

        return Math.max(maxSuffixOfDefaultNickname, 0) + 1;
    }

    function setNicknamesForComponentsWithoutNickname(ps, comps, defaultCompNickname, maxSuffixOfDefaultNickname, viewMode) {
        return _(comps)
            .filter(shouldSetNickname.bind(this, ps, viewMode))
            .map(function (comp) {
                var newNickname = defaultCompNickname + maxSuffixOfDefaultNickname++;
                setNickname(ps, comp, newNickname);
                return comp;
            })
            .value();
    }

    function getNicknames(ps, comps) {
        return _(comps)
            .filter(getNickname.bind(this, ps))
            .indexBy(getNickname.bind(this, ps))
            .value();
    }

    function getComponentsInPage(ps, pagePointer) {
        return ps.pointers.full.components.getChildrenRecursivelyRightLeftRootIncludingRoot(pagePointer);
    }

    function generateNicknamesForPage(ps, usedNicknames, pagePointer, viewMode) {
        var allCompsInPage = getComponentsInPage(ps, pagePointer);
        var usedNicknamesInPage = getNicknames(ps, allCompsInPage);
        var allUsedNickNames = _.assign({}, usedNicknamesInPage, usedNicknames);
        var compGroupsByBaseNickname = _.groupBy(allCompsInPage, function (compPointer) {
            var compType = ps.dal.full.get(ps.pointers.getInnerPointer(compPointer, 'componentType'));
            return compType && getDefaultNickname(compType);
        });

        var componentsWithNewNicknamesInPage = _(compGroupsByBaseNickname)
            .map(function (comps, defaultCompNickname) {
                var maxSuffixOfDefaultNickname = getNextSuffixIndex(defaultCompNickname, allUsedNickNames);
                return setNicknamesForComponentsWithoutNickname(ps, comps, defaultCompNickname, maxSuffixOfDefaultNickname, viewMode);
            })
            .flatten()
            .value();

        return _.assign(usedNicknamesInPage, getNicknames(ps, componentsWithNewNicknamesInPage));
    }

    function generateNicknamesForPagesInViewMode(ps, pageIdList, viewMode) {
        //TODO: split this to private and public for pages and site
        var masterPagePointer = ps.pointers.components.getPage('masterPage', viewMode);
        var masterPageNickNames = getNicknames(ps, getComponentsInPage(ps, masterPagePointer));
        var nicknamesInAllSite = _.reduce(pageIdList, function (nickNames, pageId) {
            var pagePointer = ps.pointers.components.getPage(pageId, viewMode);
            var nicknamesForPage = generateNicknamesForPage(ps, masterPageNickNames, pagePointer, viewMode);
            return _.assign(nickNames, nicknamesForPage);
        }, {});

        generateNicknamesForPage(ps, nicknamesInAllSite, masterPagePointer, viewMode);
    }

    /**
     *
     * @param ps
     * @param pageIdList
     * @param viewMode default is current view mode
     * @returns {*}
     */
    function generateNicknamesForPages(ps, pageIdList, viewMode) {
        if (_.includes(pageIdList, 'masterPage')) {
            return generateNicknamesForSite(ps, viewMode);
        }

        viewMode = viewMode || documentMode.getViewMode(ps);

        generateNicknamesForPagesInViewMode(ps, pageIdList, constants.VIEW_MODES.DESKTOP);

        if (viewMode !== constants.VIEW_MODES.DESKTOP) {
            copyNicknamesFromDesktopToViewMode(ps, pageIdList, viewMode);
            generateNicknamesForPagesInViewMode(ps, pageIdList, viewMode);
        }
    }

    function copyNicknamesFromDesktopToViewMode(ps, pageIdList, viewMode) {
        _(pageIdList).concat('masterPage').uniq().forEach(function (pageId) {
            var viewModePagePointer = ps.pointers.components.getPage(pageId, viewMode);
            var viewModePageComponents = getComponentsInPage(ps, viewModePagePointer);
            var desktopPagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            _(viewModePageComponents)
                .filter(shouldSetNickname.bind(this, ps, viewMode))
                .forEach(function (viewModeCompPointer) {
                    var desktopCompPointer = ps.pointers.components.getComponent(viewModeCompPointer.id, desktopPagePointer);
                    if (desktopCompPointer) {
                        var desktopCompNickname = getNickname(ps, desktopCompPointer);
                        setNickname(ps, viewModeCompPointer, desktopCompNickname);
                    }
                }).commit();
        }).commit();
    }

    //TODO: split this to private and public for pages and site
    /**
     *
     * @param ps
     * @param viewMode default is current view mode
     */
    function generateNicknamesForSite(ps, viewMode) {
        generateNicknamesForPages(ps, page.getPageIdList(ps), viewMode);
    }

    function getNickname(ps, compPointer) {
        var compConnections = connections.get(ps, compPointer);
	    var wixCodeConnectionItem = getWixCodeConnectionItem(compConnections);
        if (wixCodeConnectionItem) {
            return wixCodeConnectionItem.role;
        }
    }

	function getWixCodeConnectionItem(currentConnections) {
        return _.get(currentConnections, [0, 'type']) === 'WixCodeConnectionItem' && currentConnections[0];
    }

	function setNickname(ps, compPointer, nickname) {
        if (validateNickname(ps, compPointer, nickname) !== VALIDATIONS.VALID) {
            throw new Error('The new nickname you provided is invalid');
        }

        var currentConnections = connections.get(ps, compPointer);
        var connection = getWixCodeConnectionItem(currentConnections);
        if (connection) {
            connection.role = nickname;
        } else {
            var newConnectionItem = {
                type: 'WixCodeConnectionItem',
                role: nickname
            };

            currentConnections = [newConnectionItem].concat(currentConnections);
        }

        dataModel.updateConnectionsItem(ps, compPointer, currentConnections);
    }

    function removeNickname(ps, compPointer) {
        var currentConnections = connections.get(ps, compPointer);
        var connection = getWixCodeConnectionItem(currentConnections);
        if (connection) {
            currentConnections = currentConnections.slice(1);
            if (currentConnections.length > 0) {
                dataModel.updateConnectionsItem(ps, compPointer, currentConnections);
            } else {
                dataModel.removeConnectionsItem(ps, compPointer);
            }
        }
    }

    function getPagePointersInSameContext(ps, pagePointer) {
        var viewMode = pagePointer.type;
        if (pagePointer.id === 'masterPage') {
            return _.map(ps.pointers.page.getNonDeletedPagesPointers(true), function (nonDeletedPagePointer) {
                return ps.pointers.full.components.getPage(nonDeletedPagePointer.id, viewMode);
            });
        }
        return [pagePointer, ps.pointers.full.components.getMasterPage(viewMode)];
    }

    function hasComponentWithThatNickname(ps, pagePointer, nickname, compPointerToExclude) {
        if (!nickname) {
            return false;
        }

        var pagesSharingNicknames = getPagePointersInSameContext(ps, pagePointer);
        return _(pagesSharingNicknames)
            .map(ps.pointers.full.components.getChildrenRecursivelyRightLeftRootIncludingRoot)
            .flatten()
            .reject(_.isEqual.bind(_, compPointerToExclude))
            .map(getNickname.bind(this, ps))
            .includes(nickname);
    }

    function hasInvalidCharacters(nickname) {
        var validName = /^[a-zA-Z][a-zA-Z0-9]+$/;

        return !validName.test(nickname);
    }

    function validateNickname(ps, compPointer, nickname) {
        if (_.isEmpty(nickname)) {
            return VALIDATIONS.TOO_SHORT;
        }
        if (nickname.length > MAX_NICKNAME_LENGTH) {
            return VALIDATIONS.TOO_LONG;
        }

        var componentPagePointer = component.getPage(ps, compPointer);
        if (hasComponentWithThatNickname(ps, componentPagePointer, nickname, compPointer)) {
            return VALIDATIONS.ALREADY_EXISTS;
        }

        if (hasInvalidCharacters(nickname)) {
            return VALIDATIONS.INVALID_NAME;
        }

        return VALIDATIONS.VALID;
    }

    function shouldSetNickname(ps, viewMode, compPointer) {
        return !_.isEqual(compPointer, ps.pointers.components.getMasterPage(viewMode)) && !getNickname(ps, compPointer);
    }

    return {
        generateNicknamesForSite: generateNicknamesForSite,
        getNickname: getNickname,
        setNickname: setNickname,
        removeNickname: removeNickname,
        validateNickname: validateNickname,
        generateNicknamesForPages: generateNicknamesForPages,
        hasComponentWithThatNickname: hasComponentWithThatNickname,
        getComponentsInPage: getComponentsInPage,
        VALIDATIONS: VALIDATIONS
    };
});
