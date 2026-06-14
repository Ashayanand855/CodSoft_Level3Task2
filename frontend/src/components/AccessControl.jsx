import React from 'react';
import { Shield, Plus, Mail, Trash2 } from 'lucide-react';

export default function AccessControl({ users, onDeleteUser, onAddClick }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={28} color="var(--text-purple)" />
            Access Control
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Manage system access, roles, and security credentials for all personnel.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddClick}>
          <Plus size={16} /> Add Member / Email
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="avatar" style={{ backgroundColor: user.avatarColor, width: '40px', height: '40px' }}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`badge badge-${user.role === 'ADMIN' ? 'high' : user.role === 'DEPARTMENT' ? 'medium' : 'low'}`}>
                    {user.role || 'EMPLOYEE'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} /> {user.email}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  {user.role !== 'ADMIN' && (
                    <button 
                      className="btn-delete-member" 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px' }}
                      onClick={() => {
                        if (confirm(`Revoke access for ${user.name}? This will delete their account permanently.`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
