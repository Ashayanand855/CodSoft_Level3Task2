import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import TeamManager from './components/TeamManager';
import AccessControl from './components/AccessControl';
import Login from './components/Login';
import { Plus, Calendar, FolderKanban, CheckSquare, Search, AlertTriangle, Trash2, Key, Mail } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // Modals
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  // Form states for creating project
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projPriority, setProjPriority] = useState('MEDIUM');
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');

  // Form states for creating user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('EMPLOYEE');
  const [newUserError, setNewUserError] = useState('');
  const [newUserSuccess, setNewUserSuccess] = useState('');

  // Search/Filter states for All Tasks tab
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilterProject, setTaskFilterProject] = useState('');
  const [taskFilterAssignee, setTaskFilterAssignee] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState('');

  // Fetch initial data
  const loadData = async () => {
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
      
      // Select first user as default active session if not already set or fallback if deleted
      if (usersData.length > 0) {
        if (!activeUser) {
          setActiveUser(usersData[0]);
        } else {
          const stillExists = usersData.find(u => u.id === activeUser.id);
          if (stillExists) {
            setActiveUser(stillExists);
          } else {
            setActiveUser(usersData[0]);
          }
        }
      } else {
        setActiveUser(null);
      }

      const projectsData = await api.getProjects();
      setProjects(projectsData);

      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (err) {
      console.error("Error loading application data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Set active user profile if users list changes
  useEffect(() => {
    if (users.length > 0 && !activeUser) {
      setActiveUser(users[0]);
    } else if (users.length === 0) {
      setActiveUser(null);
    }
  }, [users]);

  // Project Actions
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projName.trim()) return;

    try {
      await api.createProject({
        name: projName,
        description: projDesc,
        priority: projPriority,
        startDate: projStart || null,
        endDate: projEnd || null,
      });

      // Reset
      setProjName('');
      setProjDesc('');
      setProjPriority('MEDIUM');
      setProjStart('');
      setProjEnd('');
      setShowCreateProject(false);
      
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      await api.updateProject(updatedProject.id, updatedProject);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      setSelectedProjectId(null);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Task Actions
  const handleCreateTask = async (taskData) => {
    if (!selectedProjectId) return;
    try {
      await api.createTask(selectedProjectId, taskData);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await api.updateTask(id, taskData);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // User Actions
  const handleCreateUser = async (userData) => {
    try {
      const newUser = await api.createUser(userData);
      setUsers([...users, { ...newUser, totalTasks: 0, completedTasks: 0, pendingTasks: 0 }]);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;

    try {
      await handleCreateUser({ 
        name: newUserName, 
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('EMPLOYEE');
      setNewUserError('');
      setNewUserSuccess('User successfully created and granted access.');
      setTimeout(() => {
        setShowCreateUser(false);
        setNewUserSuccess('');
      }, 1500);
    } catch (err) {
      setNewUserError(err.message || 'Failed to create user account.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      if (activeUser && activeUser.id === id) {
        setActiveUser(null);
      }
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (user, token) => {
    setActiveUser(user);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setActiveUser(null);
    setCurrentTab('dashboard');
  };

  // Get project currently viewing
  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Filter tasks for the 'All Tasks' view
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(taskSearch.toLowerCase()));
    const matchesProject = !taskFilterProject || task.projectId === taskFilterProject;
    const matchesAssignee = !taskFilterAssignee || 
                            (taskFilterAssignee === 'unassigned' ? !task.assigneeId : task.assigneeId === taskFilterAssignee);
    const matchesStatus = !taskFilterStatus || task.status === taskFilterStatus;

    return matchesSearch && matchesProject && matchesAssignee && matchesStatus;
  });

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedProjectId(null);
          setCurrentTab(tab);
        }}
        activeUser={activeUser}
        users={users}
        onLogout={handleLogout}
      />

      {/* Main Panel */}
      <main className="main-content">
        {selectedProjectId && currentProject ? (
          /* Kanban Project Board View */
          <ProjectDetail
            project={currentProject}
            users={users}
            onBack={() => setSelectedProjectId(null)}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            activeUser={activeUser}
          />
        ) : (
          /* General Tab Views */
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                projects={projects}
                tasks={tasks}
                activeUser={activeUser}
                onSelectProject={(id) => setSelectedProjectId(id)}
                setCurrentTab={setCurrentTab}
              />
            )}

            {currentTab === 'projects' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Workspace Projects</h1>
                    <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Organize resources, track milestones, and manage task boards.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowCreateProject(true)}>
                    <Plus size={16} /> Create Project
                  </button>
                </div>

                <div className="project-grid">
                  {projects.map((project) => (
                    <div 
                      key={project.id} 
                      className="glass-card project-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="project-card-header">
                        <div>
                          <h3 className="project-title" style={{ marginBottom: '0.2rem' }}>{project.name}</h3>
                          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Status: <span style={{ color: project.status === 'COMPLETED' ? 'var(--text-emerald)' : 'var(--text-purple)', fontWeight: 600 }}>{project.status.replace('_', ' ')}</span>
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className={`badge badge-${project.priority.toLowerCase()}`}>{project.priority}</span>
                          {activeUser?.role === 'ADMIN' && (
                            <button 
                              className="btn-delete-project" 
                              style={{ 
                                padding: '0.25rem', 
                                border: 'none', 
                                background: 'none', 
                                color: 'var(--text-muted)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                transition: 'color 0.2s, background-color 0.2s'
                              }} 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this project?')) {
                                  handleDeleteProject(project.id);
                                }
                              }}
                              title="Delete Project"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="project-desc">{project.description || 'No description provided.'}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>Completion ({project.progress}%)</span>
                          <span>{project.completedTasks}/{project.totalTasks} Tasks</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '6px' }}>
                          <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} />
                          <span>End: {project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                        <span style={{ color: 'var(--text-purple)', fontWeight: 600 }}>Open Board →</span>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <FolderKanban size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No projects created yet</h3>
                      <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Get started by setting up your first project board.</p>
                      <button className="btn btn-primary" onClick={() => setShowCreateProject(true)}>
                        Create Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentTab === 'tasks' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Workspace Tasks</h1>
                  <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Filter and check tasks across all current projects.</p>
                </div>

                {/* Filter Bar */}
                <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.4rem 0.75rem' }}>
                    <Search size={16} className="text-muted" />
                    <input 
                      type="text" 
                      placeholder="Search tasks by title..." 
                      style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <select className="form-select" style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }} value={taskFilterProject} onChange={(e) => setTaskFilterProject(e.target.value)}>
                      <option value="">All Projects</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>

                    <select className="form-select" style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }} value={taskFilterAssignee} onChange={(e) => setTaskFilterAssignee(e.target.value)}>
                      <option value="">All Assignees</option>
                      <option value="unassigned">Unassigned</option>
                      {users.filter(u => u.role === 'EMPLOYEE').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>

                    <select className="form-select" style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }} value={taskFilterStatus} onChange={(e) => setTaskFilterStatus(e.target.value)}>
                      <option value="">All Statuses</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>

                {/* Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                    return (
                      <div key={task.id} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{task.priority}</span>
                          <div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>{task.title}</h3>
                            <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Project: <strong>{task.project.name}</strong></p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: isOverdue ? 'var(--grad-rose)' : 'var(--text-muted)' }}>
                            <Calendar size={14} />
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No Deadline'}</span>
                            {isOverdue && <AlertTriangle size={14} />}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Status:</span>
                            <select 
                              className="form-select" 
                              style={{ width: 'auto', padding: '0.3rem 1.75rem 0.3rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-input)' }}
                              value={task.status} 
                              onChange={(e) => handleUpdateTask(task.id, { ...task, status: e.target.value })}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Owner:</span>
                            <select 
                              className="form-select" 
                              style={{ width: 'auto', padding: '0.3rem 1.75rem 0.3rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-input)' }}
                              value={task.assigneeId || ''} 
                              onChange={(e) => handleUpdateTask(task.id, { ...task, assigneeId: e.target.value || null })}
                            >
                              <option value="">Unassigned</option>
                              {users.filter(u => u.role === 'EMPLOYEE').map(u => <option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredTasks.length === 0 && (
                    <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <CheckSquare size={40} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontSize: '0.9rem' }}>No tasks found matching current filters.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentTab === 'team' && (
              <TeamManager 
                users={users} 
                onDeleteUser={handleDeleteUser}
                activeUser={activeUser}
                onAddClick={() => setShowCreateUser(true)}
              />
            )}

            {currentTab === 'access' && (
              <AccessControl
                users={users}
                onDeleteUser={handleDeleteUser}
                onAddClick={() => setShowCreateUser(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Create Project Modal overlay */}
      {showCreateProject && (
        <div className="modal-overlay" onClick={() => setShowCreateProject(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Workspace Project</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setShowCreateProject(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Website Overhaul" 
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  placeholder="Describe project deliverables, scope, and objectives..." 
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select 
                  className="form-select"
                  value={projPriority}
                  onChange={(e) => setProjPriority(e.target.value)}
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={projStart}
                    onChange={(e) => setProjStart(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={projEnd}
                    onChange={(e) => setProjEnd(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal overlay */}
      {showCreateUser && (
        <div className="modal-overlay" onClick={() => { setShowCreateUser(false); setNewUserError(''); setNewUserSuccess(''); }}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Member / Email Access</h3>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setShowCreateUser(false); setNewUserError(''); setNewUserSuccess(''); }}>✕</button>
            </div>
            <form onSubmit={handleCreateUserSubmit}>
              {newUserError && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  {newUserError}
                </div>
              )}
              {newUserSuccess && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10B981', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  {newUserSuccess}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Login ID)</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Key size={16} />
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Set temporary password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Access Level (Role)</label>
                <select 
                  className="form-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  required
                >
                  <option value="EMPLOYEE">Employee (Limited Access)</option>
                  <option value="DEPARTMENT">Department (Standard Dashboard)</option>
                  <option value="ADMIN">Master Admin (Full System Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreateUser(false); setNewUserError(''); setNewUserSuccess(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
