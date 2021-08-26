import React from "react";
import {
  OnStartFn,
  PlasmaApp,
  Page,
} from "@sberdevices/plasma-temple";
import { AssistantProps } from "@sberdevices/plasma-temple/dist/assistant";

import { AppHeaderProps, PageState, PageParams } from "./types";

const assistantParams: Partial<AssistantProps> = {
  initPhrase: "запусти почемучку демо",
  token: process.env.REACT_APP_SMARTAPP_TOKEN ?? "",
};

const headerProps: AppHeaderProps = {
  title: "Marvel Search",
  logo: "logo.svg",
};

const onStart: OnStartFn<PageState, PageParams> = async ({ pushScreen }) => {
  pushScreen("main");
};

// @ts-ignore
const Main = Page.lazy(() => import("./pages/Main"));

export const App: React.FC = () => (
  <PlasmaApp
    onStart={onStart}
    assistantParams={assistantParams as AssistantProps}
    header={headerProps}
  >
    <Page name="main" component={Main} />
  </PlasmaApp>
);
