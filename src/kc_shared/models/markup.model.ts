interface KnowledgeSourceMarkup {
    id: UuidModel
    pos: { x: Number, y: Number, width: Number, height: Number }
    events?: EventModel
}

interface MarkupColor {
    color: string
}

interface MarkupFont {
    weight: number
}

interface MarkupData {
    data: string
}

interface MarkupNote extends KnowledgeSourceMarkup {
    title: string
    body: string
}

interface MarkupSticker extends KnowledgeSourceMarkup, MarkupData {
    link?: string
}

interface MarkupUnderline extends KnowledgeSourceMarkup, MarkupColor, MarkupFont, Partial<MarkupData> {}

interface MarkupHighlight extends KnowledgeSourceMarkup, MarkupColor, MarkupFont, Partial<MarkupData> {
    opacity: number
}
