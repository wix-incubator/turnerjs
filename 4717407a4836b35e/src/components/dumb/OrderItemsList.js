import React, {Component, PropTypes} from 'react';

import {
  Text,
  View,
  Image
} from 'react-native';

import OrderStyles from '../../styles/OrderViewStylesTransform';
import * as CONSTANTS from '../../utils/constants';
import { formatPrice } from '../../selectors/productSelectors';
import topology from '../../utils/Topology';
import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';

const wixMediaApi = WixMediaApi(topology.staticMediaUrl);


export const OrderItemsList = ({items, currency, storeSettings}) => !items.length ? null : (
    <View style={OrderStyles('items')}>
    {
      items.map((item, index) => (
          <View key={index} style={OrderStyles('items.item')}>
            {item.image
              ? <Image
                  style={OrderStyles('items.item.image')}
                  source={{uri: wixMediaApi.imageFill(item.image, 150, 150)}}
              />
              :
              <View style={[
                  OrderStyles('items.item.image'),
                  OrderStyles('items.item.emptyImageWrapper')
                ]}>
                <Image style={OrderStyles('items.item.emptyImageWrapper.image')} source={require('../../assets/emptyStates/StoresPlaceholder140x140.png')}/>
              </View>
            }
            <View style={OrderStyles('items.item.info')}>
              <View style={OrderStyles('items.item.info.header')}>
                <Text style={OrderStyles('items.item.info.header.title')} numberOfLines={1}>{item.title.replace(/\s\s+/g, ' ')}</Text>
                <Text style={OrderStyles('items.item.info.header.price')}>{`${currency}${formatPrice(item.total, storeSettings)}`}</Text>
              </View>

              <Text style={OrderStyles('items.item.info.subtitle')}>{`${CONSTANTS.ORDER_ITEM_QUANTITY}: ${item.quantity}`}</Text>
              {
                Object.keys((item.options || {})).length ?
                <Text style={OrderStyles('items.item.info.subtitle')}>{Object.keys((item.options || {})).map(k => item.options[k]).join(', ')}</Text> : null
              }
            </View>
          </View>
        )
      )
    }
    </View>
);


OrderItemsList.propTypes = {
  items: PropTypes.array.isRequired,
  currency: PropTypes.string.isRequired,
  storeSettings: PropTypes.object.isRequired
};


