import React from 'react';
import { LayoutDashboard, FolderKanban, Users, CheckSquare, Shield } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, activeUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'team', label: 'Team Members', icon: Users },
  ];

  if (activeUser?.role === 'ADMIN') {
    menuItems.push({ id: 'access', label: 'Access Control', icon: Shield });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">P</div>
        <span className="brand-name">ProManage</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-selector-card" style={{ cursor: 'default' }}>
          <div className="avatar" style={{ backgroundColor: activeUser?.avatarColor || '#8B5CF6' }}>
            {activeUser?.name ? activeUser.name.split(' ').map(n => n[0]).join('') : '?'}
          </div>
          <div className="user-info">
            <p className="user-name">{activeUser?.name ? activeUser.name : 'Unknown User'}</p>
            <p className="user-role">{activeUser?.role || 'User'}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="btn btn-secondary" 
          style={{ width: '100%', marginTop: '0.75rem', padding: '0.6rem', fontSize: '0.85rem' }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
