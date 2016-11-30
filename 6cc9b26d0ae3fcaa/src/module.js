import _ from 'lodash';
import biLogger from './services/WixBiLogger.config';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {ModuleRegistry, WixSession} from 'a-wix-react-native-framework';
import mixpanel from 'wix-mixpanel-middleware';
import UploadsScreen from './uploads/UploadsScreen';
import UploadGroupScreen from './groups/UploadGroupScreen';
import ImagePreviewScreen from './uploads/ImagePreviewScreen';
import CameraScreen from './camera/CameraScreen';
import PreviewScreen from './preview/PreviewScreen';
import ImagesScreen from './images/ImagesScreen';
import LearnMoreScreen from './uploads/LearnMoreScreen';
import * as reducers from './reducers';
import * as sessionActions from './session/actions';
import * as imagesActions from './images/actions';

const createStoreWithMiddleware = applyMiddleware(mixpanel.create(), thunk)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);

ModuleRegistry.addListener('core.SessionUpdate', (session) => {
  store.dispatch(sessionActions.updateSession(session));
  biLogger.updateDefaults({
    ownerId: _.get(session, 'metaSite.authorizationInfo.ownerId', ''),
    roles: _.get(session, 'metaSite.authorizationInfo.roles', ''),
    msid: WixSession.getMetaSiteId(session)
  });
});

ModuleRegistry.registerComponentAsScreen('media.UploadsScreen', () => UploadsScreen, store, Provider);
ModuleRegistry.registerComponentAsScreen('media.UploadGroupScreen', () => UploadGroupScreen, store, Provider);
ModuleRegistry.registerComponentAsScreen('media.ImagePreviewScreen', () => ImagePreviewScreen, store, Provider);
ModuleRegistry.registerComponentAsScreen('media.CameraScreen', () => CameraScreen, store, Provider);
ModuleRegistry.registerComponentAsScreen('media.PreviewScreen', () => PreviewScreen, store, Provider);
ModuleRegistry.registerComponentAsScreen('media.ImagesScreen', () => ImagesScreen, store, Provider);
ModuleRegistry.registerComponentAsScreen('media.LearnMoreScreen', () => LearnMoreScreen, store, Provider);


ModuleRegistry.registerMethod('media.UploadImages', () => {
  return async(cameraRatioOverlay, maxImagesUpload = 0) => {
    return new Promise((resolve, reject) => {
      store.dispatch(imagesActions.showImagesModal({
        pushUploadGroupScreen: true,
        uploadFinishedResolve: resolve,
        uploadFinishedReject: reject,
        cameraRatioOverlay,
        maxImagesUpload
      }));
    });
  };
});



ModuleRegistry.addListener('core.AppInit', (data) => {
  store.dispatch(imagesActions.checkCameraPermission());
  store.dispatch(imagesActions.checkPhotosPermission());

  mixpanel.setDistinctId(data.appInstallationId);
  biLogger.updateDefaults({
    installationId: data.appInstallationId,
    appVersion: data.appVersion,
    bundleVersion: data.bundleVersion,
    osVersion: data.osVersion
  });
});
