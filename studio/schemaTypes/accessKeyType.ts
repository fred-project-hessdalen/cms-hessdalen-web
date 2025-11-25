// schemas/accessKeyType.ts
import { defineType, defineField } from "sanity";
import { v4 as uuidv4 } from 'uuid';

export const accessKeyType = defineType({
    name: "accessKey",
    title: "Access Key",
    type: "document",
    fields: [
        defineField({
            name: "key",
            title: "Access Key",
            type: "string",
            description: "Auto-generated unique access key",
            readOnly: true,
            initialValue: () => uuidv4(),
        }),
        defineField({
            name: "name",
            title: "Name",
            type: "string",
            description: "Name of the person this key is assigned to",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "email",
            title: "Email",
            type: "string",
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: "expiresAt",
            title: "Expires At",
            type: "datetime",
            description: "When this access key expires",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "isActive",
            title: "Is Active",
            type: "boolean",
            description: "Can be used to manually disable a key",
            initialValue: true,
        }),
        defineField({
            name: "notes",
            title: "Notes",
            type: "text",
            description: "Internal notes about this key",
        }),
    ],
    preview: {
        select: {
            key: "key",
            name: "name",
            email: "email",
            expiresAt: "expiresAt",
            isActive: "isActive",
        },
        prepare: ({ key, name, email, expiresAt, isActive }) => {
            const expDate = expiresAt ? new Date(expiresAt).toLocaleDateString('no') : "No expiry";
            const status = isActive ? "✓" : "✗";
            return {
                title: `${status} ${name} <${email}>`,
                subtitle: `until ${expDate.substring(0, 10)}`,
            };
        },
    },
});
