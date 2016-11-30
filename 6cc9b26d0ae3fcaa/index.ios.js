import React, {
  Component,
} from 'react';
import {
  AppRegistry,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';

import {Navigation} from 'react-native-navigation';
import {ModuleRegistry, WixSession} from 'a-wix-react-native-framework';
import './src/module';

ModuleRegistry.notifyListeners('core.AppInit',
  {
    appInstallationId: '62104b51-610d-4404-8548-c6c53217f9b9',
    appVersion: '1.2.3',
    bundleVersion: '17',
    osVersion: '9.2'
  }
);

WixSession.getDemoSession('julie@example.com', '123456').then((session) => {
  ModuleRegistry.notifyListeners('core.SessionUpdate', session);
});

class Example extends Component {

  constructor(props) {
    super(props);
    this.state = {
      result: 'result'
    };
  }

  onOpenMobileUploads() {
    this.restResult();
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'media.UploadsScreen',
        title: 'Mobile Uploads'
      }
    });
  }

  restResult() {
    this.setState({result: ''});
  }

  async onStartGroup(overlay, max) {
    this.restResult();
    try {
      const urls = await ModuleRegistry.invoke('media.UploadImages', overlay, max);

      this.setState({result: JSON.stringify(urls)});
    } catch (e) {
      this.setState({result: JSON.stringify(e)});
    }
  }

  onShowCameraWithOverlay() {
    const cameraOverlay = {
      color: '#00000077',
      ratios: ['1:1', '3:4', '9:6']
    };
    this.onStartGroup(cameraOverlay);
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>

        <TouchableOpacity onPress={() => this.onOpenMobileUploads()}>
          <Text style={styles.text}>
            Show Mobile Uploads
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.onStartGroup()}>
          <Text style={styles.text}>
            Upload Group
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.onShowCameraWithOverlay()}>
          <Text style={styles.text}>
            Show camera with overlay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.onStartGroup(null, 1)}>
          <Text style={styles.text}>
            Upload Single Image
          </Text>
        </TouchableOpacity>


        <ScrollView>
          <Text>{this.state.result}</Text>
        </ScrollView>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontSize: 25,
    padding: 20
  },
});

ModuleRegistry.registerComponentAsScreen('example.main', () => Example);

Navigation.startSingleScreenApp({
  screen: {
    screen: 'example.main',
    title: 'Example'
  }
});

AppRegistry.registerComponent('example', () => Example);
