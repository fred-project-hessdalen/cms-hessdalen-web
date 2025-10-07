import { pageType } from "./pageType";
import { newsType } from "./newsType"
import { eventType } from "./eventType"
import { personType } from "./personType"
import { venueType } from "./venueType"
// Importing custom block types
import { callout } from "./blocks/callout"
import { credit } from "./blocks/credit"
import { imageGallery } from "./blocks/imageGallery"
import { textColumns } from "./blocks/textColumns"
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
    textColumns, imageGallery, callout, credit,
    socialLink,
    siteSettings,
    siteMenu,
    menuItem,
    menuLink
]
