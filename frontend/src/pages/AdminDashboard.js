import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import API from '../axios';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState('');
  const [tasksByProject, setTasksByProject] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
      const taskMap = {};
      for (const project of res.data) {
        try {
          const tasks = await API.get(`/tasks?projectId=${project.id}`);
          taskMap[project.id] = tasks.data;
        } catch {
          taskMap[project.id] = [];
        }
      }
      setTasksByProject(taskMap);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setTimeout(() => setLoading(false), 250); // Delay to avoid flicker
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.trim()) return;
    setLoading(true);
    try {
      await API.post('/projects', { name: newProject });
      setNewProject('');
      await fetchProjects();
    } catch (err) {
      console.error('Add project error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setLoading(true);
    try {
      await API.delete(`/projects/${id}`);
      await fetchProjects();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await API.delete(`/tasks/${taskId}`);
      await fetchProjects();
    } catch (err) {
      console.error('Task delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectStatusChange = async (projectId, newStatus) => {
  try {
    await API.put(`/projects/${projectId}`, { status: newStatus });

    // Update only the changed project locally
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId ? { ...project, status: newStatus } : project
      )
    );
  } catch (err) {
    console.error('Update status error:', err);
  }
};



  const handleAddTaskRow = (projectId) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), { id: Date.now(), title: '', userEmail: '', status: 'TODO', isNew: true }]
    }));
  };

  const handleTaskChange = (projectId, index, field, value) => {
    const updatedTasks = [...tasksByProject[projectId]];
    updatedTasks[index][field] = value;
    setTasksByProject((prev) => ({ ...prev, [projectId]: updatedTasks }));
  };

  const handleAssignTasks = async (projectId) => {
    setLoading(true);
    try {
      const tasksToAssign = tasksByProject[projectId].filter(t => t.isNew);
      for (const task of tasksToAssign) {
        await API.post('/tasks', {
          title: task.title,
          projectName: projects.find(p => p.id === projectId).name,
          userEmail: task.userEmail,
          status: task.status || 'TODO'
        });
      }
      await fetchProjects();
    } catch (err) {
      console.error('Assign tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: '250px', padding: '20px' }}>
        <div className="container-fluid">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <h2 className="mb-0">Admin's Dashboard</h2>
            <div className="d-flex flex-column flex-md-row gap-2 w-50 w-md-50">
              <input
                type="text"
                className="form-control"
                placeholder="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="New Project Name"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleCreateProject}>+ Add Project</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {currentProjects.map((project) => (
                  <div key={project.id} className="col-12">
                    <div className="card p-3 shadow-sm">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                        <h5 className="mb-0">{project.name}</h5>
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
                          <select
                            value={project.status}
                            onChange={(e) => handleProjectStatusChange(project.id, e.target.value)}
                            className="form-select"
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-dark">
                            <tr>
                              <th>S.No</th>
                              <th>Tasks</th>
                              <th>Assigned To</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(tasksByProject[project.id] || []).map((task, index) => (
                              <tr key={task.id || index}>
                                <td>{index + 1}</td>
                                <td>
                                  {task.isNew ? (
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={task.title}
                                      onChange={(e) => handleTaskChange(project.id, index, 'title', e.target.value)}
                                    />
                                  ) : (
                                    task.title
                                  )}
                                </td>
                                <td>
                                  {task.isNew ? (
                                    <input
                                      type="email"
                                      className="form-control"
                                      value={task.userEmail}
                                      onChange={(e) => handleTaskChange(project.id, index, 'userEmail', e.target.value)}
                                    />
                                  ) : (
                                    task.user?.email || task.userEmail || 'Unassigned'
                                  )}
                                </td>
                                <td>{task.status}</td>
                                <td>
                                  {!task.isNew && (
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDeleteTask(task.id)}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-3">
                        <button className="btn btn-outline-secondary" onClick={() => handleAddTaskRow(project.id)}>+ Task</button>
                        <button className="btn btn-outline-success" onClick={() => handleAssignTasks(project.id)}>Assign</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
