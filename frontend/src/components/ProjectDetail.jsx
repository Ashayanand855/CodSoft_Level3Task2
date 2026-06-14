import React, { useState } from 'react';
import { Calendar, AlertTriangle, Plus, Trash2, ArrowLeft, CheckCircle, Clock } from 'lucide-react';

export default function ProjectDetail({ project, users, onBack, onUpdateProject, onDeleteProject, onCreateTask, onUpdateTask, onDeleteTask, activeUser }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Status lists
  const COLUMNS = [
    { id: 'TODO', label: 'To Do', color: '#64748b' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: '#3B82F6' },
    { id: 'REVIEW', label: 'In Review', color: '#F59E0B' },
    { id: 'DONE', label: 'Done', color: '#10B981' }
  ];

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onCreateTask({
      title: newTaskTitle,
      description: newTaskDesc,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || null,
      assigneeId: newTaskAssignee || null,
      status: 'TODO'
    });

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('MEDIUM');
    setNewTaskDueDate('');
    setNewTaskAssignee('');
    setShowAddTask(false);
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('') : '?';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', minHeight: 0 }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{project.name}</h1>
              <span className={`badge badge-${project.priority.toLowerCase()}`}>{project.priority}</span>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.95rem', maxWidth: '700px' }}>{project.description || 'No description provided.'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }} 
            value={project.status} 
            onChange={(e) => onUpdateProject({ ...project, status: e.target.value })}
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAddTask(true)}>
            <Plus size={16} /> Add Task
          </button>
          {activeUser?.role === 'ADMIN' && (
            <button className="btn btn-danger" style={{ padding: '0.5rem 1rem' }} onClick={() => { if (confirm('Are you sure you want to delete this project?')) onDeleteProject(project.id); }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Details Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Start Date</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Deadline</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.2rem', color: project.endDate && new Date(project.endDate) < new Date() && project.status !== 'COMPLETED' ? 'var(--grad-rose)' : 'inherit' }}>
              {project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Project Completion: <strong>{project.progress}%</strong></span>
          <div className="progress-bar-bg" style={{ width: '150px', height: '8px' }}>
            <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTasks = project.tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="kanban-column animate-fade-in">
              <div className="kanban-column-header">
                <div className="column-title-group">
                  <span className="column-title" style={{ color: col.color }}>{col.label}</span>
                  <span className="task-count">{colTasks.length}</span>
                </div>
              </div>

              <div className="kanban-tasks">
                {colTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                  return (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <select 
                            className="form-select" 
                            style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', width: 'auto', backgroundColor: 'rgba(255,255,255,0.05)' }} 
                            value={task.status} 
                            onChange={(e) => onUpdateTask(task.id, { ...task, status: e.target.value })}
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="DONE">Done</option>
                          </select>
                          <button 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                            onClick={() => { if (confirm('Delete this task?')) onDeleteTask(task.id); }}
                            title="Delete Task"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h4 className="task-title">{task.title}</h4>
                      {task.description && <p className="task-desc">{task.description}</p>}

                      <div className="task-footer">
                        <div className={`due-date-indicator ${isOverdue ? 'overdue' : ''}`}>
                          <Calendar size={12} />
                          <span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                          </span>
                          {isOverdue && <AlertTriangle size={12} style={{ marginLeft: '0.1rem' }} />}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <select
                            className="form-select"
                            style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', width: 'auto', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'right' }}
                            value={task.assigneeId || ''}
                            onChange={(e) => onUpdateTask(task.id, { ...task, assigneeId: e.target.value || null })}
                          >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role === 'EMPLOYEE').map(u => (
                              <option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>
                            ))}
                          </select>

                          {task.assignee ? (
                            <div 
                              className="avatar" 
                              style={{ backgroundColor: task.assignee.avatarColor, width: 22, height: 22, fontSize: '0.65rem' }} 
                              title={`Assigned to ${task.assignee.name}`}
                            >
                              {getInitials(task.assignee.name)}
                            </div>
                          ) : (
                            <div 
                              className="avatar" 
                              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', width: 22, height: 22, fontSize: '0.65rem' }}
                              title="Unassigned"
                            >
                              ?
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div style={{ border: '2px dashed rgba(255,255,255,0.03)', borderRadius: '14px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal overlay */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Task</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setShowAddTask(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Set up API schema"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  placeholder="Describe the task details..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-select"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Assignee</label>
                <select 
                  className="form-select"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.filter(u => u.role === 'EMPLOYEE').map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTask(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
