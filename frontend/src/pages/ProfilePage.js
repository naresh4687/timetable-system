import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { LuMail, LuBuilding2, LuPencil, LuX, LuCheck, LuLoader, LuShield, LuCalendar, LuCamera } from 'react-icons/lu';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({ name: '', department: '', dob: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    userAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.user);
        
        // Format date for HTML input type="date"
        let formattedDob = '';
        if (data.user.dob) {
          const d = new Date(data.user.dob);
          formattedDob = d.toISOString().split('T')[0];
        }

        setForm({
          name: data.user.name || '',
          department: data.user.department || '',
          dob: formattedDob,
        });
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false));
  };

  const initials = (name = '') =>
    name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    let formattedDob = '';
    if (profile.dob) {
      formattedDob = new Date(profile.dob).toISOString().split('T')[0];
    }
    setForm({ name: profile.name, department: profile.department, dob: formattedDob });
    setEditing(false);
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    if (!form.department.trim()) return toast.error('Department is required.');

    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({
        name: form.name.trim(),
        department: form.department.trim(),
        dob: form.dob || null
      });
      setProfile(data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');

      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, name: data.user.name, department: data.user.department };
      localStorage.setItem('user', JSON.stringify(updated));
      window.dispatchEvent(new Event('profile-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file');
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await userAPI.uploadProfileImage(formData);
      setProfile(prev => ({ ...prev, profileImage: data.profileImage }));
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  if (loading) {
    return (
      <div className="profile-page-modern" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LuLoader size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!profile) return null;

  // Determine avatar src
  let avatarUrl = null;
  if (profile.profileImage) {
    // If it's a relative path, prefix with backend URL
    avatarUrl = profile.profileImage.startsWith('http') 
      ? profile.profileImage 
      : `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000'}${profile.profileImage}`;
  }

  return (
    <div className="profile-page-modern">
      <div className="profile-glass-card">
        
        {/* AVATAR UPLOAD */}
        <div className="profile-upload-wrap" onClick={triggerFileInput}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="profile-avatar-glass" />
          ) : (
            <div className="profile-avatar-glass">
              {initials(profile.name)}
            </div>
          )}
          
          <div className="profile-upload-overlay">
            {uploading ? (
              <LuLoader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <LuCamera size={20} style={{ marginBottom: 4 }} />
                <span>Upload</span>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden-file-input" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        {/* HEADER */}
        <h2 className="profile-name-glass">{profile.name}</h2>
        <span className="profile-badge-glass">{profile.role}</span>

        {!editing ? (
          <>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <LuMail />
                <span>{profile.email}</span>
              </div>
              <div className="profile-info-item">
                <LuBuilding2 />
                <span>{profile.department}</span>
              </div>
              <div className="profile-info-item">
                <LuCalendar />
                <span>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not set'}</span>
              </div>
            </div>

            <button className="btn-glass" onClick={handleEdit}>
              <LuPencil size={18} /> Edit Profile
            </button>
          </>
        ) : (
          <form className="profile-edit-glass" onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>Department</label>
              <input
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            <div className="glass-actions">
              <button type="button" className="btn-glass btn-glass-cancel" onClick={handleCancel}>
                <LuX size={16} /> Cancel
              </button>
              <button type="submit" className="btn-glass" disabled={saving}>
                {saving ? <LuLoader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <LuCheck size={16} />}
                {saving ? 'Saving' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
