import React from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Project, ProjectType, ProjectStatus } from '../types';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const ProjectsPage = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<ProjectType | 'All'>('All');
  const [filterStatus, setFilterStatus] = React.useState<ProjectStatus | 'All'>('All');

  React.useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(loading => false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || project.type === filterType;
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">Our Projects</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our portfolio of residential, commercial, and infrastructure projects across the region.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="All">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Roads">Roads</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="All">All Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
