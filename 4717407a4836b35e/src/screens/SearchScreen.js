import React, {Component} from 'react';
import {
	View, Text, Dimensions, Keyboard
} from 'react-native';
import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';

import * as appActions from '../actions/appActions';
import * as appTypes from '../actionTypes/appActionTypes';
import * as productTypes from '../actionTypes/productActionTypes';

import ProductList from '../components/ProductList';
import OrderList from '../components/OrderList';
import SearchBar from '../components/SearchBar';

import * as CONSTANTS from '../utils/constants';

class SearchScreen extends Component {
	static navigatorStyle = {
		statusBarColor: '#d9e1e8',
		navBarHidden: true
	};

	constructor(props) {
		super(props);
		this.props.dispatch({type: appTypes.IS_SEARCH, isSearch: true});
		this.state = {
			searchOffset: {
				bottom: 0
			}
		};

		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	onNavigatorEvent(event){
		switch (event.id) {
			case CONSTANTS.BACK_NAVIGATOR_BUTTON:
			case CONSTANTS.HARDWARE_BACK_NAVIGATOR_BUTTON:
				return this.cancelSearch();
		}
	}

	onItemPress(row) {
		if (!this.props.isConnected){
			this.props.dispatch(appActions.setAppAsFailed(true));
			return;
		}

		let propsToPass = {
			[this.props.activeScreen ? 'productId' : 'orderId']: row.id
		};
		//HACK: EE-5275
		if (this.props.activeScreen) {

			this.props.dispatch({
				type: productTypes.PRODUCT_SELECTED,
				id: row.id
			});

			propsToPass.managedProductItemsSummary = row.managedProductItemsSummary;
		}

		this.props.navigator.push({
			title: this.props.activeScreen ? row.name.replace(/\s\s+/g, ' ') : `${CONSTANTS.ORDER_SCREEN_TITLE} #${row.incrementId}`,
			screen: this.props.activeScreen ? "wix.merchant.ProductScreen" : "wix.merchant.OrderScreen",
			backButtonTitle: CONSTANTS.BACK_BUTTON,
			passProps: propsToPass
		});
	}

	componentDidMount() {
		this.keyboardListeners = [
			Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this)),
			Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
		];
	}

	componentWillUnmount() {
		this.keyboardListeners.forEach((listener) => listener.remove());
	}

	keyboardDidShow (e) {
		let newSize = Dimensions.get('window').height - e.endCoordinates.screenY;
		this.setState({
			searchOffset: {
				bottom: newSize
			}
		});
	}

	keyboardDidHide (e) {
		this.setState({
			searchOffset: {
				bottom: 0
			}
		});
	}

	onSearchChanged(val){
		this.props.dispatch(appActions.search(val));
	}

	cancelSearch() {
		this.props.dispatch(appActions.search(''));
		this.props.dispatch({type: appTypes.IS_SEARCH, isSearch: false});
		this.props.navigator.pop({
			animated: true
		});
	}

	render() {
		return <View style={{flex:1}}>
			<SearchBar isSearch={true}
					   cancelSearch={this.cancelSearch.bind(this)}
					   onSearchChanged={this.onSearchChanged.bind(this)}
					   searchString={this.props.searchString}
					   activeScreen={this.props.activeScreen}/>
			{
				this.props.activeScreen ? (
					<ProductList key="product_view"
								 data={this.props.products}
								 storeSettings={this.props.settings}
								 onItemPress={this.onItemPress.bind(this)}
								 onListRefresh={() => {}}
								 contentOffset={this.state.searchOffset}
								 collections={this.props.collections}
								 selectedCollection={this.props.selectedCollection}
								 isProductListRefreshing={this.props.isProductListRefreshing}
								 isSearch={this.props.isSearch}
					/>
				) : (
					<OrderList key="order_view"
							   data={this.props.orders}
							   storeSettings={this.props.settings}
							   onListRefresh={() => {}}
							   onItemPress={this.onItemPress.bind(this)}
							   contentOffset={this.state.searchOffset}
							   isOrderListRefreshing={this.props.isOrderListRefreshing}
							   isSearch={this.props.isSearch}
					/>
				)
			}
		</View>;
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
		products: stateReader.getProducts(state),
		isProductListLoading: stateReader.getProductListUpdateStatus(state),
		isProductListRefreshing: stateReader.getProductListRefreshStatus(state),
		isOrderListRefreshing: stateReader.getOrderListRefreshStatus(state),
		isOrderListLoading: stateReader.getOrderListUpdateStatus(state),
		newProductIds: stateReader.getNewProductIds(state),
		collections: stateReader.getCollections(state),
		selectedCollection: stateReader.getSelectedCollection(state),
		canCreateNewProduct: state.products.canCreateNewProduct,
		searchString: stateReader.getSearchString(state)
	};
}

export default connect(mapStateToProps)(SearchScreen);