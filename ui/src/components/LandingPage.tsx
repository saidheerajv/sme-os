import React from 'react';
import { Card, Button } from 'flowbite-react';
import AuthCard from './AuthCard';
import { 
  HiCode, 
  HiLightningBolt, 
  HiCube, 
  HiShieldCheck,
  HiTemplate,
  HiChartBar 
} from 'react-icons/hi';

const LandingPage: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <HiCode className="w-12 h-12 text-blue-600" />,
      title: 'AI-Powered Development',
      description: 'Create complex business tools using natural language. Let AI handle the complexity while you focus on your business logic.'
    },
    {
      icon: <HiLightningBolt className="w-12 h-12 text-blue-600" />,
      title: 'Lightning Fast',
      description: 'Build and deploy internal tools in minutes, not months. Get your team productive faster with rapid development.'
    },
    {
      icon: <HiCube className="w-12 h-12 text-blue-600" />,
      title: 'Flexible & Modular',
      description: 'Define custom entities, relationships, and workflows. BRM adapts to your business needs, not the other way around.'
    },
    {
      icon: <HiShieldCheck className="w-12 h-12 text-blue-600" />,
      title: 'Secure by Default',
      description: 'Enterprise-grade security with role-based access control, data encryption, and audit logs built-in.'
    },
    {
      icon: <HiTemplate className="w-12 h-12 text-blue-600" />,
      title: 'Rich Components',
      description: 'Beautiful, responsive UI components out of the box. Create professional interfaces without design skills.'
    },
    {
      icon: <HiChartBar className="w-12 h-12 text-blue-600" />,
      title: 'Analytics & Insights',
      description: 'Track usage, monitor performance, and gain insights into how your tools are being used across your organization.'
    }
  ];

  const clients = [
    { name: 'TechCorp', logo: '🚀' },
    { name: 'InnovateCo', logo: '💡' },
    { name: 'DataFlow', logo: '📊' },
    { name: 'CloudScale', logo: '☁️' },
    { name: 'SecureNet', logo: '🔒' },
    { name: 'AgileWorks', logo: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-blue-600">BRM</h1>
            </div>
            <nav className="flex space-x-8">
              <Button
                color="light"
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                About
              </Button>
              <Button
                color="light"
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Features
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
                Create Tools for your business using AI
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Build powerful internal tools without code. Empower your team with custom solutions tailored to your unique business needs.
              </p>
              <div className="flex gap-4">
                <Button
                  color="info"
                  size="lg"
                  onClick={() => scrollToSection('features')}
                >
                  Learn More
                </Button>
                <Button
                  color="light"
                  size="lg"
                  onClick={() => scrollToSection('contact')}
                  className="border-2 border-blue-600 text-blue-600"
                >
                  Contact Us
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

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About BRM</h2>
            <p className="text-lg text-gray-600 mb-4">
              BRM (Business Resource Manager) is a cutting-edge low-code platform that empowers businesses to create sophisticated internal tools using the power of AI. Whether you need a CRM, project management system, inventory tracker, or custom workflow automation, BRM makes it possible without writing code.
            </p>
            <p className="text-lg text-gray-600">
              Our platform combines the flexibility of traditional development with the speed and accessibility of no-code tools. Define your data models, customize your interfaces, and let BRM handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">
              Everything you need to build, deploy, and manage your internal tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Leading Companies</h2>
            <p className="text-lg text-gray-600">
              Join hundreds of businesses already building with BRM
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {clients.map((client, index) => (
              <Card key={index} className="flex items-center justify-center p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-2">{client.logo}</div>
                  <p className="text-sm font-semibold text-gray-700">{client.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">
              Have questions? Want to see a demo? We'd love to hear from you.
            </p>
          </div>

          <Card className="p-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>

              <Button
                type="submit"
                color="info"
                size="lg"
                className="w-full"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">BRM</h3>
          <p className="text-gray-400 mb-4">
            Build smarter. Ship faster. Scale effortlessly.
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 BRM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
