export interface AiRaid {
  title?: string;
  contentType?: string;
  timestamp?: string;
  location?: string;
  requirements?: string[];
  roles?: AiRaidRole[];
  confidence?: number;
}

export interface AiRaidRole {
  name: string;
  role: string;
  preAssignedUser: string;
}
