define([
    'lodash',
    'react',
    'santaProps',
    'core/components/animatableMixin',
    'core/components/renderDoneMixin',
	'core/components/compActionMixin',
    'core/components/compBehaviorsExecuterMixin',
    'experiment'
], function (
    _,
    React,
    santaProps,
    animatableMixin,
    renderDoneMixin,
    compActionMixin,
    compBehaviorsExecuterMixin,
    experiment
) {
    'use strict';

    var SantaTypes = santaProps.Types;

	var BASE_COMP_ACTIONS = {
		click: 'onClick',
		dblclick: 'onDoubleClick',
		mouseenter: 'onMouseEnter',
		mouseleave: 'onMouseLeave'
	};

	function getMergedEventHandlers(refData) {
		var refDataEventHandlers = _.pick(refData, _.values(BASE_COMP_ACTIONS));

        if (_.get(this.props.compProp, 'isDisabled')) {
            return refDataEventHandlers;
        }

		var compActionHandlers = _(this.props.compActions)
			.pick(_.keys(BASE_COMP_ACTIONS))
			.mapKeys(function (compAction, compName) {
				return BASE_COMP_ACTIONS[compName];
			})
			.mapValues(function (action) {
				return this.handleAction.bind(this, action.name);
			}, this)
			.value();

		return _.assign(compActionHandlers, refDataEventHandlers, function (compActionHandler, refDataEventHandler) {
			var self = this;
			return function () {
				if (compActionHandler) {
					compActionHandler.apply(self, arguments);
				}
				if (refDataEventHandler) {
					refDataEventHandler.apply(self, arguments);
				}
			};
		}, this);
	}

	function getCompInlineStyles(refData) {
		var style = _.defaults(refData.style || {}, this.props.style);
		if (_.get(this.props.compProp, 'isHidden')) {
			style.visibility = 'hidden';
		}

        if (refData['data-collapsed']) {
            style.visibility = 'hidden';
        }

        if (!_.get(this.props.compProp, 'isDisabled') && _.has(this.props.compActions, 'click')) {
            style.cursor = 'pointer';
        }

		if (_.isFunction(this.transformRefStyle)) {
			return this.transformRefStyle(style);
		}

		return style;
	}

	function getCompClasses(refDataClassName) {
		var classListStr = _.compact([refDataClassName, this.props.className]).join(' ');
		if (_.isFunction(this.transformRefClasses)) {
			return this.transformRefClasses(classListStr);
		}
		return classListStr;
	}

    /**
     * @class core.baseCompMixin
     * @extends {core.animatableMixin}
     * @property {comp.properties} props
     */
    var baseComp = {
        mixins: [animatableMixin, renderDoneMixin, compBehaviorsExecuterMixin, compActionMixin],

        propTypes: {
            id: SantaTypes.Component.id.isRequired,
            className: React.PropTypes.string,
            structure: SantaTypes.Component.structure.isRequired,
            style: SantaTypes.Component.style.isRequired,
            ref: SantaTypes.Component.ref,
            compActions: SantaTypes.Component.compActions,
            compBehaviors: SantaTypes.Component.compBehaviors,
            compProp: santaProps.Types.Component.compProp,
            registerReLayoutPending: SantaTypes.Layout.registerReLayoutPending,
            reLayoutIfPending: SantaTypes.Layout.reLayoutIfPending,
            getRootIdsWhichShouldBeRendered: SantaTypes.getRootIdsWhichShouldBeRendered,
            rootId: SantaTypes.Component.rootId,
            renderFlags: SantaTypes.renderFlags
        },

        registerReLayout: function () {
            if (this.props.registerReLayoutPending) {
                this.props.registerReLayoutPending(this.props.id);
            }
        },

        componentDidUpdate: function () {
            if (this.props.reLayoutIfPending) {
                this.callAfterRenderDone(this.props.reLayoutIfPending);
            }
        },

        isComponentActive: function (props){
            //TODO: Alissa we add here master page, because aspects components get it as root id.. :(
            var getRootIdsWhichShouldBeRendered = props.getRootIdsWhichShouldBeRendered || props.siteAPI.getRootIdsWhichShouldBeRendered.bind(props.siteAPI);
            return _.includes(getRootIdsWhichShouldBeRendered(), props.rootId) || props.rootId === 'masterPage';
        },

        /**
         * Return false if this component is currently animating and should not be updated
         * @returns {boolean}
         */
        shouldComponentUpdate: function (nextProps, nextState) {
            //this probably should be more generic
            var animationAllowsUpdate = !this.shouldComponentUpdateAnimatable || this.shouldComponentUpdateAnimatable(nextProps, nextState);
            var isComponentOnCurrentPage = this.isComponentActive(this.props);
            var pageNeedsRender = this.shouldComponentUpdatePage && this.shouldComponentUpdatePage(nextProps, nextState); //shouldComponentUpdatePage render the stubs, it happens when the page isn't current anymore

            if (experiment.isOpen('sv_shouldComponentUpdate_for_blog')) {
                var specificComponentAllowsUpdate = !_.isFunction(this.componentSpecificShouldUpdate) || this.componentSpecificShouldUpdate(nextProps, nextState);
                return animationAllowsUpdate && specificComponentAllowsUpdate && (pageNeedsRender || isComponentOnCurrentPage);
            }

            return animationAllowsUpdate && (pageNeedsRender || isComponentOnCurrentPage);
        },

	    updateRootRefDataStyles: function (rootRefData) {
		    if (!_.get(this.props, 'compProp.isHidden')) {
			    var mergedEvents = getMergedEventHandlers.call(this, rootRefData);
			    _.assign(rootRefData, mergedEvents);
		    }

		    rootRefData.style = getCompInlineStyles.call(this, rootRefData);
		    rootRefData.className = getCompClasses.call(this, rootRefData.className);

		    var structure = this.props.structure;
		    var angle = _.get(structure, 'layout.rotationInDegrees');
		    if (angle) {
			    rootRefData['data-angle'] = angle;
		    }
	    }
    };

	return {
		baseComp: baseComp,
		_testActionsMap: BASE_COMP_ACTIONS
	};
});
