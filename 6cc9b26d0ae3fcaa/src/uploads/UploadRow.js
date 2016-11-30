import React, {Component, PropTypes} from 'react';
import {
  StyleSheet,
  Text, View,
  Image, Dimensions, TouchableOpacity, Platform
} from 'react-native';
import {WixMediaApi} from 'react-native-wix-media';
const wixMediaApi = new WixMediaApi('https://static.wixstatic.com/media');
import * as consts from './consts';
import Loader from '../components/Loader';
import * as Progress from 'react-native-progress';

export default class UploadRow extends Component {
  static propTypes = {
    wixId: PropTypes.string,
    uri: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    state: PropTypes.string.isRequired,
    progress: PropTypes.number,
    onPress: PropTypes.func
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.state === this.props.state) {
      return nextProps.progress !== this.props.progress;
    }
    return true;
  }

  _renderProgress(state, progress) {
    if (state === consts.UPLOAD_STATES.SERVER || state === consts.UPLOAD_STATES.FINISHED) {
      return false;
    }
    if (state === consts.UPLOAD_STATES.PENDING) {
      return (
        <View style={[styles.inner, {backgroundColor: '#ffffffb0'}]}/>
      );
    }
    if (state === consts.UPLOAD_STATES.RUNNING) {
      //TODO this is because progress is only supported on IOS
      const indeterminate = progress >= 100 || Platform.OS === 'android';
      if (Platform.OS === 'ios') {
        return (
          <View style={[styles.inner, {backgroundColor: '#ffffffb0'}]}>
            <Progress.Circle
              color={'#3899ec'}
              style={{margin: progressMargin}}
              progress={progress / 100}
              size={innerSize - (2 * progressMargin)}
              animated
              indeterminate={indeterminate}
              thickness={3}
              borderWidth={indeterminate ? 3 : 1}
            />
          </View>
        );
      } else {
        return (
          <Loader/>
        );
      }
    }
    return false;
  }

  renderRetry() {
    return (
      <View style={[styles.inner, {backgroundColor: '#ffffffb0'}]}>
        <Image source={require('./img/retry.png')}/>
        <Text style={styles.retry}>{'Retry'}</Text>
      </View>
    );
  }

  render() {
    const uri = this.props.uri ? this.props.uri : wixMediaApi.imageFill(this.props.wixId, innerSize * 2, innerSize * 2);
    return (
      <TouchableOpacity style={styles.container} onPress={() => this.props.onPress(this.props)}>
        <Image style={styles.inner} source={{uri}}>
          {this._renderProgress(this.props.state, this.props.progress)}
          {this.props.state === consts.UPLOAD_STATES.FAILED ? this.renderRetry() : false}
        </Image>
      </TouchableOpacity>
    );
  }
}

const size = Math.floor((Dimensions.get('window').width - 30) / 3);
const innerSize = size - 10;
const isSmallDevice = Dimensions.get('window').width === 320;
const progressMargin = isSmallDevice ? 20 : 40;

const styles = StyleSheet.create({
  container: {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: innerSize,
    height: innerSize,
    alignItems: 'center',
    justifyContent: 'center'
  },
  retry: {
    color: '#3899ec',
    marginTop: 6,
    fontSize: 16
  }
});
