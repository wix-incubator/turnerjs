import * as types from './actionTypes';
import * as Constants from './constants';
import immutable from 'seamless-immutable';
import _ from 'lodash';

export const initialState = immutable({
  selectedImages: [],
  captureImages: [],
  cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE,
  uploadImages: [],
  pushUploadGroupScreen: false,  // whether we want to push upload group screen
  imagesWixMediaData: [], // the wix media urls (statics)
  cameraRatioOverlay: undefined, //TODO replace undefined with an empty object ?
  cameraPermission: undefined,
  photosPermission: undefined,
  lastEditedImage: undefined,
  maxImagesUpload: 0
});

export default function reduce(state = initialState, action = {}) {

  switch (action.type) {

    case types.SELECTED_IMAGES_CHANGED:
      return selectedChanged(state, action);
    case types.ADD_CAPTURE_IMAGE:
      return addCaptureImage(state, action);
    case types.CAMERA_SCREEN_STATE_CHANGED:
      return handleCameraScreenDonePressed(state, action);
    case types.PREPARE_STATE_FOR_UPLOAD:
      return prepareStateForUpload(state, action);
    case types.CLEAN_CAPTURE_IMAGES:
      return cleanCapturesImages(state, action);
    case types.CLEAN_SELECTED_IMAGES:
      return cleanSelectedImages(state, action);
    case types.CLEAN_ALL_EXCEPT_PERMISSIONS:
      return cleanAllExceptPermissions(state, action);
    case types.SET_SHOW_UPLOAD_GROUP_SCREEN:
      return setShowUploadGroupScreen(state, action);
    case types.SET_IMAGES_WIX_MEDIA_DATA:
      return setImagesWixMediaData(state, action);
    case types.SET_CAMERA_RATIO_OVERLAY:
      return setCameraRatioOverlay(state, action);
    case types.SET_CAMERA_PERMISSION:
      return setCameraPermission(state, action);
    case types.SET_PHOTOS_PERMISSION:
      return setPhotosPermission(state, action);
    case types.SWAP_IMAGE_ID:
      return swapImageId(state, action);
    case types.OVERRIDE_SELECTED_WITH_UPLOADS_IMAGES:
      return overrideSelectedWithUploads(state, action);
    case types.SET_MAX_IMAGES_UPLOAD:
      return setMaxImagesUpload(state, action);
    case types.SET_LAST_EDITED_IMAGE_ID:
      return setLastEditedImageId(state, action);
    default:
      return state;
  }
}

function selectedChanged(state, action) {
  if (_.includes(state.selectedImages, action.image)) {
    const index = _.indexOf(state.selectedImages, action.image);
    return state.set('selectedImages', [
      ...state.selectedImages.slice(0, index),
      ...state.selectedImages.slice(index + 1)
    ]);
  } else {
    return state.set('selectedImages', [
      ...state.selectedImages,
      action.image
    ]);
  }
}

function addCaptureImage(state, action) {
  return state.set('captureImages', state.captureImages.concat([action.id]));
}

function handleCameraScreenDonePressed(state, action) {
  return state.set('cameraScreenDoneUpdateValue', action.cameraScreenDoneUpdateValue);
}

function prepareStateForUpload(state, action) {
  const newArr = state.selectedImages.concat(state.captureImages);
  const newArrNoDuplicates = _.uniqBy(newArr);
  return state.merge({uploadImages: newArrNoDuplicates, captureImages: [], selectedImages: newArrNoDuplicates});
}

function cleanCapturesImages(state, action) {
  return state.set('captureImages', []);
}

function cleanSelectedImages(state, action) {
  return state.set('selectedImages', []);
}

function cleanAllExceptPermissions(state, action) {
  return immutable({...initialState, cameraPermission: state.cameraPermission, photosPermission: state.photosPermission});
}

function setShowUploadGroupScreen(state, action) {
  return state.set('pushUploadGroupScreen', action.value);
}

function setImagesWixMediaData(state, action) {
  return state.set('imagesWixMediaData', action.data);
}

function setCameraRatioOverlay(state, action) {
  return state.set('cameraRatioOverlay', action.data.cameraRatioOverlay);
}

function setCameraPermission(state, action) {
  return state.set('cameraPermission', action.cameraPermission);
}

function setPhotosPermission(state, action) {
  return state.set('photosPermission', action.photosPermission);
}

function swapImageId(state, action) {
  const oldImageId = action.oldImageId;
  const newImageId = action.newImageId && action.newImageId.length > 0 ? action.newImageId : undefined;
  const oldImageIndex = _.indexOf(state.uploadImages, oldImageId);

  if (oldImageIndex >= 0) {
    let newUploadImagesArray;
    if (newImageId) {
      newUploadImagesArray = state.uploadImages.slice(0, oldImageIndex).concat(newImageId);
    } else {
      newUploadImagesArray = state.uploadImages.slice(0, oldImageIndex);
    }
    if (oldImageIndex < (state.uploadImages.length - 1)) {
      const tail = state.uploadImages.slice(oldImageIndex + 1, state.uploadImages.length);
      newUploadImagesArray = newUploadImagesArray.concat(tail);
    }
    state = state.set('uploadImages', newUploadImagesArray);
  }
  return state;
}

function overrideSelectedWithUploads(state, action) {
  return state.set('selectedImages', state.uploadImages);
}

function setMaxImagesUpload(state, action) {
  let maxImagesUpload = action.data.maxImagesUpload;
  if (maxImagesUpload < 0) {
    maxImagesUpload = 0;
  }
  return state.set('maxImagesUpload', maxImagesUpload);
}

function setLastEditedImageId(state, action) {
  return state.set('lastEditedImageId', action.newImageId);
}
