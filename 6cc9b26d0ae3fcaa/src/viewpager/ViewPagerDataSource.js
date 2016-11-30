export default class ViewPagerDataSource {

  constructor(params) {
    this._getPageData = params.getPageData ? params.getPageData : (dataBlob, pageID) => dataBlob[pageID];
    this._pageHasChanged = params.pageHasChanged ? params.pageHasChanged : () => {
      //
    };

    this.pageIdentities = [];
  }

  cloneWithPages(dataBlob, pageIdentities) {
    const newSource = new ViewPagerDataSource({
      getPageData: this._getPageData,
      pageHasChanged: this._pageHasChanged,
    });

    newSource._dataBlob = dataBlob;

    if (pageIdentities) {
      newSource.pageIdentities = pageIdentities;
    } else {
      newSource.pageIdentities = Object.keys(dataBlob);
    }

    newSource._cachedPageCount = newSource.pageIdentities.length;
    newSource._calculateDirtyPages(
      this._dataBlob,
      this.pageIdentities
    );
    return newSource;
  }

  getPageCount() {
    return this._cachedPageCount;
  }

  pageShouldUpdate(pageIndex) {
    const needsUpdate = this._dirtyPages[pageIndex];
    return needsUpdate;
  }

  getPageData(pageIndex) {
    if (!this.getPageData) {
      return null;
    }
    const pageID = this.pageIdentities[pageIndex];
    return this._getPageData(this._dataBlob, pageID);
  }

  /**
   * Private members and methods.
   */

  _getPageData() {
    //
  }

  _pageHasChanged() {
    //
  }

  _dataBlob;
  _dirtyPages;
  _cachedRowCount;

  pageIdentities;

  _calculateDirtyPages(
    prevDataBlob,
    prevPageIDs
  ) {
    const prevPagesHash = keyedDictionaryFromArray(prevPageIDs);
    this._dirtyPages = [];

    let dirty;
    for (let sIndex = 0; sIndex < this.pageIdentities.length; sIndex++) {
      const pageID = this.pageIdentities[sIndex];
      dirty = !prevPagesHash[pageID];
      const pageHasChanged = this._pageHasChanged;
      if (!dirty && pageHasChanged) {
        dirty = pageHasChanged(
          this._getPageData(prevDataBlob, pageID),
          this._getPageData(this._dataBlob, pageID)
        );
      }
      this._dirtyPages.push(!!dirty);
    }
  }
}

function keyedDictionaryFromArray(arr) {
  if (arr.length === 0) {
    return {};
  }
  const result = {};
  for (let ii = 0; ii < arr.length; ii++) {
    const key = arr[ii];
    result[key] = true;
  }
  return result;
}

module.exports = ViewPagerDataSource;
