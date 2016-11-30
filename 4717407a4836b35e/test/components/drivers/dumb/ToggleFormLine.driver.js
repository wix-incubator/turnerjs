import BaseDriver from '../BaseDriver';
const React = require('react-native-mock');

export default class ToggleFormLineDriver extends BaseDriver {
  constructor() {
    super({
      path: 'dumb/ToggleFormLine',
      mocks: {
        'react-native': React,
        '../../styles/EditStyles': () => { return {}}
      },
      name: 'ToggleFormLine'
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
        this.byId('toggle').simulate('valueChange');
        return this;
      }
    };
    this.get = {
      label: () => this.byId('label'),
      labelText: () => this.get.label().props().children,
      toggle: () => this.byId('toggle')
    };
  }
}