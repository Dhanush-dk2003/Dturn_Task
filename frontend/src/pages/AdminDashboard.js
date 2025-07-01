import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import API from "../axios";
import { AuthContext } from "../contexts/AuthContext";
import { useMediaQuery } from 'react-responsive';
import Snackbar from "../components/Snackbar"; // Assuming you have a Snackbar component

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [tasksByProject, setTasksByProject] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showInputBox, setShowInputBox] = useState(false);
  const projectsPerPage = 3;
  const isLargeScreen = useMediaQuery({ minWidth: 992 });
  const [snackbarMessage, setSnackbarMessage] = useState("");
const [showSnackbar, setShowSnackbar] = useState(false);
const [snackbarType, setSnackbarType] = useState("success");


  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data.sort((a, b) => a.id - b.id));
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
      console.error("Fetch error:", err);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const handleCreateProject = async () => {
  if (!newProject.trim()) return;
  setLoading(true);
  try {
    await API.post("/projects", { name: newProject });
    setNewProject("");
    await fetchProjects();
    setTimeout(() => setShowInputBox(false), 1000);

    setSnackbarMessage("Project added successfully!");
    setSnackbarType("success");
    setShowSnackbar(true);
  } catch (err) {
    console.error("Add project error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCreateProject();
    }
  };
const handleDeleteProject = async (id) => {
  if (!window.confirm("Delete this project?")) return;
  setLoading(true);
  try {
    await API.delete(`/projects/${id}`);
    await fetchProjects();

    setSnackbarMessage("Project deleted successfully!");
    setSnackbarType("success");
    setShowSnackbar(true);
  } catch (err) {
    console.error("Delete error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleDeleteTask = async (taskId) => {
  if (!window.confirm("Delete this task?")) return;
  setLoading(true);
  try {
    await API.delete(`/tasks/${taskId}`);
    await fetchProjects();

    setSnackbarMessage("Task deleted successfully!");
    setSnackbarType("success");
    setShowSnackbar(true);
  } catch (err) {
    console.error("Task delete error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleProjectStatusChange = async (projectId, newStatus) => {
  try {
    await API.put(`/projects/${projectId}`, { status: newStatus });
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, status: newStatus } : project
      )
    );
    setSnackbarMessage("Project status updated successfully!");
    setSnackbarType("success");
    setShowSnackbar(true);
  } catch (err) {
    console.error("Update status error:", err);
  }
};


  const handleAddTaskRow = (projectId) => {
    setTasksByProject((prev) => ({
      ...prev,
      [projectId]: [
        ...(prev[projectId] || []),
        {
          id: Date.now(),
          title: "",
          userEmail: "",
          status: "TODO",
          isNew: true,
        },
      ],
    }));
  };

  const handleTaskChange = (projectId, index, field, value) => {
    const updatedTasks = [...tasksByProject[projectId]];
    updatedTasks[index][field] = value;
    setTasksByProject((prev) => ({ ...prev, [projectId]: updatedTasks }));
  };

  const handleAssignTasks = async (projectId) => {
  const tasksToAssign = tasksByProject[projectId].filter((t) => t.isNew);

  if (tasksToAssign.length === 0) {
    setSnackbarMessage("No new tasks to assign!");
    setSnackbarType("warning");
    setShowSnackbar(true);
    return;
  }

  setLoading(true);
  try {
    for (const task of tasksToAssign) {
      await API.post("/tasks", {
        title: task.title,
        projectName: projects.find((p) => p.id === projectId).name,
        userEmail: task.userEmail,
        status: task.status || "TODO",
      });
    }

    await fetchProjects();

    setSnackbarMessage("Tasks assigned successfully!");
    setSnackbarType("success");
    setShowSnackbar(true);
  } catch (err) {
    console.error("Assign tasks error:", err);
  } finally {
    setLoading(false);
  }
};



  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  return (
    <div className="d-flex flex-column flex-md-row" >
      <Sidebar />
      <div
  className="flex-grow-1 px-3 py-4"
  style={{
    marginLeft: isLargeScreen ? '250px' : '0',
    marginRight: isLargeScreen ? '50px' : '0',
  }}
>

        <div className="container-fluid">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
            <h1 className="mb-4  mt-4">{user?.name || "Admin"}'s Dashboard</h1>
            {!showInputBox && (
              <button
                className="btn btn-primary"
                onClick={() => setShowInputBox(true)}
              >
                + Add Project
              </button>
            )}
          </div>

          {showInputBox && (
            <div className="row justify-content-end mb-3">
              <div className="col-md-6 d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Project name"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus
                />
                <button className="btn btn-success" onClick={handleCreateProject}>Add</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowInputBox(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="row mb-3 justify-content-end">
            <div className="col-md-6 d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Tasks</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {currentProjects.map((project) => (
                  <div key={project.id} className="col-12">
                    <div className="card shadow-sm p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2 position-relative">
  <h5 className="mb-0">{project.name}</h5>
  <div
  className="d-flex flex-row align-items-center gap-2 mt-5"
  style={{ minWidth: "200px"}}
>
  <span className="fw-semibold mt-1">Status:</span>
  <select
    className="form-select mt-1"
    style={{ maxWidth: "160px" }}
    value={project.status}
    onChange={(e) => handleProjectStatusChange(project.id, e.target.value)}
  >
    <option value="TODO">Todo</option>
    <option value="IN_PROGRESS">In Progress</option>
    <option value="DONE">Done</option>
  </select>
</div>


  <button
    type="button"
    className="btn-close position-absolute"
    aria-label="Close"
    style={{ top: "5px", right: "5px" }}
    onClick={() => handleDeleteProject(project.id)}
  ></button>
</div>


                      <div className="table-responsive">
                        <table className="table table-bordered text-center">
                          <thead className="table-dark">
                            <tr>
                              <th>S.No</th>
                              <th>Task</th>
                              <th>Assigned To</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(tasksByProject[project.id] || [])
                              .filter((task) => !statusFilter || task.status === statusFilter)
                              .map((task, index) => (
                                <tr key={task.id || index}>
                                  <td>{index + 1}</td>
                                  <td>
                                    {task.isNew ? (
                                      <input
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

                      <div className="d-flex justify-content-between mt-3">
                        <button className="btn btn-outline-secondary" onClick={() => handleAddTaskRow(project.id)}>
                          + Task
                        </button>
                        <button className="btn btn-outline-success" onClick={() => handleAssignTasks(project.id)}>
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          <Snackbar
  message={snackbarMessage}
  show={showSnackbar}
  onClose={() => setShowSnackbar(false)}
  type={snackbarType}
/>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
