import { Upload, Edit2, Trash2, Video, Users, Eye, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { userData: user } = useSelector(state => state.auth);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({ subscribers: 0, subscribedTo: 0 });
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !uploadData.title || !uploadData.description) {
      toast.error('Title, description, and video file are required');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('video', videoFile);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

    try {
      await api.post('/videos/publish', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Video uploaded successfully!');
      setShowUploadModal(false);
      setUploadData({ title: '', description: '' });
      setVideoFile(null);
      setThumbnailFile(null);
      fetchUserVideos(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const fetchUserVideos = async () => {
    if (!user?._id) return;
    try {
      const response = await api.get('/videos/get-all-videos', {
        params: { userId: user._id }
      });
      setVideos(response.data.data.videos || []);
      
      const channelRes = await api.get(`/users/chanel/${user.username}`);
      setStats({
        subscribers: channelRes.data.data.subscriberCount || 0,
        subscribedTo: channelRes.data.data.chanelSubscribedToCount || 0
      });
    } catch (error) {
      console.error('Failed to load your videos', error);
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/videos/delete-video/${videoId}`);
      toast.success('Video deleted');
      fetchUserVideos();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  useEffect(() => {
    fetchUserVideos();
  }, [user?._id]);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Channel Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Code Master</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Video
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Users className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <h3 className="text-muted-foreground font-medium mb-1">Total Subscribers</h3>
          <p className="text-2xl font-bold text-foreground">{stats.subscribers}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Eye className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <h3 className="text-muted-foreground font-medium mb-1">Total Views</h3>
          <p className="text-2xl font-bold text-foreground">
            {videos.reduce((total, v) => total + (v.view || 0), 0)}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <ThumbsUp className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <h3 className="text-muted-foreground font-medium mb-1">Subscribed To</h3>
          <p className="text-2xl font-bold text-foreground">{stats.subscribedTo}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Video className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <h3 className="text-muted-foreground font-medium mb-1">Total Videos</h3>
          <p className="text-2xl font-bold text-foreground">{videos.length}</p>
        </div>
      </div>

      {/* Videos List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-bold text-foreground text-lg">Your Videos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="px-6 py-4 font-medium">Video</th>
                <th className="px-6 py-4 font-medium">Visibility</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Views</th>
                <th className="px-6 py-4 font-medium">Likes</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    You haven't uploaded any videos yet. Click "Upload Video" to get started!
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 aspect-video bg-muted rounded overflow-hidden flex-shrink-0">
                          <img src={video.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-foreground line-clamp-2 max-w-[250px]">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-medium">
                        {video.isPublished ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{new Date(video.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{video.view || 0}</td>
                    <td className="px-6 py-4 text-sm text-foreground">0</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(video._id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Upload Video</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Description</label>
                <textarea 
                  required
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary h-24"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Video File</label>
                <input 
                  type="file" 
                  accept="video/*"
                  required
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Thumbnail (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full mt-6 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Publish Video'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
