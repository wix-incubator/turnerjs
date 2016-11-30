import {Dimensions, PixelRatio, Platform} from 'react-native';
import { transformStyles } from '../utils/stylesBuilder';
import commonStyles from './CommonStyles';
import * as Patterns from '../utils/patterns';

let deviceWidth = Dimensions.get('window').width;

function getSize(value) {
  return value / PixelRatio.get();
}

const errorColor = '#ff0000';
const warningRed = '#ee5951';
const commonGray = '#e8e9ec';
const imageBgGray = '#eff1f2';
const textGray = '#a0afbf';
const textDarkGray = '#2d4150';
const androidInputText = '#43515c';
const defaultLight = '#ffffff';
const blueColor = '#00adf5';
const labelGray = '#b6c1cd';
const topBorderGray = '#dedede';

const commonFontSize = 17;

const iosp = 25;
const andp = 20;
const viewContainerPadding = 0;//Platform.OS === 'ios' ? 0 : andp;
const linePaddingHor = Platform.OS === 'ios' ? undefined : andp;
const verticalPadding = Platform.OS === 'ios' ? 25 : 20;

export default transformStyles({
  viewWrapper: {
    backgroundColor: defaultLight,
    paddingTop: viewContainerPadding,
    padContainer: Patterns.Case((val) => {
      switch (val) {
        case 'edit':
          return Platform.OS === 'ios' ? 0 : andp * 2;
        case 'create':
          return Platform.OS === 'ios' ? 0 : andp;
        default:
          return 0
      }
    }, (x) => ({
      paddingTop: x,
      paddingHorizontal: Platform.OS === 'ios' ? iosp : 0,
    })),
    aPadContainer: {
      paddingHorizontal: Platform.OS === 'ios' ? 0 : andp,
    },
    paddingIosHor: {
      paddingHorizontal: iosp
    },
    paddingIosVer: {
      paddingVertical: iosp
    },
    deleteButton: {
      fontSize: commonFontSize,
      color: warningRed,
    },
    flexRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  },
  inputBox: {
    flexGrow: 0.5,
    justifyContent: 'flex-start',
    marginBottom: 25,
    wrapper: Patterns.Bool({
        'true': commonGray,
        'false': errorColor
      }, color => ({
        borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
        borderBottomColor: color
      })
    ),
    labelColor: Patterns.Bool({
        'true': labelGray,
        'false': errorColor
      }, color => ({
        color
      })
    ),
    label: Patterns.Bool({
        'true': {f: 14, t: 0, o: 1},
        'false': {f: 10, t: 22, o: 0}
      }, ({f, t, o}) => ({
        position: 'absolute',
        fontWeight: '300',
        fontSize: f,
        top: t,
        opacity: o,
        backgroundColor: 'transparent'
      })
    ),
    positionStyles: Patterns.Case((val) => {
      switch (val) {
        case 'left':
          return Platform.OS === 'ios' ? 26 : andp;
        case 'right':
          return 0;
        default:
          return null
      }
    }, (x) => ({
      marginRight: x,
      marginBottom: 0
    })),
    withMargin: Patterns.Bool({
      'true': 17,
      'false': undefined
    }, (x) => ({
      marginTop: x
    })),
    input: Patterns.OS({
      ios: {
        flexGrow: 1,
        height: 37,
        lineHeight: 37,
        fontSize: commonFontSize,
        color: textDarkGray,
        fontWeight: '200',
        marginTop: 17,
      },
      android: {
        flexGrow: 1,
        height: 48,
        fontSize: 18,
        color: androidInputText,
        padding: 0,
        paddingBottom: 18,
        paddingLeft: 1
      }
    }, s => s)
  },
  toggleLine: {
    wrapper: {
      backgroundColor: defaultLight,
      paddingHorizontal: linePaddingHor,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    text: {
      color: textDarkGray,
      fontSize: commonFontSize,
      fontWeight: '200',
      marginVertical: Platform.OS === 'ios' ? iosp : andp
    },
    toggle: {
      color: blueColor
    }
  },
  inputLine: {
    flexRow: {
      flexGrow: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    inputBox: {
      width: 100,
      marginBottom: 0,
      flexGrow: undefined
    },
    label: {
      flexGrow: 1,
      marginVertical: 0
    }
  },
  commonLine: {
    wrapper: {
      backgroundColor: defaultLight,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: commonGray,
      paddingHorizontal: linePaddingHor
    },
    downloadIcon: {
      width: 27/2,
      height: 25/2,
      marginRight: 13
    },
    line: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
      flexWrap: 'wrap',
      paddingVertical: 25,
      text: Patterns.Bool({
        'true': 1,
        'false': undefined
      }, (x) => ({
        flex: x,
        color: textDarkGray,
        fontSize: commonFontSize,
        fontWeight: '200',
      })),
      value: Patterns.Bool({
        'true': undefined,
        'false': 1
      }, (x) => ({
        color: blueColor,
        fontSize: commonFontSize,
        marginLeft: 10,
        flex: x,
        textAlign: 'right'
      }))
    }
  },
  multilineText: {
    wrapper: {
      borderBottomWidth: 1,
      borderBottomColor: commonGray,
      paddingBox: {
        paddingVertical: verticalPadding,
      },
      label: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 17,
        text: {
          color: labelGray,
          fontSize: 14,
          fontWeight: '400',
          lineHeight: Platform.OS === 'ios' ? undefined : 37
        }
      },
      discWrapper: {
        backgroundColor: defaultLight,
        borderBottomWidth: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      descText: {
        width: deviceWidth - 66,
        fontSize: commonFontSize,
        lineHeight: Platform.OS === 'ios' ? 26 : 30,
        letterSpacing: 0.3,
        fontWeight: '200',
        color: textDarkGray
      },
      arrow: {
        width: 8,
        height: 13.5
      },
      descLine: {
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }
  },
  sv: {
    flex: 1,
    imageContainer: {
      height: 225,
      paddingTop: Platform.OS === 'ios' ? iosp : 0,
    },
    imageContainerEdit: {
      position: 'relative',
      height: Platform.OS === 'ios' ? 250 : 225,
      paddingVertical: Platform.OS === 'ios' ? iosp : 0,
    },
    manageIcon: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 17 : 25,
      left: Platform.OS === 'ios' ? 42 : 25,
      icon: Patterns.OS({
        'ios': {x: 25, y: 18.5},
        'android': {x: 30, y: 27}
      }, ({x, y}) => ({
        width: x,
        height: y
      }))
    },
    editPhoto: Patterns.OS({
      'ios': {h: 200, w: deviceWidth - 50, m: iosp},
      'android': {h: 250, w: deviceWidth, m: 0}
    }, ({h, w, m}) => ({
      height: h,
      width: w,
      marginLeft: m,
    })),
    noMedia: {
      height: Platform.OS === 'ios' ? 200 : 225,
      width: Platform.OS === 'ios' ? deviceWidth - 50 : deviceWidth,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: imageBgGray,
      marginLeft: Platform.OS === 'ios' ? iosp : 0,
      borderRadius: Platform.OS === 'ios' ? 2 : 0,
      overflow: 'hidden',
      placeHolder: {
        width: 325.5,
        height: 203.5
      }
    }
  },
  ds: {
    flex: 1,
    paddingHorizontal: iosp,
    paddingTop: iosp,
    align: {
      alignItems: 'flex-start'
    },
    block: Patterns.Case((val) => {
      switch (val) {
        case 0:
          return 0;
        case 1:
          return 26;
        default:
          return null
      }
    }, (x) => ({
      flex: 0.5,
      justifyContent: 'flex-start',
      marginBottom: iosp,
      marginRight: x
    })),
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: commonGray
    },
    orPrice: {
      color: labelGray,
      fontSize: 14,
      fontWeight: '300'
    },
    price: Platform.OS === 'ios' ? {
      fontSize: commonFontSize,
      lineHeight: 28,
      height: 37,
      color: textGray,
      fontWeight: '200'
    } : {
      color: textGray,
      height: 35,
      marginTop: 2,
      paddingBottom: 0,
      fontSize: commonFontSize,
    }
  },
  collections: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 66 : 0,
    right: 0,
    bottom: 0,
    borderTopWidth: getSize(1),
    borderTopColor: topBorderGray,
    backgroundColor: 'transparent',
    icon: {
      width: 16.5,
      height: 14
    },
    preloader: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      indicator: {
        backgroundColor: 'transparent'
      }
    },
    listView: {
      paddingHorizontal: andp
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: andp,
      borderBottomWidth: getSize(1),
      borderBottomColor: topBorderGray,
      text: Patterns.Bool({
          'true': '600',
          'false': '200'
        }, fontWeight => ({
          flex: 1,
          fontWeight,
          fontSize: commonFontSize,
          color: textDarkGray
        }))
    }
  },
  inventoryOptions: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: verticalPadding
  }
});

