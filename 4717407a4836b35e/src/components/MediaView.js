import React, {Component} from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableHighlight,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';

import PhotoItem from '../components/PhotoManagerImageItem'

import styles from '../styles/MediaVewStyles';
import * as CONSTANTS from '../utils/constants';
import {mediaCommands} from '../utils/CQRSVCommandsBuilder';

import _ from 'lodash';

export default class MediaView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY({x: 0, y: 0}),
      media: [...this.props.media],
      changed: false
    };

    this.scrollValue = 0;
    this.itemGrid = [];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.media !== nextProps.media) {
      this.setState({
        media: [...nextProps.media]
      });

      setTimeout(() => {
        this.recalculateGrid();
      }, 0);
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.recalculateGrid(true);
    }, 0);
  }

  componentWillMount() {
    const onPanResponderMoveCb = Animated.event([null, {
      dx: this.state.pan.x,
      dy: this.state.pan.y,
    }]);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => !!this.state.itemProps,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => !!this.state.itemProps,
      onPanResponderTerminate: (evt, gestureState) => false,
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onShouldBlockNativeResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {

        onPanResponderMoveCb(evt, gestureState);

        this.getItemIndex(gestureState.moveX, gestureState.moveY);

        if (gestureState.moveY + 100 > Dimensions.get('window').height || gestureState.moveY < 80) {
          this.moveY = gestureState.moveY;
          !this.requested && requestAnimationFrame(this.scrollAnimation.bind(this));
        } else {
          this.moveY = undefined;
          this.requested = false;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.moved = false;
        this.state.item.onPressOut();
      },
      onPanResponderGrant: (evt, gestureState) => {
        this.moved = true;
      },
    });
  }

  scrollAnimation() {
    if (this.moveY == null) return;

    const scrollLowerBound = 100;
    const scrollHigherBound = Dimensions.get('window').height - scrollLowerBound;
    const maxScrollValue = this.scrollContainerHeight - Dimensions.get('window').height;
    const currentScrollValue = this.scrollValue;
    const scrollMaxChange = 20;

    let newScrollValue = null;
    this.requested = true;

    if (this.moveY < scrollLowerBound && currentScrollValue > -100) {
      let pChange = 1 - (this.moveY / scrollLowerBound);
      newScrollValue = currentScrollValue - (pChange * scrollMaxChange);
      if (newScrollValue < 0) newScrollValue = 0;
    }

    if (this.moveY > scrollHigherBound && currentScrollValue < maxScrollValue) {
      let pChange = 1 - ((Dimensions.get('window').height - this.moveY) / scrollLowerBound);
      newScrollValue = currentScrollValue + (pChange * scrollMaxChange);
      if (newScrollValue > maxScrollValue) newScrollValue = maxScrollValue;
    }

    if (newScrollValue !== null) {
      this.scrollValue = newScrollValue;
      this.scrollView.scrollTo({x: 0, y: this.scrollValue, animated: false});
    } else {
      this.requested = null;
    }

    requestAnimationFrame(this.scrollAnimation.bind(this));
  }

  onLongPress({ pageX, pageY, itemProps, layout , item}) {
    const {width} = Dimensions.get('window');
    const itemSize = (width - 35 * 2) / 2;

    this.state.pan.setOffset({
      x: layout.width > itemSize ? (pageX - (itemSize - 10) / 2) : layout.px + 5,
      y: layout.width > itemSize ? (pageY - (itemSize - 10) / 2) : layout.py + 5
    });

    this.state.pan.setValue({x: 0, y: 0});

    this.setState({
      pageX,
      pageY,
      itemProps,
      layout,
      item
    });
  }

  shouldPressOut() {
    return !this.moved;
  }

  onPressOut() {
    if (this.previosIndex != null && this.selectedIndex !== this.previosIndex) {
      const {newMedia} = this.reorderItems(this.selectedIndex, this.previosIndex);
      this.reorderUI(newMedia);
      this.deactivateItems();
    }

    this.moveY = undefined;

    this.setState({
      itemProps: null
    });
  }

  onItemLayout({px, py, width, height}) {
    this.itemGrid.push({x: px, x1: px + width, y: py, y1: py + height});
  }

  getItemIndex(moveX, moveY) {
    const _moveY = moveY + this.scrollValue;

    const item = _.first(this.itemGrid.filter((it) => {
      return it.x < moveX && it.y < _moveY && it.x1 > moveX && it.y1 > _moveY
    }));

    const index = this.itemGrid.indexOf(item);

    if (this.previosIndex != null && this.previosIndex !== index) {
      this.refs['item_' + this.previosIndex].setActive(false);
    }

    if (!!~index && this.refs['item_' + index]) {
      this.refs['item_' + index].setActive(true, this.selectedIndex < index);
      this.previosIndex = index;
    }
  }

  deactivateItems() {
    for (let i = 0; i < this.props.media.length; i++) {
      this.refs['item_' + i].setActive(false);
    }

    this.previosIndex = null;
  }

  reorderItems(from, to) {
    const newMedia = [...this.state.media];

    newMedia.splice(to, 0, newMedia.splice(from, 1)[0]);

    for (let i = 0; i < newMedia.length; i++) {
      if (newMedia[i].index !== i) {
        newMedia[i] = {...newMedia[i], index: i};
      }
    }


    return {newMedia};
  }

  reorderUI(newMedia) {
    //const startItemIndex = Math.min(this.selectedIndex, this.previosIndex);
    //const endItemIndex = Math.max(this.selectedIndex, this.previosIndex);
    //const movingDirection = this.selectedIndex > this.previosIndex ? 0 : 1;

    this.props.onMediaReordered(newMedia);

    //Promise.all([...newMedia.slice(startItemIndex, endItemIndex + 1).map((m, i) => {
    //
    //  return this.refs['item_' + (startItemIndex + i)].animateChange(m, (startItemIndex + i) === this.selectedIndex ? movingDirection : 2)
    //
    //})]).then(() => {
    //  this.props.onMediaReordered(newMedia);
    //});
  }

  onDelete(mediaItemIndex) {
    this.props.onDelete(() => {
      return _.filter(
        this.state.media, i => i.index !== mediaItemIndex
      ).map(photo => photo.index > mediaItemIndex
        ? {...photo, index: photo.index - 1}
        : photo
      );
    });
  }

  recalculateGrid() {

    this.itemGrid = [];

    for (let i = 0; i < this.props.media.length; i++) {
      if (this.refs['item_' + i]) {
        (this.refs['item_' + i].getComp() || {}).measure((fx, fy, width, height, px, py) => {
          this.onItemLayout({fx, fy, width, height, px, py: py + this.scrollValue});
        });
      }
    }
  }

  addButton() {
    return (<TouchableHighlight underlayColor="rgb(234, 247, 255)" style={styles.addButtonContainer}
                                onPress={this.props.onAddPressed}>
      <View style={styles.addButtonSub}>
        <Image style={styles.addButtonIcon} source={require('../assets/addNewProduct.png')}/>
        <Text style={styles.addButtonText}>{CONSTANTS.PHOTO_MANAGER_ADD_IMAGE}</Text>
      </View>
    </TouchableHighlight>)
  }

  empty() {
    return (
      <View style={styles.box}>
        <ScrollView style={styles.box}>
          <View style={{padding: 25}}>
            {this.addButton()}
          </View>
        </ScrollView>
      </View>
    )
  }

  render() {
    const {media} = this.state;

    return !media.length ? this.empty() : (
      <View style={styles.box} ref="sv">
        <ScrollView style={styles.box}
                    scrollEnabled={!this.state.itemProps}
                    ref={s => {this.scrollView = s}}
                    scrollEventThrottle={16}
                    onScroll={({nativeEvent: {contentOffset, contentSize}}) => {
                        this.scrollValue = contentOffset.y;
                        this.scrollContainerHeight = contentSize.height;
                    }}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this.scrollContainerHeight = contentHeight;
                    }}
                    alwaysBounceVertical={true}
        >
          <View style={styles.top}>
            <Text style={styles.topText}>{CONSTANTS.PHOTO_MANAGER_TAP_AND_HOLD}</Text>
          </View>
          <View style={styles.box} {...this._panResponder.panHandlers}>
            <View style={styles.mainPicture}>
              <PhotoItem
                key={`p_${_.first(media).url + 0}`}
                style={styles.mainPictureImage}
                source={_.first(media).url}
                onLongPress={(itemProps) => {
                    this.selectedIndex = 0;
                    this.onLongPress(itemProps)
                }}
                onPressOut={this.onPressOut.bind(this)}
                shouldPressOut={this.shouldPressOut.bind(this)}
                onLayout={layout => {this.onItemLayout(layout)}}
                ref={'item_0'}
                withoutDelete={!!this.state.itemProps}
                onDelete={this.onDelete.bind(this)}
                index={_.first(media).index}
              />
            </View>
            <View style={styles.photosBlock}>
              {media.slice(1).map((m, i)=> {
                return (
                  <PhotoItem
                    key={`p_${m.url + (i+ 1) }`}
                    ref={'item_' + (i + 1)}
                    style={styles.photoBlockImage}
                    source={m.url}
                    onLongPress={(itemProps) => {
                        this.selectedIndex = i + 1;
                        this.onLongPress(itemProps)
                    }}
                    onPressOut={this.onPressOut.bind(this)}
                    shouldPressOut={this.shouldPressOut.bind(this)}
                    onLayout={layout => {this.onItemLayout(layout)}}
                    withoutDelete={!!this.state.itemProps}
                    onDelete={this.onDelete.bind(this)}
                    index={m.index}
                  />
                )
              })}
              {this.props.isAddButton ? this.addButton() : null}
            </View>
          </View>
        </ScrollView>
        {this.state.itemProps ? (
          <Animated.View style={[
                        styles.dragImageContainer,
                        this.state.pan.getLayout()
                    ]}>
            <PhotoItem
              style={styles.box}
              withoutDelete={true}
              source={this.state.itemProps.source}/>
          </Animated.View>
        ) : null}
      </View>
    )
  }
}

