import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaDatabase, FaUsers } from 'react-icons/fa';
import type { EntityDefinition } from '../../types/entity.types';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    entities: EntityDefinition[];
}

const navItems = [
    { path: '/dashboard/users', label: 'Manage Users', icon: FaUsers },
    { path: '/dashboard/entity-definitions', label: 'Manage Modules', icon: FaDatabase }
];

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, entities }) => {
    const location = useLocation();

    return (
        <>
            {/* Side Navigation */}
            <aside
                className={`
                    absolute inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
                    {entities.length > 0 && (
                        <>
                            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">
                                Modules
                            </div>
                            <ul className="space-y-2 font-medium">
                                {entities.map((entity) => {
                                    const path = `/dashboard/content/${entity.name}`;
                                    const isActive = location.pathname === path;
                                    return (
                                        <li key={entity.id}>
                                            <Link
                                                to={path}
                                                className={`
                                                    flex items-center p-2 rounded-lg group
                                                    ${isActive
                                                        ? 'bg-primary-100 text-primary-700'
                                                        : 'text-gray-900 hover:bg-gray-100'}
                                                `}
                                                onClick={onClose}
                                            >
                                                <FaDatabase
                                                    className={`
                                                        w-5 h-5 transition duration-75 
                                                        ${isActive ? 'text-primary-700' : 'text-gray-500 group-hover:text-gray-900'}
                                                    `}
                                                />
                                                <span className="ml-3 capitalize">{entity.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                            <hr className="my-4 border-gray-200" />
                        </>
                    )}

                    <div className="mt-auto">
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
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'text-gray-900 hover:bg-gray-100'}
                                            `}
                                            onClick={onClose}
                                        >
                                            <item.icon
                                                className={`
                                                    w-5 h-5 transition duration-75 
                                                    ${isActive ? 'text-primary-700' : 'text-gray-500 group-hover:text-gray-900'}
                                                `}
                                            />
                                            <span className="ml-3">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-10 md:hidden"
                    onClick={onClose}
                />
            )}
        </>
    );
};

export default SideMenu;
