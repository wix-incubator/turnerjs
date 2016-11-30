import React, {Component} from 'react';
import {
	View,
	Image,
	TextInput,
	TouchableOpacity,
	Linking,
	Text
} from 'react-native';

import _ from 'lodash/fp';

import { connect } from 'react-redux';
import * as stateReader from '../../reducers/stateReader';

import ProductList from '../../components/ProductList';
import SearchBar from '../../components/SearchBar';

import searchStyles from '../../styles/searchBarStyles';

import * as appActions from '../../actions/appActions';
import * as posAction from '../../actions/posActions';
import * as posActionTypes from '../../actionTypes/posActionsTypes';
import * as CONSTANTS from '../../utils/constants';

class ProductListScreen extends Component {
	static navigatorButtons = {
		rightButtons: [{
			title: 'Next',
			id: 'next',
			disabled: true
		}]
	};

	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.props.dispatch(posAction.resetPOS());
	}
	onNavigatorEvent(event) {
		switch (event.id) {
			case 'next':
				return this.onNext();
		}
	}
	onNext(){
		//this.props.navigator.push({
		//	title: 'Checkout',
		//	screen: "wix.merchant.pos.CheckoutScreen",
		//	backButtonTitle: CONSTANTS.BACK_BUTTON,
		//});
	}
	onItemPress(prod) {
		this.props.dispatch(posAction.addProductToCart(prod.id));
		this.props.navigator.setButtons({
			rightButtons: [{
				title: 'Next',
				id: 'next',
				disabled: false
			}]
		});
	}
	onSearchChanged(val){
		this.props.dispatch(appActions.search(val));
	}
	render() {
		return (
			<View style={{flex: 1}}>
				<View style={{
						height: 65,
						padding: 20,
						paddingBottom: 10,
						justifyContent: 'center',
						flexDirection: 'row',
						alignItems: 'center'
					}}>
					<View style={searchStyles.fieldHolder}>
						<Image style={searchStyles.searchIcon} source={require('../../assets/searchIcon.png')}/>
						<TextInput returnKeyType="search"
								   selectionColor="#00adf5"
								   placeholder={`Search products`}
								   placeholderTextColor="#aab7c5"
								   value={`${this.props.searchString || ''}`}
								   onChangeText={text => {
								   		this.onSearchChanged(text)
								   }}
								   style={searchStyles.input}
						/>
						{(this.props.searchString || '').length ? <TouchableOpacity style={searchStyles.clearButtonHolder} onPress={() => {this.onSearchChanged('')}}>
							<Image style={searchStyles.clearButton} source={require('../../assets/searchClearButton.png')}/>
						</TouchableOpacity> : null}
					</View>
					<View>
						<Image style={{width: 22, height: 24.5}} source={require('../../assets/storeIcon.png')}/>
						<View style={{
							justifyContent: 'center',
							flexDirection: 'row',
							alignItems: 'center',
							position: 'absolute',
							top: 2,
							left: 0,
							width: 22,
							height: 24.5,
							backgroundColor: 'transparent',
						}}>
							<Text style={{
								fontSize: 16,
								backgroundColor: 'transparent',
								color: '#fff'
							}}>{(this.props.selectedProducts || []).length}</Text>
						</View>
					</View>
				</View>
				<Text style={{paddingBottom: 10, color: '#20455e', textAlign: 'center', fontSize: 14, fontWeight: '300', lineHeight: 25}}>Tap once to add to cart, tap again to increase quantity</Text>
				<ProductList key="product_view"
							 data={this.props.products}
							 storeSettings={this.props.settings}
							 onItemPress={this.onItemPress.bind(this)}
							 onListRefresh={() => {}}
							 onAddButtonHidden={(isHidden) => {}}
							 contentOffset={{top: 0, bottom: 0, offsetY: 0}}
					//collections={this.props.collections}
					//selectedCollection={this.props.selectedCollection}
							 isProductListRefreshing={false}
							 skipOffset={true}
							 skipAddButton={true}
							 isSearch={!!this.props.searchString}
				/>
			</View>
		);
	}
}

function mapStateToProps(state) {
	return {
		settings: stateReader.getSettings(state),
		products: stateReader.getProducts(state),
		selectedCollection: stateReader.getSelectedCollection(state),
		collections: stateReader.getCollections(state),
		searchString: stateReader.getSearchString(state),
		cart: state.pos.cart,
		selectedProducts: state.pos.selectedProducts
	};
}

export default connect(mapStateToProps)(ProductListScreen);