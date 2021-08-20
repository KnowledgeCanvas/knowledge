export interface GoogleSearchResultsModel {
  context: { title: string }
  items: GoogleSearchItemModel[]
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

export interface GoogleSearchItemModel {
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
