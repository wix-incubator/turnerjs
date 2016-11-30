import React, { Component } from 'react';

import { Platform } from 'react-native';

import photoPicker from '../photoPicker';
import * as CONSTANTS from '../../utils/constants';

import confirmation from '../../utils/confirmation';

import _ from 'lodash';

import MediaView from '../MediaView';

export default class extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        if (this.props.isCreate && !this.props.media.length) {
            this.openPhotoPicker();
        }
    }
    onMediaReordered(media){
        this.props.onChange && this.props.onChange(media);
    }
    openPhotoPicker() {
        const maxImagesNumber = CONSTANTS.MAX_PHOTOS_NUMBER - this.props.media.length;

        photoPicker()
            .then((_images) => {
                this.props.onChange([
                    ...this.props.media,
                    ..._.take(_images, Math.min(maxImagesNumber, _images.length)).map((i, j) => ({...i, index: this.props.media.length + j}))
                ]);
            }).catch((e) => {});
    }
    showDeletionDialog(callback) {
        confirmation({
                message: Platform.OS === 'ios' ? undefined : CONSTANTS.DELETE_IMAGE_TITLE,
                options: [Platform.OS === 'ios' ? CONSTANTS.DELETE_IMAGE_BUTTON : CONSTANTS.OK_BUTTON, CONSTANTS.CANCEL_BUTTON],
                cancelButtonIndex: 1,
                destructiveButtonIndex: 0
            },
            buttonIndex => !buttonIndex && this.props.onChange && this.props.onChange(callback())
        );
    }
    render() {
        return (
            <MediaView
                media={this.props.media}
                onDelete={callback => this.showDeletionDialog(callback)}
                onMediaReordered={(media, commands) => this.onMediaReordered(media, commands)}
                onAddPressed={() => this.openPhotoPicker()}
                isAddButton={this.props.media.length < CONSTANTS.MAX_PHOTOS_NUMBER}
            />
        )
    }
}



