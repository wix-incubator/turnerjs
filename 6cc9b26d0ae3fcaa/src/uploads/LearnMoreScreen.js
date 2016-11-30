import React, {Component, PropTypes} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {i18n} from './../../strings';

class LearnMoreScreen extends Component {

  static navigatorButtons = {
    rightButtons: [{
      title: i18n('LEARN_MORE_SCREEN_DONE_BUTTON'),
      id: 'learnMoreDone'
    }]
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'learnMoreDone') {
        Navigation.dismissModal();
      }
    }
  }

  render() {
    return (
      <View
        style={styles.container}
      >
        <View style={styles.textsContainer}>
          <Text style={styles.textTitle}>{i18n('LEARN_MORE_SCREEN_HOW_TO')}</Text>
          <Text style={styles.textContent}>{i18n('LEARN_MORE_SCREEN_OPEN_WIX_EDITOR')}</Text>
          <Text style={styles.textContent}>{i18n('LEARN_MORE_SCREEN_HEAD_TO')}</Text>
          <Text style={styles.textContent}>{i18n('LEARN_MORE_SCREEN_CLICK_IMAGES')}</Text>
          <Text style={styles.textContent}>{i18n('LEARN_MORE_SCREEN_OPEN_YOUR_MOBILE_UPLOADS')}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  textsContainer: {
    marginTop: 43,
    paddingLeft: 30
  },
  textTitle: {
    fontSize: 27,
    lineHeight: 35,
    color: '#2d4150',
    paddingBottom: 27
  },
  textContent: {
    fontSize: 17,
    lineHeight: 27,
    color: '#7a92a5'
  }
});

export default LearnMoreScreen;
