import React, {Component} from 'react';

import {
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions
} from 'react-native';

import _ from 'lodash/fp';
import cappedMap from 'lodash/fp/map';
import confirmation from '../utils/confirmation';
import ActivityIndicator from '../components/CommonActivityIndicator';
const map = cappedMap.convert({ 'cap': false });


import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';
import * as orderActions from '../actions/orderActions';

import styles from '../styles/OrderViewStyles';

import loadingStyles from '../styles/loadingScreenStyles';


import { formatPrice } from '../selectors/productSelectors';

import {symbolize} from 'currency-symbol.js';

import moment from 'moment';

import {phonecall, email} from 'react-native-communications';

import * as CONSTANTS from '../utils/constants';

import Observer from '../utils/Observer';

import topology from '../utils/Topology';
import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';
const wixMediaApi = WixMediaApi(topology.staticMediaUrl);

const CountryAndStateNames = require('../locale/messages_en.json');
const deviceHeight = Dimensions.get('window').height;


//new imports

import { OrderStatusLine } from '../components/dumb/OrderStatusLine';
import { OrderItemsList } from '../components/dumb/OrderItemsList';
import { OrderTotals } from '../components/dumb/OrderTotals';
import { OrderShippingInfo } from '../components/dumb/OrderShippingInfo';
import OrderStyles from '../styles/OrderViewStylesTransform';

class OrderScreen extends Component {
    constructor(props) {
        super(props);
        this.scrollPosition = 0;
        this.props.dispatch(orderActions.loadOrderDetails(props.orderId));
        this.state = {
            historyShowed: false
        };
        this.props.navigator.setOnNavigatorEvent(event => {
            //console.log(event.id);
            _.find(item => item.id === event.id)(this.getNavigatorButtons({}, true)).action();
        });
    }
    getNavigatorButtons(order, getAll) {
        const BUTTONS = Platform.OS === 'ios' ?
            getAll || !(this.isOrderPaid(order) && this.isOrderFulfilled(order)) ? [{
                id: 'manage_order',
                title: 'Manage',
                isPresent: true,
                action: () => this.manageOrder()
            }] : []
            :
            [
                // {
                //     id: CONSTANTS.ORDER_MANAGE_PRIVATE_NOTE_ID,
                //     title: CONSTANTS.ORDER_MANAGE_PRIVATE_NOTE,
                //     isPresent: true,
                //     action: () => {},
                //     showAsAction: 'never'
                // },
                {
                    id: CONSTANTS.ORDER_MANAGE_PAID_AND_FULFILLED_ID,
                    title: CONSTANTS.ORDER_MANAGE_PAID_AND_FULFILLED,
                    isPresent: getAll || (!this.isOrderPaid(order) && !this.isOrderFulfilled(order)),
                    action: () => this.markAsPaidAndFulfilled(),
                    showAsAction: 'never'
                },
                {
                    id: CONSTANTS.ORDER_MANAGE_PAID_ID,
                    title: CONSTANTS.ORDER_MANAGE_PAID,
                    isPresent: getAll || !this.isOrderPaid(order),
                    action: () => this.markAsPaid(),
                    showAsAction: 'never'
                },
                {
                    id: CONSTANTS.ORDER_MANAGE_FULFILLED_ID,
                    title: CONSTANTS.ORDER_MANAGE_FULFILLED,
                    isPresent: getAll || this.isOrderPaid(order) && !this.isOrderFulfilled(order),
                    action: () => this.fulfillOrder(),
                    showAsAction: 'never'
                },
                // {
                //     id: CONSTANTS.ORDER_MANAGE_SHIPPING_DETAILS_ID,
                //     title: CONSTANTS.ORDER_MANAGE_SHIPPING_DETAILS,
                //     isPresent: this.isOrderPaid(order) && this.isOrderFulfilled(order),
                //     action: () => {},
                //     showAsAction: 'never'
                // }
            ];
        return BUTTONS;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isFailed) {
            this.props.navigator.pop({
                animated: true
            });
        } else if (nextProps.order && nextProps.order.isNew) {
            this.props.dispatch(orderActions.markOrderAsRead(nextProps.order));
        }
        let order = nextProps.order;

        console.log(nextProps.order);

