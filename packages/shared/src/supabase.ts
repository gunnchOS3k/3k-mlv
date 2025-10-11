import { createClient } from '@supabase/supabase-js';
import type { Profile, AvatarConfig, Project, HouseLayout, PresenceUser, ChatMessage } from './types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

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

export type { Profile, AvatarConfig, Project, HouseLayout, PresenceUser, ChatMessage };
