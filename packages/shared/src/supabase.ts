import { createClient } from '@supabase/supabase-js';
import type { Profile, AvatarConfig, Project, HouseLayout, PresenceUser, ChatMessage } from './types';

const PLACEHOLDER_URL = 'https://your-project.supabase.co';
const PLACEHOLDER_KEY = 'your-anon-key';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || PLACEHOLDER_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey) &&
  supabaseUrl !== PLACEHOLDER_URL &&
  supabaseKey !== PLACEHOLDER_KEY &&
  !String(supabaseKey).includes('your-anon-key');

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const useAuth = () => {
  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { signInWithGitHub, signOut };
};

// Profile helpers
export const useProfile = () => {
  const getProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', updates.id);
    
    return { data, error };
  };

  return { getProfile, updateProfile };
};

// Avatar helpers
export const useAvatar = () => {
  const getAvatarConfig = async (userId: string): Promise<AvatarConfig | null> => {
    const { data, error } = await supabase
      .from('avatar_config')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching avatar config:', error);
      return null;
    }
    return data;
  };

  const updateAvatarConfig = async (userId: string, config: AvatarConfig['body']) => {
    const { data, error } = await supabase
      .from('avatar_config')
      .upsert({
        user_id: userId,
        body: config,
        updated_at: new Date().toISOString()
      });
    
    return { data, error };
  };

  return { getAvatarConfig, updateAvatarConfig };
};

// Project helpers
export const useProjects = () => {
  const getProjects = async (userId: string): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner', userId)
      .order('order_idx');
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data || [];
  };

  const createProject = async (project: Omit<Project, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    return { data, error };
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);
    
    return { data, error };
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    return { error };
  };

  return { getProjects, createProject, updateProject, deleteProject };
};

// House layout helpers
export const useHouseLayout = () => {
  const getHouseLayout = async (userId: string): Promise<HouseLayout | null> => {
    const { data, error } = await supabase
      .from('house_layouts')
      .select('*')
      .eq('owner', userId)
      .single();
    
    if (error) {
      console.error('Error fetching house layout:', error);
      return null;
    }
    return data;
  };

  const updateHouseLayout = async (userId: string, layout: HouseLayout['layout']) => {
    const { data, error } = await supabase
      .from('house_layouts')
      .upsert({
        owner: userId,
        layout,
        updated_at: new Date().toISOString()
      });
    
    return { data, error };
  };

  return { getHouseLayout, updateHouseLayout };
};

export const useMlvWorkspace = () => {
  const ensurePlayerInstance = async () => {
    const { data, error } = await supabase.rpc('mlv_ensure_player_instance');
    return { data, error };
  };

  const listOwnNodes = async () => {
    const { data, error } = await supabase
      .from('mlv_nodes')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    return { data: data || [], error };
  };

  const openShare = async (token: string) => {
    const { data, error } = await supabase.rpc('mlv_open_share', { p_token: token });
    return { data, error };
  };

  const listPublicNodes = async () => {
    const { data, error } = await supabase
      .from('mlv_nodes')
      .select('id, owner_id, kind, name, mime_type, size_bytes, visibility, metadata, created_at, updated_at')
      .eq('visibility', 'public')
      .is('deleted_at', null);
    return { data: data || [], error };
  };

  return { ensurePlayerInstance, listOwnNodes, openShare, listPublicNodes };
};

export type { Profile, AvatarConfig, Project, HouseLayout, PresenceUser, ChatMessage };
