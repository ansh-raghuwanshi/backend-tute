import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VideoDetail() {
  const { id } = useParams();
  const { userData: user } = useSelector(state => state.auth);
  
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const videoRes = await api.get(`/videos/get-video/${id}`);
        setVideo(videoRes.data.data);
        
        // Fetch likes
        const likesRes = await api.get(`/likes/video/${id}/likes`);
        setLikes(likesRes.data.data.length);
        setIsLiked(likesRes.data.data.some(like => like.likedBy === user?._id));

        // Add to history
        if (user?._id) {
          await api.post(`/users/history/${id}`).catch(err => console.log(err));
        }

        // Fetch channel status (isSubscribed)
        if (videoRes.data.data.owner?.username && user?._id) {
          const channelRes = await api.get(`/users/chanel/${videoRes.data.data.owner.username}`);
          setIsSubscribed(channelRes.data.data.isSubscribed);
        }

        // Fetch comments
        const commentsRes = await api.get(`/comments/video/${id}`);
        setComments(commentsRes.data.data || []);

        // Fetch suggested videos
        const suggestedRes = await api.get('/videos/get-all-videos');
        setSuggestedVideos(suggestedRes.data.data.videos.filter(v => v._id !== id).slice(0, 8));
      } catch (error) {
        toast.error('Failed to load video details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVideoData();
  }, [id, user?._id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this video');
      return;
    }
    try {
      await api.post(`/likes/video/${id}/toggle`);
      setIsLiked(prevIsLiked => {
        setLikes(prevLikes => prevIsLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1);
        return !prevIsLiked;
      });
    } catch (error) {
      toast.error('Failed to toggle like');
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }
    try {
      const targetChannelId = video?.owner?._id || video?.owner;
      await api.post(`/subscription/toggle/${targetChannelId}`);
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed');
    } catch (error) {
      toast.error('Failed to toggle subscription');
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/comments/video/${id}`, { content: newComment });
      const commentWithOwner = { ...res.data.data, owner: { _id: user._id, username: user.username, avatar: user.avatar } };
      setComments(prev => [commentWithOwner, ...prev]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) return <div className="text-center p-8">Loading video...</div>;
  if (!video) return <div className="text-center p-8">Video not found</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
      {/* Main Content */}
      <div className="flex-1">
        {/* Video Player Placeholder */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
          <video 
            src={video.videoFile} 
            controls 
            className="w-full h-full object-contain"
            poster={video.thumbnail}
          />
        </div>

        {/* Video Info */}
        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {video.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Channel Info */}
            <div className="flex items-center gap-4">
              <img 
                src={video.owner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Channel"} 
                alt="Channel Avatar" 
                className="w-12 h-12 rounded-full cursor-pointer object-cover"
              />
              <div>
                <h3 className="font-bold text-foreground leading-tight">{video.owner?.username || "Channel Name"}</h3>
              </div>
              <button 
                onClick={handleSubscribe}
                className={`ml-4 px-4 py-2 rounded-full font-medium transition-colors ${
                  isSubscribed 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <div className="flex items-center bg-secondary rounded-full">
                <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-l-full border-r border-border ${isLiked ? 'text-primary' : ''}`}>
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">{likes}</span>
                </button>
                <button className="px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-r-full">
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="font-medium hidden md:inline">Share</span>
              </button>
              <button className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="mt-4 bg-secondary p-4 rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
            <div className="flex gap-2 text-sm font-medium text-foreground mb-1">
              <span>{video.view || 0} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-line line-clamp-3">
              {video.description}
              <br/><br/>
              Timestamps:
              0:00 Intro
              1:23 Main Topic
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Comments</h2>
          
          {/* Add Comment */}
          <div className="flex gap-4 mb-8">
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} 
              alt="User" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-1 transition-colors"
              />
              <div className="flex justify-end gap-2 mt-2 opacity-0 focus-within:opacity-100 transition-opacity">
                <button 
                  onClick={() => setNewComment("")}
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-full"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCommentSubmit}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <img 
                    src={comment.owner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} 
                    alt="Commenter" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">@{comment.owner?.username || 'user'}</span>
                      <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggested Videos Sidebar */}
      <div className="lg:w-[400px] flex flex-col gap-3">
        {suggestedVideos.map((item) => (
          <div key={item._id} onClick={() => window.location.href=`/video/${item._id}`} className="flex gap-2 group cursor-pointer">
            <div className="w-40 aspect-video bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
              <img 
                src={item.thumbnail} 
                alt="Thumbnail" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col py-1">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <span className="text-xs text-muted-foreground mt-1">{item.owner?.username || 'Channel'}</span>
              <span className="text-xs text-muted-foreground">{item.views || 0} views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
