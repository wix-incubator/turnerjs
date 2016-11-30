import React, {Component} from 'react';
import {View} from 'react-native';
import {CTA} from '../../components/pos/CTA';

import * as CONSTANTS from '../../utils/constants';

export default class PaymentGiftCardScreen extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <CTA
      image={{
        source: require('../../assets/notFound.png'),
        width: 188,
        height: 63
      }}
      title="Coming Soon!"
      subtitle={'Let your customers give the perfect gift gift cards from your business.'}
    />;
  }
}