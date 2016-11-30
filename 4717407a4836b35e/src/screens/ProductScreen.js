import React, {Component} from 'react';
import {
    Text,
    View,
    Switch,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    WebView,
    Dimensions,
    Platform
} from 'react-native';

import _ from 'lodash/fp';
import { connect } from 'react-redux';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { ConnectionStatusBar } from 'wix-react-native-error-components';
import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';
import ActivityIndicator from '../components/CommonActivityIndicator';
import Carousel from '../components/Carousel';

import { symbolize } from 'currency-symbol.js';

import * as stateReader from '../reducers/stateReader';

import { loadProductDetails, editProduct} from '../actions/productActions';
import { getCommands, resetEditProduct }  from '../actions/editProductActions';

import productStyles from '../styles/ProductScreenStyles';
import buttonsBuilder from '../utils/buttonsBuilder';
import confirmation from '../utils/confirmation';

import * as CONSTANTS from '../utils/constants';
import { formatPrice, prodCollections, getInventoryStatus, media } from '../selectors/productSelectors';

import EditForm from '../components/EditForm';

class ProductScreen extends Component {
    static navigatorButtons = {
        ...(Platform.OS === 'ios' ? {
            rightButtons: [{
                title: CONSTANTS.EDIT_BUTTON,
                id: CONSTANTS.EDIT_BUTTON
            }]
        } : {
            rightButtons: [{
                title: CONSTANTS.EDIT_BUTTON,
                id: CONSTANTS.EDIT_BUTTON,
                icon: require('../assets/edit.png')
            }, {
                title: CONSTANTS.DELETE_PRODUCT_BUTTON,
                id: CONSTANTS.DELETE_BUTTON,
                showAsAction: 'never'
            }]
        })
    };
    constructor(props) {
        super(props);

        this.state = {
            editMode: false
        };

        this.props.loadProductDetails(props.productId);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }
    componentWillReceiveProps(nextProps){
        if (nextProps.isFailed || !nextProps.product && !nextProps.isUpdating) {
            this.props.navigator.pop({
                animated: true
            });
        }

        if(!nextProps.isSaving && this.props.isSaving && nextProps.product) {
            this.switchEditMode(false);
        }
    }
    onNavigatorEvent(event){
        switch (event.id) {
            case CONSTANTS.EDIT_BUTTON:
                return this.switchEditMode(true);
            case CONSTANTS.CANCEL_BUTTON:
            case CONSTANTS.CANCEL_NAVIGATOR_BUTTON:
                return this.onCancel();
            case CONSTANTS.HARDWARE_BACK_NAVIGATOR_BUTTON:
            case CONSTANTS.BACK_NAVIGATOR_BUTTON:
                return this.androidCancel();
            case CONSTANTS.DONE_BUTTON:
                return this.onDoneEditing();
            case CONSTANTS.DELETE_BUTTON:
                return this.deleteProduct();
        }
    }
    androidCancel(){
        if (this.state.editMode) {
            this.onCancel();
        } else {
            this.props.navigator.pop();
        }
    }
    onCancel() {
        if(this.props.commands && this.props.commands.length) {
            confirmation({
                    message: Platform.OS === 'ios' ? undefined : CONSTANTS.DISCARD_CHANGES_TITLE,
                    options: [Platform.OS === 'ios' ? CONSTANTS.DISCARD_CHANGES_BUTTON : CONSTANTS.OK_BUTTON, CONSTANTS.CANCEL_BUTTON],
                    cancelButtonIndex: 1,
                    destructiveButtonIndex: 0
                },
                buttonIndex => {
                    if (buttonIndex == 0) {
                        this.props.resetEditProduct();
                        this.switchEditMode(false);
                    }
                });
        } else {
            this.switchEditMode(false);
        }
    }
    changeTitle(title){
        this.props.navigator.setTitle({
            title: title
        });
    }
    onDoneEditing(){
        const form = this.refs.editForm.getWrappedInstance();
        if (form.validate() && this.props.commands && this.props.commands.length) {
            form.saveForm();
            this.switchEditMode(false, true, true);
        } else if(!this.props.commands || !this.props.commands.length) {
            this.switchEditMode(false);
        }
    }
    switchEditMode(isEdit, disabled, keepButtons){
        if (isEdit || keepButtons) {
            this.props.navigator.setButtons(buttonsBuilder({
                ...(Platform.OS !== 'ios' ? {
                    leftButton: {
                        title: CONSTANTS.CANCEL_NAVIGATOR_BUTTON,
                        id: CONSTANTS.CANCEL_NAVIGATOR_BUTTON
                    }
                } : {
                    leftButtons: [{
                        title: CONSTANTS.CANCEL_BUTTON,
                        id: CONSTANTS.CANCEL_BUTTON,
                        disabled
                    }],
                }),
                rightButtons: [{
                    title: Platform.OS === 'ios' ? CONSTANTS.DONE_BUTTON : CONSTANTS.SAVE_BUTTON,
                    id: CONSTANTS.DONE_BUTTON,
                    disabled
                }],
                animated: true
            }));
            this.props.editProduct(this.props.productId);
        } else {
            this.props.navigator.setButtons(buttonsBuilder({
                ...(Platform.OS !== 'ios' ? {
                    leftButton: {
                        title: CONSTANTS.BACK_NAVIGATOR_BUTTON,
                        id: CONSTANTS.BACK_NAVIGATOR_BUTTON
                    },
                    rightButtons: [{
                        title: CONSTANTS.EDIT_BUTTON,
                        id: CONSTANTS.EDIT_BUTTON,
                        icon: require('../assets/edit.png')
                    }, {
                        title: CONSTANTS.DELETE_PRODUCT_BUTTON,
                        id: CONSTANTS.DELETE_BUTTON,
                        showAsAction: 'never'
                    }]
                } : {
                    leftButtons: [],
                    rightButtons: [{
                        title: CONSTANTS.EDIT_BUTTON,
                        id: CONSTANTS.EDIT_BUTTON
                    }]
                }),
                animated: false
            }));
        }

        this.setState({
            editMode: isEdit,
        });

        this.changeTitle(isEdit ? CONSTANTS.EDIT_PRODUCT : CONSTANTS.PRODUCT_DETAILS);
    }
    deleteProduct(){
        const form = this.refs.editForm.getWrappedInstance();
        form && form.deleteProduct();
    }
    getItemAmount(currency, price, settings){
        let {status, showStatus, quantity} = getInventoryStatus(this.props.product);

        return (
            <View style={productStyles.iaContainer.wrapper.get(!!(this.props.product.description && this.props.product.description))}>
                <Text style={productStyles.iaContainer.price.get(status)}>
                    {`${symbolize(currency)}${formatPrice(+price, settings)}`}
                </Text>
                <View style={productStyles.iaContainer.vLine}></View>
                {
                    showStatus
                    ? <Text style={productStyles.iaContainer.inventoryStatus.get(status)}>{CONSTANTS.STOCK_OPTIONS[status]}</Text>
                    : <Text style={productStyles.iaContainer.inventoryStatus.get('in_stock')}>{`${quantity} ${CONSTANTS.PRODUCT_ITEM_IN_STOCK}`}</Text>
                }
            </View>
        )
    }
    getProductImages(){
        if(this.props.media && this.props.media.length) {
            return <Carousel media={this.props.media} ribbon={this.props.product.ribbon}/>
        } else {
            return (
              <View style={productStyles.photoGallery.noMedia}>
                    <Image style={productStyles.photoGallery.noMedia.placeHolder} source={require('../assets/emptyStates/Placeholder.png')}/>
                    {this.props.product.ribbon && !this.state.editMode ? (
                        <View style={productStyles.photoGallery.ribbonCont}>
                            <Text style={productStyles.photoGallery.ribbonCont.text}>{this.props.product.ribbon}</Text>
                        </View>
                    ) : null}
              </View>);
        }
    }
    render() {
        if (this.props.isUpdating && !this.props.isSaving || !this.props.product) {
            return (
                <View style={productStyles.flexPreloader}>
                    <ActivityIndicator
                      size="large"
                      style={{backgroundColor: 'transparent'}}
                    />
                </View>
            );
        }
        return this.state.editMode
            ? this.renderEditMode()
            : this.renderViewMode();
    }
    renderEditMode(){
        return (
            <View style={productStyles.viewWrapper}>
                <KeyboardAwareScrollView
                    style={productStyles.viewWrapper.sv}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps={true}
                    scrollOffset = {20}
                    getTextInputRefs={() => this.refs.editForm.getWrappedInstance().allRefs}
                >
                    <EditForm
                        mode="edit"
                        onSubmit={this.onDoneEditing.bind(this)}
                        navigator={this.props.navigator}
                        ref="editForm"
                    />
                </KeyboardAwareScrollView>
                {this.props.isSaving && (
                    <View style={productStyles.preloader}>
                        <ActivityIndicator size="large"/>
                    </View>
                )}
            </View>
        )
    }
    renderViewMode(){
        return (
            <View style={productStyles.viewWrapper}>
                <ScrollView style={productStyles.viewWrapper.sv}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps={true}
                >
                    <View style={productStyles.viewWrapper.sv.imageContainer}>
                        {this.getProductImages()}
                    </View>
                    <View style={productStyles.viewWrapper.container}>
                        <View style={productStyles.viewWrapper.sv.titleSection.cont.get(() => (!!(this.props.product.description && this.props.product.description != "")))}>
                            <Text numberOfLines={1} style={productStyles.viewWrapper.sv.titleSection.name}>{this.props.product.name.replace(/\s\s+/g, ' ')}</Text>
                            {this.props.product.collections && this.props.product.collections.length ? (
                                <Text style={productStyles.viewWrapper.sv.titleSection.coll}>
                                    {`${CONSTANTS.COLLECTION_TITLE}${this.props.product.collections.length >1 ? 's' : ''}: ${this.props.product.collections.map(i => i.name).join(', ')}`}
                                </Text>
                            ) : null}
                        </View>
                        {this.getItemAmount(
                            this.props.settings.currency,
                            this.props.product.price,
                            this.props.settings,
                            this.props.product.inventory,
                            this.props.product.managedProductItemsSummary
                        )}
                        {this.props.product.description && this.props.product.description != "" ? (
                          <View style={productStyles.viewWrapper.sv.description}>
                              <Text
                                ref={(r) => {this._description = r}}
                                style={productStyles.viewWrapper.sv.description.text}
                                numberOfLines={3}
                              >{this.props.product.description}</Text>
                          </View>
                        ) : null}
                    </View>
                    <View style={productStyles.viewWrapper.sv.paddingContainer}>
                        <View style={productStyles.viewWrapper.sep}></View>
                    </View>
                    <EditForm
                        mode="view"
                        ref="editForm"
                        navigator={this.props.navigator}
                        onSubmit={this.onDoneEditing.bind(this)}
                    />
                </ScrollView>
                {this.props.isSaving && (
                    <View style={productStyles.preloader}>
                        <ActivityIndicator size="large"/>
                    </View>
                )}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        session: stateReader.getSession(state),
        product: stateReader.getProduct(state),
        isUpdating: stateReader.getProductUpdateStatus(state),
        isSaving: stateReader.getProductSavingStatus(state),
        newProductIds: stateReader.getNewProductIds(state),
        settings: stateReader.getSettings(state),
        media: media(state),
        commands: getCommands(state),
        isFailed: stateReader.isProductFailed(state)
    };
}

export default connect(
    mapStateToProps,
    {
        loadProductDetails,
        editProduct,
        resetEditProduct
    }
)(ProductScreen);
