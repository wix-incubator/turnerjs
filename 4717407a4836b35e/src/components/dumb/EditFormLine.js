import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';

import editFormStyles from '../../styles/EditStyles';

export const EditFormLine = (props) => (
    <TouchableOpacity activeOpacity={1} onPress={props.onPress}>
        <View style={editFormStyles('commonLine.wrapper')}>
            <View style={editFormStyles('commonLine.line')}>
                <Text style={[editFormStyles('commonLine.line.text', !!props.multilineTitle)]}>{props.title}</Text>
                <Text numberOfLines={1} style={[
                    editFormStyles('commonLine.line.value', !!props.multilineTitle),
                    props.actionTextColor ? {color: props.actionTextColor} : {}
                ]}>{props.actionText}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

EditFormLine.propTypes = {
    onPress: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    multilineTitle: PropTypes.bool,
    actionTextColor: PropTypes.string
};