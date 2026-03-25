import React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { Project, Lead, User, ProjectType, ProjectStatus, LeadStatus } from '../types';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  LogOut,
  TrendingUp,
  Search,
  Loader2,
  ChevronRight,
  MoreVertical,
  X,
  ExternalLink,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import ConfirmationModal from '../components/ConfirmationModal';
import Fuse from 'fuse.js';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'projects' | 'leads' | 'users'>('overview');
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [user] = useAuthState(auth);

  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = React.useState(false);

  React.useEffect(() => {
    if (editingProject) {
      setGalleryUrls(editingProject.gallery || []);
    } else {
      setGalleryUrls([]);
    }
  }, [editingProject, isProjectModalOpen]);

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingImages(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(storage, `projects/gallery/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setGalleryUrls(prev => [...prev, ...urls]);
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      alert("Failed to upload some images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isLoading: false,
  });

  React.useEffect(() => {
    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]);
    });

    const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[]);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as unknown as User[]);
      setLoading(false);
    });

    return () => {
      unsubProjects();
      unsubLeads();
      unsubUsers();
    };
  }, []);

  const handleLogout = () => signOut(auth);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Leads', value: leads.filter(l => l.status === 'New').length, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Ongoing Projects', value: projects.filter(p => p.status === 'Ongoing').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Team Members', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const fuse = new Fuse(projects, {
      keys: ['title', 'location', 'type', 'status', 'description'],
      threshold: 0.3,
    });
    return fuse.search(searchQuery).map(result => result.item);
  }, [projects, searchQuery]);

  const filteredLeads = React.useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const fuse = new Fuse(leads, {
      keys: ['name', 'email', 'phone', 'requirement', 'status'],
      threshold: 0.3,
    });
    return fuse.search(searchQuery).map(result => result.item);
  }, [leads, searchQuery]);

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const fuse = new Fuse(users, {
      keys: ['displayName', 'email', 'role'],
      threshold: 0.3,
    });
    return fuse.search(searchQuery).map(result => result.item);
  }, [users, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">AVELTY ADMIN</span>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'projects', label: 'Projects', icon: Building2 },
            { id: 'leads', label: 'Leads', icon: MessageSquare },
            { id: 'users', label: 'Team', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSearchQuery('');
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-64 p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab} Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.displayName || 'Admin'}</p>
          </div>
          <div className="flex items-center space-x-4 flex-grow max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'projects' && (
              <button
                onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                <Plus className="h-5 w-5" /> Add Project
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Leads */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Recent Leads</h3>
                      <button onClick={() => setActiveTab('leads')} className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{lead.name}</div>
                              <div className="text-xs text-gray-500">{lead.email}</div>
                            </div>
                          </div>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            lead.status === 'New' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                          )}>
                            {lead.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ongoing Projects */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Ongoing Projects</h3>
                      <button onClick={() => setActiveTab('projects')} className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {projects.filter(p => p.status === 'Ongoing').slice(0, 5).map((project) => (
                        <div key={project.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-16 rounded-lg overflow-hidden shrink-0">
                              <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{project.title}</div>
                              <div className="text-xs text-gray-500">{project.location}</div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No projects found matching "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((project) => (
                          <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-14 rounded-lg overflow-hidden shrink-0">
                                <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="font-bold text-gray-900">{project.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{project.type}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              project.status === 'Ongoing' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                            )}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{project.location}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => { setEditingProject(project); setIsProjectModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete Project',
                                    message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
                                    isLoading: false,
                                    onConfirm: async () => {
                                      setConfirmModal(prev => ({ ...prev, isLoading: true }));
                                      try {
                                        await deleteDoc(doc(db, 'projects', project.id));
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                      } catch (error) {
                                        console.error("Error deleting project:", error);
                                      } finally {
                                        setConfirmModal(prev => ({ ...prev, isLoading: false }));
                                      }
                                    }
                                  });
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Requirement</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No leads found matching "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{lead.name}</div>
                            <div className="text-xs text-gray-500">{lead.email}</div>
                            <div className="text-xs text-gray-500">{lead.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">{lead.requirement}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={lead.status}
                              onChange={async (e) => await updateDoc(doc(db, 'leads', lead.id), { status: e.target.value })}
                              className="text-xs font-bold uppercase tracking-wider bg-gray-50 border-none rounded-full px-3 py-1 focus:ring-0"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Converted">Converted</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {lead.createdAt ? format(new Date((lead.createdAt as any).seconds * 1000), 'MMM dd, yyyy') : '...'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Lead',
                                  message: `Are you sure you want to delete the inquiry from "${lead.name}"? This action cannot be undone.`,
                                  isLoading: false,
                                  onConfirm: async () => {
                                    setConfirmModal(prev => ({ ...prev, isLoading: true }));
                                    try {
                                      await deleteDoc(doc(db, 'leads', lead.id));
                                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    } catch (error) {
                                      console.error("Error deleting lead:", error);
                                    } finally {
                                      setConfirmModal(prev => ({ ...prev, isLoading: false }));
                                    }
                                  }
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                            No team members found matching "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">{user.displayName || 'Unnamed'}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center text-xs text-green-600 font-medium">
                                <div className="h-1.5 w-1.5 bg-green-600 rounded-full mr-2" />
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  type: formData.get('type') as ProjectType,
                  status: formData.get('status') as ProjectStatus,
                  imageUrl: formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070',
                  timeline: formData.get('timeline') as string,
                  gallery: galleryUrls,
                  updatedAt: serverTimestamp(),
                };

                if (editingProject) {
                  await updateDoc(doc(db, 'projects', editingProject.id), data);
                } else {
                  await addDoc(collection(db, 'projects'), { ...data, createdAt: serverTimestamp() });
                }
                setIsProjectModalOpen(false);
              }}
              className="p-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Project Title</label>
                  <input name="title" defaultValue={editingProject?.title} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none" placeholder="Luxury Villa" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Location</label>
                  <input name="location" defaultValue={editingProject?.location} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none" placeholder="Beverly Hills, CA" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <textarea name="description" defaultValue={editingProject?.description} required rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none" placeholder="Describe the project details..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Type</label>
                  <select name="type" defaultValue={editingProject?.type || 'Residential'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white">
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Roads">Roads</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Status</label>
                  <select name="status" defaultValue={editingProject?.status || 'Ongoing'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white">
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Timeline</label>
                  <input name="timeline" defaultValue={editingProject?.timeline} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none" placeholder="2024 - 2026" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Image URL</label>
                <input name="imageUrl" defaultValue={editingProject?.imageUrl} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none" placeholder="https://images.unsplash.com/..." />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">Project Gallery</label>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
                    <Upload className="h-4 w-4" />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                      disabled={uploadingImages}
                    />
                  </label>
                </div>

                {uploadingImages && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading gallery images...
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryUrls(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {galleryUrls.length === 0 && !uploadingImages && (
                    <div className="col-span-full py-8 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-xs">No gallery images uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};

export default AdminDashboard;
