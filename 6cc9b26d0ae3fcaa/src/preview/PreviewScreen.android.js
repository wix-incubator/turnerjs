import {connect} from 'react-redux';
import ImageEdit from 'react-native-image-edit';
import _ from 'lodash';
import {FeatureConfig} from 'a-wix-react-native-framework';
import PreviewScreenBase from './PreviewScreenBase';

class PreviewScreen extends PreviewScreenBase {

  isImageEditorEnabled() {
    return FeatureConfig.isFeatureEnabled('feature.woa.AndroidImageEditor', _(this.props).get('session.session'));
  }

  async onEditPressed() {
    super.onEditPressed();
    const img = await ImageEdit.edit(this.state.presentedImage.uri);

    if (img && img.image) {
      this.onImageEditSuccessful(this.state.presentedImage.uri.replace('file://', ''), img.image);
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
