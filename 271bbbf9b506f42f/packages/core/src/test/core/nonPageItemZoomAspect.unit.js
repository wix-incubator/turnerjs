define(['react', 'santaProps', 'testUtils', 'utils', 'core/core/pageItemRegistry', 'core/core/siteAspectsRegistry'],
  function (React, santaProps, testUtils, utils, pageItemRegistry, siteAspectsRegistry) {
      'use strict';

      var NonPageItemZoom = siteAspectsRegistry.getSiteAspectConstructor('nonPageItemZoom');

      describe('nonPageItemZoomAspect', function () {
          beforeEach(function (done) {
              var self = this;
              testUtils.mockModules(['siteUtils/core/SiteData', 'core/siteRender/SiteAspectsSiteAPI'], {}, function (SiteData, SiteAPI) {
                  self.siteData = new SiteData();
                  self.siteAPI = new SiteAPI();
                  spyOn(self.siteAPI, 'getSiteData').and.returnValue(self.siteData);
                  self.nonPageItemZoomAspect = new NonPageItemZoom(self.siteAPI);
                  done();
              });
          });

          beforeEach(function () {
              window.rendered = {
                  forceUpdate: jasmine.createSpy('forceUpdate')
              };
          });

          describe('getComponentStructures', function () {
              it('should return nothing if nothing is zoomed', function () {
                  utils.nonPageItemZoom.unzoom();

                  expect(this.nonPageItemZoomAspect.getComponentStructures()).toBeNull();
              });

              it('should return image zoom structure if something is zoomed', function () {
                  spyOn(utils.nonPageItemZoom, 'getZoomedImageData').and.returnValue({});
                  var structures = this.nonPageItemZoomAspect.getComponentStructures();

                  expect(structures && structures.length).toBe(1);
                  expect(structures[0].id).toBe('imageZoomComp');
                  expect(structures[0].dataQuery).toBeUndefined();
                  expect(structures[0].compData).toBe(utils.nonPageItemZoom.getZoomedImageData());
              });
          });

          describe('getReactComponents', function () {
              it('should return nothing if nothing is zoomed', function () {
                  utils.nonPageItemZoom.unzoom();

                  expect(this.nonPageItemZoomAspect.getReactComponents()).toBeNull();
              });

              it('should return image zoom component if something is zoomed', function () {
                  spyOn(pageItemRegistry, 'getCompStructure').and.returnValue({id: 'imageZoomComp'});
                  spyOn(santaProps.componentPropsBuilder, 'getCompProps').and.returnValue({id: 'imageZoomComp'});
                  spyOn(utils.compFactory, 'getCompClass').and.returnValue(React.DOM.div);
                  spyOn(utils.nonPageItemZoom, 'getZoomedImageData').and.returnValue({});
                  var items = this.nonPageItemZoomAspect.getReactComponents();

                  expect(items && items.length).toBe(1);
                  var props = items[0].props;
                  expect(props.id).toBe('imageZoomComp');
                  expect(props.compData).toBe(utils.nonPageItemZoom.getZoomedImageData());
                  expect(props.closeFunction).toBe(utils.nonPageItemZoom.unzoom);
                  //expect(props.getDataByQuery()).toBe(utils.nonPageItemZoom.getZoomedImageData().galleryData);
              });
          });
      });
  });
