import React from 'react';
import { Briefcase, CheckCircle2, Clock, AlertTriangle, ChevronRight, Calendar } from 'lucide-react';

export default function Dashboard({ projects, tasks, activeUser, onSelectProject, setCurrentTab }) {
  // Compute Stats
  const totalProjects = projects.length;
  
  const activeTasks = tasks.filter(t => t.status !== 'DONE').length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'DONE' || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // Filter tasks for active user
  const myTasks = activeUser ? tasks.filter(t => t.assigneeId === activeUser.id && t.status !== 'DONE') : [];

  const statItems = [
    { label: 'Total Projects', value: totalProjects, icon: Briefcase, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
    { label: 'Active Tasks', value: activeTasks, icon: Clock, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
    { label: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
    { label: 'Overdue Tasks', value: overdueTasks, icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>
          Welcome back, {activeUser?.name ? activeUser.name.split(' ')[0] : 'Guest'} 👋
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.95rem' }}>
          Here is a summary of your team's project health and your active workloads.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card stats-card">
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {item.label}
                </p>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{item.value}</h2>
              </div>
              <div className="stats-icon-wrapper" style={{ backgroundColor: item.bg, color: item.color }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Active Projects Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active Projects</h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setCurrentTab('projects')}>
              View All
            </button>
          </div>

          <div className="project-grid" style={{ gridTemplateColumns: '1fr' }}>
            {projects.slice(0, 3).map((project) => (
              <div 
                key={project.id} 
                className="glass-card project-card" 
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectProject(project.id)}
              >
                <div className="project-card-header">
                  <div>
                    <h4 className="project-title" style={{ marginBottom: '0.25rem' }}>{project.name}</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Status: <span style={{ color: project.status === 'COMPLETED' ? 'var(--text-emerald)' : 'var(--text-purple)' }}>{project.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <span className={`badge badge-${project.priority.toLowerCase()}`}>{project.priority}</span>
                </div>

                <p className="project-desc">{project.description || 'No description provided.'}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span className="text-secondary">Progress ({project.progress}%)</span>
                    <span className="text-secondary">{project.completedTasks}/{project.totalTasks} Tasks Done</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    <span>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}
                    </span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-purple)', fontWeight: 600 }}>
                    Open Board <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No projects found. Create a project to get started!
              </div>
            )}
          </div>
        </div>

        {/* Assigned to Me Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>My Active Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myTasks.length > 0 ? (
              myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="glass-card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{task.priority}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{task.project.name}</span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{task.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    <span style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-purple)' }}>{task.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                All caught up! No active tasks assigned to you.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
