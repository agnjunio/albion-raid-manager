export type Server = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  admin: boolean;
};

export enum ChannelType {
  TEXT = 0,
}

export interface Channel {
  id: string;
  name: string;
  type?: ChannelType;
  parentId?: string;
}
