declare interface ConversionData extends MobileConversionConfig {
    preset?: Component;

    isSolidColorBackground?: boolean;
    isSemiTransparentContainer?: boolean;
    isTransparentContainer?: boolean;
    isTightContainer?: boolean;
    borderWidth?: number;

    actualTextWidth?: number;
    textLength?: number;
    textAlignments?: string[];
    averageFontSize?: number;
    averageNormalizedFontSize?: number;

    backgroundColor?: string;

    componentsOrder?: string[];
    semanticGroups?: string[];
    clusterGroups?: string[];
    textVisualGroups?: string[];
    patternGroups?: string[];
    naturalAlignment?: string;
    blocks?: string[][]
    blockLayout?: Layout[];
    tightWithPreviousSibling?: boolean;
    tightBottomMargin?: boolean;
    flattenedComponents?: string[];
    siblingCount?: number;
    rescaleMethod?: string;
}

declare interface ComponentWithConversionData extends Component {
    conversionData: ConversionData;
}

declare interface MasterPageComponentWithConversionData extends MasterPageComponent {
    conversionData: ConversionData;
}

declare interface MobileOnlyComponentHandler {
    DEFAULT_COMP_DATA: Component;
    DEFAULT_CONTAINER_ID: string;
    ON_HIDDEN_LIST_WHEN_NOT_EXIST: boolean;
    ADD_BY_DEFAULT: boolean;
    getAdditionalStyles: () => Map< { skin: string; style: any; }>;
    addToStructure: (structure: Component | MasterPageComponent) => void;
}

declare interface PublicAlgorithmOptions {
    ps: ps;
    heuristicStrategy?: string;
}

declare interface StructurePreprocessorSettings {
    flattenTransparentContainers?: boolean;
    keepEmptyTextComponents?: boolean;
    keepNotRecommendedMobileComponents?: boolean;
    keepOutOfScreenComponents?: boolean;
    keepOccludedAndEmptyBackgrounds?: boolean;
    keepInvisibleComponents?: boolean;
}

declare interface FontComparisonEntry {
    friendlyName: string,
    referencePoints: number[];
}

declare interface PageData {
    data: any;
    structure: PageComponent | MasterPageComponent;
    title?: string;
}
