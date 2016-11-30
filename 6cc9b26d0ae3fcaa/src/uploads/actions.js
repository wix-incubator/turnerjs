/*eslint no-undef: 0*/
/*eslint require-yield: 0*/
/*eslint camelcase: 0*/

import * as types from './actionTypes';
import * as consts from './consts';
import * as groupActionTypes from '../groups/actionTypes';
import * as groupActions from '../groups/actions';
import _ from 'lodash';

import * as foldersService from './folderService';

import {Platform} from 'react-native';

const BASE_UPLOAD_REQUEST = 'http://files.wix.com/files/upload/url?media_type=picture&';
const BASE_FILES_REQUEST = 'https://files.wix.com/files/getpage?media_type=picture&order=-date&parent_folder_id=';
const MAX_PARALLEL_UPLOADS = 3;

export function addUploadsToQueue(images, group) {
  return async function (dispatch, getState) {
    for (const image of images) {
      image.type = detectImageType(image.name);
      addUploadToQueueInternal(dispatch, image, group);
    }
    dispatch(checkQueue());
  };
}

async function handleUploadReadyStateChange(dispatch, upload, request) {
  try {
    if (request.readyState === request.DONE) {
      const data = await JSON.parse(request.responseText);
      dispatch({
        type: types.SET_FINISHED,
        uri: upload.uri,
        wixId: _.get(data[0], 'file_name'),
        data: data[0]
      });
      dispatch(checkQueue());
      if (upload.group) {
        dispatch({
          type: groupActionTypes.DECREASE_COUNT_FOR_GROUP,
          group: upload.group
        });
        dispatch(groupActions.checkForFinishedGroup(upload.group));
      }
    }
  } catch (e) {
    dispatch({
      type: types.SET_FAILED,
      uri: upload.uri
    });
  }
}

function handleUploadProgressChange(dispatch, upload, progressEvent) {
  const progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
  dispatch({
    type: types.SET_PROGRESS,
    uri: upload.uri,
    progress
  });
}

async function getUploadUrlToken(fileName, size) {
  const imageType = detectImageType(fileName);
  const uploadResponse = await fetch(`${BASE_UPLOAD_REQUEST}` +
    `file_name=${fileName}` +
    `&file_size= ${size}` +
    `&content_type=image%2F${imageType}`
  );
  return await uploadResponse.json();
}

function createUploadBody(upload, uploadData, folderId) {
  const body = new FormData();
  const imageFileType = detectImageType(upload.name);

  const file = {
    uri: upload.uri,
    type: `image/${imageFileType}`,
    name: upload.name
  };

  body.append('file', file);
  body.append('media_type', 'picture');
  body.append('upload_token', uploadData.upload_token);
  body.append('parent_folder_id', folderId);
  return body;
}

function detectImageType(imageName) {
  const imageNameLowerCase = imageName.toLowerCase();
  let type = 'jpg';
  if (_.endsWith(imageNameLowerCase, '.png')) {
    type = 'png';
  } else if (_.endsWith(imageNameLowerCase, '.jpg')) {
    type = 'jpg';
  } else if (_.endsWith(imageNameLowerCase, '.jpeg')) {
    type = 'jpeg';
  }
  return type;
}

function addUploadToQueueInternal(dispatch, image, group) {
  dispatch({
    type: types.CREATE_UPLOAD,
    image,
    fileName: `${getFormattedTimeStamp()}.${image.type}`,
    group
  });
}

export function addUploadToQueue(image) {
  return async function (dispatch, getState) {
    addUploadToQueueInternal(dispatch, image);
    if (!isMultiple) {
      dispatch(checkQueue());
    }
  };
}

export function getFolderId(folderName) {
  return async function getFolderId(dispatch, getState) { //eslint-disable-line
    try {
      const data = await foldersService.getFolders();
      const folders = _.get(data, 'folders');

      if (!folders) {
        dispatch({
          type: types.LOAD_PREVIOUS_UPLOADS_FAILED
        });
        dispatch({
          type: types.SET_FOLDER_ID,
          folderName,
          undefined
        });
        return;
      }
      const requestedFolder = _.find(folders, {folder_name: folderName});
      if (requestedFolder) {
        const folderId = _.get(requestedFolder, 'folder_id');
        dispatch({
          type: types.SET_FOLDER_ID,
          folderName,
          folderId
        });
        dispatch(checkQueue());
      } else {
        const newFolder = await foldersService.createFolder(folderName);
        const folderId = _.get(newFolder, 'folder_id');
        dispatch({
          type: types.SET_FOLDER_ID,
          folderName,
          folderId
        });
        dispatch(checkQueue());
      }
    } catch (e) {}
  };
}

