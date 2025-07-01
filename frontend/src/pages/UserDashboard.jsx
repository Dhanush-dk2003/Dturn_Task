import React, { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import API from "../axios";
import { AuthContext } from "../contexts/AuthContext";
import { useMediaQuery } from 'react-responsive';
import Snackbar from "../components/Snackbar"; // Assuming you have a Snackbar component


const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const isLargeScreen = useMediaQuery({ minWidth: 992 });
  const [snackbarMessage, setSnackbarMessage] = useState("");
const [showSnackbar, setShowSnackbar] = useState(false);



  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tasks/user");
      const grouped = {};

      res.data.forEach((task) => {
        const projectId = task.project?.id;
        const projectName = task.project?.name || "Unknown Project";
        if (!grouped[projectId]) {
          grouped[projectId] = { projectName, tasks: [] };
        }
        grouped[projectId].tasks.push({ ...task, updatedStatus: task.status });
      });

      setTasksByProject(grouped);
    } catch (err) {
      console.error("Error fetching user tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeLocal = (projectId, index, value) => {
    const updated = { ...tasksByProject };
    updated[projectId].tasks[index].updatedStatus = value;
    setTasksByProject(updated);
  };

  const handleSubmitTask = async (taskId, newStatus) => {
  try {
    await API.put(`/tasks/${taskId}`, { status: newStatus });
    setTasksByProject((prev) => {
      const updated = { ...prev };
      for (const pid in updated) {
        const idx = updated[pid].tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          updated[pid].tasks[idx].status = newStatus;
          updated[pid].tasks[idx].updatedStatus = newStatus;
        }
      }
      return updated;
    });
    setSnackbarMessage("Task status updated successfully!");
    setShowSnackbar(true);
  } catch (err) {
    console.error("Error updating task status:", err);
  }
};


  const filteredEntries = Object.entries(tasksByProject).filter(([_, data]) =>
    data.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntries.length / projectsPerPage);
  const indexOfLast = currentPage * projectsPerPage;
  const indexOfFirst = indexOfLast - projectsPerPage;
  const currentProjects = filteredEntries.slice(indexOfFirst, indexOfLast);

  return (
    <div className="d-flex">
      <Sidebar />
     <div
  className="flex-grow-1 px-3 py-4"
  style={{
    marginLeft: isLargeScreen ? '250px' : '0',
    marginRight: isLargeScreen ? '50px' : '0',
  }}
>
        <div className="container-fluid">
          <h1 className="mb-4 mt-4">{user?.name || "User"}'s Dashboard</h1>

          {/* Filters */}
          <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mb-3">
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

          {/* Task Cards */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <>
              {currentProjects.map(([projectId, data]) => {
                const filteredTasks = data.tasks.filter((task) => {
                  const matchesStatus =
                    !statusFilter || task.updatedStatus === statusFilter;
                  const matchesSearch =
                    !searchTerm ||
                    task.title.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesStatus && matchesSearch;
                });

                if (filteredTasks.length === 0) return null;

                return (
                  <div key={projectId} className="card p-3 mb-4 shadow-sm">
                    <h4 className="mb-3">{data.projectName}</h4>
                    <div className="table-responsive">
                      <table className="table table-bordered text-center align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th>S.No</th>
                            <th>Task</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.map((task, i) => (
                            <tr key={task.id}>
                              <td>{i + 1}</td>
                              <td>{task.title}</td>
                              <td>
                                <select
                                  className="form-select"
                                  style={{ maxWidth: "160px", margin: "auto" }}
                                  value={task.updatedStatus}
                                  onChange={(e) =>
                                    handleStatusChangeLocal(projectId, i, e.target.value)
                                  }
                                >
                                  <option value="TODO">TODO</option>
                                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                                  <option value="DONE">DONE</option>
                                </select>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() =>
                                    handleSubmitTask(task.id, task.updatedStatus)
                                  }
                                >
                                  Submit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

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
                          onClick={() => setCurrentPage(i + 1)}
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
          <Snackbar
  message={snackbarMessage}
  show={showSnackbar}
  onClose={() => setShowSnackbar(false)}
/>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
