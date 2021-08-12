import { Injectable } from '@angular/core';
import { TopicModel } from '../../models/topic.model';
import { UuidModel } from '../../models/uuid.model';
import { UuidService } from '../uuid/uuid.service';
import {BehaviorSubject, Observable} from "rxjs";
import {ProjectTreeNode} from "../../models/project.tree.model";

let tempTopicSource: TopicModel[] = [
  {
    id: '697b08fe-df4d-4bbc-9518-d421d0258148',
    name: 'Computer Science',
    description: 'The study of the hardware and software components of computers.',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'd009de90-962d-4cf9-9f7d-3e892d64d517',
    name: 'Biology',
    description: 'The study of life.',
    created_at: new Date(),
    updated_at: new Date()
  }
]

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topicSource = new BehaviorSubject<TopicModel[]>(tempTopicSource);
  public topics = this.topicSource.asObservable();

  constructor(private uuidService: UuidService) {}

  create(topic: TopicModel): TopicModel {
    this.uuidService.generate().then(id => topic.id);
    topic.created_at = new Date();
    topic.updated_at = new Date();
    this.topicSource.value.push(topic);
    return topic;
  }

  exists(id: string): boolean {
    return this.topicSource.value.find(topic => topic.id === id) !== undefined;
  }


}
