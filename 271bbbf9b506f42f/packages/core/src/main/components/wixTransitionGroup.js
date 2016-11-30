define(['lodash', 'react', 'reactDOM', 'zepto', 'core/components/transitionGroup', 'core/components/wixTransitionItem', 'core/components/animationsMixin'], function (_, React, reactDOM, $, transitionGroup, wixTransitionItem, animationsMixin) {
    'use strict';

    transitionGroup = React.createFactory(transitionGroup);
    // wixTransitionItem = React.createFactory(wixTransitionItem);

    function markTransitionDataAttr(refs, leaving) {
        _(refs)
            .map(reactDOM.findDOMNode)
            .map($)
            .forEach(function ($node) {
                $node.attr('data-leaving', leaving ? true : null);
            })
            .commit();
    }

    var wixTransitionGroup = React.createClass({
        displayName: "wixTransitionGroup",
        mixins: [animationsMixin],
        getDefaultProps: function () {
            return {
                transition: 'CrossFade',
                transitionDuration: 2,
                reverse: false,
                transitionCallback: _.noop
            };
        },
        getInitialState: function () {
            this.leavingChildren = {};
            this.enteringChildren = {};
            return {};
        },
        render: function () {
            return transitionGroup(_.assign({
                childFactory: this.childWrapper,
                component: 'div',
                ref: 'group'
            }, _.omit(this.props, 'transition')));
        },
        childWrapper: function (child) {
            return React.createElement(wixTransitionItem, {
                onWillEnter: this.onWillEnter,
                onWillLeave: this.onWillLeave,
                refInParent: child.props.refInParent,
                ref: child.props.refInParent,
                key: child.props.refInParent
            }, child);
        },
        getInnerRefs: function (refs) {
            return _.map(refs, function (ref) {
                return this.refs.group.refs[ref];
            }, this);
        },
        flush: function () {
            if (!_.isEmpty(this.enteringChildren) && _.size(this.leavingChildren) === _.size(this.enteringChildren)) {
                var leavingKeys = this.getInnerRefs(_.keys(this.leavingChildren));
                var enteringKeys = this.getInnerRefs(_.keys(this.enteringChildren));
                
                markTransitionDataAttr(leavingKeys, true);
                markTransitionDataAttr(enteringKeys, false);
                
                var callbacks = _.values(this.enteringChildren).concat(_.values(this.leavingChildren));
                this.leavingChildren = {};
                this.enteringChildren = {};

                var params = _.isFunction(this.props.getTransitionParams) ? this.props.getTransitionParams() : {};
                this.transition(leavingKeys, enteringKeys, this.props.transition, this.props.transitionDuration, 0,
                    _.assign({reverse: this.props.reverse}, params), {
                    onComplete: function () {
                        this.props.transitionCallback();
                        _.forEach(callbacks, function (callback) {
                            callback();
                        });
                    }.bind(this)
                });
            }
        },
        onWillEnter: function (ref, callback) {
            this.enteringChildren[ref] = callback;
            this.flush();
        },
        onWillLeave: function (ref, callback) {
            this.leavingChildren[ref] = callback;
            this.flush();
        }
    });

    return wixTransitionGroup;
});
