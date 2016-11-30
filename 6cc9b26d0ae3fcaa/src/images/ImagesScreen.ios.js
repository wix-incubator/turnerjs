import React from 'react';

import {ActionSheetIOS} from 'react-native';
import {connect} from 'react-redux';
import * as imagesActions from './actions';

import {
    CameraKitCamera,
    CameraKitGallery
} from 'react-native-camera-kit';
import ImagesScreenBase from './ImagesScreenBase';
import PrimingView from './PrimingView';
import biLogger, {biEvents} from '../services/WixBiLogger.config';


const BUTTONS = [
  'Discard Selection',
  'Cancel'
];

class ImagesScreen extends ImagesScreenBase {

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      showPriming: this.checkIfShouldShowPriming(props),
      navBarShowing: true
    };
    this.updateNavBar(this.checkIfShouldShowPriming(props));
  }

  componentWillReceiveProps(newProps) {
    super.componentWillReceiveProps(newProps);
    this.setState({
      showPriming: this.checkIfShouldShowPriming(newProps)
    });
    this.updateNavBar(this.checkIfShouldShowPriming(newProps));
  }

  updateNavBar(showingPriming) {
    if (showingPriming) {
      this.props.navigator.toggleNavBar({
        to: 'hidden',
        animated: true
      });
    } else {
      this.props.navigator.toggleNavBar({
        to: 'show',
        animated: false
      });
    }
  }

  checkIfShouldShowPriming(props) {
    return this.props.photosPermission === undefined && this.props.cameraPermission === undefined;
  }

  showCancelAlert() {
    ActionSheetIOS.showActionSheetWithOptions({
      options: BUTTONS,
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0
    },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          this.alertCancelPressed();
        }
      }
    );
  }

  async onPrimingScreenReturn(answer) {
    biLogger.log({...biEvents.click_on_allow_photo_access_screen, value: answer ? 'approve' : 'decline'});

    if (answer) {

      const isUserAuthorizedCamera = await CameraKitCamera.requestDeviceCameraAuthorization();
      const isUserAuthorizedPhotos = await CameraKitGallery.requestDevicePhotosAuthorization();

      this.props.dispatch(imagesActions.setPermissions(isUserAuthorizedPhotos, isUserAuthorizedCamera));
    } else {
      this.props.dispatch(imagesActions.invokeReject('user disallowed photos permissions'));
      this.props.dispatch(imagesActions.dismissMediaModal());
    }
  }

  render() {
    if (this.state.showPriming) {
      return (
        <PrimingView callback={(answer) => this.onPrimingScreenReturn(answer)}/>
      );
    } else {
      return super.render();
    }
  }

}
function mapStateToProps(state) {
  return {
    ...state.images
  };
}

export default connect(mapStateToProps)(ImagesScreen);
