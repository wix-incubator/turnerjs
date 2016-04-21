declare function byDataHook(dataHook: string): string;
declare const enum WixChildDriverType {
    CHILD_REGULAR = 0,
    CHILD_ARRAY = 1,
}
interface WixChildDriver {
    selector?: string;
    selectorIndex?: number;
    type: WixChildDriverType;
    factory?: <T extends WixComponentTestDriver>(item?, index?) => T;
    drivers?: Array<WixComponentTestDriver>;
    fullDriversArr?: Array<WixComponentTestDriver>;
}
declare class WixComponentTestDriver {
    $rootScope: ng.IRootScopeService;
    $compile: ng.ICompileService;
    body: ng.IAugmentedJQuery;
    appendedToBody: boolean;
    private _element;
    private _scope;
    private parent;
    private templateRoot;
    private childDrivers;
    constructor();
    element: ng.IAugmentedJQuery;
    scope: ng.IScope;
    isRendered: boolean;
    connectToBody(): void;
    disconnectFromBody(): void;
    applyChanges(): void;
    protected findByDataHook(dataHook: string): ng.IAugmentedJQuery;
    protected findAllByDataHook(dataHook: string): ng.IAugmentedJQuery;
    protected renderFromTemplate(template: string, args?: Object, selector?: any): void;
    protected initChildDrivers(): void;
    protected defineChild<T extends WixComponentTestDriver>(childDriver: T, selector?: string): T;
    protected defineChildren<T extends WixComponentTestDriver>(factory: (item?, index?) => T, selector: string): Array<T>;
    private defineIndexedChild<T>(childDriver, selector?, selectorIndex?);
    private initializeDriver(containingElement, selector?, selectorIndex?);
    private initArrayChild(child);
    private initRegularChild(child);
    verifyRendered(): void;
}
