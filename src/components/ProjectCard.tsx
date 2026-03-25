import React from 'react';
import { Project } from '../types';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070'}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
            project.status === 'Ongoing' ? "bg-blue-500 text-white" : "bg-green-500 text-white"
          )}>
            {project.status}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 uppercase tracking-wider">
            {project.type}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span>{project.location}</span>
          </div>
          {project.timeline && (
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{project.timeline}</span>
            </div>
          )}
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors gap-1"
        >
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
