import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building2, Home, Map, HardHat, Phone, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const [user] = useAuthState(auth);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: Building2 },
    { name: 'About', href: '/about', icon: HardHat },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', href: '/admin', icon: LayoutDashboard });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">AVELTY GROUP</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === link.href ? "text-blue-600" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === link.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
