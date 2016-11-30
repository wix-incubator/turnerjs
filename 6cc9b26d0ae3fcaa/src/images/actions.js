/*eslint require-yield: 0*/

import * as types from './actionTypes';
import {Navigation} from 'react-native-navigation';
import _ from 'lodash';

import {Platform} from 'react-native';

import * as Constants from './constants';

import * as groupActions from '../groups/actions';
import * as uploadsActions from '../uploads/actions';
import biLogger, {biEvents} from '../services/WixBiLogger.config';
import {
    CameraKitCamera,
    CameraKitGallery
} from 'react-native-camera-kit';

let uploadFinishedResolve, uploadFinishedReject;

export function showImagesModal(params) {
  return async function (dispatch, getState) {

    if (params.uploadFinishedReject && params.uploadFinishedResolve) {
      uploadFinishedResolve = params.uploadFinishedResolve;
      uploadFinishedReject = params.uploadFinishedReject;
    }

    if (params.cameraRatioOverlay) {
      dispatch({type: types.SET_CAMERA_RATIO_OVERLAY, data: params});
    }

    if (params.maxImagesUpload !== 0) {
      dispatch({type: types.SET_MAX_IMAGES_UPLOAD, data: params});
    }

    dispatch({type: types.SET_SHOW_UPLOAD_GROUP_SCREEN, value: params.pushUploadGroupScreen});

    Navigation.showModal({
      screen: 'media.ImagesScreen',
      title: ''
    });
  };
}

export function checkCameraPermission() {
  return async function (dispatch, getState) {
    let isCameraAuthorized = await CameraKitCamera.checkDeviceCameraAuthorizationStatus();
    if (Platform.OS === 'ios' && isCameraAuthorized < 0) {
      isCameraAuthorized = undefined;
    }
    dispatch({type: types.SET_CAMERA_PERMISSION, cameraPermission: isCameraAuthorized});
  };
}

export function checkPhotosPermission() {
  return async function (dispatch, getState) {
    let isPhotosAuthorized = await CameraKitGallery.checkDevicePhotosAuthorizationStatus();
    if (isPhotosAuthorized < 0) {
      isPhotosAuthorized = undefined;
    }
    dispatch({type: types.SET_PHOTOS_PERMISSION, photosPermission: isPhotosAuthorized});
  };
}

export function setCameraPermission(isPermit) {
  return async function (dispatch, getState) {
    dispatch({type: types.SET_CAMERA_PERMISSION, cameraPermission: isPermit});
  };
}

export function setPhotosPermission(isPermit) {
  return async function (dispatch, getState) {
    dispatch({type: types.SET_PHOTOS_PERMISSION, photosPermission: isPermit});
  };
}

export function setPermissions(photosPermission, cameraPermission) {
  return async function (dispatch, getState) {
    dispatch({type: types.SET_PHOTOS_PERMISSION, photosPermission});
    dispatch({type: types.SET_CAMERA_PERMISSION, cameraPermission});
  };
}


export function uploadImages(navigator, images) {
  return async function (dispatch, getState) {

    const {pushUploadGroupScreen} = getState().images;
    biLogger.log({...biEvents.camera_uploadPhoto, photosCount: _.isArray(images) ? images.length : 0});

    try {
      if (pushUploadGroupScreen) { // verticals
        const urls = await dispatch(groupActions.uploadGroup(navigator, images));
        dispatch(setImagesWixMediaData(urls));
      } else { // mobile uploads
        dispatch(cleanToInitialStateExceptPermissions());
        dispatch(uploadsActions.addUploadsToQueue(images));
        dispatch(dismissMediaModal());
      }
    } catch (e) {
      dispatch(invokeReject(e));
    }
  };
}

export function cameraDoneUpdateValue(newCameraScreenState) {
  return async function (dispatch, getState) {
    dispatch({type: types.CAMERA_SCREEN_STATE_CHANGED, cameraScreenDoneUpdateValue: newCameraScreenState});
  };
}

export function clearCameraDoneValue() {
  return async function (dispatch, getState) {
    dispatch({type: types.CAMERA_SCREEN_STATE_CHANGED, cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE});
  };
}

export function selectedImagesChanged(tapped) {
  return async function (dispatch, getState) {
    dispatch({type: types.SELECTED_IMAGES_CHANGED, image: tapped});
  };
}

export function imageCapture(id) {
  return async function (dispatch, getState) {
    dispatch({type: types.ADD_CAPTURE_IMAGE, id});
  };
}

export function prepareImagesForUpload() {
  return async function (dispatch, getState) {
    dispatch({type: types.PREPARE_STATE_FOR_UPLOAD});
  };
}

export function cleanCaptureImages() {
  return async function (dispatch, getState) {
    dispatch({type: types.CLEAN_CAPTURE_IMAGES});
  };
}

export function cleanSelectcedImages() {
  return async function (dispatch, getState) {
    dispatch({type: types.CLEAN_SELECTED_IMAGES});
  };
}

export function cleanToInitialStateExceptPermissions() {
  return async function (dispatch, getState) {
    dispatch({type: types.CLEAN_ALL_EXCEPT_PERMISSIONS});
  };
}

function removeUndefinedUndefined(imagesWixMediaData) {
  return _.filter(imagesWixMediaData, (imageData) => !_.includes(imageData, undefined));
}

export function uploadImagesProcessComplete() {
  return async function (dispatch, getState) {
    const {imagesWixMediaData} = getState().images;
    dispatch(cleanToInitialStateExceptPermissions());
    dispatch(dismissMediaModal());
    //Navigation.dismissAllModals();
    if (_.isFunction(uploadFinishedResolve)) {
      const filterImages = removeUndefinedUndefined(imagesWixMediaData);
      uploadFinishedResolve(filterImages);
    }
    cleanResolveReject();
  };
}

export function dismissMediaModal() {
  return async function (dispatch, getState) {
    Navigation.dismissModal();
  };
}

export function pushUploadGroupScreen(images, navigator) {
  return async function (dispatch, getState) {

    return await dispatch(groupActions.uploadGroup(images, navigator));
  };
}

export function setImagesWixMediaData(data) {
  return async function (dispatch, getState) {
    dispatch({type: types.SET_IMAGES_WIX_MEDIA_DATA, data});
  };
}

function cleanResolveReject() {
  if (uploadFinishedResolve) {
    uploadFinishedResolve = undefined;
  }
  if (uploadFinishedReject) {
    uploadFinishedReject = undefined;
  }
}

export function invokeReject(e) {
  return async function (dispatch, getState) {

    dispatch(cleanToInitialStateExceptPermissions());

    if (_.isFunction(uploadFinishedReject)) {
      uploadFinishedReject(e);
    }

    cleanResolveReject();
  };
}

export function swapImage(oldImageId, newImageId) {
  return async function (dispatch, getState) {
    dispatch({type: types.SWAP_IMAGE_ID, oldImageId, newImageId});
  };
}

export function updateThumbnailAfterImageEdit(newImageId) {
  return async function (dispatch, getState) {
    dispatch({type: types.SET_LAST_EDITED_IMAGE_ID, newImageId});
  };
}

export function overrideSelectedImagesWithUploadImages() {
  return async function (dispatch, getState) {
    dispatch({type: types.OVERRIDE_SELECTED_WITH_UPLOADS_IMAGES});
  };
}

