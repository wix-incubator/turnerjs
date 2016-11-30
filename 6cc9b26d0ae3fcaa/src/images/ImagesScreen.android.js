import {connect} from 'react-redux';
import ImagesScreenBase from './ImagesScreenBase';

class ImagesScreen extends ImagesScreenBase {

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      userAuthorizedPhotos: true,
      userAuthorizedCamera: true
    };
  }

  showCancelAlert() {
    this.alertCancelPressed();
  }

}
function mapStateToProps(state) {
  return {
    ...state.images
  };
}

export default connect(mapStateToProps)(ImagesScreen);
