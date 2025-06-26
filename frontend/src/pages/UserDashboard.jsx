import React, { useEffect, useState, useContext } from 'react';
import Sidebar from './Sidebar';
import API from '../axios';
import { AuthContext } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/tasks/user');
      const grouped = {};

      res.data.forEach(task => {
        const projectId = task.project?.id;
        const projectName = task.project?.name || 'Unknown Project';
        if (!grouped[projectId]) {
          grouped[projectId] = {
            projectName,
            tasks: []
          };
        }
        grouped[projectId].tasks.push({
          ...task,
          updatedStatus: task.status
        });
      });

      setTasksByProject(grouped);
    } catch (err) {
      console.error('Error fetching user tasks:', err);
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
      console.error('Error updating task status:', err);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: '250px', padding: '20px' }}>
        <h4 className="fw-bold mb-4">{user?.name || 'User'}'s Dashboard</h4>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          Object.entries(tasksByProject).map(([projectId, data], i) => (
            <div key={projectId} className="card p-3 mb-4 shadow-sm rounded-4">
              <h5 className="fw-semibold mb-3">{data.projectName}</h5>
              <div className="table-responsive">
                <table className="table table-bordered text-center align-middle">
                  <thead className="table-dark text-white">
                    <tr>
                      <th>S.No</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Submit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tasks.map((task, index) => (
                      <tr key={task.id}>
                        <td>{index + 1}</td>
                        <td>{task.title}</td>
                        <td>
                          <select
                            className="form-select"
                            value={task.updatedStatus}
                            onChange={(e) =>
                              handleStatusChangeLocal(projectId, index, e.target.value)
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
          ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
