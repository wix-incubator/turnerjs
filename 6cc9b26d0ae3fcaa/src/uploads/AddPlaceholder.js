import React, {Component, PropTypes} from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity, Image
} from 'react-native';

export default class AddPlaceholder extends Component {
  static propTypes = {
    onPress: PropTypes.func
  };

  render() {
    return (
      <TouchableOpacity style={styles.container} onPress={this.props.onPress}>
        <Image style={styles.inner} source={require('./img/add.png')}/>
      </TouchableOpacity>
    );
  }
}

const size = Math.floor((Dimensions.get('window').width - 28) / 3);
const innerSize = size - 10;

const styles = StyleSheet.create({
  container: {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inner: {
    width: innerSize,
    height: innerSize,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
