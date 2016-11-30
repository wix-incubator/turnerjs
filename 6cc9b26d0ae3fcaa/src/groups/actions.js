/*eslint require-yield: 0*/

import * as types from './actionTypes';
import * as uploadActions from '../uploads/actions';
import _ from 'lodash';
import {i18n} from './../../strings';

const groupResolvers = {};

function getGroupId() {
  return Math.floor(Math.random() * 1000000000);
}

export function uploadGroup(navigator, images) {
  return async(dispatch, getState) => {
    const groupId = getGroupId();
    dispatch({
      type: types.SET_COUNT_FOR_GROUP,
      group: groupId,
      count: images.length
    });

    dispatch(uploadActions.addUploadsToQueue(images, groupId));

    const promise = new Promise((resolve, reject) => {
      _.set(groupResolvers, [groupId], {resolve, reject});
    });

    navigator.push({
      screen: 'media.UploadGroupScreen',
      title: i18n('UPLOAD_GROUP_SCREEN_TITLE'),
      passProps: {
        group: groupId
      }
    });

    return await promise;
  };
}

export function cancelGroup(groupId) {
  return async(dispatch, getState) => {
    groupResolvers[groupId].reject('cancelled by user');
  };
}

export function checkForFinishedGroup(groupId) {
  return async(dispatch, getState) => {
    if (getState().groups[groupId] === 0) {
      //Navigation.dismissModal();
      const data = getGroupData(groupId, getState());
      groupResolvers[groupId].resolve(data);
    }
  };
}

function getGroupData(groupId, state) {
  const wixIds = [];
  for (const upload of _.values(state.uploads.uploads)) {
    if (upload.group === groupId) {
      wixIds.push(_.set({}, [upload.wixId], upload.wixData));
    }
  }
  return wixIds;
}
