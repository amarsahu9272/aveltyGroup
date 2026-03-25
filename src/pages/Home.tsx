import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Home, Map, HardHat, CheckCircle2, Users, Award, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070"
            alt="Modern Building"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-7xl font-bold text-white tracking-tight mb-6"
          >
            Building the Future of <br />
            <span className="text-blue-500">Infrastructure</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            Avelty Group delivers world-class construction and real estate solutions. From residential homes to large-scale infrastructure projects.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/projects"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              View Our Projects <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get a Quote
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We specialize in a wide range of construction services, ensuring quality and excellence in every project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Residential Buildings', icon: Home, desc: 'Crafting dream homes and modern residential complexes.' },
              { title: 'Commercial Spaces', icon: Building2, desc: 'Designing functional and aesthetic office and retail spaces.' },
              { title: 'Road Construction', icon: Map, desc: 'Building durable roads and highways for better connectivity.' },
              { title: 'Infrastructure', icon: HardHat, desc: 'Developing essential public infrastructure and utilities.' },
            ].map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Projects Completed', value: '150+', icon: CheckCircle2 },
              { label: 'Happy Clients', value: '200+', icon: Users },
              { label: 'Awards Won', value: '25+', icon: Award },
              { label: 'Years Experience', value: '15+', icon: Briefcase },
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <stat.icon className="h-8 w-8 mx-auto mb-4 opacity-80" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">Ready to start your next project?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Contact us today for a free consultation and quote. Let's build something amazing together.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors gap-2"
          >
            Contact Avelty Group <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
