import { Dimensions } from 'react-native';

const {width} = Dimensions.get('window');

const itemSize = (width - 35*2)/2;
const textColor = '#2d4150';
const addColor = '#00adf5';

export default {
    box: {
        flex: 1,
        backgroundColor: '#fff'
    },
    top: {
        padding: 25
    },
    topText: {
        fontWeight: '300',
        fontSize: 17,
        color: textColor
    },
    mainPicture: {
        paddingHorizontal: 25
    },
    mainPictureImage: {
        flex: 1,
        height: 205,
        marginBottom: 20
    },
    photosBlock: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 25
    },
    photoBlockImage: {
        width: itemSize,
        height: itemSize,
        marginBottom: 20,
    },
    addButtonContainer: {
        width: itemSize,
        height: itemSize,
        marginBottom: 20,
        borderStyle: 'dashed',
        borderColor: addColor,
        borderWidth: 1,
        borderRadius: 1
    },
    addButtonSub: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addButtonIcon: {
        width: 75/2,
        height: 75/2
    },
    addButtonText: {
        paddingTop: 6,
        fontSize: 17,
        fontWeight: '200',
        color: addColor
    },
    dragImageContainer: {
        position: 'absolute',
        width: itemSize - 10,
        height: itemSize - 10,
    }
}
