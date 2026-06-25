import { useState, useEffect, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject, getProjectStats } from '../../api/tenant/projectApi';
import { getContacts } from '../../api/tenant/contactsApi';
import { getUsers } from '../../api/tenant/usersApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Card from '../../components/ui/Card';
import { Plus, Edit3, Trash2, Eye, FolderKanban, Calendar, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import ProjectForm from '../../components/projects/ProjectForm';
import ProjectDetail from '../../components/projects/ProjectDetail';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusColors = { planning: 'default', active: 'info', on_hold: 'warning', completed: 'success', cancelled: 'danger' };
const priorityColors = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const [projRes, statsRes] = await Promise.all([getProjects(), getProjectStats()]);
      setProjects(projRes.data.data || []);
      setStats(statsRes.data.data);
    } catch { setMessage({ type: 'error', text: 'Failed to load projects' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchProjects();
    getContacts().then(res => setContacts(res.data.data || [])).catch(() => {});
    getUsers().then(res => setUsers(res.data.data || [])).catch(() => {});
  }, [fetchProjects]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createProject(data);
      setShowForm(false);
      setMessage({ type: 'success', text: 'Project created' });
      fetchProjects();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateProject(editProject._id, data);
      setShowForm(false); setEditProject(null);
      setMessage({ type: 'success', text: 'Project updated' });
      fetchProjects();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteId);
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Project deleted' });
      fetchProjects();
    } catch { setMessage({ type: 'error', text: 'Delete failed' }); }
  };

  const handleViewClose = () => {
    setViewProject(null);
    fetchProjects(); // Refresh when closing detail modal
  };

  const completionPercent = (p) => p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0;

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stats?.totalProjects || 0} projects · {stats?.totalTasks || 0} tasks</p>
        </div>
        <Button onClick={() => { setEditProject(null); setShowForm(true); }}>
          <Plus size={16} className="mr-1" /> New Project
        </Button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <FolderKanban size={20} className="text-primary-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Active</p><p className="text-lg font-bold text-gray-900 dark:text-white">{stats.projectStatusCounts?.active || 0}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Completed</p><p className="text-lg font-bold text-gray-900 dark:text-white">{stats.projectStatusCounts?.completed || 0}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <DollarSign size={20} className="text-amber-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalBudget)}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <Calendar size={20} className="text-purple-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Completion</p><p className="text-lg font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p></div>
          </div>
        </div>
      )}

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <Card key={p._id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewProject(p)}>
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</h3>
                {p.client && <p className="text-xs text-gray-500 dark:text-gray-400">{p.client.companyName}</p>}
              </div>
              <div className="flex gap-0.5 ml-2 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setEditProject(p); setShowForm(true); }} className="p-1 text-gray-400 hover:text-primary-500" title="Edit"><Edit3 size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(p._id); }} className="p-1 text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={12} /></button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <Badge variant={statusColors[p.status]}>{p.status.replace('_', ' ')}</Badge>
              <Badge variant={priorityColors[p.priority]}>{p.priority}</Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{p.doneCount || 0}/{p.taskCount || 0} tasks</span>
                <span className="font-medium">{completionPercent(p)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent(p)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              {p.startDate && <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(p.startDate)}</span>}
              {p.manager && <span className="flex items-center gap-1"><Users size={10} /> {p.manager.firstName}</span>}
              {p.budget > 0 && <span className="flex items-center gap-1"><DollarSign size={10} /> {formatCurrency(p.budget)}</span>}
            </div>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Create your first project to get started</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditProject(null); }} title={editProject ? 'Edit Project' : 'New Project'} size="lg">
        <ProjectForm
          initialData={editProject}
          contacts={contacts}
          users={users}
          onSubmit={editProject ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditProject(null); }}
          saving={saving}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!viewProject} onClose={handleViewClose} title={viewProject?.name || 'Project'} size="xl">
        {viewProject && <ProjectDetail project={viewProject} users={users} onUpdate={fetchProjects} onClose={handleViewClose} />}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Project" message="Are you sure? All tasks will also be deleted." />
    </div>
  );
};

export default ProjectsPage;