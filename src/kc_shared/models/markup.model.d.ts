import { EventModel } from "./event.model";
import { UuidModel } from "./uuid.model";
export interface KnowledgeSourceMarkup {
    id: UuidModel;
    pos: {
        x: Number;
        y: Number;
        width: Number;
        height: Number;
    };
    events?: EventModel;
}
export interface MarkupColor {
    color: string;
}
export interface MarkupFont {
    weight: number;
}
export interface MarkupData {
    data: string;
}
export interface MarkupNote extends KnowledgeSourceMarkup {
    title: string;
    body: string;
}
export interface MarkupSticker extends KnowledgeSourceMarkup, MarkupData {
    link?: string;
}
export interface MarkupUnderline extends KnowledgeSourceMarkup, MarkupColor, MarkupFont, Partial<MarkupData> {
}
export interface MarkupHighlight extends KnowledgeSourceMarkup, MarkupColor, MarkupFont, Partial<MarkupData> {
    opacity: number;
}
