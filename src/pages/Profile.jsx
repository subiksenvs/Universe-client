import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiSave, FiLogOut, FiX } from 'react-icons/fi';
import AvatarEditor from 'react-avatar-editor';

export default function Profile() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', email: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingAvatar, setPendingAvatar] = useState(null);

  // Cropper states
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [scale, setScale] = useState(1.2);

  const presetAvatars = [
    'Felix', 'Aidan', 'Destiny', 'Alexander', 'Brian', 'Caleb', 'Chase', 'Christian',
    'Jack', 'Jocelyn', 'Kingston', 'Liam', 'Mason', 'Oliver', 'Sophia',
    'Emma', 'Noah', 'Ava', 'Elijah', 'Isabella', 'James', 'Mia', 'William',
    'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn'
  ].map(seed => `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=transparent`);

  useEffect(() => {
    const stored = sessionStorage.getItem('userInfo');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.isGuest) {
        navigate('/'); // Guests can't edit profile
      } else {
        setCurrentUser(user);
        setFormData({ name: user.name, age: user.age, gender: user.gender, email: user.email });
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
    navigate('/');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset crop state
    setScale(1.2);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // allow selecting the same file again
  };

  const handleSaveCroppedImage = async () => {
    if (!editorRef.current) return;
    
    const canvas = editorRef.current.getImageScaledToCanvas();
    const base64Avatar = canvas.toDataURL('image/jpeg', 0.8);
    setPendingAvatar(base64Avatar);
    setIsCropModalOpen(false);
  };

  const handlePresetSelect = (avatarUrl) => {
    setPendingAvatar(avatarUrl);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = { id: currentUser.id, ...formData };
      if (pendingAvatar) {
        payload.avatar = pendingAvatar;
      }

      const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : `http://${window.location.hostname}:4000`);
      const response = await fetch(`${apiUrl}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      sessionStorage.setItem('userInfo', JSON.stringify(data));
      setCurrentUser(data);
      setPendingAvatar(null);
      setSuccess('Profile details saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentUser) return null;

  const displayAvatar = pendingAvatar || currentUser.avatar;

  return (
    <div className="app-container" style={{ padding: 'clamp(0.75rem, 3vw, 2rem)', maxWidth: '600px', margin: '0 auto', height: '100dvh', overflowY: 'auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem' }} onClick={() => navigate('/')}>
          <FiArrowLeft /> Back
        </button>
        <h2>Edit Profile</h2>
      </header>

      <div className="glass-panel" style={{ padding: 'clamp(1rem, 4vw, 2rem)', borderRadius: '1rem' }}>
        
        {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleImageSelect} 
          />
            <div style={{
              width: '128px', height: '128px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00e5ff, #743ad5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
            }}>
              <div 
                onClick={() => fileInputRef.current.click()}
                className="header-avatar"
                style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', 
                  background: displayAvatar ? `url(${displayAvatar}) center/cover no-repeat` : '#111', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '3rem', fontWeight: 'bold', cursor: 'pointer', 
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {!displayAvatar && currentUser.name.charAt(0).toUpperCase()}
                
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    ...
                  </div>
                )}
                <div className="avatar-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', fontSize: '1.5rem', color: 'white' }}>
                  <FiCamera />
                  <span style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Change</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', width: '100%' }}>
              <p style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Or choose a preset avatar:</p>
              <div 
                className="avatar-scroller"
                style={{ 
                  display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0.5rem',
                  scrollBehavior: 'smooth'
                }}
              >
                {presetAvatars.map((url, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handlePresetSelect(url)}
                    style={{ 
                      minWidth: '70px', height: '70px', borderRadius: '50%', cursor: 'pointer', 
                      background: `url(${url}) center/cover no-repeat, rgba(255,255,255,0.05)`, 
                      border: displayAvatar === url ? '2px solid var(--primary)' : '2px solid transparent',
                      transition: 'all 0.2s',
                      opacity: isUploading ? 0.5 : 1,
                      flexShrink: 0
                    }} 
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>
          </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" required maxLength="20" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" required min="13" max="100" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Male', 'Female', 'Other'].map(g => (
                <div key={g} onClick={() => setFormData({...formData, gender: g})} style={{ flex: 1, padding: '0.75rem', textAlign: 'center', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid', borderColor: formData.gender === g ? 'var(--primary)' : 'var(--glass-border)', background: formData.gender === g ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0,0,0,0.3)', transition: 'all 0.2s', color: 'white', fontWeight: formData.gender === g ? 600 : 400 }}>
                  {g}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}>
            <FiSave style={{ marginRight: '0.5rem' }} /> Save Changes
          </button>
        </form>
      </div>

      {isCropModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ textAlign: 'center', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
              <h3>Adjust Photo</h3>
              <FiX style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setIsCropModalOpen(false)} />
            </div>
            
            <div style={{ background: '#000', borderRadius: '1rem', padding: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <AvatarEditor
                ref={editorRef}
                image={selectedImage}
                width={200}
                height={200}
                border={20}
                borderRadius={100}
                color={[0, 0, 0, 0.6]} // RGBA
                scale={scale}
                rotate={0}
              />
            </div>

            <div style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem' }}>Zoom</span>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.01" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))} 
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%' }}>
              <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setIsCropModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveCroppedImage} disabled={isUploading}>
                {isUploading ? 'Saving...' : 'Apply & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--success)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 600,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {success}
        </div>
      )}
    </div>
  );
}
