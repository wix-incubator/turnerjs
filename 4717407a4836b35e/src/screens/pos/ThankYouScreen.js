import React, {Component} from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	ScrollView
} from 'react-native';
import {InputBox} from '../../components/dumb/InputBox';

import * as CONSTANTS from '../../utils/constants';

import * as posAction from '../../actions/posActions';
import * as orderAction from '../../actions/orderActions';
import * as productAction from '../../actions/productActions';

import * as stateReader from '../../reducers/stateReader';
import { connect } from 'react-redux';

const errorCodes = {
	amount_invalid_format: "The request had a missing or invalid amount to charge.",
	amount_too_large: "The request's amount to charge was too large.",
	amount_too_small: "The request's amount to charge was too small.",
	client_not_authorized_for_user: "The merchant currently using your Register API application has not yet authorized the application to act on their behalf.",
	could_not_perform: "The request could not be performed.",
	currency_code_mismatch: "The currency code provided in the request does not match the currency associated with the current business.",
	currency_code_missing: "The currency code provided in the request is missing or invalid.",
	data_invalid: "The URL sent to Square Register had missing or invalid information.",
	invalid_tender_type: "The request included an invalid tender type.",
	no_network_connection: "The transaction failed because the device has no network connection.",
	not_logged_in: "A merchant is not currently logged in to Square Register.",
	payment_canceled: "The merchant canceled the payment in Square Register.",
	unsupported_api_version: "The installed version of Square Register doesn't support the specified version of the Register API.",
	unsupported_currency_code: "The currency code provided in the request is not currently supported in the Register API.",
	unsupported_tender_type: "The request included a tender type that is not currently supported by the Register API.",
	user_id_mismatch: "The business location currently logged in to Square Register does not match the location represented by the merchant_id you provided in your request.",
	user_not_active: "The currently logged in location has not activated card processing."
};


class ThankYouScreen extends Component {

	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

		const params = JSON.parse(this.props.params);

		if (params && params.status === 'error') {
			this.state = {
				isError: true
			};
		} else {
			this.state = {};
			this.props.dispatch(posAction.finishOrder(params.transaction_id || "000"));
		}
	}

	onDone(val) {
		!this.state.isError && this.props.dispatch(orderAction.loadOrders());
		!this.state.isError && this.props.dispatch(productAction.loadProducts());
		!val && this.props.dispatch(posAction.setNameAndEmailToOrder('', this.state.name, this.state.email));
		val && this.props.dispatch(posAction.sendEmail(this.state.name, this.state.email));
		this.props.navigator.popToRoot();
	}

	onNavigatorEvent(event) {
		if (event.type == 'DeepLink') {
			console.log(event);
		}
	}

	render() {
		if (this.state.isError) {
			return <View
				style={{flexDirection: 'column', flex: 1, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', padding: 20}}>
				<Text style={{color: '#ee5951', textAlign: 'center', fontSize: 28, fontWeight: '300', lineHeight: 40, marginBottom: 35}}>
					Transaction Failed</Text>
				<Text>{JSON.stringify(this.props.params)}</Text>
			</View>;
		} else {
			return (
				<ScrollView style={{flex: 1}}>
					<View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around', padding: 20}}>
						<Image style={{width: 88, height: 84, alignSelf: 'center'}} source={require('../../assets/pos/transactionComplete.png')} />
						<Text style={{color: '#20455e', textAlign: 'center', fontSize: 28, fontWeight: '300', lineHeight: 40}}>
							Transaction completed</Text>
						<Text>{JSON.stringify(this.props.params)}</Text>
						<View>
							<InputBox
								name="identity"
								value=""
								onChange={(field, value) => this.setState({name: value})}
								label="Name"
							/>
						</View>
						<View>
							<InputBox
								name="identity"
								value=""
								keyboardType="email-address"
								onChange={(field, value) => this.setState({email: value})}
								label="Email address"
							/>
						</View>
						<TouchableOpacity onPress={() => this.onDone(true)} style={{alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 160, height: 50, borderRadius: 50, borderWidth: 1, borderColor: '#00adf5'}}>
							<Text style={{fontSize: 17, color: '#15b4f6'}}>Send Receipt</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.onDone(false)} style={{alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 160, height: 50}}>
							<Text style={{fontSize: 17, color: '#15b4f6'}}>No Thanks</Text>
						</TouchableOpacity>
					</View>
			</ScrollView>
			);
		}
	}
}

function mapStateToProps(state) {
	return {
		settings: stateReader.getSettings(state),
		cart: state.pos.cart,
		paymentDetails: state.pos.paymentDetails
	};
}

export default connect(mapStateToProps)(ThankYouScreen);