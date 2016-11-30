import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity, ScrollView, RefreshControl, Platform} from 'react-native';

import { connect } from 'react-redux';
import { ErrorScreen } from 'wix-react-native-error-components';
import * as appActions from '../actions/appActions';
import * as CONSTANTS from '../utils/constants';

//

class ErrorOverlay extends Component {
    constructor(props) {
        super(props);

        this.text = CONSTANTS.ERROR_MESSAGE;
        this.action = appActions.setAppAsFailed(false);
        this.isAction = true;
        this.buttonText = CONSTANTS.ERROR_DISMISS;
    }
    componentWillReceiveProps(nextProps) {
        if (!nextProps.isConnected) {
            this.isAction = nextProps.reloadList;
            this.text = CONSTANTS.ERROR_MESSAGE_NO_CONNECTION;
            this.action = appActions.setAppAsFailed(false, false);
            this.buttonText = CONSTANTS.ERROR_RELOAD;
        } else if (nextProps.isConnected && !this.props.isConnected) {
            this.isAction = true;
            this.props.reloadList && this.props.dispatch(appActions.loadAllData());
            this.props.dispatch(appActions.setAppAsFailed(false, false));
        } else {
            this.isAction = true;
        }

    }
    render(){
        return this.props.isAppFailed || (!this.props.isConnected && !this.props.session) ?
            (<ErrorScreen
                style={styles.errorOverlay}
                ctaText={this.buttonText}
                onCTA={() => {
                    this.props.reloadList && this.props.dispatch(appActions.loadAllData());
                    this.isAction && this.props.dispatch(this.action);
                }}
                {...this.props}
                text={this.text}
            />)
            : null
    }
}

const styles = {
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
};

function mapStateToProps(state) {
    return {
        isAppFailed: state.app.isFailed,
        reloadList: state.app.reloadLists,
        isConnected: state.app.isConnected,
        session: state.session
    };
}

export default connect(mapStateToProps)(ErrorOverlay);