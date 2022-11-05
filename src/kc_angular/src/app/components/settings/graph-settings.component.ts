import {Component, OnInit} from '@angular/core';
import {InputSwitchOnChangeEvent} from "primeng/inputswitch";
import {GraphSettingsModel} from "../../../../../kc_shared/models/settings.model";
import {SettingsService} from "../../services/ipc-services/settings.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged, tap} from "rxjs/operators";

@Component({
  selector: 'app-graph-settings',
  template: `
    <div class="p-fluid grid">
      <form [formGroup]="form" class="w-full h-full">
        <div class="col-12">
          <p-panel>
            <ng-template pTemplate="header">
              <div class="flex-row-center-between w-full">
                <b>Animations</b>
                <p-inputSwitch formControlName="animate">
                </p-inputSwitch>
              </div>
            </ng-template>

            <ng-template pTemplate="content">

              <div class="flex-row-center-between">
                <div class="flex flex-row gap-2">
                  <div>
                    Duration:
                  </div>
                  <div *ngIf="form.controls.duration">
                    {{form.controls.duration.value / 1000.0 | number: '1.1'}}s
                  </div>
                </div>
                <div class="flex flex-column gap-1">
                  <p-slider class="w-16rem"
                            [disabled]="!form.controls.animate.value"
                            [min]="0"
                            [max]="10000"
                            [step]="500"
                            formControlName="duration">
                  </p-slider>
                  <div class="w-full flex flex-row justify-content-between">
                    <div>Fast</div>
                    <div>Slow</div>
                  </div>
                </div>
              </div>
            </ng-template>
          </p-panel>
        </div>

        <div class="col-12">
          <p-panel>
            <ng-template pTemplate="header">
              <div class="flex-row-center-between w-full">
                <b>Allow Simulation</b>
                <p-inputSwitch formControlName="simulate">
                </p-inputSwitch>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="flex-row-center-between">
                <div class="flex flex-row gap-2">
                  <div>
                    Max Simulation Time:
                  </div>
                  <div *ngIf="form.controls.maxTime">
                    {{form.controls.maxTime.value / 1000.0 | number: '1.1'}}s
                  </div>
                </div>
                <div class="flex flex-column gap-1">
                  <p-slider class="w-16rem"
                            [disabled]="!form.controls.simulate.value"
                            [min]="0"
                            [max]="10000"
                            [step]="500"
                            formControlName="maxTime">
                  </p-slider>
                  <div class="w-full flex flex-row justify-content-between">
                    <div>Fast</div>
                    <div>Slow</div>
                  </div>
                </div>
              </div>
            </ng-template>
          </p-panel>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class GraphSettingsComponent implements OnInit {
  graphSettings: GraphSettingsModel = {
    animation: {
      enabled: true,
      duration: 1000
    },
    simulation: {
      enabled: true,
      maxTime: 5000
    }
  };

  form: FormGroup;

  constructor(private settings: SettingsService, private formBuilder: FormBuilder) {
    if (!settings.get().app.graph) {
      this.set();
    } else {
      this.graphSettings = settings.get().app.graph;
    }

    this.form = formBuilder.group({
      animate: [this.graphSettings.animation.enabled],
      duration: [this.graphSettings.animation.duration],
      simulate: [this.graphSettings.simulation.enabled],
      maxTime: [this.graphSettings.simulation.maxTime]
    });

    this.form.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => {
        return (curr.animate === prev.animate)
          && (curr.duration === prev.duration)
          && (curr.simulate === prev.simulate)
          && (curr.maxTime === prev.maxTime);
      }),
      tap((formValue) => {
        this.graphSettings.animation = {
          enabled: formValue.animate,
          duration: formValue.duration
        }
        this.graphSettings.simulation = {
          enabled: formValue.simulate,
          maxTime: formValue.maxTime
        }
        this.set();
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  onAnimationsChange($event: InputSwitchOnChangeEvent) {
    console.log('Animation change: ', $event);
  }

  set() {
    this.settings.set({
      app: {
        graph: this.graphSettings
      }
    })
  }
}
