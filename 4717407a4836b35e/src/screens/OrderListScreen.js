import React, {Component} from 'react';
import {
	View,
	Text,
	TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';

import * as appActions from '../actions/appActions';
import * as appTypes from '../actionTypes/appActionTypes';
import OrderList from '../components/OrderList';
import LoadingScreenContainer from '../components/LoadingScreenContainer';

import * as CONSTANTS from '../utils/constants';

class OrderListScreen extends Component {

	static navigatorButtons = {
		rightButtons: [
			{
				title: CONSTANTS.SEARCH_BUTTON,
				id: CONSTANTS.SEARCH_BUTTON,
				icon: require('../assets/searchIconAndroid.png'),
			}
		]
	};

	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.props.navigator.setButtons(OrderListScreen.navigatorButtons);
		//HACK for Android
		if (this.props.appFound && this.props.appLoaded) {
			this.componentWillReceiveProps(this.props);
		}
	}

	onNavigatorEvent(event) {
		switch (event.id) {
			case CONSTANTS.SEARCH_BUTTON:
				return this.showSearchScreen();
			case 'tabSelected':
				this.onTabActive();
				return;
		}
	}

	onTabActive() {
		this.props.dispatch({
			type: appTypes.ACTIVE_SCREEN,
			activeScreen: 0
		});
		this.props.navigator.setButtons(OrderListScreen.navigatorButtons);
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.appFound || !nextProps.appLoaded) return;

		if (!nextProps.isProductListLoading && !nextProps.isOrderListLoading && !nextProps.products && !nextProps.orders && !nextProps.collections){
			this.props.dispatch(appActions.loadAllData());
		}
	}

	showSearchScreen() {
		this.props.navigator.push({
			title: '',
			screen: "wix.merchant.SearchScreen",
			overrideBackPress: true
		});
	}

	onItemPress(row) {
		if (!this.props.isConnected){
			this.props.dispatch(appActions.setAppAsFailed(true));
			return;
		}

		let propsToPass = {
			['orderId']: row.id
		};

		this.props.navigator.push({
			title: `${CONSTANTS.ORDER_SCREEN_TITLE} #${row.incrementId}`,
			screen: "wix.merchant.OrderScreen",
			backButtonTitle: CONSTANTS.BACK_BUTTON,
			passProps: propsToPass
		});
	}

	onListRefresh() {
		if (this.props.isConnected) {
			this.props.dispatch(appActions.refreshAllData(this.props.activeScreen));
		}
	}

	getIsListLoadingStatus() {
		return (this.props.isOrderListLoading && !this.props.isOrderListRefreshing);
	}

	render() {
		return (
		<LoadingScreenContainer
			isModuleLoaded={this.props.appLoaded}
			isAppFound={this.props.appFound}
			isLoading={this.getIsListLoadingStatus()}
		>
			<OrderList key="order_view"
						  data={this.props.orders}
						  storeSettings={this.props.settings}
						  onListRefresh={this.onListRefresh.bind(this)}
						  onItemPress={this.onItemPress.bind(this)}
						  contentOffset={{bottom:49}}
						  isOrderListRefreshing={this.props.isOrderListRefreshing}
						  isSearch={false}
				/>
		</LoadingScreenContainer>)
	}
}

function mapStateToProps(state) {
	return {
		session: stateReader.getSession(state),
		isConnected: stateReader.isConnected(state),
		settings: stateReader.getSettings(state),
		appLoaded: stateReader.getAppLoadingStatus(state),
		appFound: stateReader.getAppExistingStatus(state),
		isSearch: stateReader.getIsSearchStatus(state),
		activeScreen: stateReader.getActiveScreen(state),
		orders: stateReader.getOrders(state),
		isOrderListRefreshing: stateReader.getOrderListRefreshStatus(state),
		isOrderListLoading: stateReader.getOrderListUpdateStatus(state),
		newProductIds: stateReader.getNewProductIds(state),
		collections: stateReader.getCollections(state),
		selectedCollection: stateReader.getSelectedCollection(state),
		canCreateNewProduct: state.products.canCreateNewProduct,
		searchString: stateReader.getSearchString(state)
	};
}

export default connect(mapStateToProps)(OrderListScreen);