        if (order) {
            const BUTTONS = this.getNavigatorButtons(order).reduce((acc, button) => button.isPresent ? [...acc, button] : acc, []);
            this.props.navigator.setTitle({title: `${CONSTANTS.ORDER_SCREEN_TITLE} #${order.incrementId}`});
            this.props.navigator.setButtons({
                rightButtons: BUTTONS.map(button => {
                    return {
                        id: button.id,
                        title: button.title,
                        showAsAction: button.showAsAction || 'ifRoom'
                    }
                })
            });
        }
    }
    componentWillUnmount() {
        this.props.dispatch(orderActions.resetOrder());
    }
    isOrderFulfilled(order) {
        return order.shippingInfo && order.shippingInfo.status === 'fulfilled';
    }
    isOrderPaid(order) {
        return order.billingInfo.status === 'paid';
    }
    markAsPaid() {
        this.props.dispatch(orderActions.markOrderAsPaid(this.props.order.id));
    }
    fulfillOrder() {
        let status = this.isOrderFulfilled(this.props.order) ? 'notFulfilled' : 'fulfilled';
        const getBiStatus = status => status === 'fulfilled' && status || 'not fulfilled';
        this.props.dispatch(orderActions.changeOrderShippingStatus(this.props.order.id, status));
        Observer.dispatch('onOrdersScrollTop');

    }
    markAsPaidAndFulfilled() {
        this.props.dispatch(orderActions.markOrderAsPaidAndFulfilled(this.props.order.id));
    }
    callUser() {
        this.props.dispatch(orderActions.contactBuyer('call', this.props.order.shippingInfo.address));
        phonecall(this.props.order.shippingInfo.address.phoneNumber, true);
    }
    emailUser() {
        email([this.props.order.shippingInfo.address.email], null, null, null, null);
    }
    engageUser() {
        this.props.dispatch(orderActions.contactBuyer('email', this.props.order.shippingInfo.address));
        !this.props.order.contactId ?
            this.emailUser()
            : this.props.navigator.push({
                title: this.props.order.userInfo.name || this.props.order.userInfo.email,
                screen: 'crm.inbox.Conversation',
                passProps: {
                    contactId: this.props.order.contactId
                }
            });
    }
    showOrderHistory() {
        this.setState({
            historyShowed: true
        });
    }
    hideOrderHistory() {
        this.setState({
            historyShowed: false
        });
        Platform.OS !== 'ios' ? this.scrollTo(this.scrollPosition) : {};
    }
    manageOrder() {
        if (!this.props.order) {
            return;
        }
        const BUTTONS = [
            {
                title: CONSTANTS.CANCEL_BUTTON,
                isPresent: true,
                action: () => {}
            },
            {
                title: CONSTANTS.ORDER_MANAGE_PAID,
                isPresent: !this.isOrderPaid(this.props.order),
                action: () => this.markAsPaid()
            },
            {
                title: CONSTANTS.ORDER_MANAGE_PAID_AND_FULFILLED,
                isPresent: !this.isOrderPaid(this.props.order) && !this.isOrderFulfilled(this.props.order),
                action: () => this.markAsPaidAndFulfilled()
            },
            {
                title: CONSTANTS.ORDER_MANAGE_FULFILLED,
                isPresent: this.isOrderPaid(this.props.order) && !this.isOrderFulfilled(this.props.order),
                action: () => this.fulfillOrder()
            },
            // {
            //     title: CONSTANTS.ORDER_MANAGE_SHIPPING_DETAILS,
            //     isPresent: this.isOrderPaid(this.props.order) && this.isOrderFulfilled(this.props.order),
            //     action: () => {}
            // },
            // {
            //     title: CONSTANTS.ORDER_MANAGE_PRIVATE_NOTE,
            //     isPresent: true,
            //     action: () => {}
            // }
        ];
        let buttons = BUTTONS.reduce((pr, button) => button.isPresent ? [...pr, button] : pr, []);
        (this.isOrderPaid(this.props.order) && this.isOrderFulfilled(this.props.order)) || confirmation({
            options: buttons.map(button => button.title),
            cancelButtonIndex: 0
        }, buttonIndex => {
            buttons[buttonIndex].action();
        });
    }

    getHistory() {
        const messages = (itemType) => ({
            DefaultHistoryItem: key => CONSTANTS.HISTORY_MESSAGES[key],
            MerchantComment: message => `${CONSTANTS.HISTORY_MESSAGES.COMMENT} "${message}"`
        }[itemType]);

        const show = (historyItem, index) => {
            return (
                <View key={index}>
                    <View style={styles.history.item}>
                        <Text style={styles.history.item.message}>
                            {messages(historyItem.itemType)(historyItem.message)}
                        </Text>
                        <Text style={styles.history.item.time}>
                            {moment(historyItem.date).format('MMM DD, YYYY [at] h:mm:ss A')}
                        </Text>
                    </View>
                    {index < this.props.order.history.length - 1 ?
                        <View style={styles.history.item.separator}></View>
                        : null
                    }
                </View>
            );
        };
        return (
            <View>
                {map(show)(_.orderBy(['date'])(['desc'])(this.props.order.history))}
            </View>
        );
    }
    scrollTo(y) {
        this.refs.view.scrollTo({y: y - deviceHeight + (Platform.OS === 'ios' ? 66 : 80)});
    }
    render() {
        if (this.props.isUpdating && !this.props.isSaving || !this.props.order) {
            return (
                <View style={loadingStyles.mainView}>
                    <ActivityIndicator
                      size='large'
                      style={{backgroundColor: 'transparent'}}
                    />
                </View>
            );
        }
        return (
            <View style={styles.wrapper}>
                <ScrollView
                  ref="view"
                  style={styles.scrollView}
                  onContentSizeChange={(x, y) => this.state.historyShowed ? this.scrollTo(y) : this.scrollPosition = y}
                >
                    <View style={OrderStyles('summary')}>
                        <Text style={OrderStyles('summary.total')}>
                            {CONSTANTS.ORDER_SUMMARY_TOTAL}: {`${symbolize(this.props.order.currency)}${formatPrice(this.props.order.totals.total, this.props.storeSettings)}`}
                        </Text>
                        <Text style={OrderStyles('summary.date')}>Placed on {moment(this.props.order.history[0].date).format('MMM DD, YYYY')}</Text>
                    </View>

                    <OrderStatusLine
                      isOrderFulfilled = {this.isOrderFulfilled(this.props.order)}
                      isOrderPaid = {this.isOrderPaid(this.props.order)}
                      order = {this.props.order}
                      onPress = {Platform.OS === 'ios' ? this.manageOrder.bind(this) : () => {}}
                    />

                    <OrderItemsList
                        items = {this.props.order.items}
                        currency = {symbolize(this.props.order.currency)}
                        storeSettings = {this.props.storeSettings}
                    />

                    <OrderTotals
                      order = {this.props.order}
                      formatPrice = {(settings => price => formatPrice(price, settings))(this.props.storeSettings)}
                      currency = {symbolize(this.props.order.currency)}
                    />

                    <OrderShippingInfo
                      shippingInfo    = {this.props.order.shippingInfo}
                      trackingInfo    = {this.props.order.trackingInfo}
                      deliveryInfo    = {this.props.order.deliveryInfo}
                      buyerNote    = {this.props.order.buyerNote}
                      onEngagePressed = {this.engageUser.bind(this)}
                      onPhonePressed  = {this.callUser.bind(this)}
                    />

                    <View style={[styles.history]}>
                        <View style={styles.history.header}>
                            <Text style={styles.history.header.title}>{CONSTANTS.ORDER_HISTORY}</Text>
                            <TouchableOpacity onPress={this.state.historyShowed ? this.hideOrderHistory.bind(this) : this.showOrderHistory.bind(this)}>
                                <Text style={styles.history.header.button}>{this.state.historyShowed ? CONSTANTS.ORDER_HISTORY_HIDE : CONSTANTS.ORDER_HISTORY_VIEW}</Text>
                            </TouchableOpacity>
                        </View>
                        {
                            this.state.historyShowed
                                ? this.getHistory()
                                : null
                        }
                    </View>
                </ScrollView>

                {this.props.isSaving && (<View style={styles.absolutePreloader}>
                    <ActivityIndicator size="large"/>
                </View>)}
            </View>
            );
    }
}

function mapStateToProps(state) {
    return {
        session: stateReader.getSession(state),
        order: stateReader.getOrder(state),
        isUpdating: stateReader.getOrderUpdateStatus(state),
        isSaving: stateReader.getOrderSavingStatus(state),
        storeSettings: stateReader.getSettings(state),
        isFailed: stateReader.isOrderFailed(state)
    };
}

export default connect(mapStateToProps)(OrderScreen);