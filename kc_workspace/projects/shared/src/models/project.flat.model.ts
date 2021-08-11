export class ProjectFlatModel {
    name = '';
    id = '';
    description = '';
    created = '';
    modified = '';
    authors: string[] = [];
    parent = '';
    children: string[] = [];
    tags: string[] = [];
    expandable = false;
    level = -1;
}
