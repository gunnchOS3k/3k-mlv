export interface Profile {
  id: string;
  handle: string;
  display_name?: string;
  bio?: string;
  links: {
    github?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
  created_at: string;
}

export interface AvatarConfig {
  user_id: string;
  body: {
    size: 'small' | 'medium' | 'large';
    color: string;
    hairStyle: string;
    outfit: string;
    vfx?: string[];
  };
  updated_at: string;
}

export interface Project {
  id: string;
  owner: string;
  title: string;
  blurb?: string;
  tags: string[];
  demo_url?: string;
  repo_url?: string;
  video_url?: string;
  cover_url?: string;
  order_idx: number;
  created_at: string;
}

export interface HouseLayout {
  id: string;
  owner: string;
  layout: {
    walls: Array<{
      id: string;
      position: [number, number, number];
      rotation: [number, number, number];
      type: string;
    }>;
    furniture: Array<{
      id: string;
      position: [number, number, number];
      rotation: [number, number, number];
      type: string;
    }>;
    decorations: Array<{
      id: string;
      position: [number, number, number];
      rotation: [number, number, number];
      type: string;
    }>;
  };
  updated_at: string;
}

export interface PresenceUser {
  id: string;
  handle: string;
  display_name?: string;
  position: [number, number, number];
  avatar: AvatarConfig['body'];
  last_seen: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  handle: string;
  message: string;
  timestamp: string;
  type: 'text' | 'emote';
}

export type MlvVisibility = 'private' | 'shared' | 'public';
export type MlvNodeKind = 'file' | 'folder' | 'project' | 'shortcut' | 'creation';
export type MlvSharePermission = 'view' | 'download';

export interface MlvNode {
  id: string;
  owner_id: string;
  parent_id: string | null;
  kind: MlvNodeKind;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  sha256: string | null;
  storage_key: string | null;
  visibility: MlvVisibility;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MlvShareLink {
  id: string;
  node_id: string;
  owner_id: string;
  token_hash: string;
  permission: MlvSharePermission;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface MlvWorldPlacement {
  id: string;
  owner_id: string;
  node_id: string;
  room_id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  presentation_type: string;
  created_at: string;
  updated_at: string;
}

export interface MlvPlayerInstance {
  owner_id: string;
  world_config: Record<string, unknown>;
  home_theme: string;
  spawn: { x: number; y: number; z: number };
  updated_at: string;
}

export interface GunnchOSArtifactIntent {
  artifact_id: string;
  owner_id: string;
  title: string;
  mime_type: string;
  app_id: string;
  local_uri?: string | null;
  cloud_node_id?: string | null;
  suggested_presentation?: string;
  default_visibility: 'private';
}
