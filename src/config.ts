export type ExternalSkip = Array<string | RegExp>;

export interface Config {
  name?: string;
  skip?: ExternalSkip;
}

export const defaultConfig: Config = {
  name: "default",
  skip: [
    /(?<=[\\\/])(node_modules|temp|cache|dist|\.(nuxt|nitro|output))(?=[\\\/])/,
  ],
};
