import React, {Component, PropTypes} from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback
} from 'react-native';

export const OptionLine = (props) => <TouchableWithoutFeedback onPress={props.onPress}>
  <View style={[{paddingVertical: 25, marginHorizontal: 20, flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}, !props.isLast ? {borderBottomWidth: 1, borderBottomColor: '#e8e9ec'} : {}]}>
    <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start'}}>
      {props.type === 'COLOR'
        ? <View style={{backgroundColor: props.value, borderRadius: 25, borderWidth: 1, borderColor: '#c0cedd', width: 13, height: 13, marginRight: 13}} />
        : null}
      <Text style={{fontSize: 17, fontWeight: '300', color: '#2d4150'}}>{props.description}</Text>
    </View>
    <View style={{backgroundColor: props.isSelected ? '#00adf5' : '#fff', borderRadius: 25, borderWidth: 1, borderColor: '#aab7c5', width: 25, height: 25, justifyContent: 'center', alignItems: 'center'}} >
      <View style={{backgroundColor: '#fff', borderRadius: 25, width: 8, height: 8}}/>
    </View>
  </View>
</TouchableWithoutFeedback>;

OptionLine.propTypes = {
  id: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['DROP_DOWN', 'COLOR']).isRequired,
  value: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onPress: PropTypes.func,
  isLast: PropTypes.bool
};