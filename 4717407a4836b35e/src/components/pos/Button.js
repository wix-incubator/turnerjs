import React, {Component, PropTypes} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

let styles = {
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20
  },
  title: {textAlign: 'center', color: '#2d4150', fontSize: 23, fontWeight: '300', lineHeight: 50, marginTop: 27},
  subtitle: {textAlign: 'center', color: '#7a92a5', fontSize: 17, fontWeight: '300', lineHeight: 25, marginTop: 22},
  button: {marginTop: 28},
  label: {color: '#00adf5', textAlign: 'center', fontSize: 17, fontWeight: '400'}
};

export const Button = (props) => {
  return props.type === 'big'
    ? <TouchableOpacity style={{
      marginHorizontal: 25,
      marginVertical: 10,
      borderWidth: 1,
      borderRadius: 2,
      borderColor: 'rgba(67,81,92, 0.15)',
      backgroundColor: '#fff',
      ...props.style
    }} onPress={props.onPress}>
      <View style={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {props.image
          ? <Image style={{width: props.image.width, height: props.image.height}} resizeMode="contain" source={props.image.source} />
          : null
        }
        <Text style={{textAlign: 'center', color: '#43515c', fontSize: 24, fontWeight: '300', marginTop: 14}}>{props.title}</Text>
      </View>
    </TouchableOpacity>
    : <TouchableOpacity style={{
        marginHorizontal: 25,
        borderBottomWidth: 1,
        borderColor: 'rgba(67,81,92, 0.15)',
        backgroundColor: '#fff',
        ...props.style
      }} onPress={props.onPress}>
        <View style={{
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginVertical: 32
          }}>
          {props.image
            ? <View style={{height: 25, width: 38, alignItems: "center", justifyContent: "center", alignSelf: "center"}}>
              <Image style={{width: props.image.width, height: props.image.height}} resizeMode="contain" source={props.image.source} />
            </View>
            : null
          }
          <Text style={{textAlign: 'center', color: '#43515c', fontSize: 21, fontWeight: '300', marginLeft: 20}}>{props.title}</Text>
        </View>
    </TouchableOpacity>;
};

Button.propTypes = {
  type: PropTypes.oneOf(['small', 'big']),
  image: PropTypes.object,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func
};