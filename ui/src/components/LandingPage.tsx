import React from 'react';
import { Card, Button } from 'flowbite-react';
import AuthCard from './AuthCard';
import { 
  HiClipboardList, 
  HiUserGroup, 
  HiViewBoards, 
  HiUsers,
  HiKey
} from 'react-icons/hi';

const LandingPage: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const templates = [
    {
      icon: <HiClipboardList className="w-12 h-12 text-primary-600" />,
      title: 'Order Maintenance',
      description: 'Manage and track orders efficiently with real-time updates, status tracking, and customer management.'
    },
    {
      icon: <HiUserGroup className="w-12 h-12 text-primary-600" />,
      title: 'Attendance Tracking',
      description: 'Monitor employee attendance, track working hours, and generate comprehensive attendance reports.'
    },
    {
      icon: <HiViewBoards className="w-12 h-12 text-primary-600" />,
      title: 'Kanban Board',
      description: 'Visualize your workflow with drag-and-drop tasks, customizable columns, and real-time collaboration.'
    },
    {
      icon: <HiUsers className="w-12 h-12 text-primary-600" />,
      title: 'Visitor Management',
      description: 'Streamline visitor check-ins, maintain visitor logs, and enhance security with digital registration.'
    },
    {
      icon: <HiKey className="w-12 h-12 text-primary-600" />,
      title: 'Valet Management',
      description: 'Efficiently manage valet services with vehicle tracking, ticket generation, and quick retrieval.'
    }
  ];



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-primary-600">Enweb</h1>
            </div>
            <nav className="flex space-x-8">
              <Button
                color="light"
                onClick={() => scrollToSection('templates')}
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Templates
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Title */}
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                One Workspace for your business
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Build powerful internal tools without code. Empower your team with custom solutions tailored to your unique business needs.
              </p>
              <div className="flex gap-4">
                <Button
                  color="info"
                  size="lg"
                  onClick={() => scrollToSection('templates')}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Side - Auth Card */}
            <div className="flex justify-center">
              <AuthCard />
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready-to-Use Templates</h2>
            <p className="text-lg text-gray-600">
              Start quickly with our pre-built templates designed for common business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{template.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Button color="info" size="sm" className="mt-auto">
                    Get Started
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Enweb</h3>
          <p className="text-gray-400 mb-4">
            One Workspace for your business
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 Enweb. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
