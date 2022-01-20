import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";

export interface KcTheme {
  name: string
  code: string
  isDark: boolean
  isDual: boolean
  items?: KcTheme[]
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _themes: KcTheme[] = [
    {name: 'Arya Blue', code: 'arya-blue', isDark: true, isDual: false},
    {name: 'Arya Green', code: 'arya-green', isDark: true, isDual: false},
    {name: 'Arya Orange', code: 'arya-orange', isDark: true, isDual: false},
    {name: 'Arya Purple', code: 'arya-purple', isDark: true, isDual: false},
    {name: 'Bootstrap4 Light Blue', code: 'bootstrap4-light-blue', isDark: false, isDual: true},
    {name: 'Bootstrap4 Dark Blue', code: 'bootstrap4-dark-blue', isDark: true, isDual: true},
    {name: 'Bootstrap4 Light Purple', code: 'bootstrap4-light-purple', isDark: false, isDual: true},
    {name: 'Bootstrap4 Dark Purple', code: 'bootstrap4-dark-purple', isDark: true, isDual: true},
    {name: 'Fluent Light', code: 'fluent-light', isDark: false, isDual: false},
    {name: 'Lara Light Blue', code: 'lara-light-blue', isDark: false, isDual: true},
    {name: 'Lara Dark Blue', code: 'lara-dark-blue', isDark: true, isDual: true},
    {name: 'Lara Light Indigo', code: 'lara-light-indigo', isDark: false, isDual: true},
    {name: 'Lara Dark Indigo', code: 'lara-dark-indigo', isDark: true, isDual: true},
    {name: 'Lara Light Purple', code: 'lara-light-purple', isDark: false, isDual: true},
    {name: 'Lara Dark Purple', code: 'lara-dark-purple', isDark: true, isDual: true},
    {name: 'Lara Light Teal', code: 'lara-light-teal', isDark: false, isDual: true},
    {name: 'Lara Dark Teal', code: 'lara-dark-teal', isDark: true, isDual: true},
    {name: 'Luna Amber', code: 'luna-amber', isDark: true, isDual: false},
    {name: 'Luna Blue', code: 'luna-blue', isDark: true, isDual: false},
    {name: 'Luna Green', code: 'luna-green', isDark: true, isDual: false},
    {name: 'Luna Pink', code: 'luna-pink', isDark: true, isDual: false},
    {name: 'Material Light Deep-Purple', code: 'md-light-deeppurple', isDark: false, isDual: true},
    {name: 'Material Dark Deep-Purple', code: 'md-dark-deeppurple', isDark: true, isDual: true},
    {name: 'Material Light Indigo', code: 'md-light-indigo', isDark: false, isDual: true},
    {name: 'Material Dark Indigo', code: 'md-dark-indigo', isDark: true, isDual: true},
    {name: 'Material Compact Light Deep-Purple', code: 'mdc-light-deeppurple', isDark: false, isDual: true},
    {name: 'Material Compact Dark Deep-Purple', code: 'mdc-dark-deeppurple', isDark: true, isDual: true},
    {name: 'Material Compact Light Indigo', code: 'mdc-light-indigo', isDark: false, isDual: true},
    {name: 'Material Compact Dark Indigo', code: 'mdc-dark-indigo', isDark: true, isDual: true},
    {name: 'Nova', code: 'nova', isDark: false, isDual: false},
    {name: 'Nova Accent', code: 'nova-accent', isDark: false, isDual: false},
    {name: 'Nova Alt', code: 'nova-alt', isDark: false, isDual: false},
    {name: 'Rhea', code: 'rhea', isDark: false, isDual: false},
    {name: 'Saga Blue', code: 'saga-blue', isDark: false, isDual: false},
    {name: 'Saga Green', code: 'saga-green', isDark: false, isDual: false},
    {name: 'Saga Orange', code: 'saga-orange', isDark: false, isDual: false},
    {name: 'Saga Purple', code: 'saga-purple', isDark: false, isDual: false},
    {name: 'Tailwind Light', code: 'tailwind-light', isDark: false, isDual: false},
    {name: 'Vela Blue', code: 'vela-blue', isDark: true, isDual: false},
    {name: 'Vela Green', code: 'vela-green', isDark: true, isDual: false},
    {name: 'Vela Orange', code: 'vela-orange', isDark: true, isDual: false},
    {name: 'Vela Purple', code: 'vela-purple', isDark: true, isDual: false},
  ];

