import {Dimensions, Platform} from 'react-native';
const {height, width} = Dimensions.get('window');

export default {
    toolBarStyle: {
        top: 44,
        width: width,
        position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        borderTopWidth: 0,
        height: 72,
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 29 : 10,
        paddingLeft: Platform.OS === 'ios' ? 20 : 0,
        paddingRight: Platform.OS === 'ios' ? 17.5 : 0,
        paddingBottom: 9,
        borderBottomColor: '#e8e9ec',
        borderBottomWidth: 1
    },
    fieldHolder: {
        borderWidth: Platform.OS === 'ios' ? 1 : 0,
        borderRadius: Platform.OS === 'ios' ? 18 : 0,
        borderColor: Platform.OS === 'ios' ? '#e8e9ec' : '#fff',
        backgroundColor: Platform.OS === 'ios' ? '#fff' : 'transparent',
        flex: 0.7,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        marginRight: 10,
        overflow: 'hidden'
    },
    searchIcon: {
        width: 17.5,
        height: 17.5,
        marginRight: 5
    },
    input: {
        flex: 1,
        height: Platform.OS === 'ios' ? 32 : 45,
        fontSize: 17,
        color: '#162d3d',
        fontWeight: '200'
    },
    clearButtonHolder: {
        height: 32,
        width: 32,
        justifyContent: 'center',
        alignItems: 'center'
    },
    clearButton: {
        width: 15,
        height: 15,
    },
    cancelButton: {
        fontSize: 17,
        color: '#00adf5',
        fontWeight: '600',
    }
}