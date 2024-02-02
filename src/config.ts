export type ExternalSkip = Array<string | RegExp>;

export interface Config {
  /**
   * @default "default"
   */
  name?: string;
  /**
   * @default [/(?<=[\\\/])(node_modules|temp|cache|dist|\.(nuxt|nitro|output))(?=[\\\/])/]
   */
  skip?: ExternalSkip;
  /**
   * @default true
   */
  withDefaltSkip?: boolean;
}

export const defaultConfig: Required<Config> = {
  name: "default",
  skip: [
    /(?<=[\\\/])(node_modules|temp|cache|dist|\.(nuxt|nitro|output))(?=[\\\/])/,
  ],
  withDefaltSkip: true,
};
