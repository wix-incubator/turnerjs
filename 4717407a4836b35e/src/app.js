import {Platform} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { ModuleRegistry, WixSession} from 'a-wix-react-native-framework';
import './module';

WixSession.getDemoSession(
    'alexk@wix.com',
    '1q2w3e4r',
  //'tarasd@wix.com',
  //'321321',
  //'3513d9e4-b8b7-487b-853b-c92781164f09',
  //'b45dcb11-2bff-477f-bfa3-909db890c4ea',
  //'11592b6f-2669-41c4-a8bc-c1808bfdf351',
  '419a59ed-df34-4142-92a5-be2c18a696ce',
  //  'ea78448d-70af-4268-ab3b-1041e1f7e28e', //Taras
  true)
  .then(function (session) {
    ModuleRegistry.notifyListeners('core.SessionUpdate', session);
  });


if (Platform.OS === 'ios') {
  Navigation.startTabBasedApp({
    tabs: [{
      label: 'Product List',
      screen: 'wix.merchant.ProductAndOrderScreen',
      title: 'Store',
      icon: require('./assets/storeIcon.png')
    }]
  });
} else {
  Navigation.startTabBasedApp({
    tabs:[
      {
        label: 'Product List',
        screen: 'wix.merchant.MainScreen',
        title: 'Stores',
        icon: require('./assets/storeIcon.png'),
        topTabs: [
          {
            screenId: 'wix.merchant.OrderListScreen',
            title: 'ORDERS'
          },
          {
            screenId: 'wix.merchant.ProductListScreen',
            title: 'PRODUCTS'
          }
        ]
      }
    ]
  });
}
