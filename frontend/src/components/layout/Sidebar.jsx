
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';

const navItems = [
  { icon: Icons.Home, label: 'Home', path: '/' },
  { icon: Icons.Compass, label: 'Shorts', path: '/shorts' },
  { icon: Icons.Video, label: 'Subscriptions', path: '/subscriptions' },
  { icon: Icons.History, label: 'History', path: '/history' },
  { icon: Icons.ThumbsUp, label: 'Liked Videos', path: '/liked-videos' },
];

export default function Sidebar({ isOpen }) {
  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col py-4 overflow-y-auto sticky top-16 hidden md:flex">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-4 px-6 py-3 hover:bg-secondary transition-colors ${
              isActive ? 'bg-secondary font-medium' : 'text-foreground'
            }`
          }
        >
          <item.icon className="w-6 h-6" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
