import { useState, useEffect } from 'react';
import World from './three/World';
import Phone from './ui/Phone';
// import { useAuth, useProjects, supabase } from '@3k-mlv/shared';
// import type { Project } from '@3k-mlv/shared';

// Temporary types and functions
interface Project {
  id: string;
  title: string;
  blurb?: string;
  tags: string[];
  demo_url?: string;
  repo_url?: string;
  video_url?: string;
}

const useAuth = () => ({
  signInWithGitHub: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null })
});

const useProjects = () => ({
  getProjects: async (_userId: string) => []
});

const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null as any } }),
    onAuthStateChange: (_callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject] = useState<Project | null>(null);
  const [user, setUser] = useState<any>(null);

  const { signInWithGitHub, signOut } = useAuth();
  const { getProjects } = useProjects();

  useEffect(() => {
    // Check if user is signed in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setIsSignedIn(true);
        setUser(session.user);
        loadUserData(session.user.id);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        setIsSignedIn(true);
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setIsSignedIn(false);
        setUser(null);
        setProjects([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const userProjects = await getProjects(userId);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleHouseClick = (_houseId: string) => {
    setIsPhoneOpen(true);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isSignedIn) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠 3k MLV</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            My Little Vicinity
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            A cozy multiplayer portfolio hub where you can build your home, 
            visit friends' project galleries, and discover amazing work.
          </p>
          <button
            onClick={handleSignIn}
            style={{
              background: '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Sign in with GitHub
          </button>
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
            <p>🎮 Shared identity with Anime Aggressors</p>
            <p>🎨 Customize your avatar and home</p>
            <p>👥 Visit friends' project galleries</p>
            <p>🎯 Launch demos without leaving the world</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}>
        <div style={{ color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🏠 3k MLV</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
            Welcome back, {user?.user_metadata?.full_name || user?.email}!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsPhoneOpen(true)}
            style={{
              background: '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📱 Phone
          </button>
          <button
            onClick={handleSignOut}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* 3D World */}
      <World onHouseClick={handleHouseClick} />

      {/* Phone UI */}
      <Phone
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        projects={projects}
        currentProject={currentProject || undefined}
      />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '1rem',
        borderRadius: '10px',
        fontSize: '0.9rem',
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>🎮 Controls</h4>
        <p style={{ margin: '0 0 0.5rem 0' }}>• Click houses to visit friends</p>
        <p style={{ margin: '0 0 0.5rem 0' }}>• Use mouse to look around</p>
        <p style={{ margin: '0 0 0.5rem 0' }}>• Scroll to zoom in/out</p>
        <p style={{ margin: '0' }}>• Press 📱 to open phone</p>
      </div>
    </div>
  );
}

export default App;
