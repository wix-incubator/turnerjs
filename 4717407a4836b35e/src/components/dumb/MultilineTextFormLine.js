import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions
} from 'react-native';

import editFormStyles from '../../styles/EditStyles';

export const MultilineTextFormLine = (props) => (
    <TouchableOpacity
        activeOpacity={1}
        onPress={props.onPress}
        style={editFormStyles('multilineText.wrapper')}>
        {props.text !== '' ? (
            <View style={editFormStyles('multilineText.wrapper.paddingBox')}>
                <View style={editFormStyles('multilineText.wrapper.label')}>
                    <Text style={editFormStyles('multilineText.wrapper.label.text')}>{ props.title }</Text>
                </View>
                <View style={editFormStyles('multilineText.wrapper.discWrapper')}>
                    <Text
                        style={editFormStyles('multilineText.wrapper.descText')}
                        numberOfLines={3}
                    >{ props.text }</Text>
                        <Image style={editFormStyles('multilineText.wrapper.arrow')} source={require('../../assets/smallArrow.png')}/>
                </View>
            </View>
        ) : (
            <View style={editFormStyles('multilineText.wrapper.discWrapper')}>
                <View style={editFormStyles('multilineText.wrapper.descLine')}>
                    <Text style={editFormStyles('commonLine.line.text', false)}>{ props.title }</Text>
                </View>
                <View style={editFormStyles('multilineText.wrapper.descLine')}>
                    <Text numberOfLines={1} style={editFormStyles('commonLine.line.value', true)}>{ props.actionText }</Text>
                </View>
            </View>
        )}
    </TouchableOpacity>
);

MultilineTextFormLine.propTypes = {
    onPress: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired
};