import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) {
      toast.error('Avatar is required');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('avatar', avatar);
      if (coverImage) data.append('coverImage', coverImage);

      await api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">Create an account</h1>
      <p className="text-muted-foreground mb-8 text-center">Join us today</p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <input 
              name="username" type="text" onChange={handleChange} required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input 
              name="fullname" type="text" onChange={handleChange} required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input 
            name="email" type="email" onChange={handleChange} required
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <input 
            name="password" type="password" onChange={handleChange} required
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Avatar Image</label>
          <input 
            type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} required
            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Cover Image (Optional)</label>
          <input 
            type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])}
            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full py-2 px-4 mt-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>
      
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
