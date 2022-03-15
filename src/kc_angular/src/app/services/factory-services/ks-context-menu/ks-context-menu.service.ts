import {Injectable} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {MenuItem, PrimeIcons} from "primeng/api";
import {KsCommandService} from "../../command-services/ks-command/ks-command.service";
import {ProjectService} from "../project-service/project.service";

@Injectable({
  providedIn: 'root'
})
export class KsContextMenuService {

  styleClass = 'surface-0';

  constructor(private ksCommandService: KsCommandService, private projectService: ProjectService) {
  }

  generate(target: KnowledgeSource, ksList?: KnowledgeSource[]): MenuItem[] {
    let menu: MenuItem[] = [
      {
        label: target.title.substring(0, 16) + (target.title.length > 16 ? '...' : ''),
        disabled: true
      },
      {
        label: '',
        separator: true,
      },
      {
        label: 'Details',
        icon: PrimeIcons.INFO,
        command: () => {
          this.ksCommandService.detail(target)
        }
      },
      {
        label: 'Preview',
        icon: PrimeIcons.EYE,
        command: () => {
          this.ksCommandService.preview(target);
        }
      },
      {
        label: 'Open',
        icon: PrimeIcons.EXTERNAL_LINK,
        command: () => {
          this.ksCommandService.open(target);
        }
      },
      {
        label: '',
        separator: true
      },
      {
        label: 'Goto Project',
        icon: PrimeIcons.ARROW_CIRCLE_RIGHT,
        command: () => {
          if (target.associatedProject)
            this.projectService.setCurrentProject(target.associatedProject.value);
        }
      },
      {
        label: 'Copy',
        icon: PrimeIcons.COPY
      },
      {
        label: '',
        separator: true,
      },
      {
        label: 'Move',
        icon: PrimeIcons.REPLY
      },
      {
        label: 'Remove',
        icon: PrimeIcons.TRASH
      }
    ];

    let ksLabel = target.title.substring(0, 13);
    if (target.title.length > 13) {
      ksLabel += '...';
    }

    menu = this.setRemove(menu, target, ksLabel, ksList);
    menu = this.setMove(menu, target, ksLabel, ksList);
    menu = this.setCopy(menu, target, ksLabel, ksList);
    menu = this.setShowIn(menu, target);
    return menu
  }

  private setRemove(menu: MenuItem[], target: KnowledgeSource, label: string, ksList?: KnowledgeSource[]): MenuItem[] {
    let remove = menu.find(m => m.label === 'Remove');

    if (remove && (!ksList || ksList.length === 0)) {
      remove.label = 'Remove';
      remove.command = () => {
        this.ksCommandService.remove([target]);
      }
    } else if (remove) {
      remove.items = [{
        label: label,
        styleClass: this.styleClass,
        command: () => {
          this.ksCommandService.remove([target]);
        }
      }];
      if (ksList && ksList.length > 1) {
        remove.items.push({
          label: `Selected (${ksList.length})`,
          styleClass: this.styleClass,
          command: () => {
            this.ksCommandService.remove(ksList);
          }
        })
      }
    }
    return menu;
  }

  private setMove(menu: MenuItem[], target: KnowledgeSource, label: string, ksList?: KnowledgeSource[]): MenuItem[] {
    let move = menu.find(m => m.label === 'Move');

    if (move && (!ksList || ksList.length === 0)) {
      move.label = "Move";
      move.command = () => {
        this.ksCommandService.move([target]);
      }
    } else if (move) {
      move.items = [{
        label: label,
        styleClass: this.styleClass,
        command: () => {
          this.ksCommandService.move([target]);
        }
      }];
      if (ksList && ksList.length) {
        move.items.push({
          label: `Selected (${ksList.length})`,
          styleClass: this.styleClass,
          command: () => {
            this.ksCommandService.move(ksList);
          }
        })
      }
    }

    return menu;
  }

  private setCopy(menu: MenuItem[], target: KnowledgeSource, label: string, ksList?: KnowledgeSource[]) {
    let copy = menu.find(m => m.label === 'Copy');

    if (copy && (!ksList || ksList.length === 0)) {
      copy.items = [
        {
          label: target.ingestType === 'file' ? 'Path' : 'Link',
          styleClass: this.styleClass,
          command: () => {
            this.ksCommandService.copyPath([target]);
          }
        },
        {
          label: 'Object as JSON',
          styleClass: this.styleClass,
          command: () => {
            this.ksCommandService.copyJSON([target]);
          }
        }
      ];
    } else if (copy) {
      copy.items = [{
        label: label,
        styleClass: this.styleClass,
        items: [
          {
            label: target.ingestType === 'file' ? 'Path' : 'Link',
            styleClass: this.styleClass,
            command: () => {
              this.ksCommandService.copyPath([target]);
            }
          },
          {
            label: 'Object as JSON',
            styleClass: this.styleClass,
            command: () => {
              this.ksCommandService.copyJSON([target]);
            }
          }
        ]
      }
      ]

      if (ksList && ksList.length) {
        let nFiles = ksList.filter(k => k.ingestType === 'file').length;
        let nLinks = ksList.length - nFiles;
        let multiLabel = ``;
        if (nFiles > 0) {
          multiLabel += `Path${nFiles > 1 ? 's' : ''} (${nFiles})${nLinks > 0 ? ' / ' : ''}`;
        }
        if (nLinks > 0) {
          multiLabel += `Link${nLinks > 1 ? 's' : ''} (${nLinks})`;
        }
        copy.items.push(
          {
            label: `Selected`,
            styleClass: this.styleClass,
            items: [
              {
                label: multiLabel,
                styleClass: this.styleClass,
                command: () => {
                  this.ksCommandService.copyPath(ksList);
                }
              },
              {
                label: `Objects as JSON (${ksList.length})`,
                styleClass: this.styleClass,
                command: () => {
                  this.ksCommandService.copyJSON(ksList);
                }
              }
            ]
          }
        )
      }
    }

    return menu;
  }

  private setShowIn(menu: MenuItem[], target: KnowledgeSource) {
    if (target.ingestType === 'file') {
      let menuItem = {
        label: 'Show in files',
        icon: PrimeIcons.FOLDER_OPEN,
        command: () => {
          this.ksCommandService.showInFiles(target);
        }
      }
      menu.splice(5, 0, menuItem);
    }
    return menu;
  }

}
