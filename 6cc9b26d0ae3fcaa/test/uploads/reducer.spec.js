/*eslint camelcase: ["error", {properties: "never"}]*/

require('jasmine-expect');
import * as reducer from '../../src/uploads/reducer';
import * as actionTypes from '../../src/uploads/actionTypes';
import immutable from 'seamless-immutable';
import * as consts from '../../src/uploads/consts';

describe('uploads', () => {

  it('should by default give initial state', () => {
    const newState = reducer.default(undefined, {type: undefined});
    expect(newState).toEqual({
      ...reducer.initialState
    });
  });

  it('should add an upload object when new upload with default folder and default group', () => {
    spyOn(Date, 'now').and.returnValue(1234);
    const newUploadAction = {
      type: actionTypes.CREATE_UPLOAD,
      image: {
        uri: 'image_uri',
        size: 12345
      },
      fileName: 'file_name.jpg'
    };
    const newState = reducer.default(reducer.initialState, newUploadAction);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        image_uri: {
          state: consts.UPLOAD_STATES.PENDING,
          progress: 0,
          uri: 'image_uri',
          size: 12345,
          startedTS: 1234,
          name: 'file_name.jpg',
          folderName: consts.DEFAULT_FOLDER,
          group: consts.DEFAULT_GROUP_ID
        }
      }
    }));
    expect(Date.now).toHaveBeenCalled();
  });

  it('should add an upload object when new upload with default folder and secific group', () => {
    spyOn(Date, 'now').and.returnValue(1234);
    const newUploadAction = {
      type: actionTypes.CREATE_UPLOAD,
      image: {
        uri: 'image_uri',
        size: 12345
      },
      fileName: 'file_name.jpg',
      group: 9876
    };
    const newState = reducer.default(reducer.initialState, newUploadAction);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        image_uri: {
          state: consts.UPLOAD_STATES.PENDING,
          progress: 0,
          uri: 'image_uri',
          size: 12345,
          startedTS: 1234,
          name: 'file_name.jpg',
          folderName: consts.DEFAULT_FOLDER,
          group: 9876
        }
      }
    }));
    expect(Date.now).toHaveBeenCalled();
  });

  it('should add an upload object when new upload with specific folder', () => {
    spyOn(Date, 'now').and.returnValue(1234);
    const newUploadAction = {
      type: actionTypes.CREATE_UPLOAD,
      image: {
        uri: 'image_uri',
        size: 98765
      },
      folderName: 'specific',
      fileName: 'file.jpg'
    };
    const newState = reducer.default(reducer.initialState, newUploadAction);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        image_uri: {
          state: consts.UPLOAD_STATES.PENDING,
          progress: 0,
          uri: 'image_uri',
          size: 98765,
          startedTS: 1234,
          name: 'file.jpg',
          folderName: 'specific',
          group: consts.DEFAULT_GROUP_ID
        }
      }
    }));
    expect(Date.now).toHaveBeenCalled();
  });

  it('should start an upload', () => {
    const initial = reducer.initialState.setIn(['uploads', 'image_uri'], {state: consts.UPLOAD_STATES.PENDING});
    const action = {
      type: actionTypes.START_UPLOAD,
      uri: 'image_uri'
    };
    const newState = reducer.default(initial, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        image_uri: {
          state: consts.UPLOAD_STATES.RUNNING
        }
      }
    }));
  });

  it('should set in an ongoing upload', () => {
    const initial = reducer.initialState.setIn(['uploads', '123456'], {progress: 0});
    const action = {
      type: actionTypes.SET_PROGRESS,
      uri: '123456',
      progress: 23
    };
    const newState = reducer.default(initial, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        123456: {
          progress: 23
        }
      }
    }));
  });

  it('should finish an upload', () => {
    const initial = reducer.initialState.setIn(['uploads', '123456'], {state: consts.UPLOAD_STATES.PENDING});
    const action = {
      type: actionTypes.SET_FINISHED,
      uri: '123456',
      wixId: 'wix---wix',
      data: {
        some: 'data'
      }
    };
    const newState = reducer.default(initial, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        123456: {
          state: consts.UPLOAD_STATES.FINISHED,
          wixId: 'wix---wix',
          wixData: {
            some: 'data'
          }
        }
      }
    }));
  });

  it('should allow to fail an upload', () => {
    const initial = reducer.initialState.setIn(['uploads', '123456'], {state: consts.UPLOAD_STATES.FAILED});
    const action = {
      type: actionTypes.SET_FAILED,
      uri: '123456'
    };
    const newState = reducer.default(initial, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        123456: {
          state: consts.UPLOAD_STATES.FAILED
        }
      }
    }));
  });

  it('should allow to retry an upload', () => {
    const initial = reducer.initialState.setIn(['uploads', '123456'], {state: consts.UPLOAD_STATES.RUNNING});
    const action = {
      type: actionTypes.RETRY_UPLOAD,
      uri: '123456'
    };
    const newState = reducer.default(initial, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      uploads: {
        123456: {
          state: consts.UPLOAD_STATES.PENDING
        }
      }
    }));
  });
});

