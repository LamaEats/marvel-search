import React from "react";
import { PageComponentProps } from "../types";
import {
  Form,
  FormField,
  Header,
  Input,
  VoiceField,
} from "@sberdevices/plasma-temple";

const SearchForm = () => {
  return (
    <Form
      sequence={["search"]}
      initialData={{ search: "" }}
      initialField="search"
    >
      {({ active, onChange, onSubmit, data }) => (
        <>
          <FormField name="search" active={active}>
            <VoiceField
              labels={{
                one: "Имя героя",
                suggestion: "Имя героя",
                reject: "Нет, ввести другую",
              }}
              onSubmit={onSubmit}
              onChange={onChange}
              value={data.search}
              manualMode={false}
            >
              <Input
                value={data.search}
                onChange={onChange}
                onSubmit={onSubmit}
                label="Имя героя"
              />
            </VoiceField>
          </FormField>
        </>
      )}
    </Form>
  );
};

const Main: React.FC<PageComponentProps<"main">> = ({ header }) => {
  return (
    <>
      <Header {...header} />
      <SearchForm />
    </>
  );
};

export default Main;
