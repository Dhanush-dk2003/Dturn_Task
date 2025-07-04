import React, { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import API from "../axios";
import { AuthContext } from "../contexts/AuthContext";
import { useMediaQuery } from 'react-responsive';


const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const isLargeScreen = useMediaQuery({ minWidth: 992 });

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 100000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get("/projects");
      const sorted = res.data.sort((a, b) => a.id - b.id);
      setProjects(sorted);

      const taskMap = {};
      for (const project of sorted) {
        const tasksRes = await API.get(`/tasks?projectId=${project.id}`);
        taskMap[project.id] = tasksRes.data;
      }
      setTasksByProject(taskMap);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const handlePageChange = (num) => setCurrentPage(num);

  const getStatusBadge = (status) => {
    const color =
      status === "TODO" ? "secondary" :
      status === "IN_PROGRESS" ? "info" :
      status === "DONE" ? "success" : "dark";
    return <span className={`badge bg-${color}`}>{status.replace("_", " ")}</span>;
  };

  return (
    <div className="d-flex flex-column flex-md-row">
      <Sidebar />
      <div
  className="flex-grow-1 px-3 py-4"
  style={{
    marginLeft: isLargeScreen ? '250px' : '0',
    marginRight: isLargeScreen ? '50px' : '0',
  }}
>
        <div className="container-fluid">
          <h1 className="mb-4 mt-4">{user?.name || "Manager"}'s Dashboard</h1>

          {/* Filters */}
          <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search projects"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "200px" }}
            />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: "180px" }}
            >
              <option value="">All Tasks</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Project Cards */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <>
              <div className="row g-3">
                {currentProjects.map((project) => (
                  <div key={project.id} className="col-12">
                    <div className="card p-3 shadow-sm">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                        <h4 className="mb-0">{project.name}</h4>
                        <div>
                          <strong>Status:</strong> {getStatusBadge(project.status)}
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered text-center">
                          <thead className="table-dark">
                            <tr>
                              <th>#</th>
                              <th>Task</th>
                              <th>Assigned To</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(tasksByProject[project.id] || [])
                              .filter((task) =>
                                !statusFilter || task.status === statusFilter
                              )
                              .map((task, i) => (
                                <tr key={task.id}>
                                  <td>{i + 1}</td>
                                  <td>{task.title}</td>
                                  <td>{task.user?.email || "Unassigned"}</td>
                                  <td>{getStatusBadge(task.status)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
