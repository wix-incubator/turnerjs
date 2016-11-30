import React, {Component} from 'react';
import {
    Text,
    View,
    ListView,
    TouchableOpacity,
    Image
} from 'react-native';
import _ from 'lodash/fp';

import { connect } from 'react-redux';
import * as stateReader from '../../reducers/stateReader';
import * as collectionActions from '../../actions/collectionsActions';
import * as CONSTANTS from '../../utils/constants';


import CommonActivityIndicator from '../CommonActivityIndicator';
import editFormStyles from '../../styles/EditStyles';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class EditCollections extends Component {
    constructor(props){
        super(props);
        !this.props.isCollectionsListLoading && !this.props.collections && this.props.loadCollections();
    }
    onCollectionPress(collectionId){
        const index = _.findIndex((c) => c.id === collectionId)(this.props.selectedCollections);

        if(!!~index) {
            this.props.onChange && this.props.onChange(this.props.selectedCollections.filter((e, i) => (i !== index)));

        } else {
            this.props.onChange && this.props.onChange([
                ...this.props.selectedCollections,
                _.omit(['productIds'])(this.props.collections[collectionId])
            ]);
        }
    }
    renderRow(rowData){
        const isSelected = !!~_.findIndex((c) => c.id === rowData.id)(this.props.selectedCollections);
        const isDefault = rowData.id == CONSTANTS.DEFAULT_COLLECTION;

        return (
            <TouchableOpacity activeOpacity={isDefault ? 1 : 0.5} onPress={() => {!isDefault && this.onCollectionPress(rowData.id)}}>
                <View style={editFormStyles('collections.row')}>
                    <Text style={editFormStyles('collections.row.text', isSelected || isDefault)} numberOfLines={1}>
                        {rowData.name}
                    </Text>
                    {isSelected && !isDefault ? <Image style={editFormStyles('collections.icon')} source={require('../../assets/checkmark.png')}/> : null}
                    {isDefault ? <Image style={editFormStyles('collections.icon')} source={require('../../assets/checkmarkDisabled.png')}/> : null}
                </View>
            </TouchableOpacity>
        )
    }
    render(){
        return (
            <View style={{flex: 1}}>
                <ListView
                    contentContainerStyle={editFormStyles('collections.listView')}
                    dataSource={ds.cloneWithRows(this.props.collections || {}, Object.keys(this.props.collections || {}))}
                    renderRow={this.renderRow.bind(this)}
                />
                {
                    this.props.isCollectionsListLoading && !this.props.collections ? (
                        <View style={editFormStyles('collections.preloader')}>
                            <CommonActivityIndicator
                              size="large"
                              style={editFormStyles('collections.preloader.indicator')}
                            />
                        </View>
                    ) : null
                }
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        isCollectionsListLoading: stateReader.getCollectionsListUpdateStatus(state),
        collections: stateReader.getCollections(state)
    };
}

export default connect(mapStateToProps, collectionActions)(EditCollections);
