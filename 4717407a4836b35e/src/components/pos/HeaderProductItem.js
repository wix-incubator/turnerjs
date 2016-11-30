import React, {Component, PropTypes} from 'react';
import {Text, View, Image, TouchableOpacity, Platform } from 'react-native';

import topology from '../../utils/Topology';
import * as CONSTANTS from '../../utils/constants';

import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';
const wixMediaApi = WixMediaApi(topology.staticMediaUrl);

ProductImage = (props) => {
  return <Image
    style={{position: 'absolute', width: 53 - props.position, height: 53, top: 6 - props.position, left: 3 + props.position, borderWidth: 1, borderColor: '#fff'}}
    resizeMode="contain"
    source={props.mediaUrl ? {uri: wixMediaApi.imageFill(props.mediaUrl, 53, 53)} : require('../../assets/emptyStates/Placeholder140.png')}
  />;
};

export const HeaderProductItem = (props) => {
  return  <View style={{marginHorizontal: 6, alignItems: 'center', justifyContent: 'center', width: 60, height: 81}}>
    {props.quantity > 2 ? (
      <ProductImage
        position={6}
        mediaUrl={(props.product || {}).mediaUrl}
      />
    ) : null}
    {props.quantity > 1 ? (
      <ProductImage
        position={2}
        mediaUrl={(props.product || {}).mediaUrl}
      />
    ) : null}
    <ProductImage
      position={0}
      mediaUrl={(props.product || {}).mediaUrl}
    />
    <Text style={{position: 'absolute', color: '#d5dbe2', textAlign: 'center', fontSize: 14, bottom: 4, width: 60}} numberOfLines={1}>{props.quantity} {props.quantity > 1 ? 'items' : 'item'}</Text>
    {props.onRemove ? (
      <TouchableOpacity onPress={props.onRemove} style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 0 : 2,
              right: Platform.OS === 'ios' ? -4 : 2,
              width: 16,
              height: 16
            }
           }>
      <Image
        style={{flex: 1, height: 16, width: 16}}
        source={require('../../assets/pos/grayCross.png')}/>
      </TouchableOpacity>
    ) : null}
  </View>
};

HeaderProductItem.propTypes = {
  product: PropTypes.object.isRequired,
  quantity: PropTypes.number.isRequired,
  onRemove: PropTypes.func
};