  private readonly _groupedThemes: KcTheme[] = [
    {
      name: 'Arya', code: 'arya', isDark: true, isDual: false,
      items: [
        {name: 'Arya Blue', code: 'arya-blue', isDark: true, isDual: false},
        {name: 'Arya Green', code: 'arya-green', isDark: true, isDual: false},
        {name: 'Arya Orange', code: 'arya-orange', isDark: true, isDual: false},
        {name: 'Arya Purple', code: 'arya-purple', isDark: true, isDual: false},
      ]
    },

    {
      name: 'Bootstrap 4', code: 'bootstrap4-light', isDark: false, isDual: true,
      items: [
        {name: 'Bootstrap4 Light Blue', code: 'bootstrap4-light-blue', isDark: false, isDual: true},
        {name: 'Bootstrap4 Light Purple', code: 'bootstrap4-light-purple', isDark: false, isDual: true},
      ]
    },

    {
      name: 'Bootstrap 4', code: 'bootstrap4-dark', isDark: true, isDual: true,
      items: [
        {name: 'Bootstrap4 Dark Blue', code: 'bootstrap4-dark-blue', isDark: true, isDual: true},
        {name: 'Bootstrap4 Dark Purple', code: 'bootstrap4-dark-purple', isDark: true, isDual: true},
      ]
    },

    {
      name: 'Lara', code: 'lara-light', isDark: false, isDual: true,
      items: [
        {name: 'Lara Light Blue', code: 'lara-light-blue', isDark: false, isDual: true},
        {name: 'Lara Light Indigo', code: 'lara-light-indigo', isDark: false, isDual: true},
        {name: 'Lara Light Purple', code: 'lara-light-purple', isDark: false, isDual: true},
        {name: 'Lara Light Teal', code: 'lara-light-teal', isDark: false, isDual: true},
      ]
    },

    {
      name: 'Lara', code: 'lara-dark', isDark: true, isDual: true,
      items: [
        {name: 'Lara Dark Blue', code: 'lara-dark-blue', isDark: true, isDual: true},
        {name: 'Lara Dark Indigo', code: 'lara-dark-indigo', isDark: true, isDual: true},
        {name: 'Lara Dark Purple', code: 'lara-dark-purple', isDark: true, isDual: true},
        {name: 'Lara Dark Teal', code: 'lara-dark-teal', isDark: true, isDual: true},
      ]
    },

    {
      name: 'Luna', code: 'luna', isDark: true, isDual: false,
      items: [
        {name: 'Luna Amber', code: 'luna-amber', isDark: true, isDual: false},
        {name: 'Luna Blue', code: 'luna-blue', isDark: true, isDual: false},
        {name: 'Luna Green', code: 'luna-green', isDark: true, isDual: false},
        {name: 'Luna Pink', code: 'luna-pink', isDark: true, isDual: false},
      ]
    },

    {
      name: 'Material', code: 'md-light', isDark: false, isDual: true,
      items: [
        {name: 'Material Light Deep-Purple', code: 'md-light-deeppurple', isDark: false, isDual: true},
        {name: 'Material Light Indigo', code: 'md-light-indigo', isDark: false, isDual: true},
      ]
    },

    {
      name: 'Material', code: 'md-dark', isDark: true, isDual: true,
      items: [
        {name: 'Material Dark Deep-Purple', code: 'md-dark-deeppurple', isDark: true, isDual: true},
        {name: 'Material Dark Indigo', code: 'md-dark-indigo', isDark: true, isDual: true},
      ]
    },

    {
      name: 'Material Compact', code: 'mdc-light', isDark: false, isDual: true,
      items: [
        {name: 'Material Compact Light Deep-Purple', code: 'mdc-light-deeppurple', isDark: false, isDual: true},
        {name: 'Material Compact Light Indigo', code: 'mdc-light-indigo', isDark: false, isDual: true},
      ]
    },

    {
      name: 'Material Compact', code: 'mdc-dark', isDark: true, isDual: true,
      items: [
        {name: 'Material Compact Dark Deep-Purple', code: 'mdc-dark-deeppurple', isDark: true, isDual: true},
        {name: 'Material Compact Dark Indigo', code: 'mdc-dark-indigo', isDark: true, isDual: true},
      ]
    },

    {
      name: 'Nova', code: 'nova', isDark: false, isDual: true,
      items: [
        {name: 'Nova', code: 'nova', isDark: false, isDual: false},
        {name: 'Nova Accent', code: 'nova-accent', isDark: false, isDual: false},
        {name: 'Nova Alt', code: 'nova-alt', isDark: false, isDual: false},
      ]
    },


    {
      name: 'Saga', code: 'saga', isDark: false, isDual: false,
      items: [
        {name: 'Saga Blue', code: 'saga-blue', isDark: false, isDual: false},
        {name: 'Saga Green', code: 'saga-green', isDark: false, isDual: false},
        {name: 'Saga Orange', code: 'saga-orange', isDark: false, isDual: false},
        {name: 'Saga Purple', code: 'saga-purple', isDark: false, isDual: false},
      ]
    },

    {
      name: 'Vela', code: 'vela', isDark: true, isDual: false,
      items: [
        {name: 'Vela Blue', code: 'vela-blue', isDark: true, isDual: false},
        {name: 'Vela Green', code: 'vela-green', isDark: true, isDual: false},
        {name: 'Vela Orange', code: 'vela-orange', isDark: true, isDual: false},
        {name: 'Vela Purple', code: 'vela-purple', isDark: true, isDual: false},
      ]
    },

    {
      name: 'Other', code: 'other-light', isDark: false, isDual: false,
      items: [
        {name: 'Fluent Light', code: 'fluent-light', isDark: false, isDual: false},
        {name: 'Rhea', code: 'rhea', isDark: false, isDual: false},
        {name: 'Tailwind Light', code: 'tailwind-light', isDark: false, isDual: false},
      ]
    },
  ];

