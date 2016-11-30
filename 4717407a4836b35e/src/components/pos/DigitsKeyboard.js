import React, {Component, PropTypes} from 'react';
import {Text, View, Image, TouchableOpacity } from 'react-native';

import * as CONSTANTS from '../../utils/constants';

const styles = {
  line: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 20
  },
  text: {
    fontSize: 27,
    color: '#43515c',
    fontWeight: '300'
  }
};

export const DigitsKeyboard = (props) => {
  return  <View style={{flexDirection:'column', flex: 1, justifyContent: 'space-between'}}>
    <View style={styles.line}>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(1)}>
        <View><Text style={styles.text}>1</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(2)}>
        <View><Text style={styles.text}>2</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(3)}>
        <View><Text style={styles.text}>3</Text></View>
      </TouchableOpacity>
    </View>
    <View style={styles.line}>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(4)}>
        <View><Text style={styles.text}>4</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(5)}>
        <View><Text style={styles.text}>5</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(6)}>
        <View><Text style={styles.text}>6</Text></View>
      </TouchableOpacity>
    </View>
    <View style={styles.line}>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(7)}>
        <View><Text style={styles.text}>7</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(8)}>
        <View><Text style={styles.text}>8</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(9)}>
        <View><Text style={styles.text}>9</Text></View>
      </TouchableOpacity>
    </View>
    <View style={styles.line}>
      <TouchableOpacity style={styles.button}>
        <View><Text style={styles.text}> </Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => props.onPress(0)}>
        <View><Text style={styles.text}>0</Text></View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={props.onBackspacePress}>
        <View><Image style={{width: 24, height: 17}} resizeMode="contain" source={require('../../assets/pos/backspace.png')} /></View>
      </TouchableOpacity>
    </View>
  </View>
};

DigitsKeyboard.propTypes = {
  onPress: PropTypes.func,
  onBackspacePress: PropTypes.func,
};