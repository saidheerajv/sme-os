import type { ComponentType } from 'react';
import { UIComponentType } from '../../types/entity.types';
import DataTableContainer from './DataTable/index';
import KanbanContainer from './Kanban/index';

const entityDisplayRegistry: Record<string, ComponentType> = {
    [UIComponentType.DATATABLE]: DataTableContainer,
    [UIComponentType.KANBAN]: KanbanContainer,
};

export const getEntityDisplayComponent = (uiComponent?: string): ComponentType => {
    if (uiComponent && entityDisplayRegistry[uiComponent]) {
        return entityDisplayRegistry[uiComponent];
    }
    return entityDisplayRegistry[UIComponentType.DATATABLE];
};

export default entityDisplayRegistry;
