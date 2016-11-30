import React, {Component, PropTypes} from 'react';
import {View, Platform} from 'react-native';
import ViewPager from '../viewpager/ViewPager';
import DataSource from '../viewpager/ViewPagerDataSource';
import ImagePreviewPage from './ImagePreviewPage';

export default class ImagePreviewScreen extends Component {

  static propTypes = {
    uploads: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
  };

  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarButtonColor: Platform.OS === 'ios' ? undefined : '#00adf5',
    navBarBackgroundColor: '#000000',
    tabBarHidden: true
  };

  constructor(props) {
    super(props);
    const ds = new DataSource({pageHasChanged: (p1, p2) => p1 !== p2});
    this.state = {
      dataSource: ds.cloneWithPages(props.uploads)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithPages(nextProps.uploads)
    });
  }

  renderPage(page) {
    return (
      <ImagePreviewPage {...page}/>
    );
  }

  render() {
    return (
      <View style={{flex: 1, overflow: 'hidden'}}>
        <ViewPager
          style={{flex: 1, backgroundColor: '#000000'}}
          dataSource={this.state.dataSource}
          renderPage={this.renderPage}
          initialPage={this.props.index}
        />
      </View>
    );
  }
}
