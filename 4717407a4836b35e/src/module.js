import React, {Component} from 'react';
import { AppRegistry, View, NetInfo, Platform, Text} from 'react-native';
import { createStore, applyMiddleware } from 'redux';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { Navigation, Screen} from 'react-native-navigation';

import { ModuleRegistry, WixSession} from 'a-wix-react-native-framework';

import reducer from './reducers';
import defaultActionsMiddleware from './middleware/defaultActions';
import errorReporterMiddleware from './middleware/errorReporter';
import biMiddleware from './middleware/biLoggerMiddleware';

import * as sessionActions from './actions/sessionActions';
import * as appActions from './actions/appActions';
import * as orderActions from './actions/orderActions';

import ProductAndOrderScreen from './screens/ProductAndOrderScreen';

import ProductScreen from './screens/ProductScreen';
import CreateProductScreen from './screens/CreateProductScreen';
import EditScreen from './screens/EditScreen';
import OrderScreen from './screens/OrderScreen';


import MainScreen from './screens/MainScreen';
import OrderListScreen from './screens/OrderListScreen';
import ProductListScreen from './screens/ProductListScreen';
import SearchScreen from './screens/SearchScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import VariantStatusScreen from './screens/VariantStatusScreen';

import ErrorOverlay from './components/ErrorOverlay';

import PosScreens from './screens/pos/posScreens';
import { ConnectionStatusBar, ErrorScreen } from 'wix-react-native-error-components';

import biLogger from './services/biLogger.config';
import _ from 'lodash';

const logger =  store => next => action => {
    if (console && console.group) {
        console.group(action.type);
        console.log(action);
        console.groupEnd(action.type);
    } else {
        console.log(action);
    }

    return next(action);
};



const createStoreWithMiddleware = applyMiddleware(thunk, biMiddleware, errorReporterMiddleware, defaultActionsMiddleware)(createStore);
const store = createStoreWithMiddleware(reducer);

const navigatorStyle = Platform.OS === 'ios'
    ? {
        navBarButtonColor: '#00adf5',
        tabBarHidden: true,
        navBarNoBorder: false,
    }
    : {
        statusBarColor: '#0092d1',
        navBarTextColor: '#ffffff',
        navBarBackgroundColor: '#00adf5',
        navBarNoBorder: true,
        navBarButtonColor: '#ffffff',
        topTabTextColor: '#80ffffff',
        selectedTopTabTextColor: '#ffffff',
        selectedTopTabIndicatorHeight: 5,
        selectedTopTabIndicatorColor: '#ffffff'
    };

function registerComponentAsScreen(name, Comp, isUnder = false, tabBarHidden = true) {
  ModuleRegistry.registerComponentAsScreen(
      name,
      () => class extends Component {

          static navigatorStyle = {
              ...(isUnder && Platform.OS === 'ios' ? {
                ...navigatorStyle,
                drawUnderNavBar: true,
                drawUnderTabBar: true,
                navBarTranslucent: true,
                navBarNoBorder: true
              } : {...navigatorStyle, ...Comp.navigatorStyle}),
              tabBarHidden,
              ...(tabBarHidden ? {drawUnderTabBar: true} : {})
          };

          static navigatorButtons = Comp.navigatorButtons;

          render() {
              return (
                  <View style={{flex: 1}}>
                    <Comp {...this.props} />
                    <ConnectionStatusBar style={isUnder ? {marginTop: 110} : {}} onConnectionChange={onConnectionChange} text="Offline mode. The data might be outdated."/>
                    <ErrorOverlay {...this.props}/>
                  </View>
              );
          }
      },
      store,
      Provider
  );
}

registerComponentAsScreen('wix.merchant.ProductScreen', ProductScreen);

registerComponentAsScreen('wix.merchant.MainScreen', MainScreen, false, false);

registerComponentAsScreen('wix.merchant.ProductListScreen', ProductListScreen);

registerComponentAsScreen('wix.merchant.OrderListScreen', OrderListScreen);

registerComponentAsScreen('wix.merchant.SearchScreen', SearchScreen);

registerComponentAsScreen('wix.merchant.CollectionsScreen', CollectionsScreen);

registerComponentAsScreen('wix.merchant.CreateProductScreen', CreateProductScreen);

registerComponentAsScreen('wix.merchant.EditScreen', EditScreen);

registerComponentAsScreen('wix.merchant.OrderScreen', OrderScreen);

registerComponentAsScreen('wix.merchant.ProductAndOrderScreen', ProductAndOrderScreen, true, false);

registerComponentAsScreen('wix.merchant.VariantStatusScreen', VariantStatusScreen);

_.keys(PosScreens).reduce((acc, screenKey) => {
    registerComponentAsScreen(`wix.merchant.pos.${screenKey}`, PosScreens[screenKey]);
}, {});

ModuleRegistry.addListener('core.SessionUpdate', function (session) {
    biLogger.updateDefaults({
        ownerId: _.get(session, 'metaSite.authorizationInfo.ownerId', ''),
        roles: _.get(session, 'metaSite.authorizationInfo.roles', ''),
        msid: WixSession.getMetaSiteId(session)
    });
    store.dispatch(sessionActions.updateSession(session));
});

ModuleRegistry.addListener('core.AppInit', function(data) {
    biLogger.updateDefaults({
        installationId: data.appInstallationId,
        appVersion: data.appVersion,
        bundleVersion: data.bundleVersion,
        osVersion: data.osVersion
    });
});

ModuleRegistry.addListener('core.AppStateChange', function ({state}) {
    const currentState = store.getState();
    const shouldRefresh = ![
        currentState.app.isConnected,
        currentState.app.appLoaded,
        !currentState.orders.isListLoading,
        !currentState.orders.isListRefreshing
    ].some((i) => !i);

    if(state === 'active' && store && shouldRefresh){
        store.dispatch(orderActions.loadOrders());
    }
});


function onConnectionChange(isConnected) {
    store.dispatch(appActions.updateConnectionStatus(isConnected));
}