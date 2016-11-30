define(['lodash',
        'utils',
        'wixappsCore',
        'wixappsClassics',
        'documentServices/dataModel/dataModel',
        'documentServices/constants/constants',
        'documentServices/siteMetadata/clientSpecMap',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/tpa/services/provisionService',
        'documentServices/wixapps/utils/blogPageJsonGetter',
        'documentServices/wixapps/utils/blogPaginationCustomizationsGetter',
        'documentServices/wixapps/utils/classicsPathUtils',
        'documentServices/wixapps/utils/getBlogNewSocialShareButtonsCustomizationForView',
        'documentServices/componentDetectorAPI/componentDetectorAPI',
        'documentServices/component/component',
        'documentServices/page/page',
        'documentServices/hooks/hooks',
        'documentServices/wixapps/utils/blogFeedAndCustomFeedPaginationChecker',
        'documentServices/wixapps/utils/classicsUtils',
        'documentServices/wixapps/services/blogUtils',
        'experiment'],
    function (_,
              utils,
              wixappsCore,
              wixappsClassics,
              dataModel,
              constants,
              clientSpecMap,
              siteMetadata,
              provisionService,
              blogPageJsonGetter,
              blogPaginationCustomizationsGetter,
              classicsPathUtils,
              getBlogNewSocialShareButtonsCustomizationForView,
              componentDetectorAPI,
              component,
              page,
              hooks,
              blogFeedAndCustomFeedPaginationChecker,
              classicsUtils,
              blogUtils,
              experiment) {
        'use strict';

        var FunctionLibrary = wixappsCore.FunctionLibrary;
        var blogAppPartNames = utils.blogAppPartNames;
        var expression = wixappsCore.expression;

        /**
         * @param {!PrivateServices} privateServices
         * @param {string} componentId
         */
        function invalidateComponentViewCache(privateServices, componentId) {
            privateServices.setOperationsQueue.waitForChangesApplied(function () {
                wixappsClassics.viewCacheUtils.removeComponentViewDefs(componentId);
            });
        }

        /**
         * Gets a list of all appPart components
         * @param ps Private Services
         * @param {Object} pagesData
         */
        function getAllAppPartComps(ps, packageName) {
            var appId = packageName && getApplicationId(ps, packageName);
            if (_.isNull(appId)) {
                return [];
            }
            var appPartPointers = componentDetectorAPI.getComponentByType(ps, 'wixapps.integration.components.AppPart');
            return appPartPointers.map(function pointerToData(appPartPointer) {
                return dataModel.getDataItem(ps, appPartPointer);
            }).filter(function doesBelongToPackage(appPartData) {
                return appPartData.appInnerID === appId || !appId;
            });
        }

        /**
         * @param {!PrivateServices} privateServices
         * @param {string} packageName
         */
        function reloadApp(privateServices, packageName) {
            if (_.size(classics.getAllAppPartComps(privateServices, packageName)) > 0) {
                var packageDescriptorPath = classicsPathUtils.getPackageDescriptorPath(packageName);
                var packageDescriptor = privateServices.dal.getByPath(packageDescriptorPath);

                var packagePath = classicsPathUtils.getPackagePath(packageName);

                privateServices.dal.full.setByPath(packagePath, {});
                privateServices.dal.full.setByPath(packageDescriptorPath, packageDescriptor);

                if (packageName === 'blog') {
                    classics.loadTagNames(privateServices);
                }
            }
        }

        function getApplicationId(ps, packageName) {
            var clientSpecMapPointer = ps.pointers.general.getClientSpecMap();
            var clientSpecMapData = ps.dal.get(clientSpecMapPointer);
            var blogAppId = _.findLast(clientSpecMapData, {packageName: packageName});

            return blogAppId ? '' + blogAppId.applicationId : null;
        }

        function getDataStoreId(ps, packageName) {
            return clientSpecMap.getAppData(ps, getApplicationId(ps, packageName)).datastoreId;
        }

        function getBlogClientSpecMap(ps) {
            return clientSpecMap.getAppData(ps, getApplicationId(ps, 'blog'));
        }

        function getBlogInstanceId(ps) {
            return getBlogClientSpecMap(ps).datastoreId;
        }

        function provision(ps, packageName, appDefinitionId, onComplete) {
            var appId = classics.getApplicationId(ps, packageName);
            if (!appId) {
                if (isSiteSaved(ps)) {
                    provisionService.provisionAppAfterSave(ps, appDefinitionId, onComplete);
                } else {
                    provisionService.provisionAppBeforeSave(ps, appDefinitionId, onComplete);
                }
            } else {
                onComplete({applicationId: appId});
            }
            activateApp(ps, 'true');
        }

        function provisionFromTemplate(ps, packageName, appDefinitionId, sourceTemplateId, onComplete, onError) {
            var appId = classics.getApplicationId(ps, packageName);
            if (!appId) {
                if (isSiteSaved(ps)) {
                    provisionService.provisionAppFromSourceTemplate(ps, appDefinitionId, sourceTemplateId, onComplete, onError);
                } else {
                    onError({success: false});
                }
            } else {
                onComplete({applicationId: appId});
            }
            activateApp(ps, 'true');
        }

        function isSiteSaved(ps) {
            return !siteMetadata.generalInfo.isFirstSave(ps);
        }

        function deleteAllRemainingAppParts(ps) {
            ps.setOperationsQueue.runSetOperation(function () {
                var pages = getNonAppPagePages(ps);

                _.forEach(pages, function (pageData) {
                    var pagePointer = page.getPage(ps, pageData.id);
                    var partsToDelete = componentDetectorAPI.getComponentByType(ps, 'wixapps.integration.components.AppPart', pagePointer);
                    _(partsToDelete)
                        .union(componentDetectorAPI.getComponentByType(ps, 'wysiwyg.common.components.rssbutton.viewer.RSSButton', pagePointer))
                        .forEach(function (partPointer) {
                            component.remove(ps, partPointer);
                        })
                        .value();
                });

                var masterPagePointer = page.getPage(ps, 'masterPage');
                var partsToDeleteFromMasterPage = componentDetectorAPI.getComponentByType(ps, 'wixapps.integration.components.AppPart', masterPagePointer);
                _(partsToDeleteFromMasterPage)
                    .union(componentDetectorAPI.getComponentByType(ps, 'wysiwyg.common.components.rssbutton.viewer.RSSButton', masterPagePointer))
                    .forEach(function (partPointer) {
                        component.remove(ps, partPointer);
                    })
                    .value();

                activateApp(ps, 'false');
            });
        }

        function getNonAppPagePages(ps) {
            var pages = page.getPagesDataItems(ps);
            return _(pages)
                .compact()
                .reject({appPageType: 'AppPage'})
                .value();
        }

        function canDeleteComp(ps, compPointer) {
            var appPart = dataModel.getDataItem(ps, compPointer);
            var undeletableAppParts = [blogAppPartNames.FEED, blogAppPartNames.SINGLE_POST];

            if (experiment.isOpen('sv_blogHeroImage')) {
                undeletableAppParts.push(blogAppPartNames.HERO_IMAGE);
            }

            if (experiment.isOpen('sv_blogStudioExperiment')) {
                //give ability for studio to delete component from page
                _.pull(undeletableAppParts, blogAppPartNames.HERO_IMAGE);
            }

            if (_.includes(undeletableAppParts, appPart.appPartName)) {
                return false;
            }
        }

        function registerHooks() {
            hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, deleteAllRemainingAppParts, 'wixapps.integration.components.AppPage');
            hooks.registerHook(hooks.HOOKS.REMOVE.IS_OPERATION_ALLOWED, canDeleteComp, 'wixapps.integration.components.AppPart');
            hooks.registerHook(hooks.HOOKS.DUPLICATE.IS_OPERATION_ALLOWED, canDeleteComp, 'wixapps.integration.components.AppPart');
        }

        function getAvailableViewNames(ps, packageName, appPartName) {
            return classicsUtils.getAppPartDefinition(ps, packageName, appPartName).views;
        }

        function isRTLAllowed(ps, packageName, appPartName) {
            return classicsUtils.getAppPartDefinition(ps, packageName, appPartName).allowRtl;
        }

        function getInnerComps(ps, packageNameOrDescriptor, viewName) {
            var descriptor = _.isString(packageNameOrDescriptor) ? classicsUtils.getDescriptor(ps, packageNameOrDescriptor) : packageNameOrDescriptor;
            return _.find(descriptor.viewDescriptions, {id: viewName})
                .comps
                .filter(function shouldCompBeRemovedBecauseOfExperiment(comp) {
                    return comp.experiment === undefined || comp.experiment.value === {}[comp.experiment.name];
                });
        }

        function getViewDefinitions(descriptor, viewName, format) {
            return descriptor.views
                .filter(function isViewRelevant(view) {
                    var viewNames = _.isArray(view.name) ? view.name : [view.name];
                    return _.includes(viewNames, viewName) && _.includes([(view.format || ''), '*'], format);
                });
        }

        function getAvailableStyleCustomizations(ps, descriptor, view, format) {
            return _.flattenDeep(getInnerComps(ps, descriptor, view).map(function (comp) {
                var rules;
                if (comp.hasNoStyleCustomization || (!_.isUndefined(comp.format) && comp.format !== format)) {
                    rules = [];
                } else if (!comp.rules) {
                    rules = [{
                        fieldId: comp.compId || comp.id,
                        forType: 'Post',
                        format: format,
                        key: 'comp.style',
                        view: view
                    }];
                } else {
                    rules = _(comp.rules)
                        .filter(function (rule) {
                            return format === '' || // Normally, a common customization is created in desktop mode. Include all.
                                _.isUndefined(rule.format) || // Treat undefined format as common (for desktop and mobile).
                                rule.format === format;
                        })
                        .map(function (rule) {
                            return {
                                fieldId: rule.fieldId,
                                forType: rule.forType,
                                format: format,
                                key: 'comp.style',
                                view: rule.view
                            };
                        })
                        .value();
                }
                return rules;
            }));
        }

        function getAvailableCustomizations(ps, packageName, viewName, format, panelType) {
            var descriptor = classicsUtils.getDescriptor(ps, packageName);

            var rules = _(getViewDefinitions(descriptor, viewName, format))
                .map(function getViewCustomizations(view) {
                    var customizations = _.map(view.customizations, function addInfoFromView(customization) {
                        return _.merge({}, customization, {
                            view: viewName,
                            forType: customization.forType || view.forType,
                            format: customization.format || format
                        });
                    });

                    return customizations;
                })
                .flattenDeep()
                .filter(function isCustomizationForPanelType(customization) {
                    return panelType ? customization.panelType === panelType : customization;
                })
                .value();


            return panelType !== 'design' ? rules :
                rules.concat(getAvailableStyleCustomizations(ps, descriptor, viewName, format));
        }

        function getStyleCustomizations(ps, packageName, fieldId, view) {
            var descriptor = classicsUtils.getDescriptor(ps, packageName);
            return _.filter(descriptor.customizations, function (customization) {
                return customization.key === 'comp.style' &&
                    (fieldId === undefined || customization.fieldId === fieldId) &&
                    (view === undefined || customization.view === view);
            });
        }

        function validateRule(rule) {
            if (rule === undefined || _.includes([rule.view, rule.forType, rule.format, rule.fieldId, rule.key], undefined)) {
                throw new Error('illegal rule');
            }
        }

        function doesMatch(customization, rule) {
            var formatMatches = (customization.format === rule.format) || (rule.format === '*' && _.isUndefined(customization.format));
            return formatMatches && ['fieldId', 'forType', 'key', 'view'].every(function (fieldName) {
                    return customization[fieldName] === rule[fieldName];
                });
        }

        function findCustomizationOverride(ps, customizationOverrides, rule) {
            validateRule(rule);
            return _.find(customizationOverrides, function (customizationOverride) {
                return doesMatch(customizationOverride, rule);
            });
        }

        function findDefaultValueInViewDefinition(itemDef, rule) {
            var res;

            if (itemDef.id === rule.fieldId) {
                res = _.get(itemDef, rule.key);
                if (res !== undefined) {
                    return res;
                }
            }

            if (itemDef.comp === undefined) {
                return undefined;
            }

            // Find it recursively in items, cases and templates:
            _([itemDef.comp.items, _.values(itemDef.comp.cases), _.values(itemDef.comp.templates)])
                .flattenDeep()
                .compact()
                .some(function (itemD) {
                    res = findDefaultValueInViewDefinition(itemD, rule);
                    return res !== undefined;
                });

            return res;
        }

        function findDefaultValueInCustomizationsSection(ps, packageName, rule) {
            var customizations = classicsUtils.getDescriptor(ps, packageName).customizations;
            var customizationOverride = findCustomizationOverride(ps, customizations, rule) ||
                findCustomizationOverride(ps, customizations, _.merge({}, rule, {format: '*'}));
            return customizationOverride && customizationOverride.value;
        }

        function findDefaultValueInViewsSection(ps, packageName, rule) {
            var views = getViewDefinitions(classicsUtils.getDescriptor(ps, packageName), rule.view, rule.format);

            var res;
            views.some(function (view) {
                if (rule.fieldId === 'vars') {
                    res = view.vars && view.vars[rule.key];
                    return res !== undefined;
                }
                res = findDefaultValueInViewDefinition(view, rule);
                return res !== undefined;
            });

            return res;
        }

        function findDefaultValueInInputDefinitionOfTheCustomizationDefinition(ps, packageName, rule) {
            var availableCustomizations = getAvailableCustomizations(ps, packageName, rule.view, rule.format);
            var customization = _.find(availableCustomizations, {fieldId: rule.fieldId, key: rule.key});

            if (customization !== undefined) {
                return customization.input.defaultVal;
            }
        }

        function findCustomizationDefaultValueFromDescriptor(ps, packageName, rule) {
            validateRule(rule);

            var res;
            [
                findDefaultValueInCustomizationsSection,
                findDefaultValueInViewsSection,
                findDefaultValueInInputDefinitionOfTheCustomizationDefinition
            ].some(function (finder) {
                res = finder(ps, packageName, rule);
                return res !== undefined;
            });

            return expression.isExpression(res) ? evaluateUnreferencedExpression(res.$expr) : res;
        }

        function activateApp(ps, activeState) {
            var pointer = ps.pointers.page.getPageData('masterPage');
            var innerPath = ['appVars_61f33d50-3002-4882-ae86-d319c1a249ab', 'vars', 'applicationActiveState'];
            while (!_.isEmpty(innerPath)) {
                pointer = ps.pointers.getInnerPointer(pointer, innerPath.splice(0, 1)[0]);
                if (!ps.dal.isExist(pointer)) {
                    ps.dal.set(pointer, {});
                }
            }

            ps.dal.set(pointer, {type: "AppPartParam", value: activeState});
        }

        function getComponentTypeByProxyName(ps, proxyName) {
            return wixappsClassics.componentTypeUtil.getComponentTypeByProxyName(proxyName);
        }

        function styleToFontClass(ps, style) {
            return wixappsCore.styleMapping.styleToFontClass(style);
        }

        function fontClassToStyle(ps, fontClass) {
            return wixappsCore.styleMapping.fontClassToStyle(fontClass);
        }

        var tagsPath = ['wixapps', 'blog', 'tagNames'];

        function loadTagNames(ps, tagsLoadedCallback) {
            var baseUrl = utils.urlUtils.baseUrl(ps.siteAPI.getExternalBaseUrl());
            var storeId = classics.getBlogInstanceId(ps);
            var tagsRequest = {
                url: baseUrl + '/apps/lists/1/GroupByAndCount?consistentRead=false',
                data: {
                    collectionId: 'Posts',
                    field: 'tags',
                    filter: {
                        "scheduled.iso": {
                            "$not": {
                                "$gt": "$now"
                            }
                        },
                        "draft": false,
                        "deleted": {"$ne": true}
                    },
                    type: 'Post',
                    storeId: storeId
                },
                force: true,
                destination: tagsPath,
                transformFunc: function (response) {
                    return Object.keys(response.payload || {});
                }
            };
            ps.siteAPI.loadBatch([tagsRequest], tagsLoadedCallback);
        }

        /**
         * @returns {string[]}
         */
        function getTagNames(ps) {
            var blogTagsPath = classicsPathUtils.getBlogTagNamesPath();
            return ps.dal.getByPath(blogTagsPath);
        }

        function getBlogCategories(ps, optionalCategoryName) {
            var categoriesPath = classicsPathUtils.getCategoriesPath('blog');
            var categories = ps.dal.getByPath(categoriesPath) || [];

            var flattenedCategories = [];
            _.forEach(categories, function (category) {
                flattenedCategories.push({
                    name: category.name
                });

                _.forEach(category.subcategories, function (subcategory) {
                    flattenedCategories.push({
                        isSubcategory: true,
                        name: subcategory.name
                    });
                });
            });

            if (optionalCategoryName) {
                var isNonexistentCategory = !_.find(flattenedCategories, {name: optionalCategoryName});
                if (isNonexistentCategory) {
                    flattenedCategories.unshift({
                        name: optionalCategoryName
                    });
                }
            }

            return flattenedCategories;
        }

        /**
         * @param {!PrivateServices} ps
         *
         * @param {!Object} appPartPointer
         *
         * @param {string} forType
         *  For instance, "Array", "Post", "wix:Object", etc.
         *
         * @param {string} format
         *  "", "Mobile", or "*".
         *
         * @param {string} fieldId
         *  For instance, "vars", "title", "date", etc.
         *
         * @param {string} key
         *  For instance, "varName", "hidden", etc.
         */
        function getAppPartViewFieldKeyValue(ps, appPartPointer, forType, format, fieldId, key) {
            var appPartData = dataModel.getDataItem(ps, appPartPointer);

            var descriptor = classicsUtils.getDescriptor(ps,
                classicsUtils.getPackageName(ps, appPartData.appInnerID)
            );

            var appPartView = wixappsCore[experiment.isOpen('wixappsViewsCaching') ? 'memoizedViewsUtils' : 'viewsUtils'].findViewInDescriptorByNameTypeAndFormat(descriptor, appPartData.viewName, forType, format);
            // Make a copy to avoid modification of the descriptor at runtime.
            var appPartViewCopy = _.cloneDeep(appPartView);

            // A view's name can be an array of names. Specify the name in order to be able to customize the view.
            appPartViewCopy.name = appPartData.viewName;

            wixappsCore.viewsCustomizer.customizeView(appPartViewCopy, descriptor.customizations, appPartData.appLogicCustomizations);

            var value;
            if (fieldId === 'vars') {
                value = appPartViewCopy.vars[key];
            } else {
                wixappsCore.viewsUtils.traverseViews(appPartViewCopy, function (view) {
                    if (view.id === fieldId) {
                        value = _.get(view, key);

                        // Stop traversal.
                        return false;
                    }
                });
            }

            var finalValue = expression.isExpression(value) ? evaluateUnreferencedExpression(value.$expr) : value;

            if (typeof finalValue !== 'undefined') {
                return finalValue.toString();
            }
        }

        function evaluateUnreferencedExpression(source) {
            return expression.evaluate(function () {
            }, source, getFunctionLibrary());
        }

        var _functionLibrary = null;

        function getFunctionLibrary() {
            if (!_functionLibrary) {
                _functionLibrary = new FunctionLibrary();
            }
            return _functionLibrary;
        }

        function getSinglePostId(ps, compId) {
            var postPath = classicsPathUtils.getAppPartDataPath('blog', compId);
            var compData = ps.dal.getByPath(postPath);
            return compData ? compData[1] : '';
        }

        function getAppPartExtraData(ps, compId) {
            var compData = ps.dal.get(compId);
            var extraDataId = compData.dataQuery.replace('#', '') + '_extraData';
            var postPath = classicsPathUtils.getAppPartDataPath('blog', extraDataId);

            return ps.dal.getByPath(postPath);
        }

        function getBlogPaginationCustomizationsByAppPartName(ps, appPartName) {
            return blogPaginationCustomizationsGetter.getBlogPaginationCustomizationsByAppPartName(appPartName);
        }

        function getUserId() {
            //deprecated
            return '';
        }

        function addBlog(ps, sourceTemplateId, feedComponents, singlePostComponents, callback) {
            var provisionCallback = function (appDefinition) {
                var blogPageRef = page.getPageIdToAdd(ps);
                ps.setOperationsQueue.runSetOperation(page.add, [
                    ps,
                    blogPageRef,
                    'Blog',
                    blogPageJsonGetter.getBlogFeedPageJson(ps, feedComponents, appDefinition.applicationId)
                ], {isUpdatingAnchors: true});
                ps.setOperationsQueue.runSetOperation(page.add, [
                    ps,
                    page.getPageIdToAdd(ps),
                    'Single Post',
                    blogPageJsonGetter.getSinglePostPageJson(ps, singlePostComponents, appDefinition.applicationId)
                ], {isUpdatingAnchors: true});
                if (_.isFunction(callback)) {
                    callback(blogPageRef.id);
                }
            };

            if (!sourceTemplateId) {
                provision(ps, 'blog', '61f33d50-3002-4882-ae86-d319c1a249ab', provisionCallback);
            } else {
                provisionFromTemplate(ps, 'blog', '61f33d50-3002-4882-ae86-d319c1a249ab', sourceTemplateId, function () {
                    provisionService.provisionAppAfterSave(ps, '61f33d50-3002-4882-ae86-d319c1a249ab', provisionCallback);
                });
            }
        }

        function replaceBlogPages(ps, feedComponents, singlePostComponents, feedContainerPointer) {
            var pagePointers = ps.pointers.page.getNonDeletedPagesPointers();
            var singlePostContainer = _(pagePointers)
                .chain()
                .find(function (pointer) {
                    return blogUtils.isSinglePost(ps, pointer.id);
                })
                .thru(ps.pointers.components.getDesktopPointer)
                .value();
            var feedContainer = feedContainerPointer ||
                _(pagePointers)
                    .chain()
                    .find(function (pointer) {
                        return blogUtils.isFeed(ps, pointer.id);
                    })
                    .thru(ps.pointers.components.getDesktopPointer)
                    .value();

            var appInnerID = _(singlePostContainer.id)
                .thru(ps.pointers.data.getDataItem)
                .thru(ps.dal.get)
                .get('appInnerID');
            var blogifyComponent = blogPageJsonGetter.blogComponentBuilder(appInnerID);

            // replace single-post page
            replaceContainerChildren(singlePostContainer, singlePostComponents.map(blogifyComponent));

            // replace feed container && return new pointers
            return replaceContainerChildren(feedContainer, feedComponents.map(blogifyComponent));

            function replaceContainerChildren(containerPointer, newChildren) {
                var newChildrenPointers = [];

                // clear children
                ps.pointers.components.getChildren(containerPointer).forEach(function (comp) {
                    ps.setOperationsQueue.runSetOperation(component.remove, [ps, comp], {isUpdatingAnchors: true});
                });

                // add new children
                newChildren.forEach(function (comp) {
                    var newCompPointer = component.getComponentToAddRef(ps, containerPointer, comp);
                    newChildrenPointers.push(newCompPointer);
                    ps.setOperationsQueue.runSetOperation(component.add, [ps, newCompPointer, containerPointer, comp], {isUpdatingAnchors: true});
                });

                // return pointers
                return newChildrenPointers;
            }

        }


        var classics = {
            registerHooks: registerHooks,
            getPackageName: classicsUtils.getPackageName,
            getDataStoreId: getDataStoreId,
            invalidateComponentViewCache: invalidateComponentViewCache,
            getAllAppPartComps: getAllAppPartComps,
            getApplicationId: getApplicationId,
            getBlogInstanceId: getBlogInstanceId,
            provision: provision,
            provisionFromTemplate: provisionFromTemplate,
            reloadApp: reloadApp,
            isBlogPage: blogUtils.isBlogPage,
            canDeleteComp: canDeleteComp,
            getAvailableViewNames: getAvailableViewNames,
            isRTLAllowed: isRTLAllowed,
            getAvailableCustomizations: getAvailableCustomizations,
            getInnerComps: getInnerComps,
            findCustomizationDefaultValueFromDescriptor: findCustomizationDefaultValueFromDescriptor,
            findCustomizationOverride: findCustomizationOverride,
            getStyleCustomizations: getStyleCustomizations,
            getAppPartRole: classicsUtils.getAppPartRole,
            getComponentTypeByProxyName: getComponentTypeByProxyName,
            loadTagNames: loadTagNames,
            getTagNames: getTagNames,
            styleMapping: {
                styleToFontClass: styleToFontClass,
                fontClassToStyle: fontClassToStyle
            },
            getBlogCategories: getBlogCategories,
            getAppPartViewFieldKeyValue: getAppPartViewFieldKeyValue,
            getSinglePostId: getSinglePostId,
            getAppPartExtraData: getAppPartExtraData,
            getBlogPaginationCustomizationsByAppPartName: getBlogPaginationCustomizationsByAppPartName,
            getUserId: getUserId,
            blog: {
                addBlog: addBlog,
                replaceBlogPages: replaceBlogPages,
                isSinglePost: blogUtils.isSinglePost,
                isFeed: blogUtils.isBlogFeedPage
            },
            blogFeedOrCustomFeedHasPagination: blogFeedAndCustomFeedPaginationChecker.blogFeedOrCustomFeedHasPagination,
            getBlogNewSocialShareButtonsCustomizationForView: function (ps, name) {
                return getBlogNewSocialShareButtonsCustomizationForView(name);
            }
        };
        return classics;
    });
