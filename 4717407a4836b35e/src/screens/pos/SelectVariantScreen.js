import React, {Component, PropTypes} from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback
} from 'react-native';

import {OptionLine} from '../../components/pos/OptionLine';
import {QuantityLine} from '../../components/pos/QuantityLine';

import * as posAction from '../../actions/posActions';
import _ from 'lodash';

import { connect } from 'react-redux';

import * as CONSTANTS from '../../utils/constants';

export class SelectVariantScreen extends Component {
  static navigatorButtons = {
    leftButtons: [{
      title: 'Cancel',
      id: 'cancel'
    }],
    rightButtons: [{
      title: 'Done',
      id: 'done'
    }]
  };
  
  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      selectedOptions: {},
      quantity: 1
    }
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'done':
        this.addToCart();
        return this.props.navigator.pop();
      case 'cancel':
        return this.props.navigator.pop();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.product && nextProps.product) {
      let selectedOptions = nextProps.product.options.options.reduce((acc, option, index) => {
        acc[index] = option.selections[0].id;
        return acc;
      }, {});
      this.setState({selectedOptions});
    }
  }

  getSelectedOptions() {
    return _.values(this.state.selectedOptions);
  }

  addToCart() {
    let i = _.findIndex(this.props.product.managedProductItems, (variant) => _.isEqual(variant.optionsSelections, this.getSelectedOptions()));
    let variantSurcharge = !!~i ? this.props.product.managedProductItems[i].surcharge : 0;

    this.props.dispatch(posAction.addProductToLocalCart(this.props.productId, this.state.quantity > this.getQuantity() ? this.getQuantity() : this.state.quantity, this.getSelectedOptions(), variantSurcharge));
  }

  getQuantity() {
    let i = _.findIndex(this.props.product.managedProductItems, (variant) => _.isEqual(variant.optionsSelections, this.getSelectedOptions()));
    if (this.props.product.inventory.trackingMethod === 'quantity') {
      return !!~i ? this.props.product.managedProductItems[i].inventory.quantity : 0;
    } else {
      return !!~i ? 0 : 99999;
    }
  }

  setQuantity(quantity) {
    this.setState({quantity});
    this._quantityLine.changeValue(quantity);
  }

  render() {
    return this.props.product
        ? <ScrollView style={{flex: 1, backgroundColor: '#fff', flexDirection: 'column'}}>
          {
            (this.props.product.options.options.map((option, index) => {
              return <View key={index}>
                <View style={{backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingBottom: 0, paddingTop: 10, flex: 1}}>
                  <Text style={{fontSize: 14, fontWeight: '400', color: '#7a92a5', lineHeight: 17}}>{option.title}</Text>
                </View>
                {
                  option.selections.map((selection, selectionIndex) => {
                    return <OptionLine
                      key={selection.id}
                      id={selection.id}
                      type={option.optionType}
                      value={selection.value}
                      description={selection.description}
                      isSelected={this.state.selectedOptions[index] === selection.id}
                      onPress={() => {this.setState({selectedOptions: {...this.state.selectedOptions, [index]: selection.id}})}}
                      isLast={option.selections.length - 1 === selectionIndex }
                    />
                  })
                }
              </View>
            }))
          }
          <View>
            <View style={{backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingBottom: 8, paddingTop: 10, flex: 1}}>
              <Text style={{fontSize: 14, fontWeight: '400', color: '#7a92a5', lineHeight: 17}}>Quantity</Text>
            </View>
            <QuantityLine
              ref={(field) => this._quantityLine = field}
              value={this.state.quantity}
              onChange={this.setQuantity.bind(this)}
              maxQuantity={this.getQuantity()}
            />
          </View>
        </ScrollView>
        : <View style={{flex: 1, backgroundColor: '#fff'}}>
          <ActivityIndicator
            size='large'
            style={{backgroundColor: 'transparent'}}
          />
        </View>;
  }
}

function mapStateToProps(state) {
  return {
    product: state.pos.selectedProduct
  };
}

export default connect(mapStateToProps)(SelectVariantScreen);