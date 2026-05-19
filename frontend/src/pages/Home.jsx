import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search_query');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const endpoint = query ? `/videos/get-all-videos?query=${encodeURIComponent(query)}` : '/videos/get-all-videos';
        const response = await api.get(endpoint);
        setVideos(response.data.data.videos || []);
      } catch (error) {
        console.error('Failed to load videos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [query]);

  if (loading) return <div className="p-8 text-center">Loading videos...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.length === 0 ? (
        <div className="col-span-full text-center p-12 text-muted-foreground">
          No videos found. Be the first to upload!
        </div>
      ) : (
        videos.map((video) => (
          <Link to={`/video/${video._id}`} key={video._id} className="flex flex-col gap-3 group cursor-pointer">
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex gap-3">
              <img 
                src={video.owner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Channel"} 
                alt={video.owner?.username} 
                className="w-9 h-9 rounded-full mt-1 object-cover"
              />
              <div className="flex flex-col">
                <h3 className="text-foreground font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <span className="text-sm text-muted-foreground mt-1">{video.owner?.username || "Unknown"}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  {video.view || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
