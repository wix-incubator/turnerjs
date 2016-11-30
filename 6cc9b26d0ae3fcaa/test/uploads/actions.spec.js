/*eslint camelcase: ["error", {properties: "never"}]*/

import {ActionTest} from 'redux-testkit';
import * as testUtils from 'a-wix-react-native-commons/TestUtils';

let getFolderResponse;
let createFolderResponse;

const mockFolderService = {
  getFolders: async () => new Promise((res, rej) => res(getFolderResponse)),
  createFolder: async () => new Promise((res, rej) => res(createFolderResponse))
};

const actions = testUtils.proxyquire('src/uploads/actions', {
  'react-native': {Platform: {OS: 'android'}},
  'react-native-navigation': {},
  '../groups/actions': testUtils.proxyquire('src/groups/actions', {
    './../../strings': {i18n: (s) => s},
    'react-native': {},
    'react-native-navigation': {},
    '../uploads/actions': {}
  }),
  './folderService': mockFolderService
});

const actionTester = new ActionTest();

import * as actionTypes from '../../src/uploads/actionTypes';
import * as constants from '../../src/uploads/consts';

describe('Upload actions', () => {

  beforeEach(() => {
    actionTester.reset();
  });

  it('should add an image to the queue', () => {
    const image = {name: 'image1.jpg', uri: 'image_uri'};
    actionTester.dispatchSync(actions.addUploadsToQueue([image]));
    expect(actionTester.getDispatched().length).toEqual(2);
    expect(actionTester.getDispatched(0).isPlainObject()).toEqual(true);
    expect(actionTester.getDispatched(0).getType()).toEqual(actionTypes.CREATE_UPLOAD);
    expect(actionTester.getDispatched(0).getParams().image).toEqual({...image, type: 'jpg'});
    expect(actionTester.getDispatched(1).isFunction()).toEqual(true);
    expect(actionTester.getDispatched(1).getName()).toEqual('checkQueue');
  });

  it('should detect pngs when added to the queue', () => {
    const image = {name: 'image1.png', uri: 'image_uri'};
    actionTester.dispatchSync(actions.addUploadsToQueue([image]));
    expect(actionTester.getDispatched(0).getParams().image.type).toEqual('png');
  });

  it('should detect jpegs when added to the queue', () => {
    const image = {name: 'image1.jpeg', uri: 'image_uri'};
    actionTester.dispatchSync(actions.addUploadsToQueue([image]));
    expect(actionTester.getDispatched(0).getParams().image.type).toEqual('jpeg');
  });
});

describe('Lookup folder', () => {

  beforeEach(() => {
    actionTester.reset();
  });

  it('should lookup a folder successfully', () => {
    actionTester.setState({uploads: {folderIds: {folder_name: 123456}}});
    const folderId = actions.lookupFolderId('folder_name', actionTester.mockDispatch, actionTester.getState());
    expect(folderId).toEqual(123456);
    expect(actionTester.getDispatched().length).toEqual(0);
  });

  it('should dispatch getFolders if folderId not found and set folder pending', () => {
    const folderId = actions.lookupFolderId('folder_name', actionTester.mockDispatch, actionTester.getState());
    expect(folderId).toBeUndefined();
    expect(actionTester.getDispatched().length).toEqual(2);
    expect(actionTester.getDispatched(0).getType()).toEqual(actionTypes.SET_FOLDER_PENDING);
    expect(actionTester.getDispatched(0).getParams().folderName).toEqual('folder_name');
    expect(actionTester.getDispatched(1).getName()).toEqual('getFolderId');
  });

  it('should return undefined and not dispatch anything if folder is pending', () => {
    actionTester.setState({uploads: {folderIds: {folder_name: constants.FOLDER_PENDING}}});
    const folderId = actions.lookupFolderId('folder_name', actionTester.mockDispatch, actionTester.getState());
    expect(folderId).toBeUndefined();
    expect(actionTester.getDispatched().length).toEqual(0);
  });
});

describe('get folder', () => {

  beforeEach(() => {
    actionTester.reset();
    mockFolderService.getFolderResponse = undefined;
    mockFolderService.createFolderResponse = undefined;
  });

  it('should cope if folder request fails', () => {
    actionTester.dispatchSync(actions.getFolderId('folder_name'));
    expect(actionTester.getDispatched().length).toEqual(2);
    expect(actionTester.getDispatched(0).getType()).toEqual(actionTypes.LOAD_PREVIOUS_UPLOADS_FAILED);
    expect(actionTester.getDispatched(1).getType()).toEqual(actionTypes.SET_FOLDER_ID);
    expect(actionTester.getDispatched(1).getParams().folderName).toEqual('folder_name');
    expect(actionTester.getDispatched(1).folderId).toBeUndefined();
  });

  it('should find the folder specified if it exists on server', () => {

    getFolderResponse = {
      ts: 1470923604,
      folders: [
        {
          parent_folder_id: 'f26acdc3724a4f1e9ca0ab74d7fe6a52',
          created_ts: 1462722698,
          modified_ts: 1470915098,
          folder_name: 'Mobile Uploads',
          media_type: 'picture',
          folder_id: '228cd83b60ea4f5698373e51a2ab2f1c'
        },
        {
          parent_folder_id: null,
          created_ts: 1461229096,
          modified_ts: 1466427953,
          folder_name: '/',
          media_type: 'picture',
          folder_id: 'f26acdc3724a4f1e9ca0ab74d7fe6a52'
        }
      ]
    };

    actionTester.dispatchSync(actions.getFolderId('Mobile Uploads'));

    expect(actionTester.getDispatched().length).toEqual(2);
    expect(actionTester.getDispatched(0).getType()).toEqual(actionTypes.SET_FOLDER_ID);
    expect(actionTester.getDispatched(0).getParams().folderName).toEqual('Mobile Uploads');
    expect(actionTester.getDispatched(0).getParams().folderId).toEqual('228cd83b60ea4f5698373e51a2ab2f1c');
    expect(actionTester.getDispatched(1).getName()).toEqual('checkQueue');
  });

  it('should create the folder if it doesnt exist on server', () => {

    getFolderResponse = {
      ts: 1470923604,
      folders: []
    };

    createFolderResponse = {
      parent_folder_id: 'f26acdc3724a4f1e9ca0ab74d7fe6a52',
      created_ts: 1462722698,
      modified_ts: 1470915098,
      folder_name: 'Mobile Uploads',
      media_type: 'picture',
      folder_id: 'created_id'
    };

    actionTester.dispatchSync(actions.getFolderId('Mobile Uploads'));

    expect(actionTester.getDispatched().length).toEqual(2);
    expect(actionTester.getDispatched(0).getType()).toEqual(actionTypes.SET_FOLDER_ID);
    expect(actionTester.getDispatched(0).getParams().folderName).toEqual('Mobile Uploads');
    expect(actionTester.getDispatched(0).getParams().folderId).toEqual('created_id');
    expect(actionTester.getDispatched(1).getName()).toEqual('checkQueue');
  });

});
