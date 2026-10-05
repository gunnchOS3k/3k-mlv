import { createClient } from '@supabase/supabase-js';
import type {
  Profile,
  AvatarConfig,
  Project,
  HouseLayout,
  PresenceUser,
  ChatMessage,
  MlvNode,
  MlvWorldPlacement,
} from './types';

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
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { data: [], error: authError || new Error('not authenticated') };
    const { data, error } = await supabase
      .from('mlv_nodes')
      .select('*')
      .eq('owner_id', authData.user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    return { data: data || [], error };
  };

  const listOwnPlacements = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { data: [], error: authError || new Error('not authenticated') };
    const { data, error } = await supabase
      .from('mlv_world_placements')
      .select('*')
      .eq('owner_id', authData.user.id)
      .order('updated_at', { ascending: false });
    return { data: data || [], error };
  };

  const mirrorPrivateUpload = async (node: MlvNode, placement: MlvWorldPlacement, file: File) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user || authData.user.id !== node.owner_id) {
      return { data: null, error: authError || new Error('authenticated owner mismatch') };
    }
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_').slice(-120) || 'upload.bin';
    const storageKey = `${node.owner_id}/${node.id}/${safeName}`;
    const uploaded = await supabase.storage.from('mlv-private').upload(storageKey, file, {
      cacheControl: '3600',
      contentType: file.type || node.mime_type || 'application/octet-stream',
      upsert: false,
    });
    if (uploaded.error) return { data: null, error: uploaded.error };
    const remoteNode = { ...node, storage_key: storageKey, visibility: 'private' as const };
    const insertedNode = await supabase.from('mlv_nodes').insert(remoteNode).select().single();
    if (insertedNode.error) return { data: null, error: insertedNode.error };
    const insertedPlacement = await supabase.from('mlv_world_placements').insert(placement).select().single();
    if (insertedPlacement.error) return { data: null, error: insertedPlacement.error };
    return { data: { node: insertedNode.data, placement: insertedPlacement.data }, error: null };
  };

  const mirrorNode = async (node: MlvNode) => {
    const { data, error } = await supabase.from('mlv_nodes').upsert(node).select().single();
    return { data, error };
  };

  const updateNode = async (nodeId: string, patch: Partial<MlvNode>) => {
    const { data, error } = await supabase
      .from('mlv_nodes')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', nodeId)
      .select()
      .single();
    return { data, error };
  };

  const createShare = async (nodeId: string) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { data: null, error: authError || new Error('not authenticated') };
    const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const tokenHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const visibility = await updateNode(nodeId, { visibility: 'shared' });
    if (visibility.error) return { data: null, error: visibility.error };
    const { data, error } = await supabase.from('mlv_share_links').insert({
      node_id: nodeId,
      owner_id: authData.user.id,
      token_hash: tokenHash,
      permission: 'view',
    }).select().single();
    if (error) {
      await updateNode(nodeId, { visibility: 'private' });
      return { data: null, error };
    }
    return { data: { link: data, token: raw, node: visibility.data }, error: null };
  };

  const publishNode = async (nodeId: string, metadata?: Record<string, unknown>) => {
    return updateNode(nodeId, { visibility: 'public', ...(metadata ? { metadata } : {}) });
  };

  const makeNodePrivate = async (nodeId: string, metadata?: Record<string, unknown>) => {
    const node = await updateNode(nodeId, { visibility: 'private', ...(metadata ? { metadata } : {}) });
    if (node.error) return node;
    const { error } = await supabase
      .from('mlv_share_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('node_id', nodeId)
      .is('revoked_at', null);
    return { data: node.data, error };
  };

  const downloadOwnNode = async (node: MlvNode) => {
    if (!node.storage_key) return { data: null, error: new Error('node has no stored bytes') };
    const bucket = node.metadata?.storage_bucket === 'mlv-public' ? 'mlv-public' : 'mlv-private';
    return supabase.storage.from(bucket).download(node.storage_key);
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

  return {
    ensurePlayerInstance,
    listOwnNodes,
    listOwnPlacements,
    openShare,
    listPublicNodes,
    mirrorPrivateUpload,
    mirrorNode,
    updateNode,
    createShare,
    publishNode,
    makeNodePrivate,
    downloadOwnNode,
  };
};

export type { Profile, AvatarConfig, Project, HouseLayout, PresenceUser, ChatMessage };
