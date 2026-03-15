import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Alert } from 'flowbite-react';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import { getEntityDisplayComponent } from './EntityDisplayComponents/entityDisplayRegistry';

const EntityContentPage: React.FC = () => {

    const { entityName } = useParams<{ entityName: string }>();
    const [uiComponent, setUiComponent] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!entityName) return;

        setLoading(true);
        setError(null);

        entityDefinitionsApi.getByName(entityName)
            .then(schema => setUiComponent(schema.uiComponent))
            .catch(err => setError(err.response?.data?.message || 'Failed to load module'))
            .finally(() => setLoading(false));
    }, [entityName]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner size="xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto mt-8 mb-8">
                <Alert color="failure">
                    <span className="font-medium">Error!</span> {error}
                </Alert>
            </div>
        );
    }

    const DisplayContainer = getEntityDisplayComponent(uiComponent);
    return <DisplayContainer />;
};

export default EntityContentPage;