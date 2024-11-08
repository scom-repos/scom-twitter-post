/// <amd-module name="@scom/scom-twitter-post/data.json.ts" />
declare module "@scom/scom-twitter-post/data.json.ts" {
    const _default: {
        defaultBuilderData: {
            url: string;
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-twitter-post" />
declare module "@scom/scom-twitter-post" {
    import { ControlElement, Module, Container, IDataSchema } from '@ijstech/components';
    interface ScomTwitterPostElement extends ControlElement {
        url: string;
        config?: ITweetConfig;
    }
    interface ITweetConfig {
        conversation?: 'none';
        align?: 'center' | 'right';
        cards?: 'hidden';
        theme?: 'light' | 'dark';
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-twitter-post']: ScomTwitterPostElement;
            }
        }
    }
    interface ITweet {
        url: string;
        config?: ITweetConfig;
    }
    type executeFnType = (editor: any, block: any) => void;
    interface BlockSpecs {
        addBlock: (blocknote: any, executeFn: executeFnType, callbackFn?: any) => {
            block: any;
            slashItem: any;
        };
    }
    export class ScomTwitterPost extends Module implements BlockSpecs {
        private pnlTwitterPost;
        private pnlLoading;
        private _data;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomTwitterPostElement, parent?: Container): Promise<ScomTwitterPost>;
        get url(): string;
        set url(value: string);
        get config(): ITweetConfig;
        set config(value: ITweetConfig);
        addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: any): {
            block: any;
            slashItem: {
                name: string;
                execute: (editor: any) => void;
                aliases: string[];
            };
        };
        setData(data: ITweet): Promise<void>;
        getData(): ITweet;
        clear(): void;
        private renderUI;
        private getTweetID;
        private getTag;
        private setTag;
        getConfigurators(): {
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            }[];
            setData: any;
            getData: any;
            getTag: any;
            setTag: any;
        }[];
        private getPropertiesSchema;
        private _getActions;
        init(): Promise<void>;
        private initLibs;
        render(): any;
    }
}
