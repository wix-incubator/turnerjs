import React, {Component, PropTypes} from 'react';
import {View} from 'react-native';

export const Header = (props) => {
  return <View style={{
    height: props.height || 153,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(67,81,92, 0.15)',
    justifyContent: 'center'
  }}>
    {props.children}
  </View>
};

Header.propTypes = {
  height: PropTypes.number
};