describe('folders', () => {
  it('should allow to set default folder id', () => {
    const action = {
      type: actionTypes.SET_FOLDER_ID,
      folderId: 'newDefaultFolderId'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      folderIds: {
        'Mobile Uploads': 'newDefaultFolderId'
      }
    }));
  });

  it('should allow to set default folder pending', () => {
    const action = {
      type: actionTypes.SET_FOLDER_PENDING
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      folderIds: {
        'Mobile Uploads': consts.FOLDER_PENDING
      }
    }));
  });

  it('should allow to set specific folder id', () => {
    const action = {
      type: actionTypes.SET_FOLDER_ID,
      folderId: 'newFolderId',
      folderName: 'specificFolder'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      folderIds: {
        specificFolder: 'newFolderId'
      }
    }));
  });

  it('should allow to set specific folder pending', () => {
    const action = {
      type: actionTypes.SET_FOLDER_PENDING,
      folderName: 'specificFolder'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual(immutable({
      ...reducer.initialState,
      folderIds: {
        specificFolder: consts.FOLDER_PENDING
      }
    }));
  });
});

describe('loading previous uploads', () => {
  it('should start uploading', () => {
    const action = {
      type: actionTypes.START_LOAD_PREVIOUS_UPLOADS
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      transit: {
        ...reducer.initialState.transit,
        isLoaded: false,
        error: false
      }
    });
  });

  it('should process existing uploads', () => {
    const action = {
      type: actionTypes.SET_PREVIOUS_UPLOADS,
      data: [
        {
          file_name: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          folderId: '585d7eca383f41c6ad63c39ab46ea3e8',
          original_file_name: 'name.jpg',
          mediaType: 'picture',
          file_url: 'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          created_ts: 1462690156,
          labels: [],
          tags: [],
          width: 3000,
          height: 2002,
          fileInfo: null,
          fileInput: null,
          fileOutput: null,
          thumbnailUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
          '/v1/fill/w_210,h_210/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          previewUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
          '/v1/fit/w_375,h_375/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          originalUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          videoPreviewUrl: null
        }
      ],
      cursor: 'new_cursor'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      transit: {
        isLoaded: true,
        error: false,
        everLoaded: true
      },
      cursor: 'new_cursor',
      uploads: {
        'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg': {
          state: consts.UPLOAD_STATES.SERVER,
          progress: 0,
          wixId: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          size: 0,
          startedTS: 1462690156,
          name: 'name.jpg',
          folderName: consts.DEFAULT_FOLDER,
          wixData: {
            file_name: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            folderId: '585d7eca383f41c6ad63c39ab46ea3e8',
            original_file_name: 'name.jpg',
            mediaType: 'picture',
            file_url: 'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            created_ts: 1462690156,
            labels: [],
            tags: [],
            width: 3000,
            height: 2002,
            fileInfo: null,
            fileInput: null,
            fileOutput: null,
            thumbnailUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
            '/v1/fill/w_210,h_210/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            previewUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
            '/v1/fit/w_375,h_375/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            originalUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            videoPreviewUrl: null
          },
          group: undefined
        }
      }});
  });

  it('should preserve group information on previous uploads', () => {
    const action = {
      type: actionTypes.SET_PREVIOUS_UPLOADS,
      data: [
        {
          file_name: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          folderId: '585d7eca383f41c6ad63c39ab46ea3e8',
          original_file_name: 'name.jpg',
          mediaType: 'picture',
          file_url: 'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          created_ts: 1462690156,
          labels: [],
          tags: [],
          width: 3000,
          height: 2002,
          fileInfo: null,
          fileInput: null,
          fileOutput: null,
          thumbnailUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
          '/v1/fill/w_210,h_210/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          previewUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
          '/v1/fit/w_375,h_375/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          originalUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          videoPreviewUrl: null
        }
      ],
      cursor: 'new_cursor'
    };
    const oldState = {
      ...reducer.initialState,
      uploads: {
        12345: {
          state: consts.UPLOAD_STATES.SERVER
        },
        23456: {
          state: consts.UPLOAD_STATES.FINISHED,
          group: 2345,
          wixId: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
        },
        34567: {
          state: consts.UPLOAD_STATES.PENDING,
          group: 3456
        },
        45678: {
          state: consts.UPLOAD_STATES.RUNNING,
          group: 4567
        }
      }
    };
    const newState = reducer.default(oldState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      transit: {
        isLoaded: true,
        error: false,
        everLoaded: true
      },
      cursor: 'new_cursor',
      uploads: {
        'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg': {
          state: consts.UPLOAD_STATES.SERVER,
          progress: 0,
          wixId: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          size: 0,
          startedTS: 1462690156,
          name: 'name.jpg',
          folderName: consts.DEFAULT_FOLDER,
          wixData: {
            file_name: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            folderId: '585d7eca383f41c6ad63c39ab46ea3e8',
            original_file_name: 'name.jpg',
            mediaType: 'picture',
            file_url: 'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            created_ts: 1462690156,
            labels: [],
            tags: [],
            width: 3000,
            height: 2002,
            fileInfo: null,
            fileInput: null,
            fileOutput: null,
            thumbnailUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
            '/v1/fill/w_210,h_210/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            previewUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
            '/v1/fit/w_375,h_375/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            originalUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            videoPreviewUrl: null
          },
          group: 2345
        },
        34567: {
          state: consts.UPLOAD_STATES.PENDING,
          group: 3456
        },
        45678: {
          state: consts.UPLOAD_STATES.RUNNING,
          group: 4567
        }
      }});
  });


  it('should process existing uploads and remove previously found uploads', () => {
    const action = {
      type: actionTypes.SET_PREVIOUS_UPLOADS,
      data: [
        {
          file_name: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          folderId: '585d7eca383f41c6ad63c39ab46ea3e8',
          original_file_name: 'name.jpg',
          mediaType: 'picture',
          file_url: 'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          created_ts: 1462690156,
          labels: [],
          tags: [],
          width: 3000,
          height: 2002,
          fileInfo: null,
          fileInput: null,
          fileOutput: null,
          thumbnailUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
          '/v1/fill/w_210,h_210/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          previewUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
          '/v1/fit/w_375,h_375/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          originalUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          videoPreviewUrl: null
        }
      ],
      cursor: 'new_cursor'
    };
    const oldState = {
      ...reducer.initialState,
      uploads: {
        12345: {
          state: consts.UPLOAD_STATES.SERVER
        },
        23456: {
          state: consts.UPLOAD_STATES.FINISHED
        },
        34567: {
          state: consts.UPLOAD_STATES.PENDING
        },
        45678: {
          state: consts.UPLOAD_STATES.RUNNING
        }
      }
    };
    const newState = reducer.default(oldState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      transit: {
        isLoaded: true,
        error: false,
        everLoaded: true
      },
      cursor: 'new_cursor',
      uploads: {
        'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg': {
          state: consts.UPLOAD_STATES.SERVER,
          progress: 0,
          wixId: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
          size: 0,
          startedTS: 1462690156,
          name: 'name.jpg',
          folderName: consts.DEFAULT_FOLDER,
          wixData: {
            file_name: 'a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            folderId: '585d7eca383f41c6ad63c39ab46ea3e8',
            original_file_name: 'name.jpg',
            mediaType: 'picture',
            file_url: 'media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            created_ts: 1462690156,
            labels: [],
            tags: [],
            width: 3000,
            height: 2002,
            fileInfo: null,
            fileInput: null,
            fileOutput: null,
            thumbnailUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
            '/v1/fill/w_210,h_210/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            previewUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg' +
            '/v1/fit/w_375,h_375/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            originalUrl: '//static.wixstatic.com/media/a42357_82c0db45f7994a8b937d4c7ad5bbf9c4.jpg',
            videoPreviewUrl: null
          },
          group: undefined
        },
        34567: {
          state: consts.UPLOAD_STATES.PENDING
        },
        45678: {
          state: consts.UPLOAD_STATES.RUNNING
        }
      }});
  });

  it('should deal with uploading failing', () => {
    const action = {
      type: actionTypes.LOAD_PREVIOUS_UPLOADS_FAILED
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      transit: {
        ...reducer.initialState.transit,
        isLoaded: false,
        error: true
      }
    });
  });

  it('should clear uploads', () => {
    const oldState = {
      ...reducer.initialState,
      uploads: {
        12345: {
          state: consts.UPLOAD_STATES.SERVER
        },
        23456: {
          state: consts.UPLOAD_STATES.FINISHED
        },
        34567: {
          state: consts.UPLOAD_STATES.PENDING
        },
        45678: {
          state: consts.UPLOAD_STATES.RUNNING
        }
      }
    };
    const action = {
      type: actionTypes.CLEAR_UPLOADS
    };
    const newState = reducer.default(oldState, action);
    expect(newState).toEqual({
      ...reducer.initialState
    });
  });

  it('clearing uploads should keep showLearnMore state', () => {
    const oldState = {...reducer.initialState};
    const action1 = {
      type: actionTypes.TOGGLE_SHOULD_SHOW_LEARN_MORE
    };
    const action2 = {
      type: actionTypes.CLEAR_UPLOADS
    };
    let newState = reducer.default(oldState, action1);
    newState = reducer.default(newState, action2);
    expect(newState).toEqual({
      ...reducer.initialState,
      shouldShowLearnMore: false
    });
  });

  it('should toggle should show learn more false -> true', () => {
    const oldState = {
      ...reducer.initialState,
      shouldShowLearnMore: false
    };
    const action = {
      type: actionTypes.TOGGLE_SHOULD_SHOW_LEARN_MORE
    };
    const newState = reducer.default(oldState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      shouldShowLearnMore: true
    });
  });

  it('should toggle should show learn more true -> false', () => {
    const oldState = {
      ...reducer.initialState,
      shouldShowLearnMore: true
    };
    const action = {
      type: actionTypes.TOGGLE_SHOULD_SHOW_LEARN_MORE
    };
    const newState = reducer.default(oldState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      shouldShowLearnMore: false
    });
  });
});
