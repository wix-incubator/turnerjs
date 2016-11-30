import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import Observer from '../utils/Observer';
import * as CONSTANTS from '../utils/constants';
import styles from '../styles/EditStyles';

class VariantStatusScreen extends Component {

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }
  onNavigatorEvent(event){
    switch (event.id) {
      case CONSTANTS.HARDWARE_BACK_NAVIGATOR_BUTTON:
      case CONSTANTS.CANCEL_NAVIGATOR_BUTTON:
        return this.props.navigator.pop();
    }
  }
  changeVariant(status) {
    this.props.navigator.pop();

    Observer.dispatch(
      'onVariantStatusChanged',
      {
        variantKey: this.props.variantKey,
        status
      }
    );

  }

  render() {
    return <View style={styles('inventoryOptions')}>
      {['in_stock', 'out_of_stock'].map(o => (
        <TouchableOpacity onPress={() => {this.changeVariant(o)}} key={'k_' + o}>
          <View style={styles('collections.row')}>
            <Text style={styles('collections.row.text', this.props.status === o)}
                  numberOfLines={1}>{CONSTANTS.STOCK_OPTIONS[o]}
            </Text>
            {
              this.props.status === o ?
                <Image style={{width: 16.5, height: 14}} source={require('../assets/checkmark.png')}/>
                : null
            }
          </View>
        </TouchableOpacity>
      ))}
    </View>;
  }
}

export default VariantStatusScreen