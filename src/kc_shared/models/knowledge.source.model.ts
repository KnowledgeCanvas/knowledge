interface KnowledgeSourceModel {
    title: string
    id: UuidModel
    type: 'file' | 'web'
    source: File | WebSourceModel
    associatedProjects?: UuidModel[]
    events?: UuidModel[]
    icon?: UuidModel
    thumbnail?: UuidModel
    markup?: UuidModel[]
    topics?: UuidModel[]
    authors?: UuidModel[]
}

class KnowledgeSource implements KnowledgeSourceModel{
    id!: UuidModel;
    source!: File | WebSourceModel;
    title!: string;
    type!: 'file' | 'web';
}

interface KnowledgeSourceImage extends Hashable {
    id: UuidModel
    data: string
}

interface KnowledgeSourceIcon extends KnowledgeSourceImage {
    link?: string
}

interface KnowledgeSourceThumbnail extends KnowledgeSourceImage {
    height: number
    width: number
    link?: string
}
