import { pageType } from "./pageType";
import { newsType } from "./newsType"
import { eventType } from "./eventType"
import { personType } from "./personType"
import { venueType } from "./venueType"
// Importing custom block types
import { imageBlock } from "./blocks/imageBlock"
import { callout } from "./blocks/callout"
import { collapsible } from "./blocks/collapsible"
import { credit } from "./blocks/credit"
import { imageGallery } from "./blocks/imageGallery"
import { imageList } from "./blocks/imageList"
import { textColumns } from "./blocks/textColumns"
import { youtubeVideo } from "./blocks/youtubeVideo"
import { socialLink } from "./objects/socialLink"
import { siteSettings } from "./singletons/siteSettings"
import { siteMenu } from "./navigation/siteMenu"
import { menuItem } from "./navigation/menuItem"
import { menuLink } from "./navigation/menuLink"

export const schemaTypes = [
    pageType,
    eventType,
    venueType,
    newsType,
    personType,
    imageBlock, textColumns, imageGallery, imageList, callout, collapsible, credit, youtubeVideo,
    socialLink,
    siteSettings,
    siteMenu,
    menuItem,
    menuLink
]
