import { useState, useEffect } from 'react';
// import type { Project } from '@3k-mlv/shared';

interface Project {
  id: string;
  title: string;
  blurb?: string;
  tags: string[];
  demo_url?: string;
  repo_url?: string;
  video_url?: string;
}

interface PhoneProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProject?: Project;
}

export default function Phone({ isOpen, onClose, projects, currentProject }: PhoneProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'social' | 'links'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(currentProject || null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setSelectedProject(currentProject);
    }
  }, [currentProject]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIframeError(false);
  };

  const handleDemoClick = (project: Project) => {
    if (project.demo_url) {
      // Try to open in iframe, fallback to new tab if X-Frame-Options blocks
      setSelectedProject(project);
      setIframeError(false);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '90%',
        maxWidth: '800px',
        height: '80%',
        background: '#1a1a1a',
        borderRadius: '20px',
        border: '2px solid #333',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Phone Header */}
        <div style={{
          background: '#2a2a2a',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #333'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('projects')}
              style={{
                background: activeTab === 'projects' ? '#4ecdc4' : '#444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('social')}
              style={{
                background: activeTab === 'social' ? '#4ecdc4' : '#444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Social
            </button>
            <button
              onClick={() => setActiveTab('links')}
              style={{
                background: activeTab === 'links' ? '#4ecdc4' : '#444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Links
            </button>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Phone Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {activeTab === 'projects' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Project Gallery</h3>
              {selectedProject ? (
                <div>
                  <div style={{
                    background: '#333',
                    padding: '1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{selectedProject.title}</h4>
                    <p style={{ color: '#ccc', marginBottom: '1rem' }}>{selectedProject.blurb}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {selectedProject.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#4ecdc4',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '3px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {selectedProject.demo_url && (
                        <button
                          onClick={() => handleDemoClick(selectedProject)}
                          style={{
                            background: '#4ecdc4',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Play Demo
                        </button>
                      )}
                      {selectedProject.repo_url && (
                        <button
                          onClick={() => handleExternalLink(selectedProject.repo_url!)}
                          style={{
                            background: '#333',
                            color: 'white',
                            border: '1px solid #666',
                            padding: '0.5rem 1rem',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          GitHub
                        </button>
                      )}
                      {selectedProject.video_url && (
                        <button
                          onClick={() => handleExternalLink(selectedProject.video_url!)}
                          style={{
                            background: '#ff0000',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          YouTube
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Demo iframe */}
                  {selectedProject.demo_url && !iframeError && (
                    <div style={{
                      width: '100%',
                      height: '400px',
                      border: '1px solid #333',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <iframe
                        src={selectedProject.demo_url}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        onError={() => setIframeError(true)}
                        onLoad={(e) => {
                          // Check if iframe loaded successfully
                          try {
                            const iframe = e.target as HTMLIFrameElement;
                            if (iframe.contentDocument === null) {
                              setIframeError(true);
                            }
                          } catch (error) {
                            setIframeError(true);
                          }
                        }}
                      />
                    </div>
                  )}

                  {iframeError && (
                    <div style={{
                      background: '#333',
                      padding: '1rem',
                      borderRadius: '10px',
                      textAlign: 'center',
                      color: '#ccc'
                    }}>
                      <p>Demo cannot be embedded. Click "Play Demo" to open in new tab.</p>
                      <button
                        onClick={() => handleExternalLink(selectedProject.demo_url!)}
                        style={{
                          background: '#4ecdc4',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginTop: '0.5rem'
                        }}
                      >
                        Open Demo
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedProject(null)}
                    style={{
                      background: '#666',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '1rem'
                    }}
                  >
                    ← Back to Gallery
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      style={{
                        background: '#333',
                        padding: '1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        border: '1px solid #444'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#4ecdc4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#444';
                      }}
                    >
                      <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{project.title}</h4>
                      <p style={{ color: '#ccc', fontSize: '0.9rem' }}>{project.blurb}</p>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              background: '#4ecdc4',
                              color: 'white',
                              padding: '0.2rem 0.4rem',
                              borderRadius: '3px',
                              fontSize: '0.7rem'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Social Hub</h3>
              <div style={{
                background: '#333',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Online Friends</h4>
                <p style={{ color: '#ccc' }}>3 friends nearby</p>
              </div>
              <div style={{
                background: '#333',
                padding: '1rem',
                borderRadius: '10px'
              }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Quick Chat</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      background: '#444',
                      border: '1px solid #666',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '5px'
                    }}
                  />
                  <button
                    style={{
                      background: '#4ecdc4',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Send
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['👋', '😊', '🎉', '❤️', '👍'].map((emote, index) => (
                    <button
                      key={index}
                      style={{
                        background: '#666',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      {emote}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Quick Links</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <button
                  onClick={() => handleExternalLink('https://github.com/gunnchOS3k')}
                  style={{
                    background: '#333',
                    color: 'white',
                    border: '1px solid #666',
                    padding: '1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>🐙</div>
                  <div>GitHub</div>
                </button>
                <button
                  onClick={() => handleExternalLink('https://linkedin.com/in/edmundgunn')}
                  style={{
                    background: '#333',
                    color: 'white',
                    border: '1px solid #666',
                    padding: '1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>💼</div>
                  <div>LinkedIn</div>
                </button>
                <button
                  onClick={() => handleExternalLink('https://twitter.com/gunnchOS3k')}
                  style={{
                    background: '#333',
                    color: 'white',
                    border: '1px solid #666',
                    padding: '1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>🐦</div>
                  <div>Twitter</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
