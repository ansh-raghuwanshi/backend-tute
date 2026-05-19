import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await api.get('/likes/videos');
        setVideos(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load liked videos');
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Liked Videos</h1>
      {videos.length === 0 ? (
        <p className="text-muted-foreground text-center p-8">You haven't liked any videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`} className="group flex flex-col gap-2">
              <div className="w-full aspect-video bg-muted rounded-xl overflow-hidden relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <img src={video.owner.avatar} alt={video.owner.username} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.owner.username}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
