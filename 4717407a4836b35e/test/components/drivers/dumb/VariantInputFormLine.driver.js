import BaseDriver from '../BaseDriver';
const React = require('react-native-mock');

export default class VariantInputFormLineDriver extends BaseDriver {
  constructor() {
    super({
      path: 'dumb/VariantInputFormLine',
      mocks: {
        'react-native': React,
        '../../styles/EditStyles': () => { return {}},
        './InputBox': (props) => {
          return <React.TextInput {...props}/>
        }
      },

      name: 'VariantInputFormLine'
    });

    this.given = {
      title: (title) => {
        this.props = {...this.props, title};
        return this;
      },
      onChange: (onChange) => {
        this.props = {...this.props, onChange};
        return this;
      },
      value: (value) => {
        this.props = {...this.props, value};
        return this;
      }
    };
    this.when = {
      shallowed: () => {
        this.shallow(this.props);
        return this;
      },
      togglePressed: () => {
        this.byId('inputBox').simulate('change');
        return this;
      }
    };
    this.get = {
      label: () => this.byId('label'),
      labelText: () => this.get.label().props().children,
      input: () => this.byId('inputBox')
    };
  }
}