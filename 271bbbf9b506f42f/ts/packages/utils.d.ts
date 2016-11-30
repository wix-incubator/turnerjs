declare var utils: {
    anchorCyclesHelper: {
        fixBottomTopBottomBottomCycles: (children:any[]) => void;
    };
    constants: {
        VIEW_MODES: {
            DESKTOP: string;
            MOBILE: string;
        };
    };
    dockUtils: {
        isHorizontalDockToScreen: (layout?: Layout) => boolean;
        isFullPageComponent: (layout?: Layout) => boolean;
    };
    guidUtils: {
        getUniqueId: (prefix?:string, prefixDelimiter?:string) => string;
    };
    logger: {
        register: (packageName:string, reportType:any, reportDefCollection:any) => void;
    }
    siteConstants: {
        COMP_MODES_TYPES: {
            HOVER: string;
        }
    };
}


declare module 'utils' {
    export = utils
}