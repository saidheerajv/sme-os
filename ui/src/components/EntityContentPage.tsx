import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'flowbite-react';

const EntityContentPage: React.FC = () => {
    const { entityName } = useParams<{ entityName: string }>();

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-8">
            <h1 className="text-3xl font-bold mb-6 capitalize">{entityName} Content</h1>
            <Card>
                <div className="p-4 text-center text-gray-500">
                    <p className="text-xl mb-2">Content Management for {entityName}</p>
                    <p>This feature is currently under development.</p>
                </div>
            </Card>
        </div>
    );
};

export default EntityContentPage;
