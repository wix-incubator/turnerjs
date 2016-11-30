import * as types from './actionTypes';
import immutable from 'seamless-immutable';
import _ from 'lodash';
import * as consts from './consts';

export const initialState = immutable({
  uploads: {},
  folderIds: {},
  transit: {
    isLoaded: false,
    error: false,
    everLoaded: false
  },
  groupCounts: {},
  shouldShowLearnMore: true
});

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.CREATE_UPLOAD:
      return handleCreateUpload(state, action);
    case types.START_UPLOAD:
      return handleStart(state, action);
    case types.SET_PROGRESS:
      return handleSetProgress(state, action);
    case types.SET_SIZE:
      return handleSetSize(state, action);
    case types.SET_FINISHED:
      return handleFinish(state, action);
    case types.SET_FOLDER_ID:
      return handleFolderId(state, action);
    case types.SET_FOLDER_PENDING:
      return handleFolderPending(state, action);
    case types.START_LOAD_PREVIOUS_UPLOADS:
      return handleStartLoadPreviousUploads(state, action);
    case types.LOAD_PREVIOUS_UPLOADS_FAILED:
      return handleFailedLoadPreviousUploads(state, action);
    case types.SET_PREVIOUS_UPLOADS:
      return handleLoadedPreviousUploads(state, action);
    case types.SET_FAILED:
      return handleFailedUpload(state, action);
    case types.RETRY_UPLOAD:
      return handleRetryUpload(state, action);
    case types.CLEAR_UPLOADS:
      return handleClearUploads(state, action);
    case types.TOGGLE_SHOULD_SHOW_LEARN_MORE:
      return toggleShouldShowLearnMore(state, action);
    default:
      return state;
  }
}

function handleFailedUpload(state, action) {
  return state.setIn(['uploads', action.uri, 'state'], consts.UPLOAD_STATES.FAILED);
}

function handleRetryUpload(state, action) {
  return state.setIn(['uploads', action.uri, 'state'], consts.UPLOAD_STATES.PENDING);
}

function handleCreateUpload(state, action) {
  const ts = Date.now();
  const newUpload = immutable({
    state: consts.UPLOAD_STATES.PENDING,
    progress: 0,
    uri: action.image.uri,
    size: action.image.size,
    startedTS: ts,
    name: action.fileName,
    folderName: action.folderName ? action.folderName : consts.DEFAULT_FOLDER,
    group: action.group ? action.group : consts.DEFAULT_GROUP_ID
  });
  return state.setIn(['uploads', action.image.uri], newUpload);
}

function handleStart(state, action) {
  return state.setIn(['uploads', action.uri, 'state'], consts.UPLOAD_STATES.RUNNING);
}

function handleFolderId(state, action) {
  return state.setIn(['folderIds', action.folderName ? action.folderName : consts.DEFAULT_FOLDER], action.folderId);
}

function handleFolderPending(state, action) {
  return state.setIn(['folderIds', action.folderName ? action.folderName : consts.DEFAULT_FOLDER], consts.FOLDER_PENDING);
}

function handleSetProgress(state, action) {
  return state.setIn(['uploads', action.uri, 'progress'], action.progress);
}

function handleSetSize(state, action) {
  return state.setIn(['uploads', action.uri, 'size'], action.size);
}

function handleFinish(state, action) {
  let newState = state.setIn(['uploads', action.uri, 'state'], consts.UPLOAD_STATES.FINISHED);
  newState = newState.setIn(['uploads', action.uri, 'wixId'], action.wixId);
  newState = newState.setIn(['uploads', action.uri, 'wixData'], action.data);
  return newState;
}

function handleStartLoadPreviousUploads(state, action) {
  return immutable({
    ...state,
    transit: {
      ...state.transit,
      isLoaded: false,
      error: false
    }
  });
}

function handleFailedLoadPreviousUploads(state, action) {
  return immutable({
    ...state,
    transit: {
      ...state.transit,
      isLoaded: false,
      error: true
    }
  });
}

function handleLoadedPreviousUploads(state, action) {
  let newUploads = {...state.uploads};

  newUploads = _.pickBy(newUploads, (val) => val.state === consts.UPLOAD_STATES.PENDING || val.state === consts.UPLOAD_STATES.RUNNING);
  _.map(action.data, (item) => {
    const oldUpload = _.find(state.uploads, (v) => v.wixId === item.file_name);
    const oldGroup = oldUpload ? oldUpload.group : undefined;
    _.set(newUploads, [_.toString(item.file_url)], {
      state: consts.UPLOAD_STATES.SERVER,
      progress: 0,
      wixId: item.file_name,
      size: 0,
      startedTS: item.created_ts,
      name: item.original_file_name,
      folderName: consts.DEFAULT_FOLDER,
      wixData: item,
      group: oldGroup
    });
  });

  return immutable({
    ...state,
    cursor: action.cursor,
    uploads: {
      ...newUploads
    },
    transit: {
      isLoaded: true,
      error: false,
      everLoaded: true
    }
  });
}

function handleClearUploads(state, action) {
  return {...initialState, shouldShowLearnMore: state.shouldShowLearnMore};
}

function toggleShouldShowLearnMore(state, action) {
  return immutable({
    ...state,
    shouldShowLearnMore: !state.shouldShowLearnMore
  });
}
