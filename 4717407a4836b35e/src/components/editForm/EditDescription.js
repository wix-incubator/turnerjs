import React, {Component} from 'react';
import {
  Text,
  View,
  ListView,
  Image,
  TextInput,
  Dimensions,
  Platform,
  Keyboard
} from 'react-native';

import _ from 'lodash/fp';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'

import * as CONSTANTS from '../../utils/constants';
import styles from '../../styles/ProductViewStyles';

class EditDescription extends Component {
    constructor(props){
        super(props);
        this.state = {
            height: Dimensions.get('window').height - 106
        }
    }

    componentWillUnmount() {
        this.keyboardListeners.forEach((listener) => listener.remove());
    }

    componentDidMount() {
        if (Platform.OS === 'ios') {
            this.keyboardListeners = [
                Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this)),
                Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
            ];
        } else {
            this.keyboardListeners = [
                Keyboard.addListener('keyboardDidShow', this.keyboardWillShow.bind(this)),
                Keyboard.addListener('keyboardDidHide', this.keyboardWillHide.bind(this))
            ];
        }
    }

    keyboardWillShow (e) {
        this.setState({
            height: Dimensions.get('window').height - e.endCoordinates.height - 106
        });
    }

    keyboardWillHide (e) {
        this.setState({
            height: Dimensions.get('window').height - 66
        });
    }

    showTitle(name, titleText) {
        return <Text style={{
            color: '#b6c1cd',
            fontSize: 14,
            fontWeight: '400'
        }}>{this.props[name] && this.props[name] !== '' ? titleText : ' '}</Text>;
    }

    render(){
        return (
          <View
            style={{flex: 1, paddingHorizontal: 25}}
          >
              <View style={{marginTop: 10}}>
                  <TextInput
                    style={[{
                            fontSize: 18,
                            color: '#43515c',
                            textAlignVertical: 'top',
                            height: this.state.height
                        }]}
                    multiline={true}
                    keyboardType={'default'}
                    returnKeyType={'done'}
                    onChangeText={(text) => { this.props.onChange && this.props.onChange(text); }}
                    placeholder={CONSTANTS.PRODUCT_EDIT_FORM_DESCRIPTION_PLACEHOLDER}
                    value={`${this.props.description}`}
                    onSubmitEditing={Platform.OS === 'ios' ? this.props.onSubmit : () => {}}
                    ref={(r) => {this._description = r}}
                    onFocus = {() => {
                            this.props.onFocusInput(this._description);
                        }}
                  />
              </View>
          </View>
        )
    }
}

export default EditDescription

