import { Platform } from 'react-native';
export default {
    mainView: {
        flex: 1,
        flexDirection: 'column',
    },
    galleryView: {
        height: 200,
        position: 'relative'
    },
    indicatorHolder: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    indicator: {
        padding: 4,
        color: '#fff',
        opacity: 0.5,
        fontSize: 17
    },
    indicatorActive: {
        opacity: 1
    },
    galleryCarousel: {
        flex: 1
    },
    productInfoLine: {
        paddingHorizontal: 20,
        backgroundColor: "#fff"
    },
    productInfoLineText: {
        marginVertical: Platform.OS === 'ios' ? 25 : 20
    },
    headerLine: {
        marginBottom: 20,
        paddingTop: 20
    },
    headerLineText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#162d3d'
    },
    flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    priceLine: {
        flexDirection: 'row',
        marginBottom: 20
    },
    priceLinePrice: {
        color: '#162d3d',
        fontSize: 16,
        marginRight: 16
    },
    priceLineRibbon: {
        color: '#577083',
        fontSize: 16,
        fontWeight: '200'
    },
    dashedLine: {
        height:0,
        borderWidth: .25,
        borderStyle: 'dashed',
        borderColor: '#b2c0cc'
    },
    productDescriptionText: {
        color: '#162d3d',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '200',
        marginBottom: 20
    },
    inStockMessage: {},
    commonFont: {
        color: '#162d3d',
        fontSize: 16,
        fontWeight: '200'
    },
    outOfStock: {
        color: '#ee5951',
        fontSize: 16,
        fontWeight: '200'
    },
    managePhotoButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255, 0.85)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 54
    },
    managePhotoButtonText: {
        fontSize: 17,
        color: '#00adf5'
    },
    discountText: {
        color: '#8e8e93',
        marginRight: 9
    },
    arrow: {
        width: 8,
        height: 13
    },
    discountView: {
        flex: 1,
        backgroundColor: '#f4f4f4'
    },
    discountViewLine: {
        //borderTopWidth: 0.5,
        //borderTopColor: '#c8c7cc',
        padding: 20,
        backgroundColor: '#fff'
    },
    discountControl: {
        flex: 0.5,
        justifyContent: 'flex-start'
    },
    editableBlockControl: {
        flex: 0.5,
        justifyContent: 'flex-start',
        marginBottom: 25
    },
    subLabelDiscount: {
        color: '#577083',
        fontSize: 14,
        fontWeight: '200'
    },
    subLabel: {
        color: '#b6c1cd',
        fontSize: 14,
        fontWeight: '400'
    },
    separator: {
        borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
        borderBottomColor: '#e8e9ec'
    },
    textInput: Platform.OS === 'ios' ? {
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
        },
    textInputMultiline: {
        fontSize: 17,
        color: '#162d3d',
        fontWeight: '200'
    },
    percentSign: {
        fontSize: 17,
        color: '#98acbc',
        paddingHorizontal: 7
    },
    discountPrice: {
        fontSize: 17,
        color: '#98acbc',
        marginTop: 6
    },
    editableBlock: {
        backgroundColor: '#fff',
        marginTop: 25,
        padding: 20
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteButtonText: {
        fontSize: 17,
        color: '#ff3b30'
    },
    photosView: {
        flex: 1,
        backgroundColor: '#fff'
    },
    photoContainer: {
        height: 240,
        position: 'relative',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        shadowColor: '#000',
        shadowOpacity: 0,
        shadowOffset: {
            height: 2,
            width: 0
        },
        shadowRadius: 4,
        backgroundColor: '#fff'
    },
    deletePhotoButton: {
        position: 'absolute',
        top: 5,
        right: 15,
        width: 20,
        height: 20
    },
    managePhotosHeader: {
        paddingTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50
    },
    photoText: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        color: '#fff',
        backgroundColor: 'transparent',
        fontSize: 16,
        fontWeight: '200',
        //textShadowColor: '#696969',
        //textShadowOffset: {
        //    height: 2,
        //    width: 2
        //},
        //textShadowRadius: 2
    },
    curSign: {
        marginRight: 3,
        fontSize: 17,
        color: '#162d3d',
        lineHeight: 18,
        //fontWeight: '200'
    },
    tapAndHold: {
        color: '#577083',
        fontSize: 16,
        fontWeight: '200'
    },
    noImages: {
        backgroundColor: '#eaf7ff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noImagesText: {
        fontSize: 20,
        color: '#00adf5'
    },
    absolutePreloader: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    }
}
