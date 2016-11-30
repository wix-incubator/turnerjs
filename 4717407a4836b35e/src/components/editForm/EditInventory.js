import React, {Component} from 'react';
import ReactNative, {
  Text,
  View,
  ListView,
  Switch,
  Platform
} from 'react-native';

import _ from 'lodash/fp';

import * as CONSTANTS from '../../utils/constants';
import styles from '../../styles/EditInventoryStyles';

import { changeDeepProperty } from '../../utils/builders/DeepPropertyChanger';

import { VariantInputFormLine } from '../dumb/VariantInputFormLine';
import { InputBox } from '../dumb/InputBox';
import { EditFormLine } from '../dumb/EditFormLine';

import Observer from '../../utils/Observer';

const defaultVariant = ({quantity, status, optionsSelections = []}) => {
  return {
    inventory: {
      quantity: quantity || 0,
      status: status || "in_stock"
    },
    optionsSelections: optionsSelections,
    visibility: 'visible'
  }
};

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class EditInventory extends Component {
  constructor(props){
    super(props);
  }

  componentWillMount(){
    this.onVariantStatusChanged = Observer.subscribe('onVariantStatusChanged', ({variantKey, status}) => {
      variantKey && this.changeVariant({optionsSelections: this.props.variants[variantKey].optionsSelections, status});
      !variantKey && this.changeValue({status});
    });
  }

  componentWillUnmount(){
    this.onVariantStatusChanged.remove();
  }

  changeValue({trackingMethod, quantity, status}){
    (trackingMethod !== undefined) && this.props.onChange('inventory.trackingMethod', trackingMethod);
    (quantity !== undefined) && this.props.onChange('inventory.quantity', quantity);
    (status !== undefined) && this.props.onChange('inventory.status', status);
  }

  changeVariant({optionsSelections, quantity, status}) {
    let changed;

    const res = _.compose(
      _.find(v => _.isEqual(v[1].optionsSelections, optionsSelections)),
      _.toPairs
    )(this.props.product.managedProductItems);


    if (!res) {
      changed = {
        ...this.props.product.managedProductItems,
        [_.keys(this.props.product.managedProductItems).length]: defaultVariant({quantity, optionsSelections, status})
      }
    } else {
      const index = res[0];
      (quantity !== undefined) && (changed = changeDeepProperty(`${index}.inventory.quantity`, quantity, this.props.product.managedProductItems));
      (status !== undefined) && (changed = changeDeepProperty(`${index}.inventory.status`, status, this.props.product.managedProductItems));
    }

    this.props.onChange('managedProductItems', changed);
  }

  openVariantStatusScreen({variantKey, status}) {
    this.props.navigator.push({
      title: 'Inventory Options',
      screen: "wix.merchant.VariantStatusScreen",
      backButtonTitle: CONSTANTS.BACK_BUTTON,
      overrideBackPress: true,
      passProps: {
        variantKey: variantKey,
        status: status
      },
      tabBarHidden: true
    });
  }

  scrollToSelectedField(field) {
    const offset = this.listViewLayout.y || 0;
    const topBarHeight = 66;
    this.refs.listView.scrollResponderScrollNativeHandleToKeyboard(
      ReactNative.findNodeHandle(field),
      offset + topBarHeight,
      true
    );
  }

  renderRow(variant, key, index) {
    const {
      inventory: {
        quantity,
        trackingMethod,
        }
      } = this.props.product;

    return trackingMethod === 'quantity' ? (
      <View style={styles.viewWrapper.variant} key={key}>
        <VariantInputFormLine
          onChange = {(field, val) => {
                    this.changeVariant({optionsSelections: variant.optionsSelections, quantity: val});
                  }}
          title = {variant.description.join(' | ')}
          value = {`${variant.inventory.quantity}`}
          onFocus = {field => this.scrollToSelectedField(field)}
        />
      </View>
    ) : (
      <EditFormLine
        key={key}
        onPress = {() => this.openVariantStatusScreen({variantKey: index, status: variant.inventory.status})}
        title = {variant.description.join(' | ')}
        multilineTitle = {true}
        actionTextColor = {variant.inventory.status === 'out_of_stock' ? '#f00' : ''}
        actionText={CONSTANTS.STOCK_OPTIONS[variant.inventory.status]}
      />
    );
  }
  getDataSource(){
    return ds.cloneWithRows(this.props.variants);
  }
  render(){
    const {
      inventory: {
        quantity,
        trackingMethod,
        status
        },
      manageProductItems
      } = this.props.product;


    return (
      <View style={styles.viewWrapper}>
        <View style={styles.viewWrapper.trackInventory}>
          <Text style={styles.viewWrapper.trackInventory.label}>Update Inventory Amount</Text>
          <Switch onValueChange={value => {
                    this.changeValue({
                        trackingMethod: value ? 'quantity' : 'status'
                    });
                }} value={!(trackingMethod === 'status')} onTintColor="#7fccf7"/>
        </View>
        <View style={styles.viewWrapper.separator}></View>
        {!(trackingMethod === 'status') && !(manageProductItems === 'enabled') ? (
          <View style={styles.viewWrapper.listView}>
            <View style={styles.viewWrapper.variant}>
              <InputBox
                label={CONSTANTS.PRODUCT_EDIT_FORM_INVENTORY}
                name="quantity"
                onChange={(field, text) => {
                                this.changeValue({
                                    quantity: text
                                });
                              }}
                value={`${quantity}`}
                maxLength={5}
                keyboardType={'numeric'}
                ref="name"
              />
            </View>
          </View>
        ) : !(manageProductItems === 'enabled') ? (
          <View style={styles.viewWrapper.listView}>
            <EditFormLine
              onPress = {() => this.openVariantStatusScreen({status: status})}
              title = {CONSTANTS.PRODUCT_EDIT_FORM_INVENTORY}
              actionText={CONSTANTS.STOCK_OPTIONS[status]}
              actionTextColor = {status === 'out_of_stock' ? '#f00' : ''}
            />
          </View>
        ) : null}
        { manageProductItems === 'enabled' ? (
          <ListView
            style={styles.viewWrapper.listView}
            getTextInputRefs={() => this.varsInputs || []}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps={true}
            dataSource={this.getDataSource()}
            renderRow={this.renderRow.bind(this)}
            pageSize={20}
            onLayout = {({nativeEvent:{layout: layout}}) => {
              this.listViewLayout = layout;
            }}
            ref="listView"
            automaticallyAdjustContentInsets={false}
          />
        ) : null}
      </View>
    )
  }
}

export default EditInventory;