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

export const CTA = (props) => {
  return <View style={styles.wrapper}>
    {props.image ? <Image testID="image" style={{width: props.image.width, height: props.image.height}} resizeMode="contain" source={props.image.source} /> : null}
    {props.title ? <Text testID="title" style={styles.title}>{props.title}</Text> : null}
    {props.subtitle ? <Text testID="subtitle" style={styles.subtitle}>{props.subtitle}</Text> : null}
    {props.actionText && props.onPress ? (
      <TouchableOpacity testID="button" style={styles.button} onPress={props.onPress}>
        <Text testID="label" style={styles.label}>{props.actionText}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
};

CTA.propTypes = {
  image: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actionText: PropTypes.string,
  onPress: PropTypes.func
};