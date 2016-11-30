import React, {Component} from 'react';
import {
  View, Text, Image, TouchableOpacity, ListView
} from 'react-native';
import {Header} from '../../components/pos/Header';
import {HeaderProductItem} from '../../components/pos/HeaderProductItem';
import { symbolize } from 'currency-symbol.js';

import _ from 'lodash';

import { connect } from 'react-redux';
import * as stateReader from '../../reducers/stateReader';
import * as posAction from '../../actions/posActions';
import * as appActions from '../../actions/appActions';
import * as appTypes from '../../actionTypes/appActionTypes';

import ProductList from '../../components/pos/ProductList';
import SearchBar from '../../components/SearchBar';

import * as CONSTANTS from '../../utils/constants';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SelectProductsScreen extends Component {
  static navigatorButtons = {
    leftButtons: [{
      title: 'Cancel',
      id: 'cancel'
    }],
    rightButtons: [{
      title: CONSTANTS.SEARCH_BUTTON,
      id: CONSTANTS.SEARCH_BUTTON,
      icon: require('../../assets/searchIcon.png')
    }]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.props.dispatch(posAction.resetPOS());
    this.state = {
      search: false,
      searchString: ''
    };
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'cancel':
        return this.closePosScreens();
      case CONSTANTS.SEARCH_BUTTON:
        return this.toggleSearch();
    }
  }

  onSearchChanged(val) {
    this.props.dispatch(appActions.search(val));
  }

  closePosScreens() {
    this.props.navigator.pop();
  }

  toggleSearch(isSearch) {
    let search = isSearch !== undefined ? isSearch : !this.state.search;
    this.setState({
      search: search
    });
    this.props.dispatch({type: appTypes.IS_SEARCH, isSearch: search});
    this.props.navigator.toggleNavBar({
      to: search ? 'hidden' : 'shown',
      animated: true
    });
  }

  onItemPress(product) {
    if (product.managedProductItemsSummary) {
      console.log(product);
      this.props.dispatch(posAction.getDetailedProduct(product.id));
      this.props.navigator.push({
        title: 'Select Variant',
        screen: "wix.merchant.pos.SelectVariantScreen",
        passProps: {
          productId: product.id
        }
      });
    } else {
      this.props.dispatch(posAction.addProductToLocalCart(product.id));
    }
  }

  onRemoveItem(productId, optionsSelections) {
    this.props.dispatch(posAction.removeProductFromLocalCart(productId, optionsSelections));
  }

  getFormattedSelectedItems() {
    return this.props.localCart;
  }

  getProductPrice(productId, selectedOptions, variantSurcharge) {
    const product = this.props.products[productId];
    const priceWithoutDiscount = product.prices.price + variantSurcharge;
    return product.discount
      ? product.discount.mode === 'PERCENT'
        ? priceWithoutDiscount * (100 - product.discount.value) / 100
        : priceWithoutDiscount - product.discount.value
      : priceWithoutDiscount;
  }

  nextScreen() {
    this.props.navigator.push({
      title: 'Order Preview',
      screen: "wix.merchant.pos.OrderPreviewScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON
    });
  }

  render() {

    let sum = this.getFormattedSelectedItems().reduce((acc, product) => {
      return acc + this.getProductPrice(product.productId, product.optionsSelections, product.variantSurcharge) * product.quantity;
    }, 0);

    let dataSource = ds.cloneWithRows(this.getFormattedSelectedItems() || []);
    
    return <View style={{flex:1}}>
      <Header>
        {_.keys(this.props.localCart).length
          ? <View>
            <View>
              <Text style={{color: '#2d4150', fontSize: 27, fontWeight: '300', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10}}>{`Total: ${symbolize(this.props.settings.currency)}${Math.floor(sum * 100) / 100}`}</Text>
            </View>
            <ListView
              dataSource={dataSource}
              horizontal={true}
              style={{paddingLeft: 15, marginRight: 50}}
              renderRow={(rowData) =>
                <HeaderProductItem
                  product={this.props.products[rowData.productId]}
                  quantity={rowData.quantity}
                  onRemove={() => {this.onRemoveItem(rowData.productId, rowData.optionsSelections)}}
                />}
            />
            <TouchableOpacity onPress={this.nextScreen.bind(this)} style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 50,
                bottom: 0,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Image style={{height: 18, width: 11}} source={require('../../assets/smallArrow.png')}/>
            </TouchableOpacity>
          </View>
          : <Text style={{color: '#aab7c5', fontSize: 27, fontWeight: '300', paddingHorizontal: 24}}>{'Select the products you\nwould like to sell.'}</Text>
        }
      </Header>
      <ProductList key="product_view"
                   data={this.props.products}
                   storeSettings={this.props.settings}
                   selectedProducts={_.groupBy(this.props.localCart, 'productId')}
                   onItemPress={this.onItemPress.bind(this)}
                   onListRefresh={() => {}}
                   onAddButtonHidden={(isHidden) => {}}
                   contentOffset={{top: 0, bottom: 0, offsetY: 0}}
                   isProductListRefreshing={false}
                   skipOffset={true}
                   skipAddButton={true}
                   searchString={this.props.searchString}
                   isSearch={this.props.isSearch && !!this.props.searchString}
      />
      {this.state.search ? (
        <SearchBar
          searchString={this.props.searchString}
          activeScreen={1}
          cancelSearch={()=>{this.toggleSearch(false)}}
          onSearchChanged={this.onSearchChanged.bind(this)}
        />) : null}
    </View>;
  }
}

function mapStateToProps(state) {
  return {
    settings: stateReader.getSettings(state),
    products: stateReader.getProducts(state),
    selectedCollection: stateReader.getSelectedCollection(state),
    collections: stateReader.getCollections(state),
    isSearch: stateReader.getIsSearchStatus(state),
    searchString: stateReader.getSearchString(state),
    cart: state.pos.cart,
    localCart: state.pos.localCart
  };
}

export default connect(mapStateToProps)(SelectProductsScreen);