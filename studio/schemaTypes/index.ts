import { pageType } from "./pageType";
import { newsType } from "./newsType"
import { eventType } from "./eventType"
import { personType } from "./personType"
import { partType } from "./partType"
import { venueType } from "./venueType"
import { categoryType } from "./categoryType"
import { roleType } from "./roleType"
import { membershipType } from "./membershipType"
import { organizationalRole } from "./organizationalRole"
import { affiliationType } from "./affiliationType"
import { professionalTitle } from "./professionalTitle"
// Importing custom block types
import { imageBlock } from "./blocks/imageBlock"
import { callout } from "./blocks/callout"
import { collapsible } from "./blocks/collapsible"
import { credit } from "./blocks/credit"
import { imageGallery } from "./blocks/imageGallery"
import { imageList } from "./blocks/imageList"
import { partsList } from "./blocks/partsList"
import { textColumns } from "./blocks/textColumns"
import { youtubeVideo } from "./blocks/youtubeVideo"
import { googleSlidesEmbed } from "./blocks/googleSlidesEmbed"
import { googleDocumentEmbed } from "./blocks/googleDocumentEmbed"
import { socialLink } from "./objects/socialLink"
import { professionalAffiliation } from "./objects/professionalAffiliation"
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
    partType,
    categoryType,
    roleType,
    membershipType,
    organizationalRole,
    affiliationType,
    professionalTitle,
    imageBlock, textColumns, imageGallery, imageList, partsList, callout, collapsible, credit, youtubeVideo, googleSlidesEmbed, googleDocumentEmbed,
    socialLink,
    professionalAffiliation,
    siteSettings,
    siteMenu,
    menuItem,
    menuLink
]
