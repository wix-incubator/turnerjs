import {connect} from 'react-redux';
import {fetchSites} from './../../actions';
import React, {PropTypes, Component} from 'react';

class SiteList extends Component {
  static propTypes = {
    sites: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired
  }

  static fetchData(dispatch) {
    return dispatch(fetchSites());
  }

  render() {
    const {sites, loading} = this.props;

    if (loading) {
      return (
        <div>
          <h2>Loading...</h2>
        </div>
      );
    }

    return (
      <div>
        <h2>Site List</h2>
        <ul>
          {sites.map(site =>
            <li data-hook="site" key={site.id}>{site.siteName}</li>
          )}
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    sites: state.sites.list,
    loading: state.sites.loading
  };
}

export default connect(mapStateToProps)(SiteList);
