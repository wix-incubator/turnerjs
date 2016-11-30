import React, {Component} from 'react';
import {Text, View, Image, ScrollView, RefreshControl, Platform, PixelRatio} from 'react-native';

import _ from 'lodash/fp';
import { Navigation, Screen } from 'react-native-navigation';

import OrderListItem from './OrderListItem';
import SmartList from './SmartList';
import NoResults from './dumb/NoResult';

import styles from '../styles/ProductListStyles';
import orderStyles from '../styles/OrderListStyles';
import * as CONSTANTS from '../utils/constants';

import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';
import BlurView from './CommonBlurView';
import Observer from '../utils/Observer';

import { orderFilterFunction, transformDataOrders} from '../utils/listDataBuilder';

class OrderList extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {data, searchString} = this.props;
        return (

            <SmartList
                {...this.props}
                data={!data ? undefined : transformDataOrders(_.values(data), searchString)}
                style={{
                    backgroundColor: '#fff'
                }}
                filterFunction={orderFilterFunction}
                renderRow={this.renderRow.bind(this)}
                renderSectionHeader={this.renderSectionHeader.bind(this)}
                renderEmptyScreen={this.renderEmptyScreen.bind(this)}
                isRefreshing={this.props.isOrderListRefreshing}
                ref="smartList"
            />
        );
    }
    componentWillMount(){
        this.onScrollTopListener = Observer.subscribe('onOrdersScrollTop', () => { this.scrollToTop() });
    }
    componentWillUnmount(){
        this.onScrollTopListener.remove();
    }
    renderSectionHeader(sectionData, sectionID) {

        const showCount = sectionID === 'unfulfilled';
        const sectionHeader = sectionID === 'unfulfilled' ? CONSTANTS.ORDER_LIST_UNFULFILLED : CONSTANTS.ORDER_LIST_FULFILLED;

        return (
            <BlurView blurType="xlight" style={styles.stickyHeader}>
                <Text style={styles.stickyHeaderText}>{sectionHeader + ` (${Object.keys(sectionData).length})`}</Text>
            </BlurView>
        )
    }
    scrollToTop(){
        this.refs.smartList.scrollToTop();
    }
    renderEmptyScreen(bottom){

        if (this.props.isSearch) {
            return (
                <NoResults bottom={bottom} />
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
                        refreshing={this.props.isOrderListRefreshing}
                        onRefresh={this.props.onListRefresh}
                    />}
                >
                    <View style={{flex: 1,  justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
                        <Image style={{width: 247, height: 200}} source={require('../assets/emptyStates/StoresNoOrders.png')}/>
                        <Text style={styles.emptyListHeader}>{CONSTANTS.ORDER_EMPTY_LIST_HEADER}</Text>
                        <Text style={styles.emptyListSubHeader}>{CONSTANTS.ORDER_EMPTY_LIST_SUB_HEADER}</Text>
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderRow(row){
        return (
            <OrderListItem
                key={row.id}
                orderData={row}
                storeSettings={this.props.storeSettings}
                onPress={this.props.onItemPress.bind(this, row)}
                isSearch={this.props.isSearch && !this.props.searchString}
            />
        );
    }
}


function mapStateToProps(state) {
    return {
        selectedOrder: stateReader.getOrder(state),
        searchString: stateReader.getSearchString(state),
    };
}

export default connect(mapStateToProps)(OrderList);