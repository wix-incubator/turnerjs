import React, {Component} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Linking
} from 'react-native';
import {CTA} from '../../components/pos/CTA';

import * as CONSTANTS from '../../utils/constants';

import * as posAction from '../../actions/posActions';
import { connect } from 'react-redux';

class PaymentSquareScreen extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isSquareInstalled: false
		};
		this.squareInstalledCheck();
	}

	squareInstalledCheck() {
		Linking.canOpenURL("square-commerce-v1://payment/create").then(supported => {
			this.setState({
				isSquareInstalled: supported
			});
		});
	}

	openSquare() {
		this.props.navigator.push({
			title: 'Processing payment',
			screen: "wix.merchant.pos.LoadingScreen",
			backButtonTitle: CONSTANTS.BACK_BUTTON
		});

		//this.props.dispatch(posAction.createOrder());

		//this.props.navigator.push({
		//	title: 'Checkout',
		//	screen: "wix.merchant.pos.ThankYouScreen",
		//	backButtonTitle: CONSTANTS.BACK_BUTTON,
		//});
	}

	openAppStore() {
		Linking.openURL('https://itunes.apple.com/app/square-register-point-sale/id335393788');
	}

	render() {
		return this.state.isSquareInstalled
			? <CTA
				image={{
					source: require('../../assets/pos/square.png'),
					width: 83,
					height: 83
				  }}
				title="Get Paid via Square"
				subtitle={'Go to the Square Register app to \naccept payment.'}
				actionText="Open App"
				onPress={this.openSquare.bind(this)}
			/>
			: <CTA
				image={{
						source: require('../../assets/pos/appStore2Square.png'),
						width: 188,
						height: 63
					  }}
				title="Get the Free Square Register App"
				subtitle={'Install Square Register to start accepting CC \npayments on your POS'}
				actionText="Get the App"
				onPress={this.openAppStore.bind(this)}
			/>;
	}
}

function mapStateToProps(state) {
	return {
		cart: state.pos.cart
	};
}

export default connect(mapStateToProps)(PaymentSquareScreen);