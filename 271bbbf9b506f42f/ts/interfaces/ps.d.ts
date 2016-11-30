interface ComponentPointers {
    getMobilePointer(pointer: Pointer): Pointer;
    getDesktopPointer(pointer: Pointer): Pointer;
    getComponent(id: string): Pointer;

    isMobile(pointer: Pointer): boolean;

    isPage(pointer: Pointer): boolean;

    isMasterPage(pointer: Pointer): boolean;

    isInMasterPage(pointer: Pointer): boolean;

    getViewMode(pointer: Pointer): string;

    getChildrenContainer(pointer: Pointer): Pointer;

    getChildren(pointer: Pointer): Array<Pointer>;

    getChildrenRecursively(pointer: Pointer): Array<Pointer>;

    getParent(pointer: Pointer): Pointer;

    getSiblings(pointer: Pointer): Array<Pointer>;

    getComponent(id: string, pagePointer: Pointer): Pointer;

    getMasterPage(viewMode: string): Pointer;

    getPage(id: string, viewMode: string): Pointer;

    getNewPage(id: string, viewMode?: string): Pointer;

    getPagesContainer(viewMode: string): Pointer;

    getFooter(viewMode: string): Pointer;

    getHeader(viewMode: string): Pointer;

    getUnattached(id: string, viewMode: string): Pointer;

    getPageOfComponent(compPointer: Pointer): Pointer;

    isDescendant(comp: Pointer, possibleAncestor: Pointer): boolean;
}

interface PagePointers {
    isPointerPageType(pointer: Pointer): boolean;

    getNewPagePointer(pageId: string): any;

    getPagePointer(pageId: string): any;

    isExists(pageId: String): boolean;

    getAllPagesPointer(): any;

    getNonDeletedPagesPointers(includeMaster: boolean): any;

    getPageData(pageId: String): Pointer;

    getPageProperties(pageId: String): Pointer;
}

interface GeneralPointers {
    getAllTheme(): Pointer;

    getOrphanPermanentDataNodes(): Pointer;

    getTextRuntimeFontSize(): Pointer;

    getTextRuntimeOverallBorders(): Pointer;

    getDockedRuntimeLayout(): Pointer;

    getPagesData(): Pointer;

    getServiceTopology(): Pointer;

    getDeletedMobileComps(): Pointer;

    getDeletedPagesMapPointer(): Pointer;

    getUserId(): Pointer;

    getIsStudioUser(): Pointer;

    getEditorData(): Pointer;

    getMobileStructuresPointer(): Pointer;

    getCompsToUpdateAnchors(): Pointer;

    getCommittedMobilePages(): Pointer;

    getRuntimePointer(): Pointer;

    getNeverSaved(): Pointer;

    getPublicUrl(): Pointer;

    getPermissions(): Pointer;

    getForbiddenPageUriSEOs(): Pointer;

    getUrlFormat(): Pointer;

    getClientSpecMap(): Pointer;

    getAutosaveInfo(): Pointer;

    getMetaSiteId(): Pointer;

    getDocumentType(): Pointer;

    getActiveModes(): Pointer;

    getContactFormsMetaData(): Pointer;

    getTextRuntimeHeight(): Pointer;

    getRenderFlag(flagName: string): Pointer;

    getRenderRealtimeConfigItem(): Pointer;

    getRootsRenderedInMobileEditor(): Pointer;
}

interface DataPointers {
    getDataItem(dataItemId: string, pageId: string): Pointer;

    getDataItemWithPredicate(predicate, pageId): Pointer;

    getDataItemsWithPredicate(predicate: Function, pageId: string): Array<Pointer>;

    getDesignItem(id: string, pageId: string): Pointer;

    getPropertyItem(id: string, pageId: string): Pointer;

    getBehaviorsItem(behaviorsItemId: string, pageId: string): Pointer;

    getConnectionsItem(connectionItemId: string, pageId: string): Pointer;

    getThemeItem(id: string): Pointer;

    getItem(type: string, id: string, pageId: string, optionalComponentPointer?: Pointer): Pointer;

    getDataItemFromMaster(id: string): Pointer;

    getPageIdOfData(dataPointer: Pointer): Pointer;
}

interface SiteAPI {
    registerToDidLayout(callback): any;

    didLayoutCallback(): any;

    unRegisterFromDidLayout(callback): any;

    forceUpdate(noEnforceAnchors, affectedComps, methodNames, refreshRootsData): any;

    getSiteAspect(siteAspectName): any;

    registerNavigationComplete(callback): any;

    resetBehaviorsRegistration(): any;

    enableAction(actionName): any;

    disableAction(actionName): any;

    createDisplayedPage(pageId): any;

    createDisplayedNode(pointer: Pointer): any;

    getComponentsByPageId(rootId): any;

    getAllRenderedRootIds(): Array<string>;

    getRootIdsWhichShouldBeRendered(): any;

    isComponentRenderedOnSite(compId): any;

    navigateToPage(navigationInfo, skipHistory): any;

    scrollToAnchor(anchorData, progressCallback): any;

    openPopupPage(popupId): any;

    closePopupPage(): any;

    hasPendingFonts(): any;

    isSiteBusy(): any;

    isSiteBusyIncludingTransition(): any;

    getSiteId(): any;

    getEditorSessionId(): any;

    isMobileView(): any;

    getMainPageId(): any;

    getCurrentUrlPageId(): any;

    collectUsedStylesFromAllPages(pagesData): any;

    reportBI(reportDef: BIError | BIEvent, params?): void;

    getShapeOriginalAspectRatio(compPtr): any;

    getScreenSize(): any;

    getSiteWidth(): any;

