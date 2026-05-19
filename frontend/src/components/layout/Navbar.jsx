import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../store/authSlice';

export default function Navbar({ onMenuClick }) {
  const { status, userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    // Also call API to clear cookie
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search_query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <Menu className="w-6 h-6 text-foreground" />
        </button>
        <Link to="/" className="text-xl font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          VTube
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-xl px-8">
        <form onSubmit={handleSearch} className="flex w-full bg-background border border-border rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-primary">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-foreground"
          />
          <button type="submit" className="px-5 bg-secondary border-l border-border hover:bg-border transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4">
        {status ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src={userData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-secondary rounded-full">
              <LogOut className="w-5 h-5 text-foreground" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-secondary transition-colors">
            <User className="w-5 h-5" />
            <span className="font-medium">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
