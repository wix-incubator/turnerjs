import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Platform
} from 'react-native';
import _ from 'lodash/fp';
import editFormStyles from '../../styles/EditStyles';
import ImageWithPreloader from '../ImageWithPreloader';

export const PhotoLine = (props) => (

    <View style={editFormStyles('sv.imageContainerEdit')}>
        <TouchableOpacity activeOpacity={1} onPress={props.onPress}>
            {props.media && props.media.length ? (
                <ImageWithPreloader
                    style={editFormStyles('sv.editPhoto')}
                    source={_.first(_.sortBy('index')(props.media)).url}
                />
            ) : (
                <View style={editFormStyles('sv.noMedia')}>
                    <Image style={editFormStyles('sv.noMedia.placeHolder')} source={require('../../assets/emptyStates/Placeholder.png')}/>
                </View>
            )}
            <View style={editFormStyles('sv.manageIcon')}>
                <Image
                    style={editFormStyles('sv.manageIcon.icon')}
                    source={Platform.OS === 'ios'
                        ? require('../../assets/emptyPhotoIcon.png')
                        : require('../../assets/emptyPhotoIconAndroid.png')}
                />
            </View>
        </TouchableOpacity>
    </View>
);

PhotoLine.propTypes = {
    onPress: PropTypes.func.isRequired,
    media: PropTypes.array,
};

