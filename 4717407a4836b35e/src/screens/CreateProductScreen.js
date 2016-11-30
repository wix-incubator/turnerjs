import React, {Component} from 'react';
import {
    View,
    Keyboard,
    Platform
} from 'react-native';

import _ from 'lodash/fp';

import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

import * as stateReader from '../reducers/stateReader';
import productStyles from '../styles/ProductScreenStyles';
import { media } from '../selectors/productSelectors';

import ActivityIndicator from '../components/CommonActivityIndicator';

import * as CONSTANTS from '../utils/constants';
import buttonsBuilder from '../utils/buttonsBuilder';
import confirmation from '../utils/confirmation';
import Observer from '../utils/Observer';

import { createNewProduct, getCommands }  from '../actions/editProductActions';

import EditForm from '../components/EditForm';

class CreateProductScreen extends Component {
    static navigatorButtons = buttonsBuilder({
        rightButtons: [{
            title: CONSTANTS.DONE_BUTTON,
            id: CONSTANTS.DONE_BUTTON
        }],
        ...(Platform.OS === 'ios' ? {
                leftButtons: [{
                    title: CONSTANTS.CANCEL_BUTTON,
                    id: CONSTANTS.CANCEL_BUTTON
                }]
            } : {
                leftButton: {
                    title: CONSTANTS.CANCEL_NAVIGATOR_BUTTON,
                    id: CONSTANTS.CANCEL_NAVIGATOR_BUTTON
                }
            }
        )
    });

    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        this.keyboardIsOpened = false;
    }
    componentWillMount() {
        this.props.createNewProduct();
    }

    componentWillUnmount() {
        this.keyboardListeners.forEach((listener) => listener.remove());
    }

    componentDidMount() {

        this.keyboardListeners = [
            Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this)),
            Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
        ];

    }
    keyboardWillShow(){

        this.keyboardIsOpened = true;

    }
    keyboardDidHide(){

        this.keyboardIsOpened = false;

        if (this.waitingForGoingBack) {
            this.goBack();
            this.waitingForGoingBack = false;
        }

    }
    componentWillReceiveProps(nextProps){
        if (nextProps.isProductSaving && !this.props.isProductSaving) {
            this.switchButtonMode(true)
        } else if (!nextProps.isProductSaving && this.props.isProductSaving) {
            Observer.dispatch('onScrollTop');
            this.goBack();
        }
    }
    switchButtonMode(isDisabled){
        this.props.navigator.setButtons(buttonsBuilder({
            rightButtons: [{
                title: CONSTANTS.DONE_BUTTON,
                id: CONSTANTS.DONE_BUTTON,
                disabled: isDisabled
            }],
            ...(Platform.OS === 'ios' ? {
                    leftButtons: [{
                        title: CONSTANTS.CANCEL_BUTTON,
                        id: CONSTANTS.CANCEL_BUTTON,
                        disabled: isDisabled
                    }]
                } : {
                    leftButton: {
                        title: CONSTANTS.CANCEL_NAVIGATOR_BUTTON,
                        id: CONSTANTS.CANCEL_NAVIGATOR_BUTTON
                    }
                }
            )
        }));
    }
    onNavigatorEvent(event){
        switch (event.id) {
            case CONSTANTS.CANCEL_BUTTON:
            case CONSTANTS.CANCEL_NAVIGATOR_BUTTON:
            case CONSTANTS.HARDWARE_BACK_NAVIGATOR_BUTTON:
                return this.onCancelMode();
            case CONSTANTS.DONE_BUTTON:
                return this.onDoneEditing();
        }
    }
    onCancelMode(){
        if(this.props.commands && this.props.commands.length > 1) {
            confirmation({
                    message: Platform.OS === 'ios' ? undefined : CONSTANTS.DISCARD_CHANGES_TITLE,
                    options: [Platform.OS === 'ios' ? CONSTANTS.DISCARD_CHANGES_BUTTON : CONSTANTS.OK_BUTTON, CONSTANTS.CANCEL_BUTTON],
                    cancelButtonIndex: 1,
                    destructiveButtonIndex: 0
                },
                buttonIndex => {
                    if (buttonIndex == 0) {
                        this.goBack();
                    }
                });
        } else {
            this.goBack();
        }
    }
    goBack(){
        if (!this.keyboardIsOpened) {
            this.props.navigator.dismissModal();
        } else {
            this.refs.editForm.getWrappedInstance().blur();
            this.waitingForGoingBack = true;
        }
    }
    onDoneEditing(){
        const form = this.refs.editForm.getWrappedInstance();
        form.validate() && form.saveForm();
    }
    render() {
        if (!this.props.product) return <View></View>
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
                        mode="create"
                        onSubmit={this.onDoneEditing.bind(this)}
                        navigator={this.props.navigator}
                        ref="editForm"
                    />
                </KeyboardAwareScrollView>
                {this.props.isProductSaving && (
                    <View style={productStyles.preloader}>
                        <ActivityIndicator size="large" style={{backgroundColor: 'transparent'}}/>
                    </View>
                )}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        product: stateReader.getEditedProduct(state),
        isProductSaving: stateReader.getProductSavingStatus(state),
        media: media(state),
        commands: getCommands(state)
    };
}

export default connect(mapStateToProps, { createNewProduct })(CreateProductScreen);