import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Platform
} from 'react-native';

import editFormStyles from '../../styles/EditStyles';

export const FileFormLine = (props) => (
    <TouchableOpacity activeOpacity={1} onPress={props.onPress}>
        <View style={editFormStyles('commonLine.wrapper')}>
            <View style={editFormStyles('commonLine.line')}>
                <Image
                  style={editFormStyles('commonLine.downloadIcon')}
                  source={require('../../assets/downloadIcon.png')}
                />
                <Text numberOfLines={1} style={[
                    editFormStyles('commonLine.line.text', true),
                    props.textColor ? {color: props.textColor} : {}
                ]}>{props.title}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

FileFormLine.propTypes = {
    onPress: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    textColor: PropTypes.string
};