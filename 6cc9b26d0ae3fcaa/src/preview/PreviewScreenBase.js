import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  PixelRatio
} from 'react-native';
import {i18n} from './../../strings';
import * as imagesActions from '../images/actions';
import _ from 'lodash';
import * as consts from '../images/constants';
import biLogger, {biEvents} from '../services/WixBiLogger.config';
import {CameraKitGallery} from 'react-native-camera-kit';

const {width} = Dimensions.get('window');
const scrollViewImagesSize = (width / 5) - 5 - 7;



export default class PreviewScreenBase extends Component {

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state = {
      imageRotationValue: 0,
      imagesData: [],
      loaded: false,
      imagePresentedIndex: 0,
      singleImageMode: (this.props.maxImagesUpload === 1)
    };
    this.reload = this.reload.bind(this);
    this.throttledUploadPressed = _.throttle(this.uploadPressed, 1000, {leading: true, trailing: false});
    this.isUnmount = false; //HACK
  }

  async componentDidMount() {
    this.setNavBarButtons(true);
    this.reload(this.props.uploadImages);

    // HACK - this code written in order to overcome a bug when upload
    // navigation button pressed rapidly (<1 sec) and
    // the navigation throttle the push screen but the button event is
    // called and upload process started but no screen pushed
    setTimeout(() => {
      if (!this.isUnmount) {
        this.setNavBarButtons(false);
      }
    }, 500);
  }

  componentWillUnmount() {
    this.isUnmount = true; //HACK
  }

  componentWillReceiveProps(nextProps) {
    this.reload(nextProps.uploadImages);
  }

  async reload(uploadImages) {
    this.setState({loaded: false});
    if (_.isEmpty(uploadImages)) {
      return;
    }
    const data = await CameraKitGallery.getImagesForIds(uploadImages);
    const imagesData = data.images;
    this.setState({
      imagesURLs: this.extractUrls(imagesData),
      imagesData,
      presentedImage: imagesData[this.state.imagePresentedIndex],
      imagePresentedIndex: this.state.imagePresentedIndex,
      loaded: true
    });
  }

  setNavBarButtons(isUploadDisabled) {
    this.props.navigator.setButtons({
      rightButtons: [{
        title: i18n('PREVIEW_SCREEN_UPLOAD_BUTTON'),
        id: 'previewUpload',
        disabled: isUploadDisabled
      }],
      animated: true
    });
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'previewUpload') {
        this.throttledUploadPressed();
      }
    }
  }

  uploadPressed() {
    this.props.dispatch(imagesActions.uploadImages(this.props.navigator, this.state.imagesData));
  }

  extractUrls(images) {
    return _.map(images, 'uri');
  }

  imagePressed(imageObject, i) {
    this.setState({presentedImage: imageObject, imagePresentedIndex: i});
  }

  rotationDegree() {
    return `${(this.state.imageRotationValue).toString()}deg`;
  }

  onAddMoreImagesPressed() {
    this.props.navigator.pop({
      animated: true
    });
  }

  createImages(imageObject, i) {
    const selectedStyle = (imageObject.uri === this.state.presentedImage.uri) ? {
      borderWidth: 2,
      borderColor: 'rgb(0,173,245)',
    } : {};
    const imageKey = 'previewImageKey_' + i;
    return (
      <TouchableOpacity
        key={i}
        onPress={() => this.imagePressed(imageObject, i)}
        style={[{width: scrollViewImagesSize,
          height: scrollViewImagesSize,
          marginRight: 5}, selectedStyle]}
      >
        <Image
          key={imageKey}
          style={{flex: 1}}
          source={{uri: imageObject.uri + `?${_.uniqueId()}`}}
        />
      </TouchableOpacity>
    );
  }

  createLoadingImage(uri) {
    return (
      <View
        key={uri}
        style={[{width: scrollViewImagesSize,
          height: scrollViewImagesSize,
          marginRight: 5}, {backgroundColor: '#CCCCCC'}]}
      />
    );
  }

  addMoreImageButton() {
    return (
      <TouchableOpacity
        onPress={() => this.onAddMoreImagesPressed()}
        style={{width: scrollViewImagesSize, height: scrollViewImagesSize}}
      >
        <Image
          style={{width: scrollViewImagesSize, height: scrollViewImagesSize}}
          source={require('./../../images/addMoreImages.png')}
          resizeMode={Image.resizeMode.contain}
        />
      </TouchableOpacity>
    );
  }

  async _onDeletePressed() {
    biLogger.log({...biEvents.click_on_delete_photo});
    await this.props.dispatch(imagesActions.swapImage(this.state.presentedImage.id, ''));
    await this.props.dispatch(imagesActions.overrideSelectedImagesWithUploadImages());
    this.props.dispatch(imagesActions.cameraDoneUpdateValue(consts.PREVIEW_SCREEN_BACK));
    if (this.props.uploadImages.length === 0) {
      this.onAddMoreImagesPressed();
    } else if (this.props.uploadImages.length === this.state.imagePresentedIndex) {
      this.setState({imagePresentedIndex: this.state.imagePresentedIndex - 1});
    } else {
      const updatedPresentedImageIndex = this.state.imagePresentedIndex > 0 ? this.state.imagePresentedIndex : 0;
      this.setState({imagePresentedIndex: updatedPresentedImageIndex});
    }
  }

  async onImageEditSuccessful(oldImageId, newImageId) {
    this.setNavBarButtons(true);
    await this.props.dispatch(imagesActions.swapImage(oldImageId, newImageId));
    await this.props.dispatch(imagesActions.overrideSelectedImagesWithUploadImages());
    this.props.dispatch(imagesActions.cameraDoneUpdateValue(consts.PREVIEW_SCREEN_BACK));
    this.saveLastEditedImageHack(newImageId);

    setTimeout(() => {
      this.setNavBarButtons(false);
    }, 10);
  }

  // HACK
  // We save the imageId, and pass it to the GalleryView directly in render to refresh the corresponding thumbnail
  saveLastEditedImageHack(newImageId) {
    if (Platform.OS === 'android') {
      this.props.dispatch(imagesActions.updateThumbnailAfterImageEdit(newImageId));
    }
  }

  renderLoading() {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={[styles.image, {backgroundColor: '#CCCCCC'}]}/>
        </View>
        <View style={styles.scrollViewContainer}>
          <ScrollView
            automaticallyAdjustContentInsets={false}
            horizontal
            style={styles.horizontalScrollView}
            contentContainerStyle={styles.scrollViewContentContainerStyle}
            contentInset={{right: 20}}
          >
            {this._renderHairline()}
            {this._renderFooter()}
          </ScrollView>
        </View>
      </View>
    );
  }

  isImageEditorEnabled() {
    throw new Error('isImageEditorEnabled should not be implemented in base screen');
  }

  _renderHairline() {
    if (this.isImageEditorEnabled()) {
      return (
        <View style={{backgroundColor: '#dedede', height: 1 / PixelRatio.get()}}/>
      );
    } else {
      return null;
    }
  }

  render() {
    return this.state.loaded ? this.renderLoaded() : this.renderLoading();
  }

  _renderFooter() {
    if (!this.state.singleImageMode) {
      return (
        <View style={styles.scrollViewContainer}>
          <ScrollView
            automaticallyAdjustContentInsets={false}
            horizontal
            style={styles.horizontalScrollView}
            contentContainerStyle={styles.scrollViewContentContainerStyle}
            contentInset={{right: 20}}
          >
            {this.state.imagesData.map((imageObject, i) => this.createImages(imageObject, i))}
            {this.addMoreImageButton()}
          </ScrollView>
        </View>
      );
    } else {
      return null;
    }
  }

  renderLoaded() {
    return (
      <View style={styles.container}>
        <View style={[styles.imageContainer]}>
          <Image
            style={styles.image}
            source={{uri: (this.state.presentedImage.uri + `?${_.uniqueId()}`)}}
            resizeMode={Image.resizeMode.contain}
          />
          {this.renderBottomMenu()}
        </View>
        {this._renderHairline()}
        {this._renderFooter()}
      </View>
    );
  }

  renderBottomMenu() {
    if (this.state.singleImageMode && this.isImageEditorEnabled()) {
      return (
        <View
          style={{alignItems: 'center', justifyContent: 'center'}}
        >
          <TouchableOpacity
            style={{flexDirection: 'row', padding: 12, paddingRight: 0}}
            onPress={() => this.onEditPressed()}
          >
            <Image
              source={require('../../images/editIcon.png')}
            />
          </TouchableOpacity>
        </View>
      );
    } else if (this.isImageEditorEnabled()) {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View
            style={{justifyContent: 'center'}}
          >
            <TouchableOpacity
              onPress={() => this._onDeletePressed()}
              style={{padding: 12, paddingLeft: 0}}
            >
              <Image
                source={require('../../images/deleteIcon.png')}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{justifyContent: 'center'}}
          >
            <TouchableOpacity
              style={{flexDirection: 'row', padding: 12, paddingRight: 0}}
              onPress={() => this.onEditPressed()}
            >
              <Image
                source={require('../../images/editIcon.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  onEditPressed() {
    biLogger.log({...biEvents.click_on_edit_photo});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  imageContainer: {
    flex: 5,
    padding: 20,
    paddingBottom: 0,
    backgroundColor: 'white'
  },
  image: {
    flex: 1,
    backgroundColor: 'white'
  },
  scrollViewContainer: {
    flex: 1
  },
  horizontalScrollView: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10

  },
  scrollViewContentContainerStyle: {
    alignItems: 'center',
    paddingRight: Platform.OS === 'android' ? 40 : undefined
  },
  scrollViewButton: {
    marginRight: 5,
    backgroundColor: 'black'
  }
});
