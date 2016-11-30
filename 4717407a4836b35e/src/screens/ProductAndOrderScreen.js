import React, {Component} from 'react';
import {
    Text,
    View,
    ListView,
    TextInput,
    SegmentedControlIOS,
    TouchableOpacity,
    RecyclerViewBackedScrollView,
    StyleSheet,
    PixelRatio,
    Keyboard,
    Dimensions,
    Platform
} from 'react-native';

import _ from 'lodash/fp';

import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';

import { Navigation, Screen, NavigationToolBarIOS} from 'react-native-navigation';
import TabPanel from '../components/TabPanel'
import { ModuleRegistry } from 'a-wix-react-native-framework';

import * as productTypes from '../actionTypes/productActionTypes';

import styles from '../styles/ProductListStyles';


import * as productActions from '../actions/productActions';
import * as orderActions from '../actions/orderActions';
import * as collectionActions from '../actions/collectionsActions';
import * as appActions from '../actions/appActions';

import * as types from '../actionTypes/productActionTypes';
import * as appTypes from '../actionTypes/appActionTypes';

import ProductList from '../components/ProductList';
import OrderList from '../components/OrderList';
import Collections from '../components/Collections';

import LoadingScreenContainer from '../components/LoadingScreenContainer';

import DeepLinkService from '../services/deepLinkService';

import * as CONSTANTS from '../utils/constants';
import buttonsBuilder from '../utils/buttonsBuilder';

class ProductAndOrderScreen extends Component {
    static navigatorStyle = {
        navBarNoBorder: true,
        drawUnderNavBar: true,
        drawUnderTabBar: true,
        navBarTranslucent: true,
        navBarTextColor: '#162d3d',
        navBarButtonColor: '#00adf5'
    };

