import React from 'react';
import { Navbar } from 'flowbite-react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaSignOutAlt, FaDatabase, FaHome, FaBars } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard/overview', label: 'Overview', icon: FaHome },
        { path: '/dashboard/entity-definitions', label: 'Entities Definition', icon: FaDatabase },
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Top Navigation */}
            <Navbar fluid rounded className="bg-teal-600 text-white rounded-0 z-30 border-b border-teal-700">
                <div className="flex items-center">
                    <button
                        className="mr-3 md:hidden p-2 hover:bg-teal-700 rounded"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <FaBars />
                    </button>
                    <Link to="/dashboard" className="flex items-center">
                        <FaTachometerAlt className="mr-3 text-xl" />
                        <span className="self-center whitespace-nowrap text-xl font-semibold">CMS Dashboard</span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FaUser />
                        <span className="text-sm hidden sm:inline">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 hover:text-gray-200 bg-transparent border-0 cursor-pointer">
                        <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </Navbar>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Side Navigation - Custom Implementation */}
                <aside
                    className={`
                        absolute inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <div className="h-full px-3 py-4 overflow-y-auto">
                        <ul className="space-y-2 font-medium">
                            {navItems.map((item) => {
                                const isActive = location.pathname.includes(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`
                                                flex items-center p-2 rounded-lg group
                                                ${isActive
                                                    ? 'bg-teal-100 text-teal-700'
                                                    : 'text-gray-900 hover:bg-gray-100'}
                                            `}
                                            onClick={() => setIsSidebarOpen(false)} // Close on mobile click
                                        >
                                            <item.icon
                                                className={`
                                                    w-5 h-5 transition duration-75 
                                                    ${isActive ? 'text-teal-700' : 'text-gray-500 group-hover:text-gray-900'}
                                                `}
                                            />
                                            <span className="ml-3">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/50 z-10 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
