import React, {Component, PropTypes} from 'react';
import {StyleSheet, View, PixelRatio, ListView} from 'react-native';

import {connect} from 'react-redux';
import _ from 'lodash';
import UploadRow from './../uploads/UploadRow';
import * as consts from '../uploads/consts';
import * as actions from './actions';
import * as uploadActions from '../uploads/actions';
import * as imagesActions from '../images/actions';
import {i18n} from './../../strings';

const ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2
});

class UploadGroupScreen extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uploads: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    group: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: ds.cloneWithRows(this.processUploads(props.uploads, props.group))
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.onPressRow = this.onPressRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.processUploads(nextProps.uploads, nextProps.group))
      });
    }
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'cancel') {
        this.props.dispatch(actions.cancelGroup(this.props.group));
        this.props.dispatch(imagesActions.dismissMediaModal());
      }
      if (event.id === 'done') {
        this.props.dispatch(imagesActions.uploadImagesProcessComplete());
      }
    }
  }

  onPressRow(row) {
    if (row.state === consts.UPLOAD_STATES.FAILED) {
      this.props.dispatch(uploadActions.retryUpload(row));
    }
  }

  processUploads(uploads, group) {
    let processed = _.filter(uploads, {group});
    processed = _.reverse(_.sortBy(processed, 'startedTS'));
    const showDone = _.every(processed, (v) => v.state === consts.UPLOAD_STATES.FINISHED || v.state === consts.UPLOAD_STATES.SERVER);
    this.props.navigator.setButtons({
      leftButtons: [
        {
          title: i18n('UPLOAD_GROUP_SCREEN_NAV_BAR_CANCEL'),
          id: 'cancel',
          disabled: showDone
        }
      ],
      rightButtons: [
        {
          title: i18n('UPLOAD_GROUP_SCREEN_NAV_BAR_DONE'),
          id: 'done',
          disabled: !showDone
        }
      ]
    });
    return processed;
  }

  renderSeparator(sectionID, rowID) {
    return (
      <View key={`${rowID}_separator`} style={styles.separator}/>
    );
  }

  renderRow(row) {
    return (
      <UploadRow key={row.startedTS} {...row} onPress={this.onPressRow}/>
    );
  }

  render() {
    //TODO change enableEmptySections to false when react native updated
    return (
      <ListView
        dataSource={this.state.dataSource}
        contentContainerStyle={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 15, backgroundColor: '#ffffff'}}
        renderRow={this.renderRow}
        enableEmptySections
        style={{flex: 1}}
      />
    );
  }
}

const styles = StyleSheet.create({
  separator: {
    height: 1 / PixelRatio.get(),
    flex: 1,
    backgroundColor: '#577083'
  }
});

function mapStateToProps(state) {
  return {
    uploads: state.uploads.uploads
  };
}

export default connect(mapStateToProps)(UploadGroupScreen);

