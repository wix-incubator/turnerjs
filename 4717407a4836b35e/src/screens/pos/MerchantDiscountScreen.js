import React, {Component, PropTypes} from 'react';
import {View} from 'react-native';

import Discount from '../../components/editForm/EditDiscount';

import * as stateReader from '../../reducers/stateReader';
import * as posAction from '../../actions/posActions';

import { connect } from 'react-redux';

import * as CONSTANTS from '../../utils/constants';

export class SelectVariantScreen extends Component {
  static navigatorButtons = {
    leftButtons: [{
      title: 'Cancel',
      id: 'cancel'
    }],
    rightButtons: [{
      title: 'Done',
      id: 'done',
      disabled: true
    }]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      discount: 0
    }
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case CONSTANTS.DONE_BUTTON:
        this.state.discount && this.state.discount !== Infinity && this.props.dispatch(posAction.setMerchantDiscount(this.state.discount));
        return this.props.navigator.pop();
      case CONSTANTS.CANCEL_BUTTON:
      case CONSTANTS.CANCEL_NAVIGATOR_BUTTON:
      case CONSTANTS.BACK_NAVIGATOR_BUTTON:
      case CONSTANTS.HARDWARE_BACK_NAVIGATOR_BUTTON:
        return this.props.navigator.pop();
    }
  }
  
  onChange(value, isValid) {
    if (!isValid) {
      this.props.navigator.setButtons({
        leftButtons: [{
          title: CONSTANTS.CANCEL_BUTTON,
          id: CONSTANTS.CANCEL_BUTTON
        }],
        rightButtons: [{
          title: CONSTANTS.DONE_BUTTON,
          id: CONSTANTS.DONE_BUTTON,
          disabled: true
        }],
        animated: false
      });
    } else {
      this.setState({discount: value});
      this.props.navigator.setButtons({
        leftButtons: [{
          title: CONSTANTS.CANCEL_BUTTON,
          id: CONSTANTS.CANCEL_BUTTON
        }],
        rightButtons: [{
          title: CONSTANTS.DONE_BUTTON,
          id: CONSTANTS.DONE_BUTTON,
          disabled: false
        }],
        animated: false
      });
    }
  }

  render() {
    return <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Discount
        symbol={this.props.settings.currency}
        originalPrice={this.props.cart.totals.total + this.props.cart.totals.merchantDiscount}
        discountMode={'AMOUNT'}
        salePrice={this.props.cart.totals.merchantDiscount ? this.props.cart.totals.total : ''}
        onChange={(field, changedContent, isValid) => this.onChange(changedContent, isValid)}
        onSubmit={() => {}}
        onFocusInput={() => {}}
      />
    </View>;
  }
}

function mapStateToProps(state) {
  return {
    settings: stateReader.getSettings(state),
    cart: state.pos.cart
  };
}

export default connect(mapStateToProps)(SelectVariantScreen);