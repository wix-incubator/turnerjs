import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity, ScrollView, RefreshControl, Platform, PixelRatio} from 'react-native';

import _ from 'lodash/fp';

import { Navigation, Screen, NavigationToolBarIOS} from 'react-native-navigation';

import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';

import ProductListItem from './ProductListItem';
import SmartList from './SmartList';
import NoResults from './dumb/NoResult';


import styles from '../styles/ProductListStyles';

import * as CONSTANTS from '../utils/constants';

import { transformData, productFilterFunction } from '../utils/listDataBuilder';

import Observer from '../utils/Observer';

var isOddOrEven = false;
var isFirst = 2;
var curSection = '';

import BlurView from './CommonBlurView';

class ProductList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {data, collections, selectedCollection, searchString, skipAddButton} = this.props;

        return (
            <SmartList
                {...this.props}
                selectedCollection={selectedCollection}
                data={!data ? undefined : transformData('name')(_.values(data), searchString)}
                filterFunction={productFilterFunction(collections, selectedCollection, Platform.OS === 'ios' && !skipAddButton? true : false)}
                style={{
                    //flex: 1,
                    justifyContent: 'center',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    backgroundColor: '#fff',
                    paddingHorizontal: 5,
                }}
                renderRow={this.renderRow.bind(this)}
                renderSectionHeader={this.renderSectionHeader.bind(this)}
                renderEmptyScreen={this.renderEmptyScreen.bind(this)}
                renderSeparator={() => null}
                onListRefresh={this.props.onListRefresh}
                isRefreshing={this.props.isProductListRefreshing}
                ref="smartList"
            />
        );
    }

    scrollToTop(){
        this.refs.smartList.scrollToTop();
    }
    componentWillMount(){
        this.onScrollTopListener = Observer.subscribe('onScrollTop', () => { this.scrollToTop() });
    }
    componentWillUnmount(){
        this.onScrollTopListener.remove();
    }

    renderSectionHeader(sectionData, sectionID) {

        isOddOrEven = false;
        isFirst = 2;
        curSection = sectionID;

        const sectionName = this.props.collections ? this.props.collections[sectionID].name : CONSTANTS.DEFAULT_COLLECTION_NAME;
        return (
            <BlurView blurType="xlight" style={[styles.stickyHeader, {marginBottom: 20}]}>
                <Text style={[styles.stickyHeaderText]} numberOfLines={1}>{sectionName}</Text>
            </BlurView>
        )
    }

    renderEmptyScreen(bottom) {
        if (this.props.isSearch) {
            return (
                <NoResults bottom={bottom} skipOffset={this.props.skipOffset}/>
            )
        }
        return (
            <View style={[styles.mainView]}>
                <ScrollView
                    style={{flex: 1, marginTop: Platform.OS === 'ios' ? 110 : 0, marginBottom: Platform.OS === 'ios' ? 49 : 0}}
                    contentContainerStyle={{flex: 1}}
                    refreshControl={<RefreshControl
                        title=""
                        colors={['#1e90ff']}
                        progressBackgroundColor="#fff"
                        refreshing={this.props.isProductListRefreshing}
                        onRefresh={this.props.onListRefresh}
                    />}
                >
                    <View
                        style={{flex: 1,  justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
                        <Image style={{width: 260, height: 200}} source={require('../assets/emptyStates/StoresNoProducts.png')}/>
                        <Text style={styles.emptyListHeader}>{CONSTANTS.PRODUCT_EMPTY_LIST_HEADER}</Text>
                        <Text style={styles.emptyListSubHeader}>{CONSTANTS.PRODUCT_EMPTY_LIST_SUB_HEADER}</Text>
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderAddRow(row, isLast){
        return (
            <TouchableOpacity activeOpacity={this.props.isSearch ? 1 : 0.2} onPress={() => !this.props.isSearch && this.props.onItemPress(row)}>
                <View
                    style={[styles.listItem, {paddingTop: 0, height: styles.listItem.height - 20, paddingRight: 10}, {justifyContent: 'center', alignItems: 'center'}, isLast ? {borderBottomWidth:0} : {}]}>
                    <Image style={{width: 75/2, height: 75/2}} source={require('../assets/addNewProduct.png')}/>
                    <Text style={{paddingTop: 6, fontSize: 17, fontWeight: '200', color: '#00adf5'}}>{CONSTANTS.ADD_PRODUCT}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderEmptyCell(){
        return (
            <View style={[
                    styles.listItem,
                    {borderLeftWidth: 1, paddingLeft: 10},
                    Math.max(isFirst--, 0) ? {paddingTop: 0, height: styles.listItem.height - 20} : {},
                    {borderBottomWidth: 0},
              ]}></View>
        )
    }

    renderRow(row, allProductsAndSections) {

        isOddOrEven = !isOddOrEven;

        let count = _.keys(allProductsAndSections[curSection]).length;
        if (row.id === 'add_product') {
            isFirst -= 1;
            return this.renderAddRow(row, count + isFirst < 4);
        }

        if (String(row.id).startsWith('empty_cell')) {
            return this.renderEmptyCell();
        }


        return (
            <ProductListItem
                isEven={isOddOrEven}
                isFirst={Math.max(isFirst--, 0)}
                isLast={count + isFirst < 4}
                key={row.id}
                productData={row}
                storeSettings={this.props.storeSettings}
                onPress={this.props.onItemPress.bind(this, row)}
                isSearch={this.props.isSearch && !this.props.searchString}
            />
        )
    }
}


function mapStateToProps(state) {
    return {
        //products: stateReader.getProducts(state),
        //isProductListRefreshing: stateReader.getProductListRefreshStatus(state),
        selectedProduct: stateReader.getProduct(state),
        searchString: stateReader.getSearchString(state),
        //collections: stateReader.getCollections(state),
        //selectedCollection: stateReader.getSelectedCollection(state)
    };
}

export default connect(mapStateToProps)(ProductList);