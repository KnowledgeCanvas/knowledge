/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { KcTheme } from '@shared/models/style.model';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  onThemeChange = new EventEmitter();

  private readonly _themes: KcTheme[] = [
    {
      name: 'Lara Light Blue',
      code: 'lara-light-blue',
      isDark: false,
      isDual: true,
    },
    {
      name: 'Lara Dark Blue',
      code: 'lara-dark-blue',
      isDark: true,
      isDual: true,
    },
    {
      name: 'Lara Light Indigo',
      code: 'lara-light-indigo',
      isDark: false,
      isDual: true,
    },
    {
      name: 'Lara Dark Indigo',
      code: 'lara-dark-indigo',
      isDark: true,
      isDual: true,
    },
    {
      name: 'Lara Light Purple',
      code: 'lara-light-purple',
      isDark: false,
      isDual: true,
    },
    {
      name: 'Lara Dark Purple',
      code: 'lara-dark-purple',
      isDark: true,
      isDual: true,
    },
    {
      name: 'Lara Light Teal',
      code: 'lara-light-teal',
      isDark: false,
      isDual: true,
    },
    {
      name: 'Lara Dark Teal',
      code: 'lara-dark-teal',
      isDark: true,
      isDual: true,
    },
    { name: 'Arya Blue', code: 'arya-blue', isDark: true, isDual: false },
    { name: 'Arya Green', code: 'arya-green', isDark: true, isDual: false },
    { name: 'Arya Orange', code: 'arya-orange', isDark: true, isDual: false },
    { name: 'Arya Purple', code: 'arya-purple', isDark: true, isDual: false },
    { name: 'Saga Blue', code: 'saga-blue', isDark: false, isDual: false },
    { name: 'Saga Green', code: 'saga-green', isDark: false, isDual: false },
    { name: 'Saga Orange', code: 'saga-orange', isDark: false, isDual: false },
    { name: 'Saga Purple', code: 'saga-purple', isDark: false, isDual: false },
    { name: 'Vela Blue', code: 'vela-blue', isDark: true, isDual: false },
    { name: 'Vela Green', code: 'vela-green', isDark: true, isDual: false },
    { name: 'Vela Orange', code: 'vela-orange', isDark: true, isDual: false },
    { name: 'Vela Purple', code: 'vela-purple', isDark: true, isDual: false },
  ];

  private readonly _groupedThemes: KcTheme[] = [
    {
      name: 'Lara',
      code: 'lara-light',
      isDark: false,
      isDual: true,
      items: [
        {
          name: 'Lara Light Blue',
          code: 'lara-light-blue',
          isDark: false,
          isDual: true,
        },
        {
          name: 'Lara Light Indigo',
          code: 'lara-light-indigo',
          isDark: false,
          isDual: true,
        },
        {
          name: 'Lara Light Purple',
          code: 'lara-light-purple',
          isDark: false,
          isDual: true,
        },
        {
          name: 'Lara Light Teal',
          code: 'lara-light-teal',
          isDark: false,
          isDual: true,
        },
      ],
    },
    {
      name: 'Lara',
      code: 'lara-dark',
      isDark: true,
      isDual: true,
      items: [
        {
          name: 'Lara Dark Blue',
          code: 'lara-dark-blue',
          isDark: true,
          isDual: true,
        },
        {
          name: 'Lara Dark Indigo',
          code: 'lara-dark-indigo',
          isDark: true,
          isDual: true,
        },
        {
          name: 'Lara Dark Purple',
          code: 'lara-dark-purple',
          isDark: true,
          isDual: true,
        },
        {
          name: 'Lara Dark Teal',
          code: 'lara-dark-teal',
          isDark: true,
          isDual: true,
        },
      ],
    },
    {
      name: 'Arya',
      code: 'arya',
      isDark: true,
      isDual: false,
      items: [
        { name: 'Arya Blue', code: 'arya-blue', isDark: true, isDual: false },
        { name: 'Arya Green', code: 'arya-green', isDark: true, isDual: false },
        {
          name: 'Arya Orange',
          code: 'arya-orange',
          isDark: true,
          isDual: false,
        },
        {
          name: 'Arya Purple',
          code: 'arya-purple',
          isDark: true,
          isDual: false,
        },
      ],
    },
    {
      name: 'Saga',
      code: 'saga',
      isDark: false,
      isDual: false,
      items: [
        { name: 'Saga Blue', code: 'saga-blue', isDark: false, isDual: false },
        {
          name: 'Saga Green',
          code: 'saga-green',
          isDark: false,
          isDual: false,
        },
        {
          name: 'Saga Orange',
          code: 'saga-orange',
          isDark: false,
          isDual: false,
        },
        {
          name: 'Saga Purple',
          code: 'saga-purple',
          isDark: false,
          isDual: false,
        },
      ],
    },
    {
      name: 'Vela',
      code: 'vela',
      isDark: true,
      isDual: false,
      items: [
        { name: 'Vela Blue', code: 'vela-blue', isDark: true, isDual: false },
        { name: 'Vela Green', code: 'vela-green', isDark: true, isDual: false },
        {
          name: 'Vela Orange',
          code: 'vela-orange',
          isDark: true,
          isDual: false,
        },
        {
          name: 'Vela Purple',
          code: 'vela-purple',
          isDark: true,
          isDual: false,
        },
      ],
    },
  ];

  private _active: KcTheme;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this._active = this.localTheme;
  }

  get groupedThemes(): KcTheme[] {
    return this._groupedThemes;
  }

  get currentTheme(): KcTheme {
    return this._active;
  }

  get defaultTheme(): KcTheme {
    return {
      name: 'Vela Blue',
      code: 'vela-blue',
      isDark: true,
      isDual: false,
    };
  }

  get localTheme(): KcTheme {
    const lts = localStorage.getItem('theme');
    let lt: KcTheme;
    if (!lts) {
      lt = this.defaultTheme;
      localStorage.setItem('theme', JSON.stringify(lt));
    } else {
      lt = JSON.parse(lts);
    }
    return lt;
  }

  async switchTheme(theme: string) {
    let _theme = this._themes.filter(
      (t) => t.code === theme || t.name === theme
    )[0];

    if (!_theme) {
      console.warn(`Could not find theme "${theme}"`);
      _theme = this.defaultTheme;
    }

    return fetch(`${_theme.code}.css`)
      .then((res) => {
        if (res.status !== 200) {
          console.error('Unable to set theme - invalid style-sheet');
          return false;
        }

        const themeLink = this.document.getElementById(
          'app-theme'
        ) as HTMLLinkElement;
        if (themeLink) {
          themeLink.href = `${_theme.code}.css`;
          this._active = _theme;
          localStorage.setItem('theme', JSON.stringify(_theme));
          return true;
        }

        return false;
      })
      .catch(() => {
        console.warn('Unable to set theme - invalid style-sheet');
        return false;
      })
      .finally(() => {
        this.onThemeChange.emit();
      });
  }

  /**
   * Sets and returns the default (light) theme
   */
  restoreDefault(): KcTheme {
    const def: KcTheme = {
      name: 'Lara Light Indigo',
      code: 'lara-light-indigo',
      isDark: false,
      isDual: true,
    };
    this.switchTheme(def.code);
    return def;
  }

  async setLocal() {
    await this.switchTheme(this.localTheme.code);
  }
}
