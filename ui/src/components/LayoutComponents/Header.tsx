import React from 'react';
import { Navbar, Button } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';
// import { FaTachometerAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
// import OrganizationSelector from './OrganizationSelector';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const { logout, currentOrganization } = useAuth();
    // const { user } = useAuth();
    
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar fluid rounded className="text-primary-600 bg-white rounded-0 z-30 border-b border-primary-700/30">
            <div className="flex items-center">
                <Button
                    color="light"
                    size="sm"
                    className="mr-3 md:hidden p-2 hover:bg-primary-700 rounded bg-transparent border-0"
                    onClick={onToggleSidebar}
                >
                    <FaBars />
                </Button>
                <Link to="/dashboard" className="flex items-center">
                    {/* <FaTachometerAlt className="mr-3 text-xl" /> */}
                    <span className="self-center whitespace-nowrap text-xl font-semibold">
                        {currentOrganization?.name || 'oorimi'}
                    </span>
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {/* <OrganizationSelector className="hidden md:flex" /> */}
                <div className="flex items-center gap-2">
                    {/* <FaUser /> */}
                    {/* <span className="text-sm hidden sm:inline">{user?.name}</span> */}
                </div>
                <Button color="light" onClick={handleLogout} className="cursor-pointer flex items-center gap-2 hover:text-red-500 bg-transparent border-0 text-primary-500">
                    <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </Navbar>
    );
};

export default Header;
