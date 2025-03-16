export * from "discord-api-types/v10";

export type Server = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  admin: boolean;
};
