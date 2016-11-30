import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity, Dimensions} from 'react-native';

import topology from '../utils/Topology';
import * as CONSTANTS from '../utils/constants';
import styles from '../styles/ProductListStyles';
import getInventoryStatus from '../utils/getInventoryStatus';
import { formatPrice } from '../selectors/productSelectors';
import { symbolize } from 'currency-symbol.js';

import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';
const wixMediaApi = WixMediaApi(topology.staticMediaUrl);

export default props => {
    return (
        <TouchableOpacity activeOpacity={props.isSearch ? 1 : 0.2} onPress={() => !props.isSearch && props.onPress()}>
            <View style={[
                        styles.listItem,
                        props.isEven ? {paddingRight: 10, width: styles.listItem.width} : {borderLeftWidth: 1, paddingLeft: 10, width: styles.listItem.width + 1},
                        props.isFirst ? {paddingTop: 0, height: styles.listItem.height - 20} : {},
                        props.isLast ? {borderBottomWidth: 0} : {},
                    ]}>
                <View style={[styles.listItemImage, {position: 'relative'}, props.productData.isVisible ? {} : {opacity: 0.5}]}>
                    {getImage(props)}
                    {
                        props.productData.ribbon ?(
                            <View style={styles.discount}>
                                <Text style={[styles.discountText]} numberOfLines={1}>{props.productData.ribbon}</Text>
                            </View>)
                            : null
                    }

                </View>
                <View style={[styles.vbox, {paddingTop: 14}, props.productData.isVisible ? {} : {opacity: 0.5}]}>
                    <Text style={styles.textName} numberOfLines={1}>{props.productData.name.replace(/\s\s+/g, ' ')}</Text>
                    {getRest(props)}
                </View>
                {!props.productData.isVisible ? <Image
                    style={[
                            styles.invisibleIcon,
                            props.isFirst ? {top: styles.invisibleIcon.top - 20} : {},
                            props.isEven ? {right: styles.invisibleIcon.right + 10} : {},
                        ]}
                    source={require('../assets/invisible.png')}
                /> : null}
            </View>
        </TouchableOpacity>
    )
}


function getItemAmount({inventory, managedProductItemsSummary}){
    let {status, showStatus, isOutOfStock, quantity} = getInventoryStatus(inventory, managedProductItemsSummary);
    return (
        showStatus
            ? <Text numberOfLines={1}  style={styles.inventoryStatus.get(status)}>{CONSTANTS.STOCK_OPTIONS[status]}</Text>
            : (inventory.trackingMethod === 'quantity' ? <Text numberOfLines={1} style={[styles.inventoryStatus.get('in_stock'), {marginRight:5}]}>{quantity} {CONSTANTS.PRODUCT_ITEM_IN_STOCK}</Text> : null)
    );
}

function discountPrice(data, storeSettings){
    const salePrice = data.discount.mode === 'PERCENT'
        ? data.price - (data.price * (data.discount.value/100))
        : data.price - data.discount.value;

    return symbolize(storeSettings.currency) + formatPrice(salePrice, storeSettings);
}

function getImage(props) {
    const {width} = Dimensions.get('window');
    if (props.productData.mediaUrl) {
        return <Image
            style={styles.listItemImage}
            source={{uri: wixMediaApi.imageFill(props.productData.mediaUrl, Math.floor(styles.listItemImage.width), styles.listItemImage.height)}}
        />
    } else {
        return <View style={[styles.listItemImage, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#eff1f2'}]}>
            <Image style={{width: (width/2 - 30), height: (width/2 - 30)}} source={require('../assets/emptyStates/StoresPlaceholder315x315.png')}/>
        </View>
    }
}

function getRest(props){
    let showPrice = getInventoryStatus(props.productData.inventory, props.productData.managedProductItemsSummary).status === 'in_stock';
    return (
        <View style={[styles.labelsView, styles.labelItemView]}>
                {getItemAmount(props.productData)}
                {showPrice
                    ? <Text numberOfLines={1} style={[styles.textTag, {textAlign: 'right', flexGrow: 0.5}]}>{discountPrice(props.productData, props.storeSettings)}</Text>
                    : null
                }
        </View>
    );
}

