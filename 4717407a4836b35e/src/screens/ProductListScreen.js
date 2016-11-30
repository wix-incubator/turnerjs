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
import * as productTypes from '../actionTypes/productActionTypes';
import * as productActions from '../actions/productActions';
import ProductList from '../components/ProductList';
import LoadingScreenContainer from '../components/LoadingScreenContainer';

import * as CONSTANTS from '../utils/constants';

class ProductListScreen extends Component {

	static navigatorButtons = {
		rightButtons: [
			{
				title: CONSTANTS.SEARCH_BUTTON,
				id: CONSTANTS.SEARCH_BUTTON,
				icon: require('../assets/searchIconAndroid.png'),
			},
			{
				title: CONSTANTS.COLLECTION_BUTTON,
				id: CONSTANTS.COLLECTION_BUTTON,
				icon: require('../assets/collections.png'),
			}
		],
		fab: {
			collapsedId: CONSTANTS.ADD_BUTTON,
			collapsedIcon: require('../assets/add@2x.png'),
			backgroundColor: '#00adf5'
		}
	};
	
	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	onNavigatorEvent(event) {
		switch (event.id) {
			case CONSTANTS.ADD_BUTTON:
				return this.onAddProduct();
			case CONSTANTS.SEARCH_BUTTON:
				return this.showSearchScreen();
			case CONSTANTS.COLLECTION_BUTTON:
				this.props.navigator.push({
					title: 'Collections',
					screen: 'wix.merchant.CollectionsScreen'
				});
				return;
			case 'tabSelected':
				this.onTabActive();
				return;
		}
	}

	onTabActive() {
		this.props.dispatch({
			type: appTypes.ACTIVE_SCREEN,
			activeScreen: 1
		});
		this.props.navigator.setButtons(ProductListScreen.navigatorButtons);
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.appFound || !nextProps.appLoaded) return;
		
	}

	showSearchScreen() {
		this.props.navigator.push({
			title: '',
			screen: "wix.merchant.SearchScreen",
			overrideBackPress: true
		});
	}

	onAddProduct() {
		if (!this.props.canCreateNewProduct) return;

		this.props.dispatch(productActions.disableAddProduct(false));

		this.props.navigator.showModal({
			title: CONSTANTS.PRODUCT_NEW,
			screen: "wix.merchant.CreateProductScreen",
			backButtonTitle: CONSTANTS.CANCEL_BUTTON,
			tabBarHidden: true,
			overrideBackPress: true
		});
	}

	onItemPress(row) {
		if (!this.props.isConnected){
			this.props.dispatch(appActions.setAppAsFailed(true));
			return;
		}
		if (row.id === 'add_product') return this.onAddProduct();

		let propsToPass = {
			['productId']: row.id
		};
		//HACK: EE-5275
		this.props.dispatch({
			type: productTypes.PRODUCT_SELECTED,
			id: row.id
		});

		propsToPass.managedProductItemsSummary = row.managedProductItemsSummary;

		this.props.navigator.push({
			title: 'Product Details',
			screen: "wix.merchant.ProductScreen",
			backButtonTitle: CONSTANTS.BACK_BUTTON,
			overrideBackPress: true,
			passProps: propsToPass
		});
	}

	onListRefresh() {
		if (this.props.isConnected) {
			this.props.dispatch(appActions.refreshAllData(this.props.activeScreen));
		}
	}

	getIsListLoadingStatus() {
		return (this.props.isProductListLoading && !this.props.isProductListRefreshing);
	}

	render() {
		return (
			<LoadingScreenContainer
				isModuleLoaded={this.props.appLoaded}
				isAppFound={this.props.appFound}
				isLoading={this.getIsListLoadingStatus()}
			>
				<ProductList key="product_view"
							 data={this.props.products}
							 storeSettings={this.props.settings}
							 onItemPress={this.onItemPress.bind(this)}
							 onListRefresh={this.onListRefresh.bind(this)}
							 onAddButtonHidden={(isHidden) => {}}
							 contentOffset={{bottom:49}}
							 collections={this.props.collections}
							 selectedCollection={this.props.selectedCollection}
							 isProductListRefreshing={this.props.isProductListRefreshing}
							 isSearch={false}
				/>
			</LoadingScreenContainer>);
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
		products: stateReader.getProducts(state),
		orders: stateReader.getOrders(state),
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

export default connect(mapStateToProps)(ProductListScreen);