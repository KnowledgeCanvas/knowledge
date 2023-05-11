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

import { Component, OnInit, ViewChild } from '@angular/core';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { SettingsService } from '@services/ipc-services/settings.service';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'source-video',
  template: `
    <div class="source-youtube-player">
      <div class="p-fluid h-full w-full flex-row-center-center surface-section">
        <youtube-player #youtubePlayer [videoId]="ksYoutubeVideoId">
        </youtube-player>
      </div>
    </div>
  `,
  styleUrls: ['./source.styles.scss'],
})
export class SourceVideoComponent implements OnInit {
  @ViewChild('youtubePlayer') youtubePlayer!: YouTubePlayer;

  source!: KnowledgeSource;

  ksYoutubeVideoId = 'y5icPgca8JI';

  loaded = false;

  constructor(private settings: SettingsService) {}

  ngOnInit(): void {
    this.source.accessLink = new URL(this.source.accessLink);
    const urlParam = this.source.accessLink.searchParams.get('v');
    if (this.source.accessLink.hostname === 'www.youtube.com' && urlParam) {
      this.loadYoutubeApi(urlParam);
      if (this.settings.get().display.autoplay) {
        setTimeout(() => {
          this.youtubePlayer.playVideo();
        }, 1000);
      }
    }
  }

  loadYoutubeApi(urlParam: string) {
    this.ksYoutubeVideoId = urlParam;
    if (!this.loaded) {
      // This code loads the IFrame Player API code asynchronously, according to the instructions at
      // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      this.loaded = true;
    }
  }
}
