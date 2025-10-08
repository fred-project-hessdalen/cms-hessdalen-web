// /apps/studio/sanity.config.ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import structure from "./structure";
import { schemaTypes } from "./schemaTypes";

// Mark singletons
const singletonTypes = new Set(["siteSettings"]);
// Only allow these actions on singletons
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "default",
  title: "Project Hessdalen",

  // These are fine as process.env in Sanity Studio v3+
  projectId: 'rydrzqyk',
  dataset: 'production',
  // projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  // dataset: process.env.SANITY_STUDIO_DATASET! || "production",

  // Optional, but handy if you want the Studio at /studio in Next.js setups
  // basePath: "/studio",

  plugins: [
    structureTool({ structure }), // your custom desk structure
    visionTool(),                 // keep Vision
  ],

  schema: {
    types: schemaTypes,
  },

  // Enforce singleton behavior in the Desk
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      // Prevent creating new instances of singletons from the global "Create new" menu
      if (creationContext.type === "global") {
        return prev.filter((t) => !singletonTypes.has(t.templateId as string));
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      // Limit actions for singleton docs
      if (singletonTypes.has(schemaType)) {
        return prev.filter(
          ({ action }) => action && singletonActions.has(action)
        );
      }
      return prev;
    },
  },
});
