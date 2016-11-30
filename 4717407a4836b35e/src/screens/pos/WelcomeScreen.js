import React, {Component} from 'react';
import {CTA} from '../../components/pos/CTA';
import * as CONSTANTS from '../../utils/constants';

export default class WelcomeScreen extends Component {

  constructor(props) {
    super(props);
  }

  nextScreen() {
    this.props.navigator.push({
      title: 'New Order',
      screen: "wix.merchant.pos.NewOrderScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }

  render() {
    return <CTA
      testID="CTA"
      image={{
        source: require('../../assets/pos/welcome@2x.png'),
        width: 125,
        height: 117
      }}
      title="Welcome to POS!"
      subtitle={'You can now sell anywhere, keeping your sales and inventory synced with your online store'}
      actionText="Start Now"
      onPress={this.nextScreen.bind(this)}
    />;
  }
}


