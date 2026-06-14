import React from 'react';
import { Mail, Trash2, Plus } from 'lucide-react';

export default function TeamManager({ users, onDeleteUser, activeUser, onAddClick }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Team Roster</h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Track assigned workloads, progress, and performance across your workspace.</p>
        </div>
        {(activeUser?.role === 'ADMIN' || activeUser?.role === 'DEPARTMENT') && (
          <button className="btn btn-primary" onClick={onAddClick}>
            <Plus size={16} /> Add Member / Email
          </button>
        )}
      </div>

      <div className="team-grid">
        {users.map((user) => {
          const completionRate = user.totalTasks > 0 ? Math.round((user.completedTasks / user.totalTasks) * 100) : 0;
          return (
            <div key={user.id} className="glass-card team-card" style={{ position: 'relative' }}>
              {activeUser?.role === 'ADMIN' && user.role !== 'ADMIN' && (
                <button 
                  className="btn-delete-member" 
                  style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'color 0.2s, background-color 0.2s'
                  }} 
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${user.name} from the team?`)) {
                      onDeleteUser(user.id);
                    }
                  }}
                  title="Remove Member"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="team-avatar-lg" style={{ backgroundColor: user.avatarColor }}>
                {getInitials(user.name)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{user.name}</h3>
                <p className="text-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                  <Mail size={12} /> {user.email}
                </p>
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Workload Completion</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '4px' }}>
                  <div className="progress-bar-fill" style={{ width: `${completionRate}%`, background: 'var(--grad-emerald)' }}></div>
                </div>
              </div>

              <div className="team-stats">
                <div className="team-stat-item">
                  <span className="team-stat-val">{user.totalTasks}</span>
                  <span className="team-stat-lbl">Assigned</span>
                </div>
                <div className="team-stat-item">
                  <span className="team-stat-val" style={{ color: 'var(--text-emerald)' }}>{user.completedTasks}</span>
                  <span className="team-stat-lbl">Done</span>
                </div>
                <div className="team-stat-item">
                  <span className="team-stat-val" style={{ color: 'var(--text-purple)' }}>{user.pendingTasks}</span>
                  <span className="team-stat-lbl">Pending</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
