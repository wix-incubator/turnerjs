/**
 * Created by avim on 8/20/2014.
 */
define(['lodash', 'core', 'reactDOM', 'experiment'], function(_, /** core */ core, ReactDOM, experiment) {
    "use strict";

    var mixins = core.compMixins;

    /**
     * Convert legacy wix transition names to new modern animations
     * @type {{outIn: string, crossfade: string, shrinkfade: string, swipeHorizontal: string, swipeHorizontalFullScreen: string, swipeVertical: string, swipeVerticalFullScreen: string, none: string}}
     */
    var legacyTransitionTypesMap = {
        outIn: 'OutIn',
        crossfade: 'CrossFade',
        shrinkfade: 'CrossFade',
        swipeHorizontal: 'SlideHorizontal',
        swipeHorizontalFullScreen: 'SlideHorizontal',
        swipeVertical: 'SlideVertical',
        swipeVerticalFullScreen: 'SlideVertical',
        none: 'NoTransition'

    };

    /**
     * Return a params function with specific transition settings
     * @param {string} transitionName
     * @param {SiteData} siteData
     * @returns {function}
     */
    function getDynamicTransitionParams(transitionName, siteData){
        function paramsFunc(transName, steData){
            switch (transName){
                case 'SlideHorizontal':
                    return {siteWidth: steData.getSiteWidth(), width: steData.measureMap.width.screen, ease: 'Cubic.easeOut'};
                case 'SlideVertical':
                    var height = Math.max(steData.measureMap.height.screen, steData.measureMap.height.masterPage || steData.measureMap.height.SITE_PAGES);
                    return {screenHeight: steData.measureMap.height.screen, height: height, reverse: true, ease: 'Cubic.easeInOut'};
                case 'OutIn':
                    return {sourceEase: 'Strong.easeOut', destEase: 'Strong.easeIn'};
                case 'CrossFade':
                    return {sourceEase: 'Sine.easeInOut', destEase: 'Quad.easeInOut'};
                default:
                    return {};
            }
        }

        return paramsFunc.bind(this, transitionName, siteData);

    }

    function changePage(pgGroup, previousPage, currentPage){
        if (!pgGroup.refs[previousPage]) {
            pgGroup.refs[currentPage].updateVisibility();
        } else if (pgGroup.props.currentUrlPageId !== previousPage) {
            pgGroup.refs[previousPage].forceUpdate(function() {
                pgGroup.refs[currentPage].updateVisibility();
	            if (experiment.isOpen('sv_platform1')) {
                    ReactDOM.findDOMNode(pgGroup.refs[previousPage]).style.visibility = 'hidden';
                }
            });
        }
    }

    var pageGroup = {
        displayName: 'PageGroup',
        mixins: [mixins.skinBasedComp, mixins.animationsMixin],
        getInitialState: function() {
            this.actionsAspect = this.props.siteAPI.getSiteAspect('actionsAspect');
            return {
                prevPages: []
            };
        },

        componentWillReceiveProps: function(props) {
            var duration, callbacks, paramsFunc;
            var previousPage = this.props.currentUrlPageId;
            var currentPage = props.currentUrlPageId;
            var self = this;
            var transitionName = legacyTransitionTypesMap[props.rootNavigationInfo.transition || this.props.compProp.transition] || legacyTransitionTypesMap.none;
            var prefetchPages = this.props.siteData.getPrefetchPages();
            if (previousPage !== currentPage) {
                if (!_.includes(this.state.prevPages, previousPage)) {
                    this.setState({
                        prevPages: _.union(this.state.prevPages.concat([previousPage]), prefetchPages)
                    });
                } else {
                    this.refs[previousPage].clearAnimationsQueue(true);

                    if (!_.isEqual(_.intersection(this.state.prevPages, prefetchPages), prefetchPages)) {
                        this.setState({
                            prevPages: _.union(this.state.prevPages, prefetchPages)
                        });
                    }
                }

                duration = this.getAnimationProperties(transitionName).defaultDuration || 0;
                paramsFunc = getDynamicTransitionParams(transitionName, this.props.siteData);
                callbacks = {
                    onComplete: function() {
                        changePage(self, previousPage, currentPage);
                        self.actionsAspect.handlePageTransitionComplete(previousPage, currentPage);
                    }
                };

                this.actionsAspect.registerNextPageTransition(this, previousPage, currentPage, transitionName, duration, 0, paramsFunc, callbacks);
            } else {
                var prevPages = _(this.state.prevPages)
                                .filter(function (pageId) {
                                            return this.props.siteData.pagesData[pageId];
                                 }, this)
                                .union(prefetchPages)
                                .value();

                this.setState({prevPages: prevPages});
            }
        },

        createPage: function(pageId) {
            var isFirstPage = this.state.prevPages.length === 0;
            return this.props.createPage(pageId, isFirstPage);
        },

        getSkinProperties: function() {
            var pagesData = this.props.siteData.pagesData;
            var pages = _.includes(this.state.prevPages, this.props.currentUrlPageId) ?
                this.state.prevPages : this.state.prevPages.concat(this.props.currentUrlPageId);

            pages = _.reject(pages, function(pageId){
                 return !pagesData[pageId];
            });

            return {
                '': {
                    children: _.map(pages, this.createPage)
                }
            };
        }
    };

    return pageGroup;

});
