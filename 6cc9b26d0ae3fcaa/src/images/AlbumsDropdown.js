import React, {Component, PropTypes} from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Animated,
    PixelRatio,
    Platform
} from 'react-native';
import _ from 'lodash';

export default class AlbumsDropdown extends Component {

  static propTypes = {
    albums: PropTypes.array.isRequired,
    visible: PropTypes.bool.isRequired,
    onSelectAlbum: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.renderAlbum = this.renderAlbum.bind(this);
    this.state = {
      height: new Animated.Value(1)
    };
  }

  shouldComponentUpdate(newProps) {
    if (newProps.albums !== this.props.albums) {
      return true;
    }
    if (newProps.visible !== this.props.visible) {
      Animated.timing(
        this.state.height,
        {
          toValue: newProps.visible ? newProps.style.height : 1,
          duration: 200
        }
      ).start();
    }
    return false;
  }

  render() {
    return (
      <Animated.View style={{height: this.state.height, backgroundColor: 'white', overflow: 'hidden'}}>
        <ScrollView>
          {_.map(this.props.albums, this.renderAlbum)}
        </ScrollView>
      </Animated.View>
    );
  }

  renderImage(album) {
    if (Platform.OS === 'ios') {
      return (
        <Image style={{height: 70, width: 70}} source={{uri: `data:image/jpg;base64,${album.image}`}}/>
      );
    } else {
      return (
        <Image style={{height: 70, width: 70}} source={{uri: `file://${album.thumbUri}`}}/>
      );
    }
  }

  renderAlbum(album) {
    return (
      <View key={Math.random()} style={{flexDirection: 'column'}}>
        <TouchableOpacity
          onPress={() => this.props.onSelectAlbum(album)}
          style={{flexDirection: 'row', padding: 15, paddingLeft: 0}}
        >
          {this.renderImage(album)}
          <View style={{flexDirection: 'column', justifyContent: 'center', marginLeft: 15}}>
            <Text style={{fontSize: 17, color: 'rgb(45,65,80)'}}>{album.albumName}</Text>
            <Text style={{fontSize: 14, color: 'rgb(170,183,197)', marginTop: 5}}>{album.imagesCount}</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 1 / PixelRatio.get(), backgroundColor: 'rgba(77,96,111, 0.2)'}}/>
      </View>
    );
  }
}
