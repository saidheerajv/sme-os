import React from 'react';
import { Outlet } from 'react-router-dom';
import type { EntityDefinition } from '../types/entity.types';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import SideMenu from './SideMenu';

const DashboardLayout: React.FC = () => {
    const { currentOrganization } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [entities, setEntities] = React.useState<EntityDefinition[]>([]);

    // Reload entities when organization changes
    React.useEffect(() => {
        if (currentOrganization) {
            loadEntities();
        } else {
            setEntities([]);
        }
    }, [currentOrganization]);

    const loadEntities = async () => {
        try {
            const data = await entityDefinitionsApi.getAll();
            setEntities(data);
        } catch (error) {
            console.error('Failed to load entities for sidebar:', error);
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <Header onToggleSidebar={toggleSidebar} />

            <div className="flex flex-1 overflow-hidden relative">
                <SideMenu
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                    entities={entities}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
