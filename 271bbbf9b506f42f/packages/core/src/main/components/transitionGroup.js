define(['lodash', 'react'], function (_, React) {
  'use strict';
  /// this file is back port of React 0.14 implementation of TransitionGroup
  /// which doesn't break refs as it uses cloneElement instead of cloneWithProps
  /// delete this file after switching to 0.14


  function keyMapping(children) {
    var res = {};
    var counter = 0;
    React.Children.forEach(children, function (child) {
      res[child.key || ('' + counter++)] = child;
    });
    return res;
  }

  var ReactTransitionGroup = React.createClass({
    displayName: 'ReactTransitionGroup',

    propTypes: {
      component: React.PropTypes.any,
      childFactory: React.PropTypes.func
    },

    getDefaultProps: function() {
      return {
        component: 'span',
        childFactory: _.identity
      };
    },

    getInitialState: function() {
      return {
        children:keyMapping(this.props.children)
      };
    },

    componentWillMount: function() {
      this.currentlyTransitioningKeys = {};
      this.keysToEnter = [];
      this.keysToLeave = [];
    },

    componentDidMount: function() {
      var initialChildMapping = this.state.children;
      for (var key in initialChildMapping) {
        if (initialChildMapping[key]) {
          this.performAppear(key);
        }
      }
    },

    componentWillReceiveProps: function(nextProps) {
      var nextChildMapping = keyMapping(
        nextProps.children
      );
      var prevChildMapping = this.state.children;

      this.setState({
        children: _.assign({},
          prevChildMapping,
          nextChildMapping
        )
      });

      var key;

      for (key in nextChildMapping) {
        if (nextChildMapping[key] && !(prevChildMapping && prevChildMapping.hasOwnProperty(key)) &&
        !this.currentlyTransitioningKeys[key]) {
          this.keysToEnter.push(key);
        }
      }

      for (key in prevChildMapping) {
        if (prevChildMapping[key] && !(nextChildMapping && nextChildMapping.hasOwnProperty(key)) &&
        !this.currentlyTransitioningKeys[key]) {
          this.keysToLeave.push(key);
        }
      }

      // If we want to someday check for reordering, we could do it here.
    },

    componentDidUpdate: function() {
      var keysToEnter = this.keysToEnter;
      this.keysToEnter = [];
      keysToEnter.forEach(this.performEnter);

      var keysToLeave = this.keysToLeave;
      this.keysToLeave = [];
      keysToLeave.forEach(this.performLeave);
    },

    performAppear: function(key) {
      this.currentlyTransitioningKeys[key] = true;

      var component = this.refs[key];

      if (component.componentWillAppear) {
        component.componentWillAppear(
          this._handleDoneAppearing.bind(this, key)
        );
      } else {
        this._handleDoneAppearing(key);
      }
    },

    _handleDoneAppearing: function(key) {
      var component = this.refs[key];
      if (component.componentDidAppear) {
        component.componentDidAppear();
      }

      delete this.currentlyTransitioningKeys[key];

      var currentChildMapping = keyMapping(
        this.props.children
      );

      if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
        // This was removed before it had fully appeared. Remove it.
        this.performLeave(key);
      }
    },

    performEnter: function(key) {
      this.currentlyTransitioningKeys[key] = true;

      var component = this.refs[key];

      if (component.componentWillEnter) {
        component.componentWillEnter(
          this._handleDoneEntering.bind(this, key)
        );
      } else {
        this._handleDoneEntering(key);
      }
    },

    _handleDoneEntering: function(key) {
      var component = this.refs[key];
      if (component.componentDidEnter) {
        component.componentDidEnter();
      }

      delete this.currentlyTransitioningKeys[key];

      var currentChildMapping = keyMapping(
        this.props.children
      );

      if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
        // This was removed before it had fully entered. Remove it.
        this.performLeave(key);
      }
    },

    performLeave: function(key) {
      this.currentlyTransitioningKeys[key] = true;

      var component = this.refs[key];
      if (component.componentWillLeave) {
        component.componentWillLeave(this._handleDoneLeaving.bind(this, key));
      } else {
        // Note that this is somewhat dangerous b/c it calls setState()
        // again, effectively mutating the component before all the work
        // is done.
        this._handleDoneLeaving(key);
      }
    },

    _handleDoneLeaving: function(key) {
      var component = this.refs[key];

      if (component.componentDidLeave) {
        component.componentDidLeave();
      }

      delete this.currentlyTransitioningKeys[key];

      var currentChildMapping = keyMapping(
        this.props.children
      );

      if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
        // This entered again before it fully left. Add it again.
        this.performEnter(key);
      } else {
        this.setState(function(state) {
          var newChildren = _.assign({}, state.children);
          delete newChildren[key];
          return {children: newChildren};
        });
      }
    },

    render: function() {
      // TODO: we could get rid of the need for the wrapper node
      // by cloning a single child
      var childrenToRender = [];
      for (var key in this.state.children) {
        if (this.state.children[key]) {
          var child = this.state.children[key];
          // You may need to apply reactive updates to a child as it is leaving.
          // The normal React way to do it won't work since the child will have
          // already been removed. In case you need this behavior you can provide
          // a childFactory function to wrap every child, even the ones that are
          // leaving.
          childrenToRender.push(React.cloneElement(
            this.props.childFactory(child),
            {ref: key, key: key}
          ));
        }
      }
      return React.createElement(
        this.props.component,
        this.props,
        childrenToRender
      );
    }
  });
  return ReactTransitionGroup;
});
