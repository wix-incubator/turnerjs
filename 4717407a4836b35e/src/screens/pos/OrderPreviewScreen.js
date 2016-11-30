import React, {Component} from 'react';
import {
	View,
	ScrollView,
	Text,
	Image,
	Dimensions,
	ActivityIndicator,
	Platform
} from 'react-native';
import {SwipeActionView} from 'react-native-action-view';

import {Header} from '../../components/pos/Header';
import { EditFormLine } from '../../components/dumb/EditFormLine';

import { connect } from 'react-redux';
import { cartTransform } from '../../selectors/posSelectors';

import * as stateReader from '../../reducers/stateReader';

import _ from 'lodash/fp';

import styles from '../../styles/OrderViewStyles';
import topology from '../../utils/Topology';
import { formatPrice } from '../../selectors/productSelectors';

import {symbolize} from 'currency-symbol.js';
import * as CONSTANTS from '../../utils/constants';

import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';

import * as posAction from '../../actions/posActions';

const wixMediaApi = WixMediaApi(topology.staticMediaUrl);

const {width} = Dimensions.get('window');

class OrderPreviewScreen extends Component {
	static navigatorButtons = {
		rightButtons: [{
			title: 'Pay',
			id: 'pay'
		}]
	};

	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.props.dispatch(posAction.createCartFromLocalCart());
	}

	onNavigatorEvent(event) {
		switch (event.id) {
			case 'pay':
				return this.createOrder();
		}
	}

	componentWillReceiveProps(nextProps){
		!nextProps.orderCreating && (nextProps.orderCreating !== this.props.orderCreating) && this.nextScreen();
	}

	nextScreen() {
		this.props.navigator.push({
			title: 'Payment Method',
			screen: "wix.merchant.pos.PaymentMethodScreen",
			backButtonTitle: CONSTANTS.BACK_BUTTON
		});
	}

	createOrder() {
		this.props.cart && !this.props.cartUpdating && !this.props.orderCreating && this.props.dispatch(posAction.createOrder());
	}
	
	customAmountScreen() {
		this.props.navigator.push({
			title: 'Fixed Amount',
			screen: "wix.merchant.pos.FixedAmountScreen",
			passProps: {
				cartExists: true
			},
			backButtonTitle: CONSTANTS.BACK_BUTTON
		});
	}
	
	merchantDiscountScreen() {
		this.props.navigator.push({
			title: 'Discount',
			screen: "wix.merchant.pos.MerchantDiscountScreen",
			backButtonTitle: CONSTANTS.BACK_BUTTON
		});
	}

	render() {
		if (!this.props.cart) {
			return (
				<View style={{flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center'}}>
					<ActivityIndicator size="large"/>
				</View>
			);
		} else {
			return (
				<ScrollView style={{flex: 1}}>
					<Header height={103}>
						<Text style={{fontSize: 27, fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined, fontWeight: '300', color: '#2d4150', marginBottom: 6, paddingHorizontal: 25}}>{CONSTANTS.ORDER_SUMMARY_TOTAL}: {`${this.props.cart.totals.formattedTotal}`}</Text>
						<Text style={{fontSize: 17, fontWeight: '300', color: '#2d4150', paddingHorizontal: 25}}>{this.props.cart.itemsQuantity} item(s)</Text>
					</Header>
					<View style={{borderBottomWidth: 1, borderBottomColor: 'rgba(67,81,92, 0.15)', paddingVertical: 20}}>
						{
							(this.props.cart || {}).items
								.map((item, index) => {
									return (
										<SwipeActionView
											rightExpansionSettings={{buttonIndex: 0}}
											rightButtons={[{title: 'Delete', color: '#fc3d39', callback: () => { this.props.dispatch(posAction.removeProductFromCart(item.cartItemId));}}]}
											key={index}
										>
											<View style={[styles.items.item, {marginHorizontal: 25}]}>
												{(item.media || {}).url
													? <Image
													style={styles.items.item.image}
													source={{uri: wixMediaApi.imageFill(item.media.url, 150, 150)}}
												/>
													:
													<View style={[styles.items.item.image, styles.items.item.emptyImageWrapper]}>
														<Image style={styles.items.item.emptyImageWrapper.image} source={require('../../assets/emptyStates/StoresPlaceholder140x140.png')}/>
													</View>
												}
												<View style={styles.items.item.info}>
													<View style={styles.items.item.info.header}>
														<Text style={styles.items.item.info.header.title} numberOfLines={1}>{item.name.replace(/\s\s+/g, ' ')}</Text>
														<Text style={styles.items.item.info.header.price}>{item.formattedPrice}</Text>
													</View>
													<Text style={styles.items.item.info.subtitle}>{`${CONSTANTS.ORDER_ITEM_QUANTITY}: ${item.quantity} ${item.optionsSelectionsValues.length ? '(' + item.optionsSelectionsValues.map(selection => selection[2]).join(', ') + ')': ''}`}</Text>
												</View>
											</View>
										</SwipeActionView>
									);
								})
						}
					</View>
					<View style={{paddingHorizontal: 25}}>
						<EditFormLine
							onPress = {this.customAmountScreen.bind(this)}
							title = "Custom amount"
							actionText = { this.props.cart.totals.additionalPrice ? this.props.cart.totals.formattedAdditionalPrice : 'Add' }
						/>
						<EditFormLine
							onPress = {this.merchantDiscountScreen.bind(this)}
							title = "Discount"
							actionText = { this.props.cart.totals.merchantDiscount ? `${this.props.cart.totals.formattedMerchantDiscount} OFF` : 'Add' }
						/>
					</View>
					<View style={{marginHorizontal: 25, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(67,81,92, 0.15)'}}>
						<View style={styles.totals.line}>
							<Text style={styles.totals.line.name}>{CONSTANTS.ORDER_ITEM_TOTALS_SUBTOTAL}</Text>
							<Text style={styles.totals.line.value}>{`${this.props.cart.totals.formattedSubTotal}`}</Text>
						</View>
						<View style={styles.totals.line}>
							<Text style={styles.totals.line.name}>{CONSTANTS.ORDER_ITEM_TOTALS_TAX}</Text>
							<Text style={styles.totals.line.value}>{`${this.props.cart.totals.formattedTax}`}</Text>
						</View>
					</View>
					<View style={{marginHorizontal: 25, paddingVertical: 20}}>
						<View style={styles.totals.line}>
							<Text style={[styles.totals.line.name, {fontWeight: '400'}]}>Total</Text>
							<Text style={[styles.totals.line.value, {fontWeight: '400'}]}>{`${this.props.cart.totals.formattedTotal}`}</Text>
						</View>
					</View>
					{(this.props.cartUpdating || this.props.orderCreating) && <View style={{position: 'absolute', backgroundColor: 'rgba(255,255,255,0.5)', left: 0, top: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
						<ActivityIndicator size="large"/>
					</View>}
				</ScrollView>
			);
		}

	}
}

function mapStateToProps(state) {
	return {
		cart: cartTransform(state.pos.cart),
		cartUpdating: state.pos.cartUpdating,
		orderCreating: state.pos.orderCreating
	};
}

export default connect(mapStateToProps)(OrderPreviewScreen);