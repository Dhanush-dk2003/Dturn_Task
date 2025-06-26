import React, { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import API from "../axios";
import { AuthContext } from "../contexts/AuthContext";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
          grouped[projectId] = {
            projectName,
            tasks: [],
          };
        }
        grouped[projectId].tasks.push({
          ...task,
          updatedStatus: task.status,
        });
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
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-grow-1"
        style={{ marginLeft: "250px", padding: "20px" }}
      >
        <h4 className="fw-bold mb-4">{user?.name || "User"}'s Dashboard</h4>

        {/* Filters */}
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

        {/* Loader */}
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          Object.entries(tasksByProject).map(([projectId, data]) => {
            // Apply task-level filtering
            const filteredTasks = data.tasks.filter((task) => {
              const matchesStatus =
                !statusFilter || task.updatedStatus === statusFilter;
              const matchesSearch =
                !searchTerm ||
                data.projectName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                task.title.toLowerCase().includes(searchTerm.toLowerCase());

              return matchesStatus && matchesSearch;
            });

            // Skip project if no task matches after filtering
            if (filteredTasks.length === 0) return null;

            return (
              <div
                key={projectId}
                className="card p-3 mb-4 shadow-sm rounded-4"
              >
                <h5 className="fw-semibold mb-3">{data.projectName}</h5>
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle text-center">
                    <thead className="table-dark text-white">
                      <tr>
                        <th>S.No</th>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Submit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task, index) => (
                        <tr key={task.id}>
                          <td>{index + 1}</td>
                          <td>{task.title}</td>
                          <td>
                            <select
                              className="form-select"
                              value={task.updatedStatus}
                              onChange={(e) =>
                                handleStatusChangeLocal(
                                  projectId,
                                  index,
                                  e.target.value
                                )
                              }
                            >
                              <option value="TODO">TODO</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="DONE">Completed</option>
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
          })
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
