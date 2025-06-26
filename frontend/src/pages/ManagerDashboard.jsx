import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import API from '../axios';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('/projects');
      setProjects(res.data);

      const taskMap = {};
      for (const project of res.data) {
        try {
          const taskRes = await API.get(`/tasks?projectId=${project.id}`);
          taskMap[project.id] = taskRes.data;
        } catch {
          taskMap[project.id] = [];
        }
      }
      setTasksByProject(taskMap);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects; // add filter if needed
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
      <div className="flex-shrink-0 d-none d-md-block" style={{ width: '200px' }}></div>
      <div className="flex-grow-1" style={{ marginLeft: '200px' }}>
        <div className="container-fluid p-3">
          <h2 className="mb-4">Manager's Dashboard</h2>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {currentProjects.map(project => (
                  <div key={project.id} className="col-12">
                    <div className="card p-3 shadow-sm">
                      <h5>{project.name}</h5>
                      <p>Status: <strong>{project.status}</strong></p>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-dark">
                            <tr>
                              <th>#</th>
                              <th>Task</th>
                              <th>Assigned To</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(tasksByProject[project.id] || []).map((task, i) => (
                              <tr key={task.id}>
                                <td>{i + 1}</td>
                                <td>{task.title}</td>
                                <td>{task.user?.email || 'Unassigned'}</td>
                                <td>{task.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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

export default ManagerDashboard;
