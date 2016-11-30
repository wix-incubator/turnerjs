import * as orderActions from '../actions/orderActions';
import * as posActions from '../actions/posActions';

class DeepLinkService {

  handle(navigator, deepLinkParams, dispatch) {
    const {link, referrer} = deepLinkParams;
    
    let path = link.split('/');
    if (path[0] !== 'stores') {
      return false;
    }
    switch (path[1]) {
      case 'order':
        if (referrer !== 'core.PushNotification') {
          return false;
        }
        return this.orderPush(navigator, path.slice(2).join('/'), dispatch);
      case 'pos':
        return this.posCallback(navigator, path.slice(2).join('/'), dispatch);
      default:
        return;
    }
  }
  
  orderPush(navigator, params, dispatch) {
    // TODO report BI event, something like this -
    // let referral_info;
    // switch (referrer) {
    //   case 'core.PushNotification':
    //     referral_info = 'notification';
    //     break;
    // }
    //this.dispatch({type: biActionTypes.BI_EVENT, event: {...events.deepLinkOrder, referral_info}});

    //try {
    //  dispatch(orderActions.loadOrders());
    //} catch (e){}

    dispatch(orderActions.loadOrders());
    navigator.switchToTab();
  }
  
  posCallback(navigator, params, dispatch) {
    let data = JSON.parse(params).data;

    navigator.push({
      title: 'Thanks!',
      screen: "wix.merchant.pos.ThankYouScreen",
      passProps: {
        params: data
      }
    });
    
    dispatch(posActions.payment(data));
    navigator.switchToTab();
  }
}

export default new DeepLinkService();