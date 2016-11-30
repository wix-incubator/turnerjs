require('jasmine-expect');

import * as testUtils from 'a-wix-react-native-commons/TestUtils';
import * as reducer from '../../src/images/reducer';
import * as actionTypes from '../../src/images/actionTypes';
import * as Constants from '../../src/images/constants';
import immutable from 'seamless-immutable';
import _ from 'lodash';

describe('should maintain images array', () => {

  it('should add new capture image to capture images array', () => {
    const action = {
      type: actionTypes.ADD_CAPTURE_IMAGE,
      id: '748cc34a-7e9c-4d36-ac5b-5ce0d23d19b4'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...newState,
      captureImages: [action.id]
    });
  });

  it('should select an image', () => {
    const action = {
      type: actionTypes.SELECTED_IMAGES_CHANGED,
      image: 'image1'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      selectedImages: [
        'image1'
      ]
    });
  });

  it('should select another image', () => {
    const action = {
      type: actionTypes.SELECTED_IMAGES_CHANGED,
      image: 'image2'
    };
    const newState = reducer.default(immutable({...reducer.initialState, selectedImages: ['image1']}), action);
    expect(newState).toEqual({
      ...reducer.initialState,
      selectedImages: [
        'image1', 'image2'
      ]
    });
  });

  it('should unselect an image', () => {
    const action = {
      type: actionTypes.SELECTED_IMAGES_CHANGED,
      image: 'image1'
    };
    const newState = reducer.default(immutable({...reducer.initialState, selectedImages: ['image1', 'image2']}), action);
    expect(newState).toEqual({
      ...reducer.initialState,
      selectedImages: [
        'image2'
      ]
    });
  });

  const cameraDoneValueParams = [
    {
      description: 'none to done',
      type: actionTypes.CAMERA_SCREEN_STATE_CHANGED,
      cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED,
      state: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE
      },
      result: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED
      }
    },
    {
      description: 'none to cancel',
      type: actionTypes.CAMERA_SCREEN_STATE_CHANGED,
      cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_CANCEL_PRESSED,
      state: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE
      },
      result: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_CANCEL_PRESSED
      }
    },
    {
      description: 'cancel to none',
      type: actionTypes.CAMERA_SCREEN_STATE_CHANGED,
      cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE,
      state: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_CANCEL_PRESSED
      },
      result: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE
      }
    },
    {
      description: 'done to none',
      type: actionTypes.CAMERA_SCREEN_STATE_CHANGED,
      cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED,
      state: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_NONE
      },
      result: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED
      }
    }
  ];

  testUtils.parameterized('should maintain camera screen done value', cameraDoneValueParams, (index, param) => {
    const newState = reducer.default(reducer.initialState, param);
    expect(newState.cameraScreenDoneUpdateValue).toEqual(param.result.cameraScreenDoneUpdateValue);
  });

  const mergeParams = [
    {
      description: 'empty arrays',
      type: actionTypes.PREPARE_STATE_FOR_UPLOAD,
      state: {
        selectedImages: [],
        captureImages: [],
        uploadImages: []
      },
      result: {
        selectedImages: [],
        captureImages: [],
        uploadImages: []
      }
    },
    {
      description: 'selected only',
      type: actionTypes.PREPARE_STATE_FOR_UPLOAD,
      state: {
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        uploadImages: [],
        captureImages: [],
      },
      result: {
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        captureImages: [],
        uploadImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb']
      }
    },
    {
      description: 'capture only',
      type: actionTypes.PREPARE_STATE_FOR_UPLOAD,
      state: {
        uploadImages: [],
        selectedImages: [],
        captureImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
      },
      result: {
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        captureImages: [],
        uploadImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb']
      }
    },
    {
      description: 'selected and capture',
      type: actionTypes.PREPARE_STATE_FOR_UPLOAD,
      state: {
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        captureImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        uploadImages: []
      },
      result: {
        uploadImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: []
      }
    },
    {
      description: 'selected and capture, no duplicates',
      type: actionTypes.PREPARE_STATE_FOR_UPLOAD,
      state: {
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a', '59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        uploadImages: []
      },
      result: {
        uploadImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: []
      }
    },
    {
      description: 'selected, capture and upload',
      type: actionTypes.PREPARE_STATE_FOR_UPLOAD,
      state: {
        uploadImages: ['1234'],
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        captureImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a', '82e58faf-b1fd-4b57-9252-c7a2e66e1d1a'],
      },
      result: {
        uploadImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a', '82e58faf-b1fd-4b57-9252-c7a2e66e1d1a'],
        selectedImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb', 'c6e68a92-ac36-4394-92c7-84120384ac9a', '82e58faf-b1fd-4b57-9252-c7a2e66e1d1a'],
        captureImages: []
      }
    }
  ];

  testUtils.parameterized('should merge capture and selected into upload, sync selected and upload and empty capture', mergeParams, (index, param) => {
    const newState = reducer.default(immutable(param.state), param);
    expect(newState).toEqual(param.result);
  });

  describe('should update upload images array', () => {

    const imageUrlchanged = [
      {
        description: 'change array with single image id',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '123',
        newImageId: '456',
        state: {
          uploadImages: ['123']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['456']
        }
      },
      {
        description: 'change array with multiple image id',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '123',
        newImageId: '456',
        state: {
          uploadImages: ['000', '123', '234']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['000', '456', '234']
        }
      },
      {
        description: 'empty array',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '123',
        newImageId: '456',
        state: {
          uploadImages: []
        },
        result: {
          ...reducer.initialState,
          uploadImages: []
        }
      },
      {
        description: 'change last element',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '123',
        newImageId: '456',
        state: {
          uploadImages: ['000', '111', '123']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['000', '111', '456']
        }
      },
      {
        description: 'change first element',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '123',
        newImageId: '456',
        state: {
          uploadImages: ['123', '111', '000']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['456', '111', '000']
        }
      },
      {
        description: 'image not exists',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '333',
        newImageId: '456',
        state: {
          uploadImages: ['123', '111', '000']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['123', '111', '000']
        }
      },
      {
        description: 'empty input to change',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '',
        newImageId: '456',
        state: {
          uploadImages: ['123', '111', '000']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['123', '111', '000']
        }
      },
      {
        description: 'change to empty',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '123',
        newImageId: '',
        state: {
          uploadImages: ['123', '111', '000']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['111', '000']
        }
      },
      {
        description: 'change to exist element',
        type: actionTypes.SWAP_IMAGE_ID,
        oldImageId: '000',
        newImageId: '000',
        state: {
          uploadImages: ['123', '111', '000', '222']
        },
        result: {
          ...reducer.initialState,
          uploadImages: ['123', '111', '000', '222']
        }
      }
    ];

    testUtils.parameterized('should swap image id if exists', imageUrlchanged, (index, param) => {
      const state = immutable(_.merge(param.state, reducer.initialState));
      const newState = reducer.default(immutable(state), param);
      expect(newState).toEqual(param.result);
    });

  });



  /////////////////// start

  describe('should override selectedImages with uploadImages', () => {

    const actionsArray = [
      {
        description: 'change selected array with single value',
        type: actionTypes.OVERRIDE_SELECTED_WITH_UPLOADS_IMAGES,
        state: {
          uploadImages: ['123'],
          selectedImages: ['456']
        },
        result: {
          ...reducer.initialState,
          selectedImages: ['123'],
          uploadImages: ['123']
        }
      },
      {
        description: 'change selected array with multiple values',
        type: actionTypes.OVERRIDE_SELECTED_WITH_UPLOADS_IMAGES,
        state: {
          uploadImages: ['123', '456', '789'],
          selectedImages: ['000']
        },
        result: {
          ...reducer.initialState,
          selectedImages: ['123', '456', '789'],
          uploadImages: ['123', '456', '789']
        }
      },
      {
        description: 'change selected empty array',
        type: actionTypes.OVERRIDE_SELECTED_WITH_UPLOADS_IMAGES,
        state: {
          uploadImages: [],
          selectedImages: ['000', '111']
        },
        result: {
          ...reducer.initialState,
          selectedImages: [],
          uploadImages: []
        }
      }
    ];

    testUtils.parameterized('should override selectedImages array with uploadImages array', actionsArray, (index, param) => {
      const state = immutable(_.merge(param.state, reducer.initialState));
      const newState = reducer.default(immutable(state), param);

      expect(newState).toEqual(param.result);
    });

  });

  ////////////////// end

  const cleanCaptureParams = [
    {
      description: 'empty to empty',
      type: actionTypes.CLEAN_CAPTURE_IMAGES,
      state: {
        uploadImages: [],
        selectedImages: [],
        captureImages: []
      },
      result: {
        uploadImages: [],
        selectedImages: [],
        captureImages: []
      }
    },
    {
      description: 'non-empty to empty',
      type: actionTypes.CLEAN_CAPTURE_IMAGES,
      state: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb']
      },
      result: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: []
      }
    }
  ];

  testUtils.parameterized('should clean the capture images', cleanCaptureParams, (index, param) => {
    const newState = reducer.default(immutable(param.state), param);
    expect(newState).toEqual(param.result);
  });

  const cleanSelectedParams = [
    {
      description: 'empty to empty',
      type: actionTypes.CLEAN_SELECTED_IMAGES,
      state: {
        uploadImages: [],
        selectedImages: [],
        captureImages: []
      },
      result: {
        uploadImages: [],
        selectedImages: [],
        captureImages: []
      }
    },
    {
      description: 'non-empty to empty',
      type: actionTypes.CLEAN_SELECTED_IMAGES,
      state: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb']
      },
      result: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: [],
        captureImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb']
      }
    }
  ];

  testUtils.parameterized('should clean the capture images', cleanSelectedParams, (index, param) => {
    const newState = reducer.default(immutable(param.state), param);
    expect(newState).toEqual(param.result);
  });

  const cleanAllParams = [
    {
      description: 'empty to empty',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      result: reducer.initialState
    },
    {
      description: 'all non-empty to empty',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      state: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED,
        pushUploadGroupScreen: true,
        imagesWixMediaData: ['url', 'url2']
      },
      result: reducer.initialState
    },
    {
      description: 'mid non-empty to empty',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      state: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: [],
        captureImages: [],
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED
      },
      result: reducer.initialState
    },
    {
      description: 'initial state to initial state',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      state: reducer.initialState,
      result: reducer.initialState
    },
    {
      description: 'keep permissions true false',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      state: {
        cameraScreenDoneUpdateValue: Constants.CAMERA_SCREEN_STATE_DONE_PRESSED,
        pushUploadGroupScreen: true,
        imagesWixMediaData: ['url', 'url2'],
        cameraPermission: true,
        photosPermission: false
      },
      result: {...reducer.initialState, cameraPermission: true, photosPermission: false}
    },
    {
      description: 'keep permissions false true',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      state: {
        uploadImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        selectedImages: ['c6e68a92-ac36-4394-92c7-84120384ac9a'],
        captureImages: ['59f7e7db-4393-4a76-8b3f-8a905117f0eb'],
        pushUploadGroupScreen: true,
        cameraPermission: false,
        photosPermission: true
      },
      result: {...reducer.initialState, cameraPermission: false, photosPermission: true}
    },
    {
      description: 'keep permissions true true',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      state: {
        cameraPermission: true,
        photosPermission: true
      },
      result: {...reducer.initialState, cameraPermission: true, photosPermission: true}
    },
    {
      description: 'keep permissions undefined undefined',
      type: actionTypes.CLEAN_ALL_EXCEPT_PERMISSIONS,
      result: {...reducer.initialState, cameraPermission: undefined, photosPermission: undefined}
    }

  ];

  testUtils.parameterized('should clean the store to the initial state', cleanAllParams, (index, param) => {
    const newState = reducer.default(param.state, param);
    expect(newState).toEqual(param.result);
  });

  const ratioOverlayParams = [
    {
      description: 'set camera ratio overlay',
      type: actionTypes.SET_CAMERA_RATIO_OVERLAY,
      data: {
        cameraRatioOverlay: {
          color: '#ffffff77',
          ratios: ['1:2', '3:4', '9:6']
        }
      },
      result: {
        ...reducer.initialState,
        cameraRatioOverlay: {
          color: '#ffffff77',
          ratios: ['1:2', '3:4', '9:6']
        }
      }
    }
  ];

  testUtils.parameterized('set ratio object in state', ratioOverlayParams, (index, param) => {
    const newState = reducer.default(immutable(param.action), param);
    expect(newState).toEqual(param.result);
  });

  it('should set camera permission to true', () => {
    const action = {
      type: actionTypes.SET_CAMERA_PERMISSION,
      cameraPermission: true
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      cameraPermission: action.cameraPermission
    });
  });

  it('should set camera permission to false', () => {
    const action = {
      type: actionTypes.SET_CAMERA_PERMISSION,
      cameraPermission: false
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      cameraPermission: action.cameraPermission
    });
  });

  it('should set photos permission to true', () => {
    const action = {
      type: actionTypes.SET_PHOTOS_PERMISSION,
      photosPermission: true
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      photosPermission: action.photosPermission
    });
  });

  it('should set photos permission to false', () => {
    const action = {
      type: actionTypes.SET_PHOTOS_PERMISSION,
      photosPermission: false
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      photosPermission: action.photosPermission
    });
  });
});

const ratioOverlayParams = [
  {
    description: 'set max images upload',
    type: actionTypes.SET_MAX_IMAGES_UPLOAD,
    data: {
      maxImagesUpload: 3
    },
    result: {
      ...reducer.initialState,
      maxImagesUpload: 3
    }
  },
  {
    description: 'set max images upload to negative number',
    type: actionTypes.SET_MAX_IMAGES_UPLOAD,
    data: {
      maxImagesUpload: -1
    },
    result: {
      ...reducer.initialState,
      maxImagesUpload: 0
    }
  },
  {
    description: 'set max images upload to zero',
    type: actionTypes.SET_MAX_IMAGES_UPLOAD,
    data: {
      maxImagesUpload: 0
    },
    result: {
      ...reducer.initialState,
      maxImagesUpload: 0
    }
  }
];

testUtils.parameterized('set ratio object in state', ratioOverlayParams, (index, param) => {
  const newState = reducer.default(immutable(param.action), param);
  expect(newState).toEqual(param.result);
});
