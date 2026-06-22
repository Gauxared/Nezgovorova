export type RoleCode = "admin" | "director" | "project_manager" | "client_manager" | "finance" | "analyst";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: {
    code: RoleCode;
    name: string;
  };
};

export type DictionaryItem = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type AnyRecord = {
  id: string;
  [key: string]: unknown;
};
