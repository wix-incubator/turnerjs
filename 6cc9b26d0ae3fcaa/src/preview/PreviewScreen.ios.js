import {connect} from 'react-redux';
import _ from 'lodash';
import {FeatureConfig} from 'a-wix-react-native-framework';
import ImageEdit from 'react-native-image-edit';
import PreviewScreenBase from './PreviewScreenBase';

class PreviewScreen extends PreviewScreenBase {

  constructor(props) {
    super(props);
    if (this.isImageEditorEnabled()) {
      ImageEdit.init();
    }
  }

  isImageEditorEnabled() {
    return FeatureConfig.isFeatureEnabled('feature.woa.EnableAviaryImageEditor', _(this.props).get('session.session'));
  }

  async onEditPressed() {
    super.onEditPressed();
    const tools = ['effects', 'crop', 'orientation', 'color', 'enhance'];
    const img = await ImageEdit.edit(this.props.navigator, this.state.presentedImage.uri, tools);
    if (img && img.image) {
      this.onImageEditSuccessful(this.state.presentedImage.id, img.image);
    }
  }
}

function mapStateToProps(state) {
  return {
    ...state.images,
    session: state.session
  };
}

export default connect(mapStateToProps)(PreviewScreen);
