import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ChannelProfile() {
  const { username } = useParams();
  const { userData: user } = useSelector(state => state.auth);
  
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/chanel/${username}`);
        setProfile(response.data.data);
        
        if (response.data.data?._id) {
          const videosRes = await api.get('/videos/get-all-videos', { params: { userId: response.data.data._id } });
          setVideos(videosRes.data.data.videos || []);
        }
      } catch (error) {
        toast.error('Failed to load channel profile');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }
    try {
      await api.post(`/subscription/toggle/${profile?._id}`);
      setProfile(prev => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        subscribersCount: prev.isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
      }));
    } catch (error) {
      toast.error('Failed to toggle subscription');
    }
  };

  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (!profile) return <div className="text-center p-8">Channel not found</div>;

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* Cover Image */}
      <div className="w-full h-32 sm:h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
        <img 
          src={profile.coverImage || `https://picsum.photos/seed/${username}/1280/300`} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Channel Header */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 px-4">
        <img 
          src={profile.avatar} 
          alt="Avatar" 
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background -mt-12 sm:-mt-16 bg-card object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.fullname}</h1>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm text-muted-foreground mt-1 items-center sm:items-start">
            <span className="font-medium text-foreground">@{profile.username}</span>
            <span className="hidden sm:inline">•</span>
            <span>{profile.subscribersCount || 0} subscribers</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl line-clamp-2">
            Welcome to {profile.fullname}'s channel!
          </p>
        </div>
        <button 
          onClick={handleSubscribe}
          className={`px-6 py-2 font-medium rounded-full transition-colors mt-2 sm:mt-0 ${
            profile.isSubscribed 
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {profile.isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border mt-8">
        {['Videos', 'Shorts', 'Playlists', 'Community'].map((tab, idx) => (
          <button 
            key={tab} 
            className={`px-6 py-3 font-medium transition-colors ${
              idx === 0 
                ? 'border-b-2 border-primary text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      <div className="mt-8 mb-12">
        {videos.length === 0 ? (
          <div className="text-center py-12 border-t border-border">
            <p className="text-muted-foreground">This channel has no videos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link to={`/video/${video._id}`} key={video._id} className="flex flex-col gap-3 group cursor-pointer">
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-foreground font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <span className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    {video.view || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
