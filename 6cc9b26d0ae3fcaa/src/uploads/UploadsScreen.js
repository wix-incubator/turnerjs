import React, {Component, PropTypes} from 'react';
import {
  Animated,
  StyleSheet,
  Text, View,
  ListView, Image, TouchableOpacity,
  RefreshControl, Dimensions,
  Platform
} from 'react-native';
import {ErrorScreen} from 'wix-react-native-error-components';
import {connect} from 'react-redux';
import * as uploadActions from './actions';
import * as imagesActions from '../images/actions';
import _ from 'lodash';
import UploadRow from './UploadRow';
import * as consts from './consts';
import AddPlaceholder from './AddPlaceholder';
import Loader from '../components/Loader';
import {Constants} from 'wix-react-native-ui-lib';
import biLogger, {biEvents} from '../services/WixBiLogger.config';
import {i18n} from './../../strings';


const ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2
});

const LEARN_MORE_TEXT = i18n('UPLOAD_SCREEN_HEADER_LEARN_MORE');
let isHeaderShown = true;

class UploadsScreen extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uploads: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    transit: PropTypes.object.isRequired,
    shouldShowLearnMore: PropTypes.bool
  };

  static navigatorButtons = Platform.OS === 'ios' ? {} :
    {
      fab: {
        collapsedId: 'add',
        collapsedIcon: require('./img/fab.png'),
        backgroundColor: Constants.paletteColors.blue10
      }
    };

  constructor(props) {
    super(props);
    const processed = this.prepareData(props.uploads);
    this.state = {
      processed,
      dataSource: ds.cloneWithRows(processed),
      messageRight: new Animated.Value(0),
      messageHeight: new Animated.Value(110),
    };
    this.onAddPhotos = this.onAddPhotos.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.onPressRow = this.onPressRow.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.onTryAgain = this.onTryAgain.bind(this);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    if (props.transit.error && !props.transit.everLoaded) {
      this.onTryAgain();
    }
  }

  componentWillReceiveProps(nextProps) {
    const processed = this.prepareData(nextProps.uploads);
    this.setState({
      processed,
      dataSource: this.state.dataSource.cloneWithRows(processed),
    });
  }

  onNavigatorEvent(event) {
    console.log('EVENT', event);
    if (event.id === 'add') {
      this.onAddPhotos();
    }
  }

  onAddPhotos() {
    biLogger.log({...biEvents.click_on_add_a_photo});
    this.props.dispatch(imagesActions.showImagesModal({
      pushUploadGroupScreen: false
    }));
  }

  onRefresh() {
    this.props.dispatch(uploadActions.loadPreviousUploads());
  }

  onPressRow(row) {
    if (row.state === consts.UPLOAD_STATES.FAILED) {
      this.props.dispatch(uploadActions.retryUpload(row));
    } else if (!row.wixId) {
      return;
    } else {
      let uploads = _.cloneDeep(this.state.processed);
      uploads = _.filter(uploads, (upload) => !upload.isAdd);
      const index = _.findIndex(uploads, (upload) => upload.wixId === row.wixId);
      this.props.navigator.push({
        screen: 'media.ImagePreviewScreen',
        title: '',
        backButtonTitle: i18n('UPLOAD_SCREEN_BACK_BUTTON_TITLE'),
        passProps: {
          uploads,
          index
        }
      });
    }
  }

  prepareData(uploads) {
    const processed = _.sortBy(uploads, 'startedTS');
    if (Platform.OS === 'ios') {
      _.set(processed, _.size(processed), {isAdd: true});
    }
    return _.reverse(processed);
  }

  renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Image source={require('../../images/empty.png')} style={[styles.emptyImage, {width: 230, height: 176}]}/>
        <Text style={styles.emptyText}>
          {i18n('UPLOAD_SCREEN_EMPTY_STATE_TEXT')}
        </Text>
        <TouchableOpacity onPress={this.onAddPhotos}>
          <Text style={styles.emptyCTA}>
            {i18n('UPLOAD_SCREEN_EMPTY_STATE_CHOOSE_PHOTOS')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderSeparator(sectionID, rowID) {
    return (
      <View key={`${rowID}_separator`} style={styles.separator}/>
    );
  }

  renderRow(row) {
    if (row.isAdd) {
      return (
        <AddPlaceholder onPress={this.onAddPhotos}/>
      );
    }
    const key = row.uri ? row.uri : row.wixId;
    return (
      <UploadRow
        key={key}
        {...row}
        onPress={this.onPressRow}
      />
    );
  }

  onCloseButtonPressed() {
    const timing = Animated.timing;
    Animated.sequence([
      timing(
        this.state.messageRight,
        {
          toValue: 20,
          duration: 100
        }
      ),
      timing(
        this.state.messageRight,
        {
          toValue: -Dimensions.get('window').width,
          duration: 200
        }
      ),
      timing(
        this.state.messageHeight,
        {
          toValue: 0,
          duration: 200
        }
      )
    ]).start();

    this.state.messageHeight.addListener(({value}) => this.onAnimationFinished(value));

  }

  onAnimationFinished(value) {
    if (isHeaderShown && value === 0) {
      isHeaderShown = false;
      this.props.dispatch(uploadActions.toggleShouldShowLearnMore());
    }
  }

  onLearnMorePressed() {
    const platformSpecificNavStyle = (Platform.OS === 'android') ? {
      navBarButtonColor: '#ffffff',
      navBarTextColor: '#ffffff',
      navBarBackgroundColor: '#00adf5'
    } : {};
    this.props.navigator.showModal({
      screen: 'media.LearnMoreScreen',
      navigatorStyle: {...platformSpecificNavStyle}
    });
  }

  renderHeader() {

    if (!this.props.shouldShowLearnMore) {
      return false;
    }

    if (_.find(this.props.uploads, (val) =>
      val.state === consts.UPLOAD_STATES.SERVER ||
      val.state === consts.UPLOAD_STATES.FINISHED)) {
      return (
        <Animated.View style={[styles.headerContainer, {right: this.state.messageRight, height: this.state.messageHeight}]}>
          <View style={styles.header}>
            <Text style={styles.messageText}>
              {i18n('UPLOAD_SCREEN_HEADER_TEXT')}
            </Text>
            <TouchableOpacity
              style={{position: 'absolute', right: 0, top: 0, padding: 14}}
              onPress={() => this.onCloseButtonPressed()}
            >
              <Image
                source={require('./img/close.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.onLearnMorePressed()} style={{paddingTop: 5}}>
              <Text style={styles.learnMoreButton}>
                {(Platform.OS === 'ios') ? LEARN_MORE_TEXT : LEARN_MORE_TEXT.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }
    return false;
  }

  renderError() {
    return (
      <ErrorScreen
        ctaText={i18n('UPLOAD_SCREEN_TRY_AGAIN')}
        onCTA={this.onTryAgain}
      />
    );
  }

  onTryAgain() {
    this.props.dispatch(uploadActions.loadPreviousUploads());
  }

  render() {
    if (this.props.transit.error) {
      return this.renderError();
    }
    if (!this.props.transit.everLoaded) {
      return (
        <Loader/>
      );
    }
    if (_.isEmpty(this.props.uploads)) {
      return this.renderEmpty();
    }
    return (
      <View style={{flex: 1, backgroundColor: '#ffffff'}}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          contentContainerStyle={{justifyContent: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', padding: 15, paddingTop: 15}}
          initialListSize={14}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={!this.props.transit.isLoaded && !this.props.transit.error}
              onRefresh={this.onRefresh}
              colors={['#00adf5']}
              progressBackgroundColor={'#ffffff'}
            />
        }
          renderHeader={this.renderHeader}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  separator: {
    width: 5,
    backgroundColor: '#ffffff'
  },
  headerContainer: {
    width: Dimensions.get('window').width - 40,
    marginLeft: 5,
  },
  header: {
    padding: 15,
    backgroundColor: '#f0f3f5',
    marginBottom: 20
  },
  messageText: {
    textAlign: 'left',
    fontSize: 15,
    color: '#7a92a5',
    fontWeight: '400',
    lineHeight: 20,
    marginRight: 20,
  },
  learnMoreButton: {
    backgroundColor: '#f0f3f5',
    color: '#00adf5',
    fontSize: 15,
    lineHeight: 25,
    marginTop: 5
  },
  emptyContainer: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  emptyText: {
    color: '#20455e',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '300',
    marginTop: 40,
    marginLeft: 60,
    marginRight: 60,
    marginBottom: 20,
    lineHeight: 25
  },
  emptyImage: {},
  emptyCTA: {
    color: '#007aff',
    fontSize: 18,
    lineHeight: 25
  }
});

function mapStateToProps(state) {
  return {
    ...state.uploads
  };
}

export default connect(mapStateToProps)(UploadsScreen);
