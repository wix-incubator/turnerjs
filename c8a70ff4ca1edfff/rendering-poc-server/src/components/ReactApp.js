import React from 'react';
import griddleReact from 'griddle-react';
import {fakeData}  from '../data/fakeData.js';
import {columnMeta}  from '../data/columnMeta.js';

const resultsPerPage = 200;
const Griddle = React.createFactory(griddleReact);


const ReactApp = React.createClass({
      render: function () {
        return (
          <div id="table-area">
             <Griddle results={fakeData}
                      columnMetadata={columnMeta}
                      resultsPerPage={this.props.resultsPerPage || resultsPerPage}
                      tableClassName="table"/>
          </div>
        )
      }
  });

export default ReactApp;
