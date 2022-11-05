/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Component, OnInit} from '@angular/core';
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
                <b>Graph Settings</b>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="w-full h-full flex flex-column gap-2">
                <app-setting-template label="Animations"
                                      labelHelp="Enable or disable animations. Disabling animations may improve performance."
                                      labelSubtext="{{form.controls.animate.value | switchLabel}}">
                  <p-inputSwitch class="settings-input" formControlName="animate"></p-inputSwitch>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template label="Duration"
                                      labelHelp="How long it takes to animate changes in the graph."
                                      labelSubtext="{{form.controls.duration.value / 1000.0 | number: '1.1'}}s">
                  <p-slider class="w-16rem settings-input"
                            [min]="0"
                            [max]="10000"
                            [step]="500"
                            formControlName="duration">
                  </p-slider>
                  <div class="settings-input-subtext-left">Fast</div>
                  <div class="settings-input-subtext-right">Slow</div>
                </app-setting-template>
              </div>
            </ng-template>
          </p-panel>
        </div>

        <div class="col-12">
          <p-panel>
            <ng-template pTemplate="header">
              <div class="flex-row-center-between w-full">
                <b>Physics Simulator</b>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="w-full h-full flex flex-column gap-2">
                <app-setting-template label="Simulation (Beta)"
                                      labelHelp="Enable or disable physics-based graph simulation by selecting the 'Simulate' layout."
                                      labelSubtext="{{form.controls.simulate.value | switchLabel}}">
                  <p-inputSwitch class="settings-input" formControlName="simulate"></p-inputSwitch>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template label="Simulator Runtime"
                                      labelHelp="How long to run simulation before stopping. Shorter times may result in better performance and more stability at the cost of layout coherence."
                                      labelSubtext="{{form.controls.maxTime.value / 1000.0 | number: '1.1'}}s">
                  <p-slider class="w-16rem settings-input"
                            [min]="0"
                            [max]="10000"
                            [step]="500"
                            formControlName="maxTime">
                  </p-slider>
                  <div class="settings-input-subtext-left">Fast</div>
                  <div class="settings-input-subtext-right">Slow</div>
                </app-setting-template>
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
      enabled: false,
      maxTime: 2500
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

    this.disable()

    this.form.valueChanges.pipe(
      debounceTime(500),
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

        this.disable()
        this.set();
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  disable() {
    this.graphSettings.animation.enabled ? this.form.get('duration')?.enable() : this.form.get('duration')?.disable();
    this.graphSettings.simulation.enabled ? this.form.get('maxTime')?.enable() : this.form.get('maxTime')?.disable();
  }

  set() {
    this.settings.set({
      app: {
        graph: this.graphSettings
      }
    })
  }
}
