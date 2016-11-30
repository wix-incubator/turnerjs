import React, {Component} from 'react';
import {
	View,
	Text,
	TextInput,
	Platform,
	Dimensions,
	ActivityIndicator,
	TouchableOpacity,
	Linking
} from 'react-native';

import { cartTransform } from '../../selectors/posSelectors';

import * as CONSTANTS from '../../utils/constants';

import { connect } from 'react-redux';
import * as stateReader from '../../reducers/stateReader';

import * as posAction from '../../actions/posActions';

class LoadingScreen extends Component {
	constructor(props) {
		super(props);

		if (this.props.cart) {

			console.log(this.props.cart.totals.total * 100);

			const dataParameter = {
				"amount_money": {
					"amount": this.props.cart.totals.total * 100,
					"currency_code": this.props.settings.currency.toUpperCase()
				},
				"client_id": "sq0idp-JAUZzwza95qjDDmaw_7aWQ",
				"callback_url": "wix://stores/pos",
				"version": "1.0",
				"notes": "WIX ONE APP",
				"options": {
					"supported_tender_types": ["CREDIT_CARD"]
				}
			};
			Linking.openURL('square-commerce-v1://payment/create?data=' + encodeURIComponent(JSON.stringify(dataParameter))).catch(err => console.error('An error occurred', err));
		}

		this.props.navigator.push({
			title: 'Store',
			screen: "wix.merchant.ProductAndOrderScreen",
			backButtonHidden: true
		});
	}

	render() {
		return <View
			style={{flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 20}}>
			<Text style={{
				color: '#20455e',
				textAlign: 'center',
				fontSize: 28,
				fontWeight: '300',
				lineHeight: 40,
				marginBottom: 35
			}}>Processing payment</Text>
			<ActivityIndicator size="large"/>
		</View>;
	}
}

function mapStateToProps(state) {
	return {
		settings: stateReader.getSettings(state),
		collections: stateReader.getCollections(state),
		cart: cartTransform(state.pos.cart)
	};
}

export default connect(mapStateToProps)(LoadingScreen);