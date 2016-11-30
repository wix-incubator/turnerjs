'use strict';

import * as _ from 'lodash';
import * as hooks from 'documentServices/hooks/hooks';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {objectUtils} from 'coreUtils';
import * as experiment from 'experiment';
import * as componentModes from 'documentServices/component/componentModes';
import * as structuresComparer from 'documentServices/mobileConversion/modules/structuresComparer';
import {fullToDisplayedJson} from 'siteUtils';

const INCLUDE_MASTER_PAGE = true;
const SNAPSHOT_TAG_NAME = 'mobileMerge';

function initialize(ps: ps): void {
    hooks.registerHook(hooks.HOOKS.PUBLISH.BEFORE, () => resetCommittedMobilePages(ps));
    ps.dal.takeSnapshot(SNAPSHOT_TAG_NAME);
}

function resetCommittedMobilePages(ps: ps) {
    const committedMobilePagesPointer = ps.pointers.general.getCommittedMobilePages();
    ps.dal.set(committedMobilePagesPointer, null);
}

function getAggregatedPagesData(ps: ps): {mobile: Map<PageData>; desktop: Map<PageData>;} | null {
    const desktopPages = getChangedPagesData(ps);
    if (_.isEmpty(desktopPages)) {
        return null;
    }

    if (!experiment.isOpen('sv_mergeAggregator')) {
        return {
            desktop: desktopPages,
            mobile: conversionUtils.extractMobileStructure(desktopPages)
        };
    }

    const committedMobilePagesPointer = ps.pointers.general.getCommittedMobilePages();
    const committedMobilePages = ps.dal.get(committedMobilePagesPointer) || {};
    _.forOwn(desktopPages, (page: PageData, pageId: string) => {
        if (!committedMobilePages[pageId]) {
            const mobilePageData = objectUtils.cloneDeep(page);
            _.set(mobilePageData.structure, mobilePageData.structure.components ? 'components' : 'children', page.structure.mobileComponents || []);
            committedMobilePages[pageId] = mobilePageData;
        }
    });

    ps.dal.set(committedMobilePagesPointer, committedMobilePages);

    return {
        desktop: desktopPages,
        mobile: getAffectedMobilePages(committedMobilePages, desktopPages)
    };
}

function getAffectedMobilePages(committedMobilePages: Map<PageData>, desktopPagesData: Map<PageData>): Map<PageData> {
    const changedPageIds = _.keys(desktopPagesData);
    return <Map<PageData>> _.pick(committedMobilePages, (pageData, pageId) => _.includes(changedPageIds, pageId))
}

function getChangedPagesPointers(ps: ps): Pointer[] {
    const pagePointers = ps.pointers.page.getNonDeletedPagesPointers(INCLUDE_MASTER_PAGE);
    if (!structuresComparer.hasMobileStructure(ps)) {
        return pagePointers;
    }
    return _.filter(pagePointers, (pagePointer: Pointer) => ps.dal.wasValueChangedSinceLastSnapshot(SNAPSHOT_TAG_NAME, pagePointer));
}

function getChangedPagesData(ps: ps): Map<PageData> {
    const pagePointers = getChangedPagesPointers(ps);
    if (ps.siteAPI.isMobileView() || !experiment.isOpen('sv_hoverBox')) {
        return <Map<PageData>> _.transform(pagePointers, (acc, pagePointer: Pointer) => _.set(acc, pagePointer.id, ps.dal.get(pagePointer)), {});
    }
    return <Map<PageData>> _.transform(pagePointers, (acc, pagePointer: Pointer) => {
        const pageActiveModesMap = componentModes.getMobileActiveModesMap(ps, pagePointer.id);
        const activeModesMap = <Map<Map<boolean>>> _.set({}, pagePointer.id, pageActiveModesMap);
        const page = fullToDisplayedJson.getDisplayedJson(ps.dal.full.get(pagePointer), activeModesMap, pagePointer.id);
        _.set(page.structure, 'mobileComponents', ps.dal.get(pagePointer).structure.mobileComponents || []);
        _.set(acc, pagePointer.id, page);
    }, {});
}

function commitResults(ps: ps) {
    resetCommittedMobilePages(ps);
    ps.dal.takeSnapshot(SNAPSHOT_TAG_NAME);
}

export {
    getChangedPagesPointers,
    initialize,
    commitResults,
    getAggregatedPagesData
}
