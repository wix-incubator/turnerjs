import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image
} from 'react-native';
import {i18n} from './../../strings';

export default class PrimingView extends Component {

  static propTypes = {
    callback: PropTypes.func,
    permissionsDenied: PropTypes.bool
  };

  buttonPressed(pressed) {
    switch (pressed) {
      case 'notnow':
        this.props.callback(false);
        break;
      case 'ok':
        this.props.callback(true);
        break;
      default:
    }
  }

  renderButtons() {
    return (
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.notNowbutton} onPress={() => this.buttonPressed('notnow')}>
          <Text style={styles.notNowText}>{i18n('PRIMING_SCREEN_ALERT_NOT_NOW')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.okButton} onPress={() => this.buttonPressed('ok')}>
          <Text style={styles.okText}>{i18n('PRIMING_SCREEN_ALERT_OK')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={styles.imageContainer}>
          <Image
            source={require('./../../images/priming.png')}
            resizeMode={Image.resizeMode.contain}
          />
        </View>

        <View style={styles.wordsContainer}>
          <Text style={styles.titleText}>
            {i18n('PRIMING_SCREEN_ALLOW_PHOTO_ACCESS')}
          </Text>
          <Text style={styles.paragraphText}>
            {
              this.props.permissionsDenied ?
              i18n('PRIMING_SCREEN_REQUEST_ENABLE_PERMISSION_IN_SETTINGS') :
              i18n('PRIMING_SCREEN_REQUEST_PERMISSION')
            }
          </Text>
        </View>

        {this.props.permissionsDenied ? null : this.renderButtons()}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  imageContainer: {
    alignSelf: 'center', justifyContent: 'center'
  },
  wordsContainer: {
    alignItems: 'center',
    marginTop: 43
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 47
  },
  notNowbutton: {
    borderColor: '#00adf5',
    borderWidth: 1,
    borderRadius: 25
  },
  okButton: {
    backgroundColor: '#00adf5',
    borderRadius: 25,
    marginLeft: 25
  },
  titleText: {
    fontSize: 27,
    fontWeight: '300'
  },
  paragraphText: {
    paddingHorizontal: 40,
    fontSize: 17,
    fontWeight: '200',
    textAlign: 'center',
    marginTop: 22,
    color: '#7a92a5'
  },
  notNowText: {
    backgroundColor: 'transparent',
    fontSize: 17,
    color: '#00adf5',
    paddingVertical: 10,
    paddingHorizontal: 32
  },
  okText: {
    backgroundColor: 'transparent',
    fontSize: 17,
    color: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 55
  }
});
