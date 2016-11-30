import _ from 'lodash/fp';
import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    Switch,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform
} from 'react-native';

import { symbolize } from 'currency-symbol.js';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as EditProductActions from '../actions/editProductActions';
import * as stateReader from '../reducers/stateReader';
import confirmation from '../utils/confirmation';

import { InputBox } from './dumb/InputBox';
import { EditFormLine } from './dumb/EditFormLine';
import { FileFormLine } from './dumb/FileFormLine';
import { ToggleFormLine } from './dumb/ToggleFormLine';
import { MultilineTextFormLine } from './dumb/MultilineTextFormLine';
import { PhotoLine } from './dumb/PhotoLine';

import newStyles from '../styles/EditStyles';

import * as CONSTANTS from '../utils/constants';

function showInMode(modes, component) {
    return function(mode, optionalFlag = true){
        return !!~modes.indexOf(mode) && optionalFlag ? component : null
    }
}

const titles = {
    collections: 'Collections',
    inventory: 'Inventory',
    description: 'Description',
    discount: 'Discount'
};

class EditForm extends Component {
    constructor(props) {
        super(props);
    }

    changeValue(prop, value){
        this.props.onChangeProperty(prop, value, (this.props.mode === 'view'));
    }
    openEditScreen(comp){
        this.props.navigator.push({
            title: titles[comp],
            screen: "wix.merchant.EditScreen",
            backButtonTitle: CONSTANTS.BACK_BUTTON,
            overrideBackPress: true,
            passProps: {
                component: comp,
                mode: this.props.mode
            },
            tabBarHidden: true
        });
    }
    deleteProduct(){
        confirmation({
                message: Platform.OS === 'ios' ? undefined : CONSTANTS.DELETE_PRODUCT_TITLE,
                options: [Platform.OS === 'ios' ? CONSTANTS.DELETE_PRODUCT_BUTTON : CONSTANTS.OK_BUTTON, CONSTANTS.CANCEL_BUTTON],
                cancelButtonIndex: 1,
                destructiveButtonIndex: 0
            },
            buttonIndex => {
                if (buttonIndex == 0) {
                    this.props.onDeleteProduct();
                }
            });
    }
    saveForm(){
        this.props.saveEditedProduct();
    }
    validate(shouldFocusFirstField = true){
        const isValid = this.getRefs().map(f => f.validate()).every(v => v);

        if(!isValid && shouldFocusFirstField) {
            const failed = this.getRefs().find(f => !f.isValid);
            failed && failed.focus();
        }

        return isValid;
    }
    get allRefs (){
        return this.getRefs().map(f => f.field);
    }
    getRefs (){
        return [
            this.refs.name && this.refs.name,
            this.refs.price && this.refs.price,
            this.refs.ribbon && this.refs.ribbon
        ].filter(f => !!f);
    }
    blur() {
        this.getRefs().map(f => f.blur && f.blur());
    }
    buildLabel(){
        return this.props.product.discount.mode === 'PERCENT'
            ? this.props.product.discount.value + '%'
            : symbolize(this.props.settings.currency) + this.props.product.discount.value
    }
    render() {
        if (!this.props.product) return (<View></View>);
        return (
            <View style={newStyles('viewWrapper')}>
                {showInMode(['create', 'edit'], (
                    <PhotoLine media={this.props.product.media} onPress={() => this.openEditScreen('media')}/>
                ))(this.props.mode)}

                <View style={newStyles('viewWrapper.padContainer', this.props.mode)}>
                    <View style={newStyles('viewWrapper.aPadContainer')}>
                        {showInMode(['create', 'edit'], (
                          <InputBox
                            label={CONSTANTS.PRODUCT_EDIT_FORM_NAME}
                            name="name"
                            onChange={(field, text) => { this.changeValue('name', text) }}
                            value={this.props.product.name}
                            maxLength={50}
                            required={true}
                            validateOnChange={true}
                            ref="name"
                            onSubmitEditing={() =>  this.refs.price && this.refs.price.focus()}
                          />
                        ))(this.props.mode)}
                        {showInMode(['create', 'edit'], (
                          <View style={newStyles('viewWrapper.flexRow')}>
                              <InputBox
                                label={CONSTANTS.PRODUCT_EDIT_FORM_PRICE}
                                name="price"
                                onChange={(field, text) => { this.changeValue('price', text) }}
                                value={'' + this.props.product.price}
                                position="left"
                                keyboardType="numeric"
                                inputSymbol={symbolize(this.props.settings.currency)}
                                required={true}
                                validateOnChange={true}
                                ref="price"
                                onSubmitEditing={() => this.refs.ribbon && this.refs.ribbon.focus()}
                              />
                              <InputBox
                                label={CONSTANTS.PRODUCT_EDIT_FORM_RIBBON}
                                name='ribbon'
                                onChange={(field, text) => { this.changeValue('ribbon', text) }}
                                value={this.props.product.ribbon}
                                position="right"
                                maxLength={20}
                                ref="ribbon"
                                onSubmitEditing={() => this.refs.name && this.refs.name.focus()}
                              />
                          </View>
                        ))(this.props.mode)}
                        {showInMode(['edit', 'create'], (
                          <MultilineTextFormLine
                            onPress = {() => { this.openEditScreen('description'); }}
                            title = {CONSTANTS.PRODUCT_EDIT_FORM_DESCRIPTION}
                            text={ this.props.product.description || "" }
                            actionText = { 'Add' }
                          />
                        ))(this.props.mode)}
                    </View>
                    {showInMode(['view'], (
                      <FileFormLine
                        onPress = {() => {}}
                        title = {(
                            this.props.product.fileItems &&
                            this.props.product.fileItems.length ?
                            this.props.product.fileItems[0].fileName :
                            ''
                        )}
                        actionText = {""}
                      />
                    ))(this.props.mode, this.props.product.fileItems && this.props.product.fileItems.length)}
                    {showInMode(['edit', 'create'], (
                        <EditFormLine
                            onPress = {() => { this.openEditScreen('collections'); }}
                            title = {CONSTANTS.COLLECTION_BUTTON}
                            actionText = { this.props.product.collections.length ? this.props.product.collections.map(i => i.name).join(', ') : 'Add' }
                        />
                    ))(this.props.mode)}
                    {showInMode(['view', 'create'], (
                        <EditFormLine
                            onPress = {() => { this.openEditScreen('discount'); }}
                            title = {CONSTANTS.DISCOUNT_TITLE}
                            actionText = { this.props.product.discount.value ? `${this.buildLabel()} OFF` : CONSTANTS.NO_DISCOUNT }
                        />
                    ))(this.props.mode)}
                    {showInMode(['view', 'create'], (
                        <EditFormLine
                            onPress = {() => { this.openEditScreen('inventory'); }}
                            title = {CONSTANTS.PRODUCT_EDIT_FORM_INVENTORY}
                            actionText = { CONSTANTS.MANAGE_BUTTON }
                        />
                    ))(this.props.mode)}
                    {showInMode(['view', 'create'], (
                        <ToggleFormLine
                            onChange = {(value) => {this.changeValue('isVisible', value)}}
                            title = {CONSTANTS.PRODUCT_ITEM_SHOW_PRODUCT}
                            value = { this.props.product.isVisible }
                        />
                    ))(this.props.mode)}
                </View>
                {Platform.OS === 'ios' ? showInMode(['edit'], (
                    <View style={newStyles('viewWrapper.paddingIosHor')}>
                        <TouchableOpacity activeOpacity={.7} onPress={() => { this.deleteProduct() }} style={newStyles('viewWrapper.paddingIosVer')}>
                            <Text style={newStyles('viewWrapper.deleteButton')}>{CONSTANTS.DELETE_PRODUCT_BUTTON}</Text>
                        </TouchableOpacity>
                    </View>
                ))(this.props.mode) : null}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        baseProduct: stateReader.getProduct(state),
        product: stateReader.getEditedProduct(state),
        settings: stateReader.getSettings(state)
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(EditProductActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(EditForm);
