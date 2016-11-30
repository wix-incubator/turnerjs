import {Dimensions, PixelRatio, Platform} from 'react-native';
import stylesBuilder from '../utils/stylesBuilder';
import commonStyles from '../styles/CommonStyles';
import * as Patterns from '../utils/patterns';

let deviceWidth = Dimensions.get('window').width;

function getSize(value) {
  return value/2;
}

export default stylesBuilder({
  viewWrapper: {
    flex: 1,
    trackInventory: {
      ...commonStyles.flexRow,
      backgroundColor: "#fff",
      paddingHorizontal: 25,
      label: {
        color: '#2d4150',
        fontSize: 17,
        fontWeight: '300',
        marginVertical: Platform.OS === 'ios' ? 25 : 20
      }
    },
    separator: {
      //flex: 1,
      justifyContent: 'center',
      backgroundColor: '#f4f4f4',
      //marginHorizontal: -25,
      height: 30,
      width: deviceWidth,
      borderBottomWidth: 1,
      borderBottomColor: '#e8e9ec',
      borderTopWidth: 1,
      borderTopColor: '#e8e9ec'
    },
    listView: {
      paddingHorizontal: Platform.OS === 'ios' ? 25 : 0,
    },
    inputWrapper: {
      borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
      borderBottomColor: '#e8e9ec',
      paddingHorizontal: Platform.OS === 'ios' ? 0 : 25,
      marginTop: 10,
      label: {
        color: '#b6c1cd',
        fontSize: 14,
        fontWeight: '400'
      },
      input: Platform.OS === 'ios' ? {
        flex: 1,
        height: 37,
        lineHeight: 37,
        fontSize: 17,
        color: '#162d3d',
        fontWeight: '200'
      } : {
        flex: 1,
        height: 48,
        fontSize: 18,
        color: '#43515c',
        padding: 0,
        paddingBottom: 18,
        paddingLeft: 1
      }
    },
    variant: {
      ...commonStyles.flexRow,
      paddingHorizontal: Platform.OS === 'ios' ? 0 : 25,
      marginBottom: 10,
      marginTop: 10,
      description: {
        flex: 1,
        color: '#2d4150',
        fontSize: 17,
        fontWeight: '300',
        marginRight: 10
      },
      inputWrapper: {
        borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
        borderBottomColor: '#e8e9ec',
        height: 37,
        input: Platform.OS === 'ios' ? {
          flex: 1,
          height: 37,
          lineHeight: 37,
          fontSize: 17,
          color: '#162d3d',
          fontWeight: '200',
          width: 100
        } : {
          flex: 1,
          height: 48,
          fontSize: 18,
          color: '#43515c',
          padding: 0,
          paddingBottom: 18,
          paddingLeft: 1,
          width: 100
        }
      },
      label: Patterns.Bool({
        'in_stock': '#00adf5',
        'out_of_stock': '#ee5951'
      }, (color) => ({
        color: color,
        fontSize: 17
      }))
    }
  }
});