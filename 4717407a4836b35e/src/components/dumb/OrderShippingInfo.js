import React, {Component, PropTypes} from 'react';

import {
  Text,
  View,
  Platform,
  Image,
  TouchableOpacity
} from 'react-native';

import OrderStyles from '../../styles/OrderViewStylesTransform';
import * as CONSTANTS from '../../utils/constants';
const CountryAndStateNames = require('../../locale/messages_en.json');

const icons = {
  ios: {
    engage: {
      icon: require('../../assets/engageIcon.png'),
      message: CONSTANTS.ORDER_CONTACT_MESSAGE
    },
    phone: {
      icon: require('../../assets/callIcon.png'),
      message: CONSTANTS.ORDER_CONTACT_CALL
    }
  },
  android: {
    engage: {
      icon: require('../../assets/engageIconAndroidBlue.png'),
      message: CONSTANTS.ORDER_CONTACT_MESSAGE.toUpperCase()
    },
    phone: {
      icon: require('../../assets/callIconAndroid.png'),
      message: CONSTANTS.ORDER_CONTACT_CALL.toUpperCase()
    }
  }
};

const getAddress = addr => ([
  addr.addressLine1,
  addr.addressLine2,
  addr.city,
  addr.subdivision && CountryAndStateNames['countries.' + addr.country + '.' + addr.subdivision] || addr.subdivision,
  CountryAndStateNames['countries.' + addr.country + '.name'],
  addr.zipCode
].filter(item => item !== null).map(item => (item || "").trim()).filter(i => i !== ''));


export const OrderShippingInfo = ({shippingInfo, trackingInfo, deliveryInfo, onEngagePressed, buyerNote, onPhonePressed}) => {
  const addressArray = getAddress(shippingInfo.address);

  return (
    <View style={OrderStyles('shipping')}>
      {shippingInfo.address.fullName ? <Text style={OrderStyles('shipping.fullName')}>{shippingInfo.address.fullName}</Text> : null}

      {addressArray.length ? <Text style={OrderStyles('shipping.address')}>{addressArray.join(', ')}</Text> : null}

      <Text style={OrderStyles('shipping.address')}>{deliveryInfo.deliveryType === "PICKUP" ? CONSTANTS.STORE_PICUP : shippingInfo.method}</Text>

      {trackingInfo && trackingInfo.trackingNumber ? (
        <Text style={OrderStyles('shipping.address')}>{ `${CONSTANTS.ORDER_TRAKING_NUMBER}: ${trackingInfo.trackingNumber}`}</Text>
      ) : null}

      {buyerNote ?
        <Text style={OrderStyles('shipping.buyerNote')}>{`"${buyerNote}"`}</Text>
        : null
      }

      {
        shippingInfo.address.email || shippingInfo.address.phoneNumber ? (
          <View style={OrderStyles('shipping.contacts')}>
            {shippingInfo.address.email ?
              <TouchableOpacity style={OrderStyles('shipping.contacts.button')} onPress={onEngagePressed}>
                <Image style={OrderStyles('shipping.contacts.engageImage')} source={icons[Platform.OS].engage.icon}/>
                <Text style={OrderStyles('shipping.contacts.text')}>{icons[Platform.OS].engage.message}</Text>
              </TouchableOpacity>
              : null
            }
            {shippingInfo.address.phoneNumber ?
              <TouchableOpacity style={OrderStyles('shipping.contacts.button')} onPress={onPhonePressed}>
                <Image style={OrderStyles('shipping.contacts.callImage')} source={icons[Platform.OS].phone.icon}/>
                <Text style={OrderStyles('shipping.contacts.text')}>{icons[Platform.OS].phone.message}</Text>
              </TouchableOpacity>
              : null
            }
          </View>
        ) : null
      }
    </View>
  );

};


OrderShippingInfo.propTypes = {
  shippingInfo: PropTypes.object.isRequired,
  trackingInfo: PropTypes.object,
  deliveryInfo: PropTypes.object.isRequired,
  buyerNote: PropTypes.string,
  onEngagePressed: PropTypes.func.isRequired,
  onPhonePressed: PropTypes.func.isRequired
};