  private _active: KcTheme;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this._active = this.localTheme;
    this.switchTheme(this._active.code);
  }

  get groupedThemes(): KcTheme[] {
    return this._groupedThemes;
  }

  get currentTheme(): KcTheme {
    return this._active;
  }

  get defaultTheme(): KcTheme {
    return {name: 'Lara Light Indigo', code: 'lara-light-indigo', isDark: false, isDual: true};
  }

  get localTheme(): KcTheme {
    let lts = localStorage.getItem('theme');
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
    let _theme = this._themes.filter(t => t.code === theme || t.name === theme)[0];

    if (!_theme) {
      console.warn(`Could not find theme "${theme}"`);
      return false;
    }

    return fetch(`${_theme.code}.css`).then((res) => {
      if (res.status !== 200) {
        console.warn('Unable to set theme - invalid style-sheet');
        return false;
      }

      let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
      if (themeLink) {
        themeLink.href = `${_theme.code}.css`;
        this._active = _theme;
        localStorage.setItem('theme', JSON.stringify(_theme));
        return true;
      }

      return false;
    }).catch((_) => {
      console.warn('Unable to set theme - invalid style-sheet');
      return false;
    });
  }

  /**
   * Sets and returns the default (light) theme
   */
  restoreDefault(): KcTheme {
    let def: KcTheme = {name: 'Lara Light Indigo', code: 'lara-light-indigo', isDark: false, isDual: true};
    this.switchTheme(def.code);
    return def;
  }

  setLocal() {
    this.switchTheme(this.localTheme.code);
  }
}