    getScreenWidth(): any;

    getScreenHeight(): any;

    getPageBottomMargin(): any;

    getSiteX(): any;

    getSiteMeasureMap(): any;

    setMobileView(mobileView): any;

    isDebugMode(): any;

    getPageUrl(navigationInfo, urlFormat, baseUrl): any;

    getWixappsPackageDescriptor(packageName): any;

    setPreviewTooltipCallback(callback): any;

    getClientSpecMap(): any;

    getPrimaryPageId(): any;

    getFocusedRootId(): any;

    loadBatch(requestDescriptors, doneCallback): any;

    getExternalBaseUrl(): any;

    isBehaviorsDataMapExist(): any;

    __getSiteData(): any;

    isPageLandingPage(pageId): any;

    getCurrentPopupId(): any;

    getRootNavigationInfo(): any;

    getRuntimeDal(): any;

    isPopupOpened(): any;

    getAnchorsMap(rootId): any;

    getWidgetsStore(): any;

    createPageAnchors(rootId, forceMobileStructure): any;

    createChildrenAnchors(parentStructure, parentPageId): any;

    getQueryParam(paramName): any;

    resetAllActiveModes(): void

    createDisplayedNode(pointer: Pointer): void
}

interface SiteDataAPI {
    registerDataLoadedCallback(callback: Function): any;

    refreshRenderedRootsData(callback: Function): any;

    registerDisplayedJsonUpdateCallback(callback: Function): any;

    loadPage(urlData: any, callback: Function): void

    resetAllActiveModes(): any;

    deactivateModesInPage(rootId): any;

    getActiveModes(): any;

    getPageActiveModes(pageId: string): any;

    activateModeById(compId, rootId, modeId: string): any;

    activateMode(pointer: Pointer, modeId: string): any;

    deactivateModeById(compId, rootId, modeId: string): any;

    deactivateMode(pointer: Pointer, modeId: string): any;

    switchModesByIds(compPointer: Pointer, rootId: string, modeIdToDeactivate: string, modeIdToActivate: string): any;

    switchModes(pointer: Pointer, modeIdToDeactivate: string, modeIdToActivate: string): any;

    updatePageAnchorsIfNeeded(pageStructure): any;

    createPageAnchors(rootId, forceMobileStructure): any;

    createChildrenAnchors(parentStructure, parentPageId): any;

    createDisplayedPage(pageId): any;

    createDisplayedNode(pointer: Pointer): any;
}

interface DocumentServicesDal {
    full: DocumentServicesFullJsonDal

    get(pointer: Pointer): any;

    getByPath(path: Array<string>): any;

    isExist(pointer: Pointer): boolean;

    isPathExist(path: Array<string>): boolean;

    getKeys(pointer: Pointer): any;

    getKeysByPath(path: Array<string>): any;

    set(pointer: Pointer, value): any;

    push(pointerToArray: Pointer, value, pointerToPush?, index?: number): any;

    merge(pointer: Pointer, value): any;

    remove(pointer: Pointer): any;

    takeSnapshot(tag: string): any;

    duplicateLastSnapshot(tag: string, changes): any;

    wasValueChangedSinceLastSnapshot(snapshotTagName, pointer: Pointer): any;

    getLastSnapshotByTagName(tag: string, pathMap): any;

    getInitialSnapshot(pathMap): any;

    removeLastSnapshot(tag: string): any;

    getSnapshotByTagAndIndex(tag, index: number, pathMap): any;
}

interface DocumentServicesFullJsonDal {
    immutable: DocumentServicesDALImmutable

    get(pointer: Pointer): any;

    set(pointer: Pointer, value: any): void

    push(pointerToArray, item, pointerToPush, index?: number): any;

    merge(pointer: Pointer, value): any;

    getByPath(path: Array<string>): any;

    isExist(pointer: Pointer): boolean;

    isPathExist(path: Array<string>): boolean;

    remove(pointer: Pointer): any;

    getKeys(pointer: Pointer): any;

    getKeysByPath(path: Array<string>): any;

    setByPath(path: Array<string>, value): any;

    removeByPath(path: Array<string>): any;

    pushByPath(pathToArray: Array<string>, value, optionalIndex?: number): any;

    mergeByPath(path: Array<string>, value): any;
}

interface DocumentServicesDALImmutable {
    getSnapshotByTagAndIndex(tag: string, index: number): any;

    getLastSnapshotByTagName(tag: string): any;

    getInitialSnapshot(): any;

    getByPath(path: Array<string>): any;
}

declare interface ps {

    pointers : {
        full: any;

        getInnerPointer(pointer: Pointer, innerPath: string | Array<string>): Pointer;

        components: ComponentPointers;

        componentStructure: {
            getModes(compPointer: Pointer) : Pointer;

            getModesDefinitions(compPointer: Pointer): Pointer;

            getModesOverrides(compPointer: Pointer): Pointer;
        }

        page: PagePointers;

        general: GeneralPointers;

        data: DataPointers;

        wixCode: {
            getRoot(): Pointer;

            getModifiedFileContentMap(): Pointer;

            getModifiedFileContent(): Pointer;

            getWixCodeModel(): Pointer;

            getWixCodeAppData(): Pointer;

            getGridAppId(): Pointer;

            getScari(): Pointer;

            getIsAppReadOnly(): Pointer;
        }

        routers: {
            getRoutersPointer(): Pointer;
            getRoutersConfigMapPointer(): Pointer;
            getRouterPointer(id: string): Pointer;
        }
    }

    siteAPI: SiteAPI;

    siteDataAPI: SiteDataAPI;

    dal: DocumentServicesDal;
}

