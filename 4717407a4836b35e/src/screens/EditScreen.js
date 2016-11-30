import React, {Component} from 'react';
import {
  Text,
  View,
  Switch,
  TextInput,
  Platform,
  Keyboard
} from 'react-native';


import * as CONSTANTS from '../utils/constants';
import buttonsBuilder from '../utils/buttonsBuilder';
import _ from 'lodash';

import Collections from '../components/editForm/EditCollections';
import Inventory from '../components/editForm/EditInventory';
import Description from '../components/editForm/EditDescription';
import Discount from '../components/editForm/EditDiscount';
import Media from '../components/editForm/EditMedia';

import styles from '../styles/ProductViewStyles';

import Observer from '../utils/Observer';
import confirmation from '../utils/confirmation';

import { salePrice, getVariants } from '../selectors/productSelectors';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';
import * as productActionTypes from '../actionTypes/productActionTypes';
import * as EditProductActions from '../actions/editProductActions';

const fields = {
    description: {
        'description': {
            onEdit: (val, memory, product) => val !== memory
        }
    },
    discount: {
        'discount.value': {
            onEdit: (val, memory, product) => {
                return val !== (_.get(product, 'discount.mode') === 'PERCENT' ? _.get(product, 'price') * memory / 100 : memory);
            }
        }
    },
    collections: {
        'collections': {
            onEdit: (val, memory, product) => !_.isEqual(val, memory)
        }
    },
    media: {
        'media': {
            onEdit: (val, memory, product) => {
                return true;
            }
        }
    },
    inventory: {
        'inventory.trackingMethod': {
            onEdit: (val, memory, product, editedProduct) => {
                return val !== memory || !_.isEqual(product.managedProductItems, editedProduct.managedProductItems);
            }
        },
        'inventory.quantity' : {
            onEdit: (val, memory, product) => val !== memory
        },
        'inventory.status' : {
            onEdit: (val, memory, product) => val !== memory
        },
        'managedProductItems': {
            onEdit: (val, memory, product) => !_.isEqual(val, memory)
        }
    }
};

class EditScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }
    onNavigatorEvent(event){
        switch (event.id) {
            case CONSTANTS.CANCEL_BUTTON:
            case CONSTANTS.CANCEL_NAVIGATOR_BUTTON:
            case CONSTANTS.BACK_NAVIGATOR_BUTTON:
            case CONSTANTS.HARDWARE_BACK_NAVIGATOR_BUTTON:
                return this.onCancelMode();
            case CONSTANTS.DONE_BUTTON:
                return this.onDoneEditing();
        }
    }
    componentWillUnmount() {
        if (Platform.OS !== 'ios') this.keyboardListeners.forEach(listener => listener.remove());
    }
    componentDidMount() {
        if (Platform.OS !== 'ios') {
            this.keyboardListeners = [
                Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this))
            ];
        }

        this.memoryData = _.keys(fields[this.props.component])
            .reduce((acc, n) => (acc[n] = _.get( this.props.product, n), acc), {});
    }
    keyboardDidHide() {
        this.input && this.input.blur();
    }
    onCancelMode() {
        if(this.editMode) {
            this.input && this.input.blur();

            confirmation({
                  message: Platform.OS === 'ios' ? undefined : CONSTANTS.DISCARD_CHANGES_TITLE,
                  options: [Platform.OS === 'ios' ? CONSTANTS.DISCARD_CHANGES_BUTTON : CONSTANTS.OK_BUTTON, CONSTANTS.CANCEL_BUTTON],
                  cancelButtonIndex: 1,
                  destructiveButtonIndex: 0
              },
              buttonIndex => {
                  if (buttonIndex == 0) {
                      _.keys(this.memoryData).forEach(field => this.onChange(field, this.memoryData[field]));
                      this.props.navigator.pop();
                  }
              })
        } else this.props.navigator.pop();
    }
    onDoneEditing (value) {
        (this.props.mode === 'view') && this.props.saveEditedProduct();
        this.props.navigator.pop();
    }
    onEdit(isEdited, disabled){
        if (this.editMode === isEdited && (disabled === undefined)) return;

        if (!isEdited) {
            this.props.navigator.setButtons(buttonsBuilder({
                ...(Platform.OS === 'ios' ? {
                    leftButtons: []
                } : {
                    leftButton: {
                        id: CONSTANTS.BACK_NAVIGATOR_BUTTON,
                        color: '#ffffff'
                    }
                }),
                rightButtons: [],
                animated: false
            }));
        } else {
            this.props.navigator.setButtons(buttonsBuilder({
                ...(Platform.OS === 'ios' ? {
                    leftButtons: [{
                        title: CONSTANTS.CANCEL_BUTTON,
                        id: CONSTANTS.CANCEL_BUTTON
                    }]
                } : {
                    leftButton: {
                        id: CONSTANTS.CANCEL_NAVIGATOR_BUTTON,
                        color: '#ffffff'
                    }
                }),
                rightButtons: [{
                    title: CONSTANTS.DONE_BUTTON,
                    id: CONSTANTS.DONE_BUTTON,
                    disabled: disabled
                }],
                animated: false
            }));
        }
        this.editMode = isEdited;
    }
    onChange(field, changedContent, isValid = true){

        if (fields[this.props.component][field]) {
            const isEdited = fields[this.props.component][field].onEdit(changedContent, this.memoryData[field], this.props.baseProduct, this.props.product);
            this.onEdit(isEdited, !isValid);
        }

        this.props.onChangeProperty(field, changedContent);
    }
    setFocusedInput(textInput) {
        this.input = textInput;
    }
    collectionsRender(){
        return (
          <Collections
            selectedCollections={this.props.product.collections}
            onChange={changedContent => {
                this.onChange('collections', changedContent);
            }}
            onFocusInput={this.setFocusedInput.bind(this)}
          />
        );
    }
    inventoryRender(){
        return (
          <Inventory
            product={this.props.product}
            variants={this.props.variants}
            onChange={(field, changedContent) => {
                //console.log(changedContent);
                this.onChange(field, changedContent);
            }}
            onSubmit={this.onDoneEditing.bind(this)}
            onFocusInput={this.setFocusedInput.bind(this)}
            navigator={this.props.navigator}
          />
        );
    }
    descriptionRender(){
        return (
          <Description
            description={this.props.product.description}
            onChange={changedContent => {
                    this.onChange('description', changedContent);
                }}
            onSubmit={this.onDoneEditing.bind(this)}
            onFocusInput={this.setFocusedInput.bind(this)}
            ref="description"
          />
        );
    }
    discountRender(){
        return (
          <Discount
            symbol={this.props.settings.currency}
            originalPrice={this.props.product.price}
            discountMode={this.props.product.discount.mode}
            salePrice={this.props.salePrice}
            onChange={(field, changedContent, isValid) => {
                this.onChange(field, changedContent, isValid);
            }}
            onSubmit={this.onDoneEditing.bind(this)}
            onFocusInput={this.setFocusedInput.bind(this)}
          />
        );
    }
    mediaRender(){
        return (
            <Media
                onChange={(changedContent) => {
                    this.onChange('media', changedContent);
                }}
                media={this.props.product.media}
                isCreate={this.props.mode === 'create'}
            />
        )
    }
    render() {
        return (
          <View style={{flex: 1, backgroundColor: '#fff'}}>
              {this[this.props.component + 'Render']()}
          </View>)
    }
}

function mapStateToProps(state) {
    return {
        baseProduct: stateReader.getProduct(state),
        product: stateReader.getEditedProduct(state),
        settings: stateReader.getSettings(state),
        salePrice: salePrice(state),
        variants: getVariants(stateReader.getEditedProduct(state))
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(EditProductActions, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(EditScreen);