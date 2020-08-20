export { Component } from './component';
export { ComponentID } from './id';
export { default as ComponentFS } from './component-fs';
export type { default as ComponentConfig } from './config';
export type { ComponentFactory } from './component-factory';
// TODO: check why it's not working when using the index in snap dir like this:
// export { Snap, Author } from './snap';
export type { Snap } from './snap/snap';
export type { Author } from './snap/author';
// TODO: check why it's not working when using the index in tag dir like this:
// export { Tag } from './tag';
export type { Tag } from './tag/tag';
export type { State } from './state';
export type { Hash } from './hash';
export { TagMap } from './tag-map';
export type { ComponentMap } from './component-map';
export type { ComponentMain } from './component.main.runtime';
export { ComponentAspect } from './component.aspect';
export type { ComponentUI } from './component.ui.runtime';
export { Section } from './section';
export { ComponentContext } from './ui/context/component-context';
export { ComponentModel, ComponentModelProps } from './ui/component-model';
export { default as Config } from './config';
