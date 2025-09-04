export interface Composition {
  id: string;
  name: string;
  description?: string;
  roles: CompositionRole[];
  builds?: any[]; // Add missing builds property
  createdAt: Date;
  updatedAt: Date;
}

export interface CompositionRole {
  id: string;
  role: string;
  count: number;
  compositionId: string;
}

export namespace GetGuildCompositions {
  export type Params = { guildId: string };
  export type Response = { compositions: Composition[] };
}

// Add missing types that web project needs
export type GetGuildCompositionsResponse = GetGuildCompositions.Response;
