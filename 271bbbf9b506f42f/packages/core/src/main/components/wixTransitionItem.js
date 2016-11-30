define(['lodash', 'react', 'core/components/animatableMixin'], function (_, React, animatableMixin) {
  'use strict';

  var wixTransitionItem = React.createClass({
    displayName: 'wixTransitionItem',
    mixins: [animatableMixin],
    render: function() {
      return this.props.children;
    },
    componentWillEnter: function(callback) {
      this.props.onWillEnter(this.props.refInParent, callback);
    },
    componentWillLeave: function(callback) {
      this.props.onWillLeave(this.props.refInParent, callback);
    }
  });

  return wixTransitionItem;
});
