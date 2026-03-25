import React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { Project, Lead, User, ProjectType, ProjectStatus, LeadStatus, Notification } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
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
  Upload,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import ConfirmationModal from '../components/ConfirmationModal';
import Fuse from 'fuse.js';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'projects' | 'leads' | 'users' | 'notifications'>('overview');
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [user] = useAuthState(auth);

  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  const [mainImageUrl, setMainImageUrl] = React.useState<string>('');
  const [uploadingImages, setUploadingImages] = React.useState(false);
  const [uploadingMainImage, setUploadingMainImage] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{ [key: string]: number }>({});
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isGalleryViewOpen, setIsGalleryViewOpen] = React.useState(false);
  const [projectDetailTab, setProjectDetailTab] = React.useState<'gallery' | 'history'>('gallery');
  const [viewingProject, setViewingProject] = React.useState<Project | null>(null);

  React.useEffect(() => {
    if (editingProject) {
      setGalleryUrls(editingProject.gallery || []);
      setMainImageUrl(editingProject.imageUrl || '');
    } else {
      setGalleryUrls([]);
      setMainImageUrl('');
    }
  }, [editingProject, isProjectModalOpen]);

  const handleMainImageUpload = async (file: File) => {
    setUploadingMainImage(true);
    const storageRef = ref(storage, `projects/main/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error("Error uploading main image:", error);
        alert("Failed to upload main image.");
        setUploadingMainImage(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setMainImageUrl(downloadURL);
        setUploadingMainImage(false);
      }
    );
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingImages(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileId = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `projects/gallery/${fileId}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(prev => {
              const next = { ...prev };
              delete next[fileId];
              return next;
            });
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
    if (!user) return;

    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as unknown as User[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubNotifications = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => {
      unsubProjects();
      unsubLeads();
      unsubUsers();
      unsubNotifications();
    };
  }, [user]);

  const handleLogout = () => signOut(auth);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Leads', value: leads.filter(l => l.status === 'New').length, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Unread Alerts', value: notifications.filter(n => !n.read).length, icon: Bell, color: 'text-red-600', bg: 'bg-red-100' },
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

  const filteredNotifications = React.useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const fuse = new Fuse(notifications, {
      keys: ['title', 'message', 'type'],
      threshold: 0.3,
    });
    return fuse.search(searchQuery).map(result => result.item);
  }, [notifications, searchQuery]);

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
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.read).length },
              { id: 'users', label: 'Team', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    activeTab === item.id ? "bg-white text-blue-600" : "bg-red-500 text-white"
                  )}>
                    {item.badge}
                  </span>
                ) : null}
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
                                onClick={() => { setViewingProject(project); setProjectDetailTab('gallery'); setIsGalleryViewOpen(true); }}
                                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                title="View Details"
                              >
                                <ImageIcon className="h-5 w-5" />
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
                                        handleFirestoreError(error, OperationType.DELETE, `projects/${project.id}`);
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
                              onChange={async (e) => {
                                try {
                                  await updateDoc(doc(db, 'leads', lead.id), { status: e.target.value });
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.UPDATE, `leads/${lead.id}`);
                                }
                              }}
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

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Recent Alerts</h3>
                  <button 
                    onClick={async () => {
                      const unread = notifications.filter(n => !n.read);
                      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
                    }}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      No notifications found
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-6 flex items-start justify-between hover:bg-gray-50 transition-colors",
                          !notification.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            notification.type === 'new_lead' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {notification.type === 'new_lead' ? <MessageSquare className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-gray-900">{notification.title}</div>
                              {!notification.read && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {notification.createdAt ? format(new Date((notification.createdAt as any).seconds * 1000), 'MMM dd, HH:mm') : '...'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button 
                              onClick={() => updateDoc(doc(db, 'notifications', notification.id), { read: true })}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteDoc(doc(db, 'notifications', notification.id))}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
                const newStatus = formData.get('status') as ProjectStatus;
                const data: any = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  location: formData.get('location') as string,
                  type: formData.get('type') as ProjectType,
                  status: newStatus,
                  imageUrl: mainImageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070',
                  timeline: formData.get('timeline') as string,
                  gallery: galleryUrls,
                  updatedAt: serverTimestamp(),
                };

                try {
                  if (editingProject) {
                    if (editingProject.status !== newStatus) {
                      data.statusHistory = arrayUnion({
                        status: newStatus,
                        updatedAt: new Date().toISOString(),
                        updatedBy: auth.currentUser?.displayName || auth.currentUser?.email || 'System',
                        comment: `Status updated from ${editingProject.status} to ${newStatus}`
                      });

                      // Add notification for status change
                      await addDoc(collection(db, 'notifications'), {
                        type: 'project_status_change',
                        title: 'Project Status Updated',
                        message: `Project "${data.title}" status changed to ${newStatus}`,
                        relatedId: editingProject.id,
                        createdAt: serverTimestamp(),
                        read: false
                      });
                    }
                    await updateDoc(doc(db, 'projects', editingProject.id), data);
                  } else {
                    data.statusHistory = [{
                      status: newStatus,
                      updatedAt: new Date().toISOString(),
                      updatedBy: auth.currentUser?.displayName || auth.currentUser?.email || 'System',
                      comment: 'Project created'
                    }];
                    await addDoc(collection(db, 'projects'), { ...data, createdAt: serverTimestamp() });
                  }
                  setIsProjectModalOpen(false);
                } catch (error) {
                  handleFirestoreError(error, editingProject ? OperationType.UPDATE : OperationType.CREATE, editingProject ? `projects/${editingProject.id}` : 'projects');
                }
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
                <label className="text-sm font-bold text-gray-700">Main Project Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-40 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {mainImageUrl ? (
                      <img src={mainImageUrl} alt="Main" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    )}
                    {uploadingMainImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
                      <Upload className="h-4 w-4" />
                      <span>{mainImageUrl ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleMainImageUpload(e.target.files[0])}
                        disabled={uploadingMainImage}
                      />
                    </label>
                    <p className="text-[10px] text-gray-400">Recommended: 1920x1080px. Max 5MB.</p>
                  </div>
                </div>
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

                {Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([id, progress]) => (
                      <div key={id} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span className="truncate max-w-[200px]">{id.split('_').slice(1).join('_')}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 cursor-zoom-in" onClick={() => setSelectedImage(url)}>
                      <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setGalleryUrls(prev => prev.filter((_, i) => i !== index)); }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
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

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[260]"
          >
            <X className="h-8 w-8 text-white" />
          </button>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {isGalleryViewOpen && viewingProject && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingProject.title}</h2>
                <p className="text-sm text-gray-500">{viewingProject.location}</p>
              </div>
              <button onClick={() => setIsGalleryViewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setProjectDetailTab('gallery')}
                className={cn(
                  "px-6 py-3 text-sm font-bold border-b-2 transition-all",
                  projectDetailTab === 'gallery' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Gallery
              </button>
              <button
                onClick={() => setProjectDetailTab('history')}
                className={cn(
                  "px-6 py-3 text-sm font-bold border-b-2 transition-all",
                  projectDetailTab === 'history' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Status History
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {projectDetailTab === 'gallery' ? (
                viewingProject.gallery && viewingProject.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingProject.gallery.map((url, idx) => (
                      <div 
                        key={idx} 
                        className="relative aspect-video rounded-2xl overflow-hidden cursor-zoom-in group shadow-sm hover:shadow-md transition-all"
                        onClick={() => setSelectedImage(url)}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Search className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p>No images in this project's gallery</p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {viewingProject.statusHistory && viewingProject.statusHistory.length > 0 ? (
                    viewingProject.statusHistory.slice().reverse().map((entry, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative pl-10">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-100 rounded-full" />
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            entry.status === 'Completed' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {entry.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(entry.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{entry.comment}</p>
                        <p className="text-[10px] text-gray-500">Updated by: {entry.updatedBy}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                      <Clock className="h-12 w-12 mb-4 opacity-20" />
                      <p>No status history available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end bg-white">
              <button 
                onClick={() => setIsGalleryViewOpen(false)}
                className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
