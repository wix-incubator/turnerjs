/*eslint react/jsx-no-bind: [0]*/

import React, {Component, PropTypes} from 'react';
import {
    Dimensions,
    View,
    PanResponder,
    Animated} from 'react-native';
import StaticRenderer from 'react-native/Libraries/Components/StaticRenderer';
import ViewPagerDataSource from './ViewPagerDataSource';

const deviceWidth = Dimensions.get('window').width;

export default class ViewPager extends Component {

  static propTypes = {
    ...View.propTypes,
    dataSource: PropTypes.instanceOf(ViewPagerDataSource).isRequired,
    renderPage: PropTypes.func.isRequired,
    onChangePage: PropTypes.func,
    locked: PropTypes.bool,
    animation: PropTypes.func,
    initialPage: PropTypes.number
  };

  static defaultProps = {
    initialPage: 0,
    locked: false,
    animation: (animate, toValue, gs) => {
      return Animated.spring(animate,
        {
          toValue,
          friction: 10,
          tension: 50
        });
    }
  };

  constructor(props) {
    super(props);
    this.fling = false;
    this.state = {
      currentPage: props.initialPage,
      viewWidth: 0,
      scrollValue: new Animated.Value(0)
    };
  }

  componentWillMount() {
    this.childIndex = 0;

    const release = (e, gestureState) => {
      const relativeGestureDistance = gestureState.dx / deviceWidth, vx = gestureState.vx;

      let step = 0;
      if (relativeGestureDistance < -0.5 || (relativeGestureDistance < 0 && vx <= 0.5)) {
        step = 1;
      } else if (relativeGestureDistance > 0.5 || (relativeGestureDistance > 0 && vx >= 0.5)) {
        step = -1;
      }

      this.movePage(step, gestureState);
    };

    this._panResponder = PanResponder.create({
      // Claim responder if it's a horizontal pan
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          if (this.props.locked !== true && !this.fling) {
            return true;
          }
        }
        return false;
      },

      // Touch is released, scroll to the one that you're closest to
      onPanResponderRelease: release,
      onPanResponderTerminate: release,

      // Dragging, move the view with the touch
      onPanResponderMove: (e, gestureState) => {
        const dx = gestureState.dx;
        const offsetX = (-dx / this.state.viewWidth) + this.childIndex;
        this.state.scrollValue.setValue(offsetX);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource) {
      const maxPage = nextProps.dataSource.getPageCount() - 1;
      const constrainedPage = Math.max(0, Math.min(this.state.currentPage, maxPage));
      this.setState({
        currentPage: constrainedPage,
      });

      this.state.scrollValue.setValue(constrainedPage > 0 ? 1 : 0);

      this.childIndex = Math.min(this.childIndex, constrainedPage);
    }
  }

  getCurrentPage() {
    return this.state.currentPage;
  }

  calculateNewScrollValue(pageNumber = -1, viewWidth) {
    const newPage = pageNumber !== -1 ? pageNumber : this.state.currentPage;
    const dataSource = this.props.dataSource;
    const pageIDs = dataSource.pageIdentities;
    let hasLeft = false;
    if (pageIDs.length > 0 && viewWidth > 0) {
      if (newPage > 0) {
        hasLeft = true;
      }
    }
    this.childIndex = hasLeft ? 1 : 0;
    this.state.scrollValue.setValue(this.childIndex);
  }

  movePage(step, gs) {
    const pageCount = this.props.dataSource.getPageCount();
    let pageNumber = this.state.currentPage + step;

    pageNumber = Math.min(Math.max(0, pageNumber), pageCount - 1);

    const moved = pageNumber !== this.state.currentPage;
    const scrollStep = (moved ? step : 0) + this.childIndex;

    this.fling = true;

    let nextChildIdx = 0;
    if (pageNumber > 0) {
      nextChildIdx = 1;
    }

    this.props.animation(this.state.scrollValue, scrollStep, gs)
        .start((event) => {
          if (event.finished) {
            this.fling = false;
            this.childIndex = nextChildIdx;
            this.state.scrollValue.setValue(nextChildIdx);
            this.calculateNewScrollValue(pageNumber, this.state.viewWidth);
            this.setState({
              currentPage: pageNumber
            });
          }
        });
  }

  _getPage(pageIdx:number) {
    const dataSource = this.props.dataSource;
    const pageID = dataSource.pageIdentities[pageIdx];
    return (
      <StaticRenderer
        key={`p_${pageID}`}
        shouldUpdate
        render={this.props.renderPage.bind(
        null,
        dataSource.getPageData(pageIdx),
        pageID,
        this.state.currentPage
      )}
      />
    );
  }

  createElements(pageIDs) {
    const bodyComponents = [];
    let pagesNum = 0;

    if (pageIDs.length > 0 && this.state.viewWidth > 0) {
      // left page
      if (this.state.currentPage > 0) {
        bodyComponents.push(this._getPage(this.state.currentPage - 1));
        pagesNum++;
      }

      // center page
      bodyComponents.push(this._getPage(this.state.currentPage));
      pagesNum++;

      // right page
      if (this.state.currentPage < pageIDs.length - 1) {
        bodyComponents.push(this._getPage(this.state.currentPage + 1));
        pagesNum++;
      }
    }
    return {bodyComponents, pagesNum};
  }

  render() {
    const dataSource = this.props.dataSource;
    const pageIDs = dataSource.pageIdentities;

    const {bodyComponents, pagesNum} = this.createElements(pageIDs);

    const sceneContainerStyle = {
      width: this.state.viewWidth * pagesNum,
      flex: 1,
      flexDirection: 'row'
    };

    const translateX = this.state.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, -this.state.viewWidth]
    });

    return (
      <View
        style={{flex: 1}}
        onLayout={(event) => {
          const viewWidth = event.nativeEvent.layout.width;
          if (!viewWidth || this.state.viewWidth === viewWidth) {
            return;
          }
          this.calculateNewScrollValue(this.state.currentPage, viewWidth);
          this.setState({
            currentPage: this.state.currentPage,
            viewWidth
          });
        }}
      >
        <Animated.View
          style={[sceneContainerStyle, {transform: [{translateX}]}]}
          {...this._panResponder.panHandlers}
        >
          {bodyComponents}
        </Animated.View>
      </View>
    );
  }
}
