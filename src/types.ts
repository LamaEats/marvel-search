import React from "react";
import { AssistantSmartAppData } from "@sberdevices/assistant-client";
import {
  PageComponent,
  PlasmaApp,
} from "@sberdevices/plasma-temple";

export type PlasmaAppProps = React.ComponentPropsWithoutRef<typeof PlasmaApp>;

export type AppHeaderProps = PlasmaAppProps["header"];
export type AssistantProps = PlasmaAppProps["assistantParams"];
export type OnStartFn = PlasmaAppProps["onStart"];

export interface PageState {
  main: {};
}

export interface PageParams {}

export type PageComponentProps<K extends keyof PageState> =
  React.ComponentProps<PageComponent<PageState, K, PageParams>>;

export enum CatalogGalleryType {
  CATEGORIES = "categories",
  POPULAR = "popular",
}

export enum ActionType {
  Search = "Search",
}

export type AssistantAction = {
  type: ActionType.Search;
  payload: { query: string };
};

export interface AssistantDataAction extends AssistantSmartAppData {
  smart_app_data: AssistantAction;
}
