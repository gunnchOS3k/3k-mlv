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
