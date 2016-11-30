import React, {Component, PropTypes} from 'react';

import {
  Text,
  View
} from 'react-native';

import OrderStyles from '../../styles/OrderViewStylesTransform';
import * as CONSTANTS from '../../utils/constants';

export const OrderTotals = ({order, formatPrice, currency}) => (
  <View>
    <View style={OrderStyles('totals')}>
      {
        [
          ['subTotal', CONSTANTS.ORDER_ITEM_TOTALS_SUBTOTAL],
          ['shipping', CONSTANTS.ORDER_ITEM_TOTALS_SHIPPING],
          ['tax', CONSTANTS.ORDER_ITEM_TOTALS_TAX]
        ].map(([key, text], index) => (
          <View style={OrderStyles('totals.line')} key={'l_' + index}>
            <Text style={OrderStyles('totals.line.name')}>{text}</Text>
            <Text style={OrderStyles('totals.line.value')}>{`${currency}${formatPrice(order.totals[key])}`}</Text>
          </View>
        ))
      }
      { order.totals.discount && order.totals.discount.value ?
        <View style={OrderStyles('totals.line')}>
          <Text style={OrderStyles('totals.line.name')} numberOfLines={1}>{`${CONSTANTS.ORDER_ITEM_TOTALS_COUPON} (${order.totals.discount.name})`}</Text>
          <Text style={OrderStyles('totals.line.value')}>{`- ${currency}${formatPrice(order.totals.discount.value)}`}</Text>
        </View>
        : null
      }
    </View>
    <View style={OrderStyles('totals2')}>
      <Text style={OrderStyles('totals2.text')}>{CONSTANTS.ORDER_ITEM_TOTALS_TOTAL}</Text>
      <Text style={OrderStyles('totals2.text')}>{`${currency}${formatPrice(order.totals.total)}`}</Text>
    </View>
  </View>
);


OrderTotals.propTypes = {
  order: PropTypes.object.isRequired,
  formatPrice: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired
};


