declare interface Pointer {
    id: string;
    type: 'MOBILE' | 'DESKTOP';
    innerPath?: string[];
}

declare interface BIError {
    errorCode: number;
    severity: 'error' | 'fatal' | 'warning' | 'recoverable';
    description?: string;
    errorName?: string;
}

declare interface BIEvent {
    eventId: number;
    params: any;
    adapter?: string;
    src?: number;
    wixSiteSampleRatio?: number;
}

declare interface Anchor {
    distance: number;
    locked: boolean;
    originalValue: number;
    targetComponent: string;
    topToTop?: number | null;
    type: 'BOTTOM_TOP' | 'BOTTOM_PARENT' | 'TOP_TOP' | 'BOTTOM_BOTTOM';
    fromComp?: string;
}

declare interface Layout {
    height: number;
    width: number;
    x: number;
    y: number;
    rotationInDegrees?: number;
    anchors?: Anchor[];
    scale?: number;
    fixedPosition?: boolean;
    docked?: any;
}

declare interface Component {
    componentType: string;
    type: string;
    skin: string;
    id: string;
    designQuery?: string;
    dataQuery?: string;
    propertyQuery?: string;
    styleId?: string;
    layout: Layout;
    components?: Component[];
}

declare interface MasterPageComponent {
    mobileComponents: Component[];
    type: 'Document';
    id: string;
    children: Component[];
    componentProperties: any;
    themeData: any;
    documentType: string;
    layout: any;
    [index: string]: any;
}

declare interface PageComponent extends Component {
    mobileComponents: Component[];
}

interface MetaData {
    isHidden?: boolean;
    isPreset?: boolean;
    schemaVersion: string;
}

declare interface ComponentMode {
    label: string;
    params: string;
    type: string;
    modeId: string;
}

declare interface MobileConversionConfig {
    // Only the component itself will be shown in the "hidden items" list and not its descendants
    filterChildrenWhenHidden?: boolean;

    // The component will take the whole screen width on mobile (320px) even when not taking the page/screen width on desktop.
    stretchHorizontally?: boolean;

    // If the component overlaps with other components that have this flag set to true, they will scale proportionally, e.g. two overlapping texts that make a logo
    isSuitableForProportionGrouping?: boolean;

    // If the component's width needs to be scaled up/down, its height will also be scaled to preserve the same aspect ratio.
    preserveAspectRatio?: boolean;

    // The component will not appear in the mobile structure, and will not appear in the hidden-items panel.
    desktopOnly?: boolean;

    // The component will not appear in the mobile structure but will be available in the hidden-items panel.
    hideByDefault?: boolean;

    // The component should be considered as screen-width in desktop
    isScreenWidth?: boolean;

    // The component does not have any appearance, for example an anchor.
    isInvisible?: boolean;

    // The component should grow if it reaches a certain threshold.
    shouldEnlargeToFitWidth?: boolean;

    // The component's children should not cover the given top/right area of this component.
    topRightMargin?: number[];

    // WPhotos that are descendants of this component should be scaled by the given factor.
    descendantImageScaleFactor?: number;

    // Keep fixed-position components of this type but convert them to absolute
    convertFixedPositionToAbsolute?: boolean;

    // How to treat components of this type when considering margins, paddings and resize
    category?: 'visual' | 'text' | 'columns' | 'siteSegments' | 'photo' | 'column' | 'page';

    // The default horizontal margin for children of this component
    marginX?: number;

    // A given size that the component should resize to.
    fixedSize?: {width: number, height: number};

    // Minimum height of this component after it has been res
    minHeight?: number;
}

declare interface ComponentData {
    is: string;
    metaData: MetaData;
    type: string;
    [index: string]: any;
}

declare interface Properties {
    metaData: MetaData;
    type: string;
    [index: string]: any;
}
