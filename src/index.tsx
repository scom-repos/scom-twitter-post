import {
  ControlElement,
  customElements,
  Module,
  Container,
  Panel,
  Styles,
  application,
  IDataSchema
} from '@ijstech/components';
import dataJson from './data.json';
const Theme = Styles.Theme.ThemeVars;

interface ScomTwitterPostElement extends ControlElement {
  url: string;
  config?: ITweetConfig;
}

interface ITweetConfig {
  conversation?: 'none';
  align?: 'center'|'right';
  cards?: 'hidden';
  theme?: 'light' | 'dark';
}

declare global {
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

declare const window: any;

const path = application.currentModuleDir;
const widgetsPath = `${path}/lib/widgets.js`;


type executeFnType = (editor: any, block: any) => void;
interface BlockSpecs {
  addBlock: (blocknote: any, executeFn: executeFnType, callbackFn?: any) => { block: any, slashItem: any };
}

@customElements('i-scom-twitter-post')
export class ScomTwitterPost extends Module implements BlockSpecs {
  private pnlTwitterPost: Panel;
  private pnlLoading: Panel;

  private _data: ITweet;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  static async create(options?: ScomTwitterPostElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get url() {
    return this._data.url ?? '';
  }
  set url(value: string) {
    this._data.url = value ?? '';
  }

  get config() {
    return this._data.config;
  }
  set config(value: ITweetConfig) {
    this._data.config = value;
  }

  addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: any) {
    const twitterRegex = /https:\/\/(twitter.com)\/\w*\/status\/(\d{19}$)/g;

    const TweetBlock = blocknote.createBlockSpec({
      type: "tweet",
      propSchema: {
        ...blocknote.defaultProps,
        url: {default: ''},
        width: {default: 512},
        height: {default: 'auto'}
      },
      content: "none"
    },
    {
      render: (block: any) => {
        const wrapper = new Panel();
        const { url } = JSON.parse(JSON.stringify(block.props));
        const customElm = new ScomTwitterPost(wrapper, { url });
        if (typeof callbackFn === "function") {
          callbackFn(customElm, block);
        }
        wrapper.appendChild(customElm);
        return {
          dom: wrapper
        };
      },
      parseFn: () => {
        return [
          {
            tag: "div[data-content-type=tweet]",
            node: 'tweet'
          },
          {
            tag: "a",
            getAttrs: (element: string|HTMLElement) => {
              if (typeof element === "string") {
                return false;
              }
              const url = element.getAttribute('href');
              const match = url && twitterRegex.test(url);
              twitterRegex.lastIndex = 0;
              if (match) {
                return { url };
              }
              return false;
            },
            priority: 406,
            node: 'tweet'
          },
          {
            tag: "p",
            getAttrs: (element: string|HTMLElement) => {
              if (typeof element === "string") {
                return false;
              }
              const child = element.firstChild as HTMLElement;
              if (child?.nodeName === 'A') {
                const url = child.getAttribute('href');
                const match = url && twitterRegex.test(url);
                twitterRegex.lastIndex = 0;
                if (match) {
                  return { url };
                }
              }
              return false;
            },
            priority: 407,
            node: 'tweet'
          },
        ]
      },
      toExternalHTML: (block: any, editor: any) => {
        const link = document.createElement("a");
        const url = block.props.url || "";
        link.setAttribute("href", url);
        link.textContent = 'tweet';
        const wrapper = document.createElement("p");
        wrapper.appendChild(link);
        return { dom: wrapper };
      },
      pasteRules: [
        {
          find: twitterRegex,
          handler(props: any) {
            const { state, chain, range } = props;
            const textContent = state.doc.resolve(range.from).nodeAfter?.textContent;
  
            chain().BNUpdateBlock(state.selection.from, {
              type: "tweet",
              props: {
                url: textContent
              },
            }).setTextSelection(range.from + 1);
          }
        }
      ]
    });

    const TweetSlashItem = {
      name: "Tweet",
      execute: (editor: any) => {
        const block = { type: "tweet", props: { url: "" }};
        if (typeof executeFn === "function") {
          executeFn(editor, block);
        }
      },
      aliases: ["tweet", "widget"]
    }

    return {
      block: TweetBlock,
      slashItem: TweetSlashItem
    };
  }

  async setData(data: ITweet) {
    this._data = {...data};
    await this.renderUI();
  }

  getData() {
    return this._data;
  }

  clear() {
    this.pnlTwitterPost.clearInnerHTML();
  }

  private async renderUI() {
    this.clear();
    const self = this;
    const id = this.getTweetID(this.url);
    if (!id) return;
    const config = this.config || {theme: 'light'};
    window.twttr.ready(
      function (twttr: any) {
        self.pnlLoading.visible = true;
        twttr.widgets.createTweet(
          id,
          self.pnlTwitterPost,
          config
        ).then(function() {
          self.pnlLoading.visible = false;
        });
      }
    );
  }

  private getTweetID(url: string) {
    if (/^\d{19}$/g.test(url)) return url;
    const regex = /((twitter|x).com)\/\w*\/status\/(\d{19}$)/gm;
    return regex.exec(url)?.[3];
  }

  private getTag() {
    return this.tag
  }

  private async setTag(value: any) {
    this.tag = value;
  }

  getConfigurators() {
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          return this._getActions();
        },
        getData: this.getData.bind(this),
        setData: async (data: ITweet) => {
          const defaultData = dataJson.defaultBuilderData as any;
          await this.setData({...defaultData, ...data});
        },
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      },
      {
        name: 'Editor',
        target: 'Editor',
        getActions: () => {
          return this._getActions()
        },
        setData: this.setData.bind(this),
        getData: this.getData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      }
    ]
  }

  private getPropertiesSchema() {
    const schema: IDataSchema = {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string"
        }
      }
    };
    return schema;
  }

  private _getActions() {
    const propertiesSchema = this.getPropertiesSchema();
    const actions = [
      {
        name: 'Edit',
        icon: 'edit',
        command: (builder: any, userInputData: any) => {
          let oldData = {url: ''};
          return {
            execute: () => {
              oldData = {...this._data};
              if (userInputData?.url) this._data.url = userInputData.url;
              if (builder?.setData) builder.setData(this._data);
            },
            undo: () => {
              this._data = {...oldData};
              if (builder?.setData) builder.setData(this._data);
            },
            redo: () => {}
          }
        },
        userInputDataSchema: propertiesSchema as IDataSchema
      }
    ]
    return actions
  }

  async init() {
    super.init();
    await this.initLibs();
    const url = this.getAttribute('url', true);
    const config = this.getAttribute('config', true);
    if (url) await this.setData({ url, config });
  }

  private async initLibs() {
    const lib = document.getElementById("twitter-wjs");
    if (lib) return;
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = widgetsPath; // "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
    
      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };
    
      return t;
    }(document, "script", "twitter-wjs"));
  }

  render() {
    return (
      <i-panel border={{ radius: 'inherit' }}>
        <i-vstack
          id="pnlLoading"
          width="100%"
          minHeight={20}
          position="absolute"
          bottom={0}
          zIndex={999}
          background={{ color: 'transparent'}}
          class="i-loading-overlay"
          visible={false}
          mediaQueries={[
            {
              maxWidth: '767px',
              properties: {
                height: 'calc(100% - 3.125rem)',
                top: 0,
              },
            },
          ]}
        >
          <i-vstack
            horizontalAlignment="center"
            verticalAlignment="center"
            position="absolute"
            top="calc(50% - 0.75rem)"
            left="calc(50% - 0.75rem)"
          >
            <i-icon
              class="i-loading-spinner_icon"
              name="spinner"
              width={'1.125rem'}
              height={'1.125rem'}
              fill={Theme.colors.primary.main}
            />
          </i-vstack>
        </i-vstack>
        <i-panel id="pnlTwitterPost"></i-panel>
      </i-panel>
    );
  }
}
