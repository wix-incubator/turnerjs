import cassandra from 'cassandra-driver';

import zlib from 'zlib';

// cassandra
const authProvider = new cassandra.auth.PlainTextAuthProvider('wipuhtinwe_ro', '4dedf240419013e030ac8f4145054857');
const loadBalancingPolicy = new cassandra.policies.loadBalancing.TokenAwarePolicy( new cassandra.policies.loadBalancing.DCAwareRoundRobinPolicy("AUS") );
const reconnectionPolicy = new cassandra.policies.reconnection.ConstantReconnectionPolicy( 100 );
const policies = {loadBalancing: loadBalancingPolicy, reconnectionPolicy: reconnectionPolicy};
const socketOptions = {tcpNoDelay: true};
const contactPoints = ['c01.aus.wixpress.com', 'c02.aus.wixpress.com', 'c03.aus.wixpress.com', 'c04.aus.wixpress.com', 'c05.aus.wixpress.com', 'c06.aus.wixpress.com'];
const cassandraClient = new cassandra.Client({ authProvider: authProvider, contactPoints: contactPoints, port: 9042, policies: policies, socketOptions: socketOptions });
cassandraClient.connect(err => {
  if (err) {
    console.log("failed to connect to cassandra " + err)
  }
});


function pageDataFor(jsonFileName) {
  const query = 'SELECT digest FROM html_pages.pages WHERE page_prefix = ? AND page_id= ?';
  // SELECT site_id, digest, ref_date FROM html_pages.pages WHERE page_prefix = "c98b59" AND page_id= "c98b59_905fada379a2b96abd9bf979938d1a87_86.json"
  // var queries = [];
  // var pagesData = [];

  return new Promise((resolve, reject) => {
    const pageId = jsonFileName.substr(0, 6);
    cassandraClient.execute(query, [pageId, jsonFileName], { prepare: true }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        if ( result.rows.length > 0 ) {
          const row = result.first();
          const buffer = row['digest'];
          zlib.gunzip(buffer, (err, decoded) => {
            if (err) {
              console.log("failed to unzip data");
              reject(err);
            } else {
              resolve( { pageId: pageId, pageData: decoded.toString() } );
            }
          });
        } else {
          console.log("No results");
          // reject(Error("No results"));
          resolve( { pageId: pageId, pageData: "No data" } );
        }
      }
    });
  });
}

function pagesDataFor(pages) {
  return Promise.all( pages.map( pageDataFor ) );
}

function pageDataBy(url) {
  console.log(url);
  const fileName = url.split("/").pop()
                      .replace(/.json.z$/, "");
  console.log(fileName);
  return pageDataFor(fileName);
}

exports.pagesDataFor = pagesDataFor;
exports.pageDataBy = pageDataBy;