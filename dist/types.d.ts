
declare class NameFormatter {
    name: string;
}

declare class NameList {
    names: string[];
}

declare class NamesApp {
    names: Array<string>;
    currentName: string;
    showNames: boolean;
    constructor();
    onNameAdded(): void;
}
