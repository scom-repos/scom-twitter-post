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
    export class ScomTwitterPost extends Module {
        private pnlContent;
        private pnlLoading;
        private _data;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomTwitterPostElement, parent?: Container): Promise<ScomTwitterPost>;
        get url(): string;
        set url(value: string);
        get config(): ITweetConfig;
        set config(value: ITweetConfig);
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
