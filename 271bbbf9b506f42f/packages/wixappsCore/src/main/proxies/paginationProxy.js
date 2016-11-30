define([
    'lodash',
    'react',
    'wixappsCore/proxies/mixins/baseCompositeProxy'
], function (
    _,
    React,
    baseCompositeProxy
) {
    'use strict';

    return {
        mixins: [baseCompositeProxy],

        renderProxy: function () {
            return React.DOM.div(getProxyProps.call(this), getProxyChildren.call(this));
        }
    };

    function getProxyProps() {
        return {
            style: getStyleForHorizontalChildAlignment.call(this)
        };
    }

    function getStyleForHorizontalChildAlignment() {
        return {
            display: 'inline-flex'
        };
    }

    function getProxyChildren() {
        return _.map(getItemProxiesViewVars.call(this), function (viewVars, index) {
            var viewDef = getItemProxyViewDefBasedOnViewVars.call(this, viewVars);
            var key = getKeyBasedOnViewVarsAndPosition(viewVars, index);
            var style = null;
            var props = getItemProxyPropsBasedOnViewVars.call(this, viewVars);
            return this.renderChildProxy(viewDef, key, style, props);
        }, this);
    }

    function getItemProxiesViewVars() {
        return [].concat(
            getBeginningItemProxiesViewVars.call(this),
            getMiddleItemProxiesViewVars.call(this),
            getEndItemProxiesViewVars.call(this)
        );
    }

    function getBeginningItemProxiesViewVars() {
        return getItemProxiesViewVarsForPrevious.call(this)
            .concat(getItemProxiesViewVarsForStartIfNeeded.call(this));
    }

    function getItemProxiesViewVarsForPrevious() {
        return hasPreviousPage.call(this) ? [getItemProxyViewVarsForPrevious.call(this)] : [];
    }

    function hasPreviousPage() {
        return !isCurrentPageNumber.call(this, 1);
    }

    function getItemProxyViewVarsForPrevious() {
        return getItemProxyViewVars.call(this, {
            isFirst: true,
            name: getNameForPrevious.call(this),
            number: getPreviousPageNumber.call(this)
        });
    }

    function getNameForPrevious() {
        return '<' + (nameForPreviousIsGiven.call(this) ? ' ' + getGivenNameForPrevious.call(this) : '');
    }

    function nameForPreviousIsGiven() {
        return Boolean(getGivenNameForPrevious.call(this));
    }

    function getGivenNameForPrevious() {
        return this.getCompProp('nameForPrevious');
    }

    function getPreviousPageNumber() {
        return getCurrentPageNumber.call(this) - 1;
    }

    function getItemProxiesViewVarsForStartIfNeeded() {
        return firstIsExcludedFromRange.call(this) ? getItemProxiesViewVarsForStart.call(this) : [];
    }

    function firstIsExcludedFromRange() {
        return rangeExcludes.call(this, 1);
    }

    function getItemProxiesViewVarsForStart() {
        return getItemProxiesViewVarsForFirstIfAny.call(this)
            .concat(getItemProxyViewVarsForGap.call(this));
    }

    function getItemProxiesViewVarsForFirstIfAny() {
        return getNumberOfSideItems.call(this) || !hasNextPage.call(this) ? [getItemProxyViewVarsForFirst.call(this)] : [];
    }

    function getItemProxyViewVarsForFirst() {
        return getItemProxyViewVars.call(this, {
            number: 1
        });
    }

    function getMiddleItemProxiesViewVars() {
        return _.map(getRange.call(this), function (number) {
            return getItemProxyViewVars.call(this, {
                isFirst: number === 1 && !hasPreviousPage.call(this),
                isDisabled: isCurrentPageNumber.call(this, number),
                number: number
            });
        }, this);
    }

    function getEndItemProxiesViewVars() {
        return getItemProxiesViewVarsForEndIfNeeded.call(this)
            .concat(getItemProxiesViewVarsForNext.call(this));
    }

    function getItemProxiesViewVarsForEndIfNeeded() {
        return lastIsExcludedFromRange.call(this) ? getItemProxiesViewVarsForEnd.call(this) : [];
    }

    function lastIsExcludedFromRange() {
        return rangeExcludes.call(this, getTotalNumberOfPages.call(this));
    }

    function getItemProxiesViewVarsForEnd() {
        return [getItemProxyViewVarsForGap.call(this)]
            .concat(getItemProxiesViewVarsForLastIfAny.call(this));
    }

    function getItemProxiesViewVarsForLastIfAny() {
        return getNumberOfSideItems.call(this) || !hasPreviousPage.call(this) ? [getItemProxyViewVarsForLast.call(this)] : [];
    }

    function getItemProxyViewVarsForLast() {
        return getItemProxyViewVars.call(this, {
            number: getTotalNumberOfPages.call(this)
        });
    }

    function getItemProxiesViewVarsForNext() {
        return hasNextPage.call(this) ? [getItemProxyViewVarsForNext.call(this)] : [];
    }

    function hasNextPage() {
        return !isCurrentPageNumber.call(this, getTotalNumberOfPages.call(this));
    }

    function getItemProxyViewVarsForNext() {
        return getItemProxyViewVars.call(this, {
            name: getNameForNext.call(this),
            number: getNextPageNumber.call(this)
        });
    }

    function getNameForNext() {
        return (nameForNextIsGiven.call(this) ? getGivenNameForNext.call(this) + ' ' : '') + '>';
    }

    function nameForNextIsGiven() {
        return Boolean(getGivenNameForNext.call(this));
    }

    function getGivenNameForNext() {
        return this.getCompProp('nameForNext');
    }

    function getNextPageNumber() {
        return getCurrentPageNumber.call(this) + 1;
    }

    function getItemProxyViewVarsForGap() {
        return getItemProxyViewVars.call(this, {
            isDisabled: true,
            isGap: true,
            name: '...'
        });
    }

    function getItemProxyViewVars(options) {
        return {
            paginationItemDisabled: Boolean(options.isDisabled),
            paginationItemFirst: Boolean(options.isFirst),
            paginationItemGap: Boolean(options.isGap),
            paginationItemName: options.name ? options.name : options.number.toString(),
            paginationItemValue: options.isDisabled ? null : options.number
        };
    }

    function rangeExcludes(number) {
        return !rangeIncludes.call(this, number);
    }

    function rangeIncludes(number) {
        return _.includes(getRange.call(this), number);
    }

    function getRange() {
        return _.range(getRangeLowerBound.call(this), getRangeUpperBound.call(this) + 1);
    }

    function getRangeLowerBound() {
        return rangeLowerBoundIsCloseToFirst.call(this) || totalNumberOfPagesIsLow.call(this) ?
            1 : getLimitedRangeLowerBoundFromRangeUpperBound.call(this);
    }

    function rangeLowerBoundIsCloseToFirst() {
        return getDistanceFromRangeLowerBoundToFirst.call(this) < getMinimumDistanceToLimit.call(this);
    }

    function getDistanceFromRangeLowerBoundToFirst() {
        return getLimitedRangeLowerBoundFromRangeUpperBound.call(this) - 1;
    }

    function getLimitedRangeLowerBoundFromRangeUpperBound() {
        return Math.max(getUnlimitedRangeLowerBoundFromRangeUpperBound.call(this), 1);
    }

    function getUnlimitedRangeLowerBoundFromRangeUpperBound() {
        return getLimitedRangeUpperBoundFromCurrent.call(this) - getDistanceBetweenBounds.call(this);
    }

    function getLimitedRangeUpperBoundFromCurrent() {
        return Math.min(
            getUnlimitedRangeUpperBoundFromCurrent.call(this),
            getTotalNumberOfPages.call(this)
        );
    }

    function getUnlimitedRangeUpperBoundFromCurrent() {
        return getCurrentPageNumber.call(this) + getNumberOfSideItems.call(this);
    }

    function getRangeUpperBound() {
        return rangeUpperBoundIsCloseToLast.call(this) || totalNumberOfPagesIsLow.call(this) ?
            getTotalNumberOfPages.call(this) :
            getLimitedRangeUpperBoundFromRangeLowerBound.call(this);
    }

    function rangeUpperBoundIsCloseToLast() {
        return getDistanceFromRangeUpperBoundToLast.call(this) < getMinimumDistanceToLimit.call(this);
    }

    function getDistanceFromRangeUpperBoundToLast() {
        return getTotalNumberOfPages.call(this) - getLimitedRangeUpperBoundFromRangeLowerBound.call(this);
    }

    function totalNumberOfPagesIsLow() {
        return getTotalNumberOfPages.call(this) < 4; // There's never a gap in case of '1 2 3'.
    }

    function getLimitedRangeUpperBoundFromRangeLowerBound() {
        return Math.min(
            getUnlimitedRangeUpperBoundFromRangeLowerBound.call(this),
            getTotalNumberOfPages.call(this)
        );
    }

    function getUnlimitedRangeUpperBoundFromRangeLowerBound() {
        return getLimitedRangeLowerBoundFromCurrent.call(this) + getDistanceBetweenBounds.call(this);
    }

    function getLimitedRangeLowerBoundFromCurrent() {
        return Math.max(getUnlimitedRangeLowerBoundFromCurrent.call(this), 1);
    }

    function getUnlimitedRangeLowerBoundFromCurrent() {
        return getCurrentPageNumber.call(this) - getNumberOfSideItems.call(this);
    }

    function getMinimumDistanceToLimit() {
        return getNumberOfSideItems.call(this) ?
            3 : // 4 - 1: '1 ... 4', but '1 2 3', not '1 ... 3' since there is no sense to insert gap for one number.
            2;  // 3 - 1: '1 ... 3'.
    }

    function getDistanceBetweenBounds() {
        return getNumberOfSideItems.call(this) * 2;
    }

    function getNumberOfSideItems() {
        return numberOfSideItemsIsGiven.call(this) ? getGivenNumberOfSideItems.call(this) : 1;
    }

    function numberOfSideItemsIsGiven() {
        return !_.isNaN(getGivenNumberOfSideItems.call(this));
    }

    function getGivenNumberOfSideItems() {
        return _.parseInt(this.getCompProp('numberOfSideItems'));
    }

    function isCurrentPageNumber(number) {
        return number === getCurrentPageNumber.call(this);
    }

    function getCurrentPageNumber() {
        return getGivenCurrentPageNumber.call(this) || 1;
    }

    function getGivenCurrentPageNumber() {
        return _.parseInt(this.getCompProp('currentPageNumber'));
    }

    function getTotalNumberOfPages() {
        return getGivenTotalNumberOfPages.call(this) || 1;
    }

    function getGivenTotalNumberOfPages() {
        return _.parseInt(this.getCompProp('totalNumberOfPages'));
    }

    function getItemProxyViewDefBasedOnViewVars(viewVars) {
        return getItemProxyViewDefForState.call(this, getItemProxyStateFromViewVars.call(this, viewVars));
    }

    function getItemProxyViewDefForState(isEnabled) {
        return isEnabled ? getItemViewDef.call(this) : getDisabledItemViewDef.call(this);
    }

    function getItemViewDef() {
        return getViewDefByTemplateName.call(this, 'item');
    }

    function getDisabledItemViewDef() {
        return getViewDefByTemplateName.call(this, 'disabledItem');
    }

    function getViewDefByTemplateName(name) {
        return this.getCompProp('templates')[name];
    }

    function getItemProxyStateFromViewVars(viewVars) {
        return !viewVars.paginationItemDisabled;
    }

    function getItemProxyPropsBasedOnViewVars(viewVars) {
        var viewDef = getItemProxyViewDefBasedOnViewVars.call(this, viewVars);
        var customContextDataPath = 'this';
        var extraContextProps = getItemProxyExtraContentPropsBasedOnViewVars.call(this, viewVars);
        return this.getChildProxyProps(viewDef, customContextDataPath, extraContextProps);
    }

    function getItemProxyExtraContentPropsBasedOnViewVars(viewVars) {
        return {
            vars: {
                proxy: viewVars
            }
        };
    }

    function getKeyBasedOnViewVarsAndPosition(viewVars, position) {
        return _.template('${name}${availability}${position}')({
            name: viewVars.paginationItemName,
            availability: !viewVars.paginationItemDisabled,
            position: position
        });
    }
});
