/**
 Copyright 2021 Rob Royce

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

export interface GoogleSearchResultsModel {
  context: { title: string }
  items: SearchModel[]
  kind: string
  queries: { request: [], nextpage: [] }
  searchInformation: GoogleSearchInformation
  url: {
    template: string
    type: string
  }
}

export interface GoogleSearchInformation {
  formattedSearchTime: string
  formattedTotalResults: string
  searchTime: number
  totalResults: string
}

export interface SearchModel {
  pagemap?: GoogleSearchResultsPagemapModel;
  kind?: string,
  title: string,
  htmlTitle: string,
  description?: string,
  link: string,
  displayLink: string,
  snippet: string,
  htmlSnippet: string,
  cacheId: string,
  formattedUrl: string,
  htmlFormattedUrl: string,
}

export interface GoogleSearchResultsPagemapModel {
  answer?: GoogleSearchResultsAnswerModel[],
  blogposting?: any[],
  cse_image?: any[],
  cse_thumbnail?: any[],
  hcard?: any[],
  imageobject?: any[],
  metatags?: MetatagsModel[],
  organization?: any[],
  person?: any[],
  question?: GoogleSearchResultsQuestionModel[],
  thumbnail?: any[],
  videoobject?: GoogleSearchResultsVideoObjectModel[]
}

export interface MetatagsModel {
  "article:tag"?: string,
  author?: string,
  "og:description"?: string,
  "og:image"?: string,
  "og:title"?: string,
  "og:type"?: string,
  "og:url"?: string,
  "theme-color"?: string
  thumbnail?: string
  "twitter:card"?: string
  "twitter:creator"?: string
  "twitter:description"?: string
  "twitter:image"?: string
  "twitter:site"?: string
  "twitter:title"?: string
  viewport?: string
}

export interface GoogleSearchResultsQuestionModel {
  name?: string
}

export interface GoogleSearchResultsAnswerModel {
  text?: string
}

export interface GoogleSearchResultsVideoObjectModel {
  description?: string,
  embedurl?: string,
  name?: string,
  thumbnailurl?: string,
  uploaddate?: string
}
