import React, {Component, PropTypes} from 'react';
import {StyleSheet, Image, View, Dimensions} from 'react-native';
import Loader from '../components/Loader';
import {WixMediaApi} from 'react-native-wix-media';
const wixMediaApi = new WixMediaApi('https://static.wixstatic.com/media');
const {width, height} = Dimensions.get('window');


export default class ImagePreviewPage extends Component {

  static propTypes = {
    wixId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    const loader = (
      <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
        <Loader/>
      </View>
    );

    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          resizeMode={'contain'}
          source={{uri: wixMediaApi.imageFit(this.props.wixId, parseInt(width), parseInt(height))}}
          onLoadStart={(e) => this.setState({loading: true})}
          onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}
          onLoad={() => this.setState({loading: false, error: false})}
        >
          {this.state.loading ? loader : false}
        </Image>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000000'
  },
  image: {
    width: Dimensions.get('window').width,
    height: undefined
  }
});
