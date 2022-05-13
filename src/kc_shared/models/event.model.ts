interface EventModel {
    timestamp: string;
    id: UuidModel;
    type: 'create' | 'read' | 'update' | 'delete' | 'reminder' | 'checkpoint';
    description?: string;
    icon?: string;
}
