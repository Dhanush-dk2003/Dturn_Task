import React, { useEffect, useState, useContext } from "react";

import Sidebar from "./Sidebar";
import API from "../axios";
import { AuthContext } from "../contexts/AuthContext";

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get("/projects");
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
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ); // add filter if needed
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "TODO":
        return "secondary";
      case "IN_PROGRESS":
        return "info";
      case "DONE":
        return "success";
      default:
        return "dark";
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-shrink-0 d-none d-md-block"
        style={{ width: "200px" }}
      ></div>
      <div
        className="flex-grow-1 d-flex flex-column min-vh-100"
        style={{ marginLeft: "80px", marginRight: "50px" }}
      >
        <div className="container-fluid p-3">
          <h2 className="mb-4">{user?.name || "Manager"}'s Dashboard</h2>
          <div className="d-flex justify-content-end mb-3">
            <div className="d-flex flex-column flex-md-row gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "200px" }}
              />
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ maxWidth: "150px" }}
              >
                <option value="">All Tasks</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {currentProjects.map((project) => (
                  <div key={project.id} className="col-12">
                    <div className="card p-3 shadow-sm">
                      <h5>{project.name}</h5>
                      <p>
                        Status:{" "}
                        <span
                          className={`badge bg-${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </p>

                      <div className="table-responsive">
                        <table className="table table-bordered text-center">
                          <thead className="table-dark">
                            <tr>
                              <th>S.No</th>
                              <th>Task</th>
                              <th>Assigned To</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(tasksByProject[project.id] || [])
                              .filter(
                                (task) =>
                                  !statusFilter || task.status === statusFilter
                              )
                              .map((task, i) => (
                                <tr key={task.id}>
                                  <td>{i + 1}</td>
                                  <td>{task.title}</td>
                                  <td>{task.user?.email || "Unassigned"}</td>
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
              {totalPages > 1 && (
                <div
                  className="d-flex justify-content-center mt-4"
                  style={{ marginTop: "auto" }}
                >
                  <nav>
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
                  </nav>
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