    constructor(props) {
        super(props);

        this.state = {
            //canCreateNewProduct: true,
            openCollections: false,
            searchOffset: {
                top: 110,
                bottom: 49,
                offsetY: -110
            }
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        this.firstLoad = false;

        ModuleRegistry.addListener(
            'core.DeepLink',
            (deepLinkParams) => DeepLinkService.handle(this.props.navigator, deepLinkParams, this.props.dispatch));

    }

    onNavigatorEvent(event) {
        switch (event.id) {
            case CONSTANTS.ADD_BUTTON:
                return this.onAdd();
            case CONSTANTS.SEARCH_BUTTON:
                return this.showSearchBar()
            case CONSTANTS.COLLECTION_BUTTON:
                return this.showCollections()
            case CONSTANTS.CLOSE_BUTTON:
                return this.hideCollections();
        }
    }

    componentWillUnmount() {
        this.keyboardListeners.forEach((listener) => listener.remove());
    }
    
    componentDidMount() {
        if (Platform.OS === 'ios') {
            this.keyboardListeners = [
                Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this)),
                Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
            ];
        } else {
            this.keyboardListeners = [
                Keyboard.addListener('keyboardDidShow', this.keyboardWillShow.bind(this)),
                Keyboard.addListener('keyboardDidHide', this.keyboardWillHide.bind(this))
            ];
        }
    }

    keyboardWillShow (e) {
        let newSize = Dimensions.get('window').height - e.endCoordinates.screenY;
        this.setState({
            searchOffset: {
                top: this.state.searchOffset.top,
                bottom: newSize,
                offsetY: this.state.searchOffset.offsetY
            }
        });
        if (Platform.OS !== 'ios') {
            this.props.navigator.toggleTabs({
                to: 'hidden',
                animated: true
            });
        }
    }

    keyboardWillHide (e) {
        this.setState({
            searchOffset: {
                top: this.state.searchOffset.top,
                bottom: 49,
                offsetY: this.state.searchOffset.offsetY
            }
        });
        if (Platform.OS !== 'ios') {
            this.props.navigator.toggleTabs({
                to: 'show',
                animated: true
            });
        }
    }

    onAdd() {

        if (!this.props.activeScreen) {
            this.props.navigator.push({
                title: 'Point of Sale',
                screen: "wix.merchant.pos.WelcomeScreen",
                backButtonTitle: CONSTANTS.BACK_BUTTON
            });
        } else {
            if (!this.props.canCreateNewProduct) return;

            this.props.dispatch(productActions.disableAddProduct(false));

            this.props.navigator.showModal({
                title: CONSTANTS.PRODUCT_NEW,
                screen: "wix.merchant.CreateProductScreen",
                backButtonTitle: CONSTANTS.CANCEL_BUTTON,
                tabBarHidden: true
            });
        }
    }
    showSearchButton(){
        return {
            title: CONSTANTS.SEARCH_BUTTON,
            id: CONSTANTS.SEARCH_BUTTON,
            icon: require('../assets/searchIcon.png'),
        }
    }
    showSearchBar() {
        this.props.dispatch({type: appTypes.IS_SEARCH, isSearch: true});

        if (Platform.OS === 'ios') {
            this.props.navigator.toggleNavBar({
                to: 'hidden',
                animated: true
            });
        }
    }

    cancelSearch() {
        this.props.dispatch({type: appTypes.IS_SEARCH, isSearch: false});

        this.onSearchChanged('');

        if (Platform.OS === 'ios') {
            this.props.navigator.toggleNavBar({
                to: 'show',
                animated: false
            });
        }
    }

    onSearchChanged(val){
        this.props.dispatch(appActions.search(val));
    }

    showCollections() {
        this.props.navigator.setButtons(buttonsBuilder({
            leftButtons: [{
                title: CONSTANTS.CLOSE_BUTTON,
                id: CONSTANTS.CLOSE_BUTTON
            }],
            rightButtons: [],
            animated: false
        }));
        this.props.navigator.setTitle({
            title: CONSTANTS.COLLECTION_BUTTON
        });
        this.props.navigator.toggleTabs({
            to: 'hidden',
            animated: true
        });

        this.setState({
            openCollections: true
        });
    }

    hideCollections() {
        this.setState({
            openCollections: false
        });

        this.props.navigator.setTitle({
            title: CONSTANTS.STORE_TITLE
        });

        this.props.navigator.toggleTabs({
            to: 'show',
            animated: true
        });

        this.showOrHideAddButton(true, _.keys(this.props.products).length, _.keys(this.props.orders).length)
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.appFound || !nextProps.appLoaded) return;

        if (!nextProps.isProductListLoading && !nextProps.isOrderListLoading && !nextProps.products && !nextProps.orders && !nextProps.collections){
            this.props.dispatch(appActions.loadAllData());
        }

        if (nextProps.orders && !nextProps.activeScreen && nextProps.isConnected){}

        if (nextProps.orders && !nextProps.activeScreen && nextProps.isConnected && !this.firstLoad) {
            this.firstLoad = true;
            this.showOrHideAddButton();
        }

        if (nextProps.canCreateNewProduct) {
            this.setState({
                canCreateNewProduct: true
            });
        }

        if (nextProps.isSearch && !this.props.isSearch) {
            this.setState({
                searchOffset: {
                    top: 72,
                    bottom: 0,
                    offsetY: -72
                }
            })
        }
        else if(this.props.isSearch && !nextProps.isSearch) {
            this.setState({
                searchOffset: {
                    top: 110,
                    bottom: 49,
                    offsetY: -110
                }
            })
        }

    }

    onListRefresh() {
        if (this.props.isConnected) {
            this.props.dispatch(appActions.refreshAllData(this.props.activeScreen));
        }
    }

    onItemPress(row) {
        if (!this.props.isConnected){
            this.props.dispatch(appActions.setAppAsFailed(true));
            return;
        }
        if (row.id === 'add_product') return this.onAdd();

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
            title: this.props.activeScreen ? 'Product Details' : `${CONSTANTS.ORDER_SCREEN_TITLE} #${row.incrementId}`,
            screen: this.props.activeScreen ? "wix.merchant.ProductScreen" : "wix.merchant.OrderScreen",
            backButtonTitle: CONSTANTS.BACK_BUTTON,
            passProps: propsToPass
        });
    }

    switchScreen(index) {
        this.props.dispatch({
            type: appTypes.ACTIVE_SCREEN,
            activeScreen: index
        });
        this.showOrHideAddButton(!!index, _.keys(this.props.products).length, _.keys(this.props.orders).length);
    }

    showOrHideAddButton(isProductTab) {
        this.props.navigator.setButtons(buttonsBuilder({
            leftButtons: isProductTab ? [{
                title: CONSTANTS.COLLECTION_BUTTON,
                icon: require('../assets/collections@2x.png'),
                id: CONSTANTS.COLLECTION_BUTTON
            }] : [],

            rightButtons: [{
                title: CONSTANTS.ADD_BUTTON,
                icon: require('../assets/p.png'),
                id: CONSTANTS.ADD_BUTTON
            }, this.showSearchButton()],
            animated: false
        }));
    }
    renderProductList() {
        return <ProductList key="product_view"
                            data={this.props.products}
                            storeSettings={this.props.settings}
                            onItemPress={this.onItemPress.bind(this)}
                            onListRefresh={this.onListRefresh.bind(this)}
                            onAddButtonHidden={(isHidden) => {}}
                            contentOffset={this.state.searchOffset}
                            collections={this.props.collections}
                            selectedCollection={this.props.selectedCollection}
                            isProductListRefreshing={this.props.isProductListRefreshing}
                            isSearch={this.props.isSearch}
        />

    }

    renderOrderList() {
        return <OrderList key="order_view"
                          data={this.props.orders}
                          storeSettings={this.props.settings}
                          onListRefresh={this.onListRefresh.bind(this)}
                          onItemPress={this.onItemPress.bind(this)}
                          contentOffset={this.state.searchOffset}
                          isOrderListRefreshing={this.props.isOrderListRefreshing}
                          isSearch={this.props.isSearch}
        />
    }

    renderCollectionsScreen() {
        return <Collections onClose={this.hideCollections.bind(this)}/>;
    }

    getIsListLoadingStatus() {
        const isLoaded = this.props.activeScreen
            ? (this.props.isProductListLoading && !this.props.isProductListRefreshing)
            : (this.props.isOrderListLoading && !this.props.isOrderListRefreshing);
        return isLoaded;
    }

    render() {
        return (
            <LoadingScreenContainer
                isModuleLoaded={this.props.appLoaded}
                isAppFound={this.props.appFound}
                isLoading={this.getIsListLoadingStatus()}
            >
                <TabPanel
                    renderProductList={this.renderProductList.bind(this)}
                    renderOrderList={this.renderOrderList.bind(this)}
                    renderCollections={this.renderCollectionsScreen.bind(this)}
                    activeScreen={this.props.activeScreen}
                    switchScreen={this.switchScreen.bind(this)}
                    openCollections={this.state.openCollections}
                    isSearch={this.props.isSearch}
                    cancelSearch={this.cancelSearch.bind(this)}
                    onSearchChanged={this.onSearchChanged.bind(this)}
                    searchString={this.props.searchString}
                />
            </LoadingScreenContainer>
        )
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

export default connect(mapStateToProps)(ProductAndOrderScreen);