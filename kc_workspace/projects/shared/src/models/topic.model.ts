export class TopicModel {
    public id: string;
    public name: string;
    public description: string;
    public created_at: Date;
    public updated_at: Date;

    constructor(id: string, name: string, description: string, created_at: Date, updated_at: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}