export function lookupFolderId(folderName, dispatch, state) {
  const folderId = _.get(state, ['uploads', 'folderIds', folderName]);
  if (!folderId) {
    dispatch({
      type: types.SET_FOLDER_PENDING,
      folderName
    });
    dispatch(getFolderId(folderName));
    return undefined;
  } else if (folderId === consts.FOLDER_PENDING) {
    return undefined;
  }
  return folderId;
}

function getFormattedTimeStamp() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(2, 2);
  let month = (date.getMonth() + 1);
  if (month.length === 1) {
    month = `0${month}`;
  }
  let day = String(date.getDate());
  if (day.length === 1) {
    day = `0${day}`;
  }
  let minutes = String(date.getMinutes());
  if (minutes.length === 1) {
    minutes = `0${minutes}`;
  }
  let seconds = String(date.getSeconds());
  if (seconds.length === 1) {
    seconds = `0${seconds}`;
  }

  return `${day}-${month}-${year}-${minutes}${seconds}`;
}

export function uploadImage(upload) {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: types.START_UPLOAD,
        uri: upload.uri
      });
      const folderId = lookupFolderId(upload.folderName, dispatch, getState());
      if (!folderId) {
        return;
      }
      const uploadData = await getUploadUrlToken(upload.name, upload.size);
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        handleUploadReadyStateChange(dispatch, upload, request);
      };
      //TODO This is only supported on IOS as of RN25
      if (Platform.OS === 'ios') {
        request.upload.onprogress = (progressEvent) => {
          handleUploadProgressChange(dispatch, upload, progressEvent);
        };
      }
      const body = createUploadBody(upload, uploadData, folderId);
      request.open('POST', uploadData.upload_url);
      request.send(body);
    } catch (e) {
      dispatch({
        type: types.SET_FAILED,
        uri: upload.uri
      });
    }
  };
}

export function retryUpload(upload) {
  return async function (dispatch, getState) {
    dispatch({
      type: types.RETRY_UPLOAD,
      uri: upload.uri
    });
    dispatch(checkQueue());
  };
}

export function checkQueue() {
  return async function checkQueue(dispatch, getState) { //eslint-disable-line
    if (!getState().uploads.transit.isLoaded) {
      dispatch(loadPreviousUploads());
    }

    const runningCount = _.size(_.pickBy(getState().uploads.uploads, (upload) => upload.state === consts.UPLOAD_STATES.RUNNING));
    if (runningCount >= MAX_PARALLEL_UPLOADS) {
      return;
    }

    let pending = _.values(_.pickBy(getState().uploads.uploads, (upload) => upload.state === consts.UPLOAD_STATES.PENDING));
    pending = _.sortBy(pending, 'startedTS');

    const startCount = MAX_PARALLEL_UPLOADS - runningCount;
    for (const upload of pending.slice(0, startCount)) {
      dispatch(uploadImage(upload));
    }
  };
}

export function loadPreviousUploads() {
  return async (dispatch, getState) => {
    dispatch({
      type: types.START_LOAD_PREVIOUS_UPLOADS
    });
    const folderId = lookupFolderId(consts.DEFAULT_FOLDER, dispatch, getState());
    if (!folderId) {
      return;
    }
    try {
      const initialPageSize = Platform.OS === 'ios' ? 59 : 60;
      const response = await fetch(`${BASE_FILES_REQUEST}${folderId}&page_size=${initialPageSize}`);
      if (response.status === 200) {
        const data = await response.json();
        dispatch({
          type: types.SET_PREVIOUS_UPLOADS,
          data: data.files,
          cursor: data.cursor
        });
      } else {
        dispatch({
          type: types.LOAD_PREVIOUS_UPLOADS_FAILED
        });
      }
    } catch (e) {
      dispatch({
        type: types.LOAD_PREVIOUS_UPLOADS_FAILED
      });
    }
  };
}

export function clearUploads() {
  return async function (dispatch, getState) {
    dispatch({
      type: types.CLEAR_UPLOADS
    });
  };
}

export function toggleShouldShowLearnMore() {
  return async function (dispatch, getState) {
    dispatch({
      type: types.TOGGLE_SHOULD_SHOW_LEARN_MORE
    });
  };
}
