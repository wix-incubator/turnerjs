import path from 'path';

import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom/server';
import ReactDOMStream from 'react-dom-stream/server';
import {match, RouterContext} from 'react-router';

import {Router} from 'express';

import wixRenderer from 'wix-renderer';
import wixRunMode from 'wix-run-mode';
import wixExpressRenderingModel from 'wix-express-rendering-model';

import createRoutes from './routes';
import configureStore from './store/configureStore';
import fetchData from './fetch-data';

import ReactApp from './components/ReactApp';
const ReactAppFactory = React.createFactory(ReactApp);

import render from 'wix-santa/server/main/render';

import version from './dynamic/version';
import model from './static/model';

import pagesService from './service/pages-service';

// const santaTestkit = require('wix-santa-testkit');
//
// const santaStaticsTest = santaTestkit.getStaticsServer();
// santaStaticsTest.start();


module.exports = ({rpc, basename, hostname, config}) => {
  const app = new Router();

  // if (process.env.NODE_ENV === 'development') {
  //   app.use(require('./fake-server'));
  // }

  app.get('/sites', (req, res) =>
    rpc.metasite(req.aspects)
       .listMetasites(req.aspects.session.userGuid)
       .then(response => res.send(response)));

  app.get('/version', (req, res) => {
    const param = req.query.version;
    const loaded = version.loadVersion(param).version();

    res.json({version: loaded});
  });

  app.get('/santa', (req, res) => {
    const modifiedModel = model.siteModel();

    if (process.env.NODE_ENV === 'development') {
      modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = "http://localhost/santa";
    } else {
      modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = "http://apps.wix.com/rendering-poc-server/santa";
    }

    const masterPageId = modifiedModel.publicModel.pageList.mainPageId;

    // render(models, function (santaSite) {
    render(modifiedModel, function (santaSite) {
      const templatePath = path.resolve('./src/react.ejs');
      const initialState = {};
      const html = ReactDOM.renderToString( santaSite );

      const baseSantaStaticUrl = modifiedModel.serviceTopology.scriptsLocationMap['santa'];
      const serviceTopology = modifiedModel.serviceTopology;
      const rendererModel2 = modifiedModel.rendererModel;
      const publicModel = modifiedModel.publicModel;

      wixExpressRenderingModel.generate(req, config).then(renderModel => {
        wixRenderer
          .render(templatePath, renderModel, {initialState, html, baseSantaStaticUrl, serviceTopology, rendererModel2, publicModel, masterPageId}, wixRunMode.isProduction())
          .then(html => res.send(html));
      });
    });
    // res.json(model.siteModel());
  });

  app.get('/santa-stream', (req, res) => {
    const modifiedModel = model.siteModel();
    if (process.env.NODE_ENV === 'development') {
      modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = "http://localhost/santa-stream";
    } else {
      modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = "http://apps.wix.com/rendering-poc-server/santa-stream";
    }

    // const baseSantaStaticUrl = modifiedModel.serviceTopology.scriptsLocationMap['santa'];
    const serviceTopology = modifiedModel.serviceTopology;
    const rendererModel2 = modifiedModel.rendererModel;
    const publicModel = modifiedModel.publicModel;
    const scriptTag = `var isServerSideRender = true; var santaModels = true; var clientSideRender = !isServerSideRender; var rendererModel = ${JSON.stringify(rendererModel2)}; var publicModel = ${JSON.stringify(publicModel)}; var serviceTopology = ${JSON.stringify(serviceTopology)};`;

    const masterPageId = modifiedModel.publicModel.pageList.mainPageId;
    publicModel.deviceInfo.deviceType='Desktop';
    const showContentScript = `document.getElementById('SITE_ROOT').childNodes[0].style.visibility = 'visible'; document.getElementById('${masterPageId}').style.visibility = 'visible';`;

    render(modifiedModel, function (santaSite) {
      const stream = ReactDOMStream.renderToStaticMarkup(
        <html>
        <head>
          <title>Santa Render to Stream</title>

          <script dangerouslySetInnerHTML={{__html: scriptTag}} />
          <script src="https://static.parastorage.com/services/third-party/requirejs/2.1.15/require.min.js"></script>
          <script src="https://static.parastorage.com/services/santa/1.1834.0/app/main-r.min.js"></script>
        </head>
        <body>
          <h1 id="main-title">Isomorphic Server Side Rendering with React</h1>

          <div id="root" dangerouslySetInnerHTML={{__html: ReactDOMStream.renderToString(santaSite)}} />

          <script dangerouslySetInnerHTML={{__html: showContentScript}} />
        </body>
        </html>
      );

      stream.pipe(res, {end: false});

      stream.on("end", () => {
        // TODO: write out the rest of the page, including the closing body and html tags.
        res.end();
      });
    });
  });


  app.get('/server', (req, res) => {
    var pageSize = req.query.pageSize;
    if (typeof pageSize == 'undefined') {
      pageSize = 200;
    }

    const templatePath = path.resolve('./src/react.ejs');
    const initialState = {};
    const html = ReactDOM.renderToString(ReactAppFactory({ resultsPerPage: pageSize }));

    wixExpressRenderingModel.generate(req, config).then(renderModel => {
      wixRenderer
        .render(templatePath, renderModel, {initialState, html}, wixRunMode.isProduction())
        .then(html => res.send(html));
    });

  });

  app.get('/stream', (req, res) => {
    var pageSize = req.query.pageSize;
    if (typeof pageSize == 'undefined') {
      pageSize = 200;
    }

    const stream = ReactDOMStream.renderToStaticMarkup(
      <html>
      <head>
        <title>React Isomorphic Server Side Rendering Example</title>
      </head>
      <body>
      <h1 id="main-title">Isomorphic Server Side Rendering with React</h1>

      <div id="react-main-mount" dangerouslySetInnerHTML={{__html: ReactDOMStream.renderToString(ReactAppFactory({resultsPerPage: pageSize}))}} />
      </body>
      </html>
    );

    stream.pipe(res, {end: false});

    stream.on("end", () => {
      res.end();
    });
  });


  app.get('/html/:id', (req, res) =>
    rpc.publicHtml(req.aspects).getSiteById(req.params.id)
       .then(response =>
         pagesService.pagesDataFor(response.pageList.pages)
                     .then(pagesData => {
                              const siteModelObj = { siteAsJson: {}, pagesData: {}};
                              pagesData.forEach(page => {
                                siteModelObj.siteAsJson[page.pageId] = page.pageData;
                                siteModelObj.pagesData[page.pageId] = page.pageData;
                              });
                              return siteModelObj;
                       }) )
       .then( model => res.json(model) ) );
       // .catch(next) );


  app.get('/model/:id', (req, res) => {
    rpc.publicModels(req.aspects).renderModels(req.params.id)
       .then(response => {
         res.json(JSON.parse(response))
       } );
  });

  app.get('/file/:file', (req, res) => {
    const fileName = req.params.file;
    const baseUrl = `http://static.wixstatic.com/sites/${fileName}.json.z`;
    pagesService.pageDataBy(baseUrl)
                .then( data => res.json(data) );
  });

  app.get('/santa2/:id', (req, res) => {
    const msId = req.params.id;
    rpc.publicModels(req.aspects).renderModels(msId)
      .then(response => {
        const modifiedModel = JSON.parse(response);

        if (process.env.NODE_ENV === 'development') {
          modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = `http://localhost/santa2/${msId}`;
        } else {
          modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = `http://apps.wix.com/rendering-poc-server/santa2/${msId}`;
        }

        const requestModel = {
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
          storage: { },
          cookie: "",
          session: { },
          deviceType: "desktop"
        };

        modifiedModel.requestModel = requestModel;
        const masterPageId = modifiedModel.publicModel.pageList.mainPageId;
        modifiedModel.publicModel.deviceInfo.deviceType = 'Desktop';

        render(modifiedModel, function (santaSite) {
          const templatePath = path.resolve('./src/react.ejs');
          const initialState = {};
          const html = ReactDOM.renderToString( santaSite );

          const baseSantaStaticUrl = modifiedModel.serviceTopology.scriptsLocationMap['santa'];
          const serviceTopology = modifiedModel.serviceTopology;
          const rendererModel2 = modifiedModel.rendererModel;
          const publicModel = modifiedModel.publicModel;

          wixExpressRenderingModel.generate(req, config).then(renderModel => {
            wixRenderer
              .render(templatePath, renderModel, {initialState, html, baseSantaStaticUrl, serviceTopology, rendererModel2, publicModel, masterPageId}, wixRunMode.isProduction())
              .then(html => res.send(html));
          });
        });
      });
  });

  app.get('/santa-stream2/:id', (req, res) => {
    const msId = req.params.id;
    rpc.publicModels(req.aspects).renderModels(msId)
      .then(response => {
        const modifiedModel = JSON.parse(response);

        if (process.env.NODE_ENV === 'development') {
          modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = `http://localhost/santa-stream2/${msId}`;
        } else {
          modifiedModel.currentUrl = modifiedModel.publicModel.externalBaseUrl = `http://apps.wix.com/rendering-poc-server/santa-stream2/${msId}`;
        }

        // const baseSantaStaticUrl = modifiedModel.serviceTopology.scriptsLocationMap['santa'];
        const serviceTopology = modifiedModel.serviceTopology;
        const rendererModel2 = modifiedModel.rendererModel;
        const publicModel = modifiedModel.publicModel;
        const scriptTag = `var isServerSideRender = true; var santaModels = true; var clientSideRender = !isServerSideRender; var rendererModel = ${JSON.stringify(rendererModel2)}; var publicModel = ${JSON.stringify(publicModel)}; var serviceTopology = ${JSON.stringify(serviceTopology)};`;

        const masterPageId = modifiedModel.publicModel.pageList.mainPageId;
        modifiedModel.publicModel.deviceInfo.deviceType = 'Desktop';
        const requestModel = {
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
          storage: { },
          cookie: "",
          session: { },
          deviceType: "desktop"
        };

        modifiedModel.requestModel = requestModel;

        const showContentScript = `document.getElementById('SITE_ROOT').childNodes[0].style.visibility = 'visible'; document.getElementById('${masterPageId}').style.visibility = 'visible';`;

        render(modifiedModel, function (santaSite) {
          const stream = ReactDOMStream.renderToStaticMarkup(
            <html>
            <head>
              <title>Santa Render to Stream</title>

              <script dangerouslySetInnerHTML={{__html: scriptTag}} />
              <script src="https://static.parastorage.com/services/third-party/requirejs/2.1.15/require.min.js"></script>
              <script src="https://static.parastorage.com/services/santa/1.1834.0/app/main-r.min.js"></script>
            </head>
            <body>
            <h1 id="main-title">Isomorphic Server Side Rendering with React</h1>

            <div id="root" dangerouslySetInnerHTML={{__html: ReactDOMStream.renderToString(santaSite)}} />

            <script dangerouslySetInnerHTML={{__html: showContentScript}} />
            </body>
            </html>
          );

          stream.pipe(res, {end: false});

          stream.on("end", () => {
            // TODO: write out the rest of the page, including the closing body and html tags.
            res.end();
          });
        });

      });
  });


  app.get('*', (req, res) => {
    const templatePath = path.resolve('./src/index.ejs');
    const store = configureStore({}, {baseUrl: `${hostname}${basename}`});
    const routes = createRoutes(store);

    match({routes, basename, location: req.url}, (err, redirect, props) => {
      if (err) {
        res.status(500).json(err);
      } else if (redirect) {
        res.redirect(302, redirect.pathname + redirect.search);
      } else if (!props) {
        res.sendStatus(404);
      } else {
        const {components, params} = props;

        return fetchData(store.dispatch, components, params).then(() => {
          const initialState = store.getState();
          const html = ReactDOM.renderToString(
            <Provider store={store}>
              <RouterContext {...props}/>
            </Provider>
          );

          const data = {initialState, html, basename};

          wixExpressRenderingModel.generate(req, config).then(renderModel => {
            wixRenderer
              .render(templatePath, renderModel, data, wixRunMode.isProduction())
              .then(html => res.send(html));
          });
        });
      }
    });
  });

  return app;
};
