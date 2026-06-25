import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from '../../api/tenant/projectApi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import ConfirmDialog from '../ui/ConfirmDialog';
import TaskForm from './TaskForm';
import { Plus, Edit3, Trash2, Calendar, User, Clock } from 'lucide-react';
import formatDate from '../../utils/formatDate';

const taskStatuses = [
  { key: 'todo', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700' },
  { key: 'review', label: 'Review', color: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700' },
  { key: 'done', label: 'Done', color: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700' },
];

const priorityColors = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

const ProjectDetail = ({ project, users, onUpdate, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks(project._id);
      setTasks(res.data.data || []);
    } catch { setMessage({ type: 'error', text: 'Failed to load tasks' }); }
    finally { setLoading(false); }
  }, [project._id]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const refreshAll = async () => {
    await fetchTasks();
    if (onUpdate) onUpdate();
  };

  const handleCreateTask = async (data) => {
    setSaving(true);
    try {
      await createTask(project._id, data);
      setShowTaskForm(false);
      setMessage({ type: 'success', text: 'Task created' });
      await refreshAll();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleUpdateTask = async (data) => {
    setSaving(true);
    try {
      await updateTask(editTask._id, data);
      setShowTaskForm(false); setEditTask(null);
      setMessage({ type: 'success', text: 'Task updated' });
      await refreshAll();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
      setMessage({ type: 'success', text: 'Task deleted' });
      await refreshAll();
    } catch { setMessage({ type: 'error', text: 'Delete failed' }); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setStatusLoading(taskId);
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
      await refreshAll();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update status' });
      await fetchTasks(); // Revert on error
    }
    setStatusLoading(null);
  };

  const tasksByStatus = (s) => tasks.filter(t => t.status === s);
  const doneCount = tasksByStatus('done').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto">
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Task Progress</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{doneCount} of {totalCount} tasks completed</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant={project.status === 'active' ? 'info' : project.status === 'completed' ? 'success' : 'default'}>{project.status.replace('_', ' ')}</Badge>
          <Badge variant={priorityColors[project.priority] || 'default'}>{project.priority}</Badge>
        </div>
        <Button size="sm" onClick={() => { setEditTask(null); setShowTaskForm(true); }}>
          <Plus size={14} className="mr-1" /> Add Task
        </Button>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {taskStatuses.map(st => (
          <div
            key={st.key}
            className={`rounded-lg border-2 p-3 min-h-[250px] ${st.color} ${st.border}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{st.label}</span>
              <span className="text-xs bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 font-semibold text-gray-500 dark:text-gray-400 shadow-sm">
                {tasksByStatus(st.key).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus(st.key).map(task => (
                <div
                  key={task._id}
                  className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  {/* Title + Edit/Delete */}
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex-1 pr-1">{task.title}</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setEditTask(task); setShowTaskForm(true); }}
                        className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edit"
                      ><Edit3 size={13} /></button>
                      <button
                        type="button"
                        onClick={() => setDeleteTaskId(task._id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Delete"
                      ><Trash2 size={13} /></button>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{task.description}</p>
                  )}

                  {/* Priority + Hours */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={priorityColors[task.priority] || 'default'}>{task.priority}</Badge>
                    {task.estimatedHours > 0 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> {task.estimatedHours}h</span>
                    )}
                  </div>

                  {/* Status Change Dropdown */}
                  <div className="mb-2">
                    <select
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newStatus = e.target.value;
                        if (newStatus !== task.status) {
                          handleStatusChange(task._id, newStatus);
                        }
                      }}
                      disabled={statusLoading === task._id}
                      className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="todo">📋 To Do</option>
                      <option value="in_progress">🔄 In Progress</option>
                      <option value="review">👀 Review</option>
                      <option value="done">✅ Done</option>
                    </select>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {task.dueDate && <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(task.dueDate)}</span>}
                    {task.assignedTo && <span className="flex items-center gap-1"><User size={11} /> {task.assignedTo.firstName}</span>}
                  </div>
                </div>
              ))}
              {tasksByStatus(st.key).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8 italic">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => { setShowTaskForm(false); setEditTask(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editTask ? 'Edit Task' : 'New Task'}</h3>
            <TaskForm
              initialData={editTask}
              users={users}
              onSubmit={editTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => { setShowTaskForm(false); setEditTask(null); }}
              saving={saving}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
      />
    </div>
  );
};

export default ProjectDetail;