import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity, LayoutAnimation, Dimensions} from 'react-native';

import topology from '../utils/Topology';

import styles from '../styles/OrderListStyles';

import {symbolize} from 'currency-symbol.js';
import dateToHumanString from '../utils/dateToHumanString';

import moment from 'moment';
import { formatPrice } from '../selectors/productSelectors';

import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';
import * as CONSTANTS from '../utils/constants';
const wixMediaApi = WixMediaApi(topology.staticMediaUrl);

function formatId(id, ln) {
    let text = id.toString();
    return `#${text.length > ln ? '...' + text.substr(text.length - ln, ln) : text}`;
}

export default class OrderListItem extends Component{
    constructor(props){
        super(props);

        this.state = {
            selected: false
        }
    }
    onPress(){
        if (!this.props.onEdit) {
            this.props.onPress();
        } else {
            this.setState({
                selected: !this.state.selected
            })
        }
    }
    render() {
        let isPaid = this.props.orderData.billingInfo.status === 'paid';
        let isNew = this.props.orderData.isNew;
        return (
            <TouchableOpacity activeOpacity={this.props.isSearch ? 1 : 0.2} onPress={() => !this.props.isSearch && this.props.onPress()}>
                <View style={[styles.item, styles.item.isNewStyles.get(isNew)]}>
                    {this.props.orderData.previewMedia && this.props.orderData.previewMedia.url
                      ? <Image
                      style={styles.item.image}
                      source={{uri: wixMediaApi.imageFill(this.props.orderData.previewMedia.url, 100, 100)}}
                    />
                      :
                      <View style={[styles.item.image, styles.item.emptyImageWrapper]}>
                          <Image style={styles.item.emptyImageWrapper.image} source={require('../assets/emptyStates/StoresPlaceholder140x140.png')}/>
                      </View>
                    }
                    <View style={styles.item.info}>
                        <View style={styles.item.info.header}>
                            <Text style={styles.item.info.header.title.get(isNew)} numberOfLines={1}>
                                {formatId(this.props.orderData.incrementId, 6)}
                            </Text>
                            <Text style={styles.item.info.header.price.get(isNew)}>
                                {`${symbolize(this.props.orderData.currency)}${formatPrice(this.props.orderData.totals.total, this.props.storeSettings)}`}
                            </Text>
                        </View>
                        <View style={styles.item.info.subtitle}>
                            <Text style={styles.item.info.subtitle.info.get(isNew)} numberOfLines={1}>
                                {`${dateToHumanString(this.props.orderData.createdDate)} | ${this.props.orderData.quantity} ${CONSTANTS.ORDER_ITEMS_QUANTITY[(this.props.orderData.quantity > 1 ? 'plural' : 'singular')]}`}
                            </Text>
                            <Text style={styles.item.info.subtitle.status.get(isPaid)}>
                                {isPaid ? CONSTANTS.ORDER_PAID : CONSTANTS.ORDER_NOT_PAID}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
