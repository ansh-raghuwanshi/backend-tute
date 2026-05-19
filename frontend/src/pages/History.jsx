import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function History() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/users/watch-history');
        setVideos(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load watch history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Watch History</h1>
      {videos.length === 0 ? (
        <p className="text-muted-foreground text-center p-8">Your watch history is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`} className="group flex flex-col sm:flex-row gap-4 hover:bg-secondary/30 p-2 rounded-lg transition-colors">
              <div className="w-full sm:w-64 aspect-video bg-muted rounded-xl overflow-hidden relative flex-shrink-0">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{video.owner?.username}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{video.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
