import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';
import * as CONSTANTS from '../../utils/constants';
import styles from '../../styles/ProductListStyles';


export default (props) => (
    <View style={[styles.noResult, {bottom: props.bottom}, props.skipOffset ? {top: 0} : {}]}>
        <Image style={{width: 195, height: 121}} source={require('../../assets/noResults.png')}/>
        <Text style={styles.noResultText}>{CONSTANTS.NO_RESULTS}</Text>
    </View>
)
