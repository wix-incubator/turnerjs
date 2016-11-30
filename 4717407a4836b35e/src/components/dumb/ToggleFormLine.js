import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    Switch,
    Platform
} from 'react-native';

import editFormStyles from '../../styles/EditStyles';

export const ToggleFormLine = (props) => (
    <View style={editFormStyles('toggleLine.wrapper')}>
        <Text testID="label" style={editFormStyles('toggleLine.text')}>{props.title}</Text>
        <Switch testID="toggle" onValueChange={props.onChange} value={props.value} onTintColor={editFormStyles('toggleLine.toggle.color')}/>
    </View>
);

ToggleFormLine.propTypes = {
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired
};