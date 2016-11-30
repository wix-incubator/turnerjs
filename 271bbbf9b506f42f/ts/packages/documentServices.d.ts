declare var biErrors: {
    MOBILE_STRUCTURE_NOT_SAVED_DUE_TO_CORRUPTION: BIError;
    MOBILE_ALGO_EFFECTIVE_TEXT_CALCULATOR_RETURNED_NULL: BIError;
};

declare var component: {
    layout: {
        get: (ps: ps, compPointer: Pointer) => any;
    };
    deleteComponent: (ps: ps, compPointer: Pointer, deletingParent?: boolean, removeArgs?: any) => boolean|void;
    getContainer: (ps: ps, compPointer: Pointer) => any;
    getSiblings: (ps: ps, compPointer: Pointer) => any;
    getChildren: (ps: ps, compPointer: Pointer) => any[];
    isExist: (ps: ps, compPointer: Pointer) => boolean;
    properties: {
        get: (ps: ps, compPointer: Pointer) => Map<any>;
        update: (ps: ps, compPointer: Pointer, newProps: Map<any>) => void;
        mobile: {
            fork: (ps, compPointer: Pointer) => void;
            isForked: (ps, compPointer: Pointer) => boolean;
        }
    }
};

declare var componentsMetaData: {
    public: {
        getMobileConversionConfig: (ps: ps, comp: Component, pageId: string) => MobileConversionConfig|undefined;
        getDefaultMobileProperties: (ps: ps, comp: Component, desktopProperties: Map<any>) => Map<any>;
        isMobileOnly: (ps: ps, compPointer: Pointer) => boolean;
    };
};

declare var componentDetectorAPI: {
    getComponentById: (ps: any, id: string) => Pointer;
};

declare var componentsMetaDataMetaDataUtils: {
    isNonContainableFullWidth: (componentType: string) => boolean;
};

declare var constants: {
    VIEW_MODES: {
        DESKTOP: string;
        MOBILE: string;
    };
    DOM_ID_PREFIX: {
        MOBILE: string;
    };
    COMP_IDS: {
        HEADER: string;
        PAGES_CONTAINER: string;
        FOOTER: string;
    };
    ANCHORS: {
        LOCK_THRESHOLD: number;
    };
    MASTER_PAGE_ID: string;
};

declare var dataModel: {
    getDataSchemaByType: (ps: ps, dataSchemaType: string) => any;
    getDataItemById: (ps: ps, dataItemId: string, pageId?: string) => any;
    getDesignItemById: (ps: ps, dataItemId: string, pageId?: string) => any;
    getPropertyItemPointer: (ps: ps, compPointer: Pointer) => Pointer;
    setDataItemByPointer: (ps: ps, dataItemPointer: Pointer, dataItem: any, schemaOrigin: string) => void;
    createDataItemByType: (ps: ps, dataType: string) => any;
    deleteDesignItem: (ps: ps, compPointer: Pointer) => void;
    deletePropertiesItem: (ps: ps, compPointer: Pointer) => void;
    updatePropertiesItem: (ps: ps, compPointer: Pointer, value: any) => void;
};

declare var dataValidators: {
    resolveDefaultItem: (schemaName: string, emptyItem?: Object) => Object;
    validateItem: (dataItem: Object, schemaOrigin: string, options?: Object) => void;
};

declare interface Hook {
    AFTER?: string;
    BEFORE?: string;
}

declare var hooks: {
    executeHook: (hookName: string, compType?: string, args?: any, stopCondition?: any) => void;
    registerHook: (hookName: string, callback: any, compType?: string) => void;
    HOOKS: {
        ADD: Hook;
        ADD_ROOT: Hook;
        SWITCH_VIEW_MODE: {MOBILE: string;};
        EFFECTIVE_MOBILE_MERGE: Hook;
        MOBILE_CONVERSION: Hook;
        PUBLISH: Hook;
    };
};

declare var siteMetadata: {
    getProperty: (ps: ps, param: string) => any;
    setProperty: (ps: ps, param: string, value: any) => void;
    PROPERTY_NAMES: {
        SITE_META_DATA: string;
    };
};

declare var structure: {
    updateCompLayout: (ps: ps, compPointer: Pointer, newLayout: any, isTriggeredByHook?: boolean) => void;
};

declare var theme: {
    styles: {
        get: (ps: ps, styleId: string) => Map<any>;
        update: (ps: ps, styleId: string, styleValue: Map<any>) => void;
        createItem: (ps: ps, styleData: Map<any>, id?: string) => string;
    },

    fonts: {
        get: (ps: ps, name: string) => string;
        update: (newFonts: Map<string>) => void;
    }
};


declare var componentModes: {
    getComponentModes: (ps: ps, compPointer: Pointer) => ComponentMode[];
    getMobileActiveModesMap: (ps: ps, pageId: string) => Map<boolean>;
};

declare module 'documentServices/bi/errors' {
    export = biErrors;
}
declare module 'documentServices/component/component' {
    export = component
}
declare module 'documentServices/componentsMetaData/componentsMetaData' {
    export = componentsMetaData;
}
declare module 'documentServices/componentsMetaData/metaDataUtils' {
    export = componentsMetaDataMetaDataUtils;
}
declare module 'documentServices/constants/constants' {
    export = constants
}
declare module 'documentServices/dataModel/dataModel' {
    export = dataModel
}
declare module 'documentServices/dataModel/dataValidators' {
    export = dataValidators;
}
declare module 'documentServices/dataModel/DesignSchemas.json' {

}
declare module 'documentServices/dataModel/PropertiesSchemas.json' {

}
declare module 'documentServices/hooks/hooks' {
    export = hooks
}
declare module 'documentServices/siteMetadata/siteMetadata' {
    export = siteMetadata
}
declare module 'documentServices/structure/structure' {
    export = structure
}
declare module 'documentServices/theme/theme' {
    export = theme
}

declare module 'documentServices/component/componentModes' {
    export = componentModes
}