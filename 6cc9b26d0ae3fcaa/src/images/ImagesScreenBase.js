import _ from 'lodash';
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Animated, Easing,
  InteractionManager
} from 'react-native';

import {Navigation} from 'react-native-navigation';
import {
  CameraKitGalleryView,
  CameraKitCamera,
  CameraKitGallery
} from 'react-native-camera-kit';
import * as imagesActions from './actions';
import * as consts from './constants';
import {ModuleRegistry} from 'a-wix-react-native-framework';
import PrimingView from './PrimingView';

import AlbumsDropdown from './AlbumsDropdown';
import {i18n} from './../../strings';
import {Assets} from 'wix-react-native-ui-lib';


const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');

const {width, height} = Dimensions.get('window');
const screenPadding = 20;

const cameraAreaStyle = {
  height: (1 / (1 + 3.5) * height) - screenPadding,
  width: width - (2 * 20)
};

const albumSelectionStyle = {
  position: 'absolute',
  top: cameraAreaStyle.height + screenPadding,
  width: width - 40,
  height: 44,
  flexDirection: 'column'
};


const cancelButton = {
  title: i18n('IMAGES_SCREEN_CANCEL_BUTTON'),
  id: 'navBarCancel'
};

export default class ImagesScreenBase extends Component {

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      album: {albumName: 'All Photos'},
      albums: [],
      dropdownVisible: false,
      blockerOpacity: new Animated.Value(1),
      singleImageMode: (this.props.maxImagesUpload === 1)
    };
    this.handleProps(props);

    if (Platform.OS === 'android') {
      setTimeout(() => {
        Animated.timing(this.state.blockerOpacity, {toValue: 0, easing: Easing.elastic(2)}).start();
      }, 1000);
    }
  }

  // HACK - should be remove when can listen to lifecycle
  componentWillReceiveProps(nextProps) {

    if (nextProps.uploadImages === this.props.uploadImages &&
        nextProps.cameraScreenDoneUpdateValue === this.props.cameraScreenDoneUpdateValue &&
        nextProps.captureImages === this.props.captureImages &&
        nextProps.selectedImages === this.props.selectedImages) {
      return;
    }

    this.handleProps(nextProps);

    switch (nextProps.cameraScreenDoneUpdateValue) {
      case consts.CAMERA_SCREEN_STATE_DONE_PRESSED:
        this.props.dispatch(imagesActions.clearCameraDoneValue());
        this.refreshNativeGallery([...nextProps.selectedImages, ...nextProps.captureImages]);
        Navigation.dismissModal();
        if (nextProps.captureImages && nextProps.captureImages.length) {
          this.showNextScreen(false);
        }
        break;
      case consts.CAMERA_SCREEN_STATE_CANCEL_PRESSED:
        this.refreshNativeGallery([...nextProps.selectedImages, ...nextProps.captureImages]);
        Navigation.dismissModal();
        this.props.dispatch(imagesActions.clearCameraDoneValue());
        break;

      case consts.PREVIEW_SCREEN_BACK:
        this.props.dispatch(imagesActions.clearCameraDoneValue());
        this.refreshNativeGallery([...nextProps.selectedImages, ...nextProps.captureImages]);
        break;

      default:
        break;

    }
  }

  handleProps(props) {
    this.setNextButtonDisability(props.selectedImages.length === 0 && props.captureImages.length === 0);
  }

  componentWillMount() {
    ModuleRegistry.notifyListeners('framework.biEvents.startSensitiveScreen');
  }

  componentWillUnmount() {
    ModuleRegistry.notifyListeners('framework.biEvents.stopSensitiveScreen');

    if (Platform.OS === 'android') {
      this.props.dispatch(imagesActions.cleanSelectcedImages());
      this.props.dispatch(imagesActions.invokeReject('canceled'));
    }
  }

  componentDidMount() {
    if (this.props.photosPermission) {
      InteractionManager.runAfterInteractions(() => {
        this.reloadAlbums();
      });
    }
    this.handleProps(this.props);
  }

  checkAuthorization() {
    throw ('Implement checkAuthorization in ImagesScreen!');
  }

  showCancelAlert() {
    throw ('Implement showCancelAlert in ImagesScreen!');
  }

  async reloadAlbums() {
    const newAlbums = await CameraKitGallery.getAlbumsWithThumbnails();
    const albums = [];
    _.forEach(newAlbums.albums, (value, name) => albums.push(_.get(newAlbums, ['albums', name])));
    this.setState({albums});
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'navBarCancel' || event.id === 'cancel') {
        if (this.props.selectedImages.length > 0) {
          this.showCancelAlert();
        } else {
          this.alertCancelPressed();
        }
      } else if (event.id === 'navBarNext') {
        this.showNextScreen(true);
      }
    }
  }

  alertCancelPressed() {
    this.props.dispatch(imagesActions.cleanSelectcedImages());
    this.props.dispatch(imagesActions.invokeReject('canceled'));
    this.props.dispatch(imagesActions.dismissMediaModal());
  }

  showNextScreen(animated = true) {
    this.props.dispatch(imagesActions.prepareImagesForUpload());
    if (this.state.singleImageMode) {
      this.props.dispatch(imagesActions.cleanSelectcedImages());
    }

    const platformSpecificNavStyle = (Platform.OS === 'android') ?
    {
      navBarButtonColor: '#ffffff',
      navBarTextColor: '#ffffff',
      navBarBackgroundColor: '#00adf5'
    } :
    {};

    this.props.navigator.push({
      screen: 'media.PreviewScreen',
      title: i18n('PREVIEW_SCREEN_TITLE'),
      animated,
      navigatorStyle: platformSpecificNavStyle
    });
  }

  refreshNativeGallery(selected) {
    if (this.props.photosPermission) {
      this.setState({album: {albumName: 'All Photos'}});
      this.gallery.refreshGalleryView(selected);
    }
  }

  onCameraIconPressed() {
    if (this.props.cameraPermission && this.props.photosPermission) {

      if (this.state.dropdownVisible) {
        this.setState({dropdownVisible: false});
      } else {
        this.props.navigator.showModal({
          screen: 'media.CameraScreen',
          navigatorStyle: {
            navBarHidden: true,
            statusBarHidden: true,
            statusBarHideWithNavBar: true
          }
        });
      }
    }
  }

  async onSelectedChanged(selectedImage) {
    await this.props.dispatch(imagesActions.selectedImagesChanged(selectedImage));

    if (this.props.maxImagesUpload && selectedImage) {
      this.showNextScreen(true);
    }
  }



  setNextButtonDisability(isDisabled) {


    const rightButtons = this.state.singleImageMode ? undefined : [{
      title: i18n('IMAGES_SCREEN_RIGHT_BUTTON_NEXT'),
      id: 'navBarNext',
      disabled: isDisabled
    }];

    //const rightButtons = Platform.OS === 'ios' && !nextButton ? {} : null;


    this.props.navigator.setButtons({
      rightButtons,
      leftButtons: Platform.OS === 'ios' ? [cancelButton] : {id: 'cancel'}
    });
  }

  onAlbumNamePressed() {
    this.setState({dropdownVisible: !this.state.dropdownVisible});
  }

  onSelectAlbum(album) {
    this.setState({dropdownVisible: false, album});
  }

  renderCameraView() {
    if (!this.props.cameraPermission) {
      return (
        <View style={{flex: 1, alignSelf: 'stretch'}}/>
      );
    }
    return (
      <CameraKitCamera
        cameraOptions={{
          flashMode: 'auto',    // on/off/auto(default)
          focusMode: 'off',      // off/on(default)
          zoomMode: 'off'        // off/on(default)
        }}
        style={{flex: 1, alignSelf: 'stretch'}}
      />
    );
  }

  renderCamera() {
    return (
      <View style={[styles.camera]}>
        {this.renderCameraView()}

        {Platform.OS === 'android' ? (
          <View style={styles.cameraIcon}>
            <Animated.View style={{flex: 1, backgroundColor: '#000000', opacity: this.state.blockerOpacity}}/>
          </View>
        ) : null}

        <View style={styles.cameraIcon}>
          <TouchableOpacity
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            onPress={() => this.onCameraIconPressed()}
          >
            <Image
              style={Platform.OS === 'ios' ? undefined : {width: 40, height: 40}}
              source={Assets.icons.cameraWhite}
              resizeMode={Image.resizeMode.contain}
            />
            <Text style={{color: 'white', backgroundColor: 'transparent'}}>{i18n('IMAGES_SCREEN_CAMERA')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderAlbumSelection() {
    return (
      <View style={albumSelectionStyle}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={{flex: 1, paddingVertical: 10}} onPress={() => this.onAlbumNamePressed()}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 18, fontWeight: '500'}}>{this.state.album.albumName}</Text>
              <Image
                style={{alignSelf: 'center', marginLeft: 5, marginTop: 5}}
                source={this.state.dropdownVisible ? require('./../../images/arrowUp.png') : require('./../../images/arrowDown.png')}
              />
            </View>
          </TouchableOpacity>
          {
            !this.state.singleImageMode &&
            <Text style={{alignSelf: 'center', fontSize: 17, fontWeight: '200'}}>
              {this.props.selectedImages.length} {i18n('IMAGES_SCREEN_ALBUM_SELECTED_POSTFIX')}
            </Text>
          }
        </View>
        {this.renderDropdown()}
      </View>
    );
  }

  renderDropdown() {
    return (
      <View style={styles.dropdownContainer}>
        <AlbumsDropdown
          style={{height: (height - albumSelectionStyle.top - albumSelectionStyle.height - 64)}}
          onSelectAlbum={(album) => this.onSelectAlbum(album)}
          visible={this.state.dropdownVisible}
          albums={this.state.albums}
        />
      </View>
    );
  }

  renderGallery() {
    let selectedImageIcon = Platform.OS === 'ios' ? require('./../../images/selected.png') : resolveAssetSource(require('./../../images/selected.png')).uri;
    let unSelectedImageIcon = Platform.OS === 'ios' ? require('./../../images/unSelected.png') : resolveAssetSource(require('./../../images/unSelected.png')).uri;
    if (this.state.singleImageMode) {
      selectedImageIcon = undefined;
      unSelectedImageIcon = undefined;
    }

    const lastEditedImage = this.props.lastEditedImage;
    this.props.lastEditedImage = null;
    return (
      <View style={styles.gallery}>
        <CameraKitGalleryView
          ref={(gallery) => {
            this.gallery = gallery;
          }}
          style={{flex: 1, marginTop: 20}}
          minimumInteritemSpacing={10}
          minimumLineSpacing={10}
          albumName={this.state.album.albumName}
          columnCount={3}
          onTapImage={(event) => {
            this.onSelectedChanged(event.nativeEvent.selected);
          }}
          selectedImages={this.props.selectedImages}
          dirtyImages={[lastEditedImage]}
          selectedImageIcon={selectedImageIcon}
          unSelectedImageIcon={unSelectedImageIcon}
          fileTypeSupport={Platform.OS === 'ios' ? undefined : {
            supportedFileTypes: ['image/png', 'image/jpeg'],
            unsupportedOverlayColor: '#55000000',
            unsupportedText: i18n('IMAGES_SCREEN_UNSUPPORTED_FILE'),
            unsupportedTextColor: '#ffffff'}}
          imageStrokeColor={'#edeff0'}
          disableSelectionIcons={this.state.singleImageMode}
        />
      </View>
    );
  }

  renderUserUnAuthorized() {
    return (
      <PrimingView permissionsDenied/>
    );
  }

  render() {
    if (this.props.photosPermission && this.props.cameraPermission) {
      return (
        <View style={styles.container}>
          {this.renderCamera()}
          {this.renderGallery()}
          {this.renderAlbumSelection()}
        </View>
      );
    } else {
      return this.renderUserUnAuthorized();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 20,
    paddingBottom: 0,
    backgroundColor: '#ffffff'
  },
  camera: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: cameraAreaStyle.height - (screenPadding / 2),
    width: cameraAreaStyle.width
  },
  gallery: {
    marginTop: albumSelectionStyle.height,
    flex: 3.5,
    justifyContent: 'center'
  },
  dropdownContainer: {
    position: 'absolute',
    flexDirection: 'column',
    width: albumSelectionStyle.width,
  }
});
