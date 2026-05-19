import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData: user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        if (!user?._id) return;
        const response = await api.get(`/subscription/subscribed-channels/${user._id}`);
        setChannels(response.data.data || []);
      } catch (error) {
        toast.error('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [user]);

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Subscriptions</h1>
      {channels.length === 0 ? (
        <p className="text-muted-foreground text-center p-8">You haven't subscribed to any channels yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((sub) => (
            <Link key={sub._id} to={`/channel/${sub.channel.username}`} className="bg-card border border-border p-6 rounded-xl flex flex-col items-center hover:shadow-lg transition-shadow">
              <img src={sub.channel.avatar} alt={sub.channel.username} className="w-24 h-24 rounded-full object-cover mb-4" />
              <h3 className="font-bold text-foreground text-lg">{sub.channel.fullname}</h3>
              <p className="text-muted-foreground text-sm">@{sub.channel.username}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
