# Wix Mobile Media Manager

A module for managing media uploads to the Wix Media Manager


## Usage:

Media Manager has two modes, it can either be used as a stand alone screen to show all mobile uploads to the Wix Media Manager so far, and to upload more images from the device. Or it can be used to allow the user to select and upload images for immediate use by another module (e.g. ecom or blogs).

### As a screen:

Simply push the `media.UploadsScreen` using `react-native-navigation`:

```jsx

Navigation.startSingleScreenApp({
	screen: {
	    screen: 'media.UploadsScreen',
	    title: 'Mobile Uploads'
	  }
});
```

### As a helper module:

Wix Mobile Media Manager exports the method `media.UploadImages`, which returns a `Promise` object.

###### With `async-await`
```jsx
const urls = await ModuleRegistry.invoke('media.UploadImages');
```
###### With arrow functions
```jsx
ModuleRegistry.invoke('media.UploadImages').then((urls) => {...})
```
This promise will be resolved with an array of the wixId and the data from the Media Manager server.

##### Example data:

```javascript
[ 
	{ 'a42357_28df3b335131456dbddb5f4d77fe8d4e.jpg': { 
			parent_folder_id: 'b22b2d3a35374437b057349c4bc891f8',
	       created_ts: 1462871739,
	       hash: '7f0c36257c70e2a497909337bb94a850',
	       tags: [],
	       file_name: 'a42357_28df3b335131456dbddb5f4d77fe8d4e.jpg',
	       labels: [ 'nature', 'water', 'green', 'waterfall', 'leaf' ],
	       file_url: 'media/a42357_28df3b335131456dbddb5f4d77fe8d4e.jpg',
	       height: 2500,
	       width: 1668,
	       original_file_name: '10-5-16-1533.jpg',
	       modified_ts: 1462871739,
	       file_size: 1268382,
	       media_type: 'picture',
	       icon_url: 'media/a42357_28df3b335131456dbddb5f4d77fe8d4e.jpg',
	       mime_type: 'image/jpeg' 
       } 
   }
]
```

## Installation

Currently the Media Manager uses the `react-native-camera-kit` which is written partly in Swift. To set up an example project to use `wix-react-native-media-manager` install it from npm, then follow the instructions at [`react-native-camera-kit`](https://github.com/wix/react-native-camera-kit) to link with the native modules.

You also need to link the react-native `ART` native dependency by adding `node-modules/react-native/Libraries/ART/Art.xcodeproj` to your Build Phases in Xcode, and then linking the libART.a library.
