import React, {Component, PropTypes} from 'react';

import {
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import OrderStyles from '../../styles/OrderViewStylesTransform';
import * as CONSTANTS from '../../utils/constants';

export const OrderStatusLine = props => (
    <TouchableOpacity style={OrderStyles('status')} onPress={props.onPress}>
      {props.isOrderPaid && props.isOrderFulfilled ?
        <Text style={OrderStyles('status.text', 0)}>{`${CONSTANTS.ORDER_STATUS_PAID_AND_FULFILLED}.`}</Text> :
        <View style={OrderStyles('status.wrapper')}>
          <View style={OrderStyles('status.lineWrapper', true)}>
            <Text style={OrderStyles('status.text')}>{CONSTANTS.ORDER_STATUS_PAYMENT}: </Text>
            <Text style={OrderStyles('status.text', props.isOrderPaid ? 0 : 1)}>
              {
                props.isOrderPaid ?
                  props.order.billingInfo.method === 'offline'
                    ? CONSTANTS.ORDER_STATUS_PAID_OFFLINE
                    : props.order.billingInfo.method
                  : CONSTANTS.ORDER_STATUS_UNPAID
              }
            </Text>
          </View>
          <View style={OrderStyles('status.lineWrapper')}>
            <Text style={OrderStyles('status.text')}>{CONSTANTS.ORDER_STATUS_ORDER}: </Text>
            <Text style={OrderStyles('status.text',  props.isOrderFulfilled ? 0 : 1)}>
              {
                props.isOrderFulfilled ?
                  CONSTANTS.ORDER_STATUS_FULFILLED :
                  CONSTANTS.ORDER_STATUS_UNFULFILLED
              }
            </Text>
          </View>
        </View>
      }
    </TouchableOpacity>
);


OrderStatusLine.propTypes = {
  isOrderFulfilled: PropTypes.bool.isRequired,
  isOrderPaid: PropTypes.bool.isRequired,
  order: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired
};

