import React from 'react';
import { motion } from 'motion/react';
import { Award, Users, Target, ShieldCheck, HardHat, Building2, Map, Home } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-24 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070"
            alt="Construction Site"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Our Legacy of <br />
            <span className="text-blue-500">Excellence</span>
          </motion.h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Avelty Group has been at the forefront of construction and real estate development for over 15 years, delivering landmark projects that stand the test of time.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To provide superior construction and real estate services by consistently improving the quality of our product; to add value for clients through innovation, foresight, integrity, and aggressive performance.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To be the most trusted and preferred construction partner globally, known for our commitment to safety, quality, and sustainable development.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=2070"
                alt="Architecture"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Core Values</h2>
            <p className="text-gray-600">The principles that guide every decision we make.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Integrity', icon: ShieldCheck, desc: 'We maintain the highest standards of professional ethics and honesty.' },
              { title: 'Innovation', icon: Target, desc: 'We embrace new technologies and methods to deliver better results.' },
              { title: 'Safety First', icon: HardHat, desc: 'The safety of our team and the community is our top priority.' },
            ].map((value, index) => (
              <div key={index} className="bg-white p-10 rounded-2xl border border-gray-100 text-center shadow-sm">
                <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Leadership</h2>
            <p className="text-gray-600">Meet the visionaries behind Avelty Group.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Robert Avelty', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1974' },
              { name: 'Sarah Jenkins', role: 'Chief Architect', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1976' },
              { name: 'Michael Chen', role: 'Operations Director', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=2070' },
              { name: 'Elena Rodriguez', role: 'Lead Engineer', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1961' },
            ].map((member, index) => (
              <div key={index} className="group">
                <div className="relative h-80 rounded-2xl overflow-hidden mb-4 shadow-lg">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
