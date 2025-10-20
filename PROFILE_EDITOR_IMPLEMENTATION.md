# Token-Based Profile Editor Implementation

## Overview
Implemented a self-service profile editor where members can update their own privacy settings without needing a Sanity account.

## Features Implemented

### 1. **New Schema Fields** (`personType.ts`)
- `canShowEmail` (boolean) - Control email visibility
- `isPublic` (boolean) - Control if profile appears on public website
- `profileToken` (string, hidden) - Secure UUID for profile editing

### 2. **Migration** (`/studio/migrations/generateProfileTokens.ts`)
- Generates unique UUID tokens for all existing people
- Run this migration in Sanity Studio to create tokens

### 3. **Profile Edit Form** (`/web/src/components/ProfileEditForm.tsx`)
- Client component with form for editing:
  - Mobile number (text input)
  - isPublic checkbox (show profile on website)
  - canShowEmail checkbox (show email publicly)
  - canShowMobileNumber checkbox (show phone publicly)
- Shows read-only name and email
- Displays success/error messages

### 4. **Profile Page Route** (`/web/src/app/profile/[token]/page.tsx`)
- URL: `/profile/[token]`
- Validates token and fetches person data
- Shows "Invalid Link" error for bad tokens
- Renders ProfileEditForm component

### 5. **API Route** (`/web/src/app/api/profile/[token]/route.ts`)
- PATCH endpoint: `/api/profile/[token]`
- Validates token before allowing updates
- Only allows updating specific fields (security)
- Uses writeClient with SANITY_API_WRITE_TOKEN

### 6. **Updated Queries** (`people.query.ts`)
- Added `isPublic == true` filter to:
  - PEOPLE_LIST_QUERY
  - PEOPLE_BY_ROLE_QUERY
  - PEOPLE_BY_AFFILIATION_QUERY
  - PEOPLE_SEARCH_QUERY
- Added privacy fields to PEOPLE_FIELDS
- Updated Zod schemas with new fields

### 7. **Environment Variable**
- Added `SANITY_API_WRITE_TOKEN` to env.ts
- Required for API route to update Sanity documents

## Setup Instructions

### Step 1: Environment Variable
Add to your `.env.local` file:
```bash
SANITY_API_WRITE_TOKEN=your_token_here
```

To get a write token:
1. Go to https://sanity.io/manage
2. Select your project
3. Go to API → Tokens
4. Create new token with "Editor" permissions
5. Copy the token

### Step 2: Run Migration
In Sanity Studio:
```bash
cd studio
npm run migrate
```
Select the "Generate profile tokens for all people" migration.

### Step 3: Get Profile Link for a Member
1. Open a person document in Sanity Studio
2. Copy their `profileToken` (hidden field - you may need to view raw JSON)
3. Or query via GROQ in Vision:
   ```groq
   *[_type == "person" && email == "member@example.com"][0]{
     name,
     email,
     profileToken
   }
   ```

### Step 4: Send Link to Member
Send them: `https://yoursite.com/profile/[their-token]`

Example: `https://yoursite.com/profile/abc-123-def-456`

## Usage Flow

1. **Admin generates link**: Query Sanity for person's profileToken
2. **Admin sends email**: Include profile edit link
3. **Member clicks link**: Opens `/profile/[token]` page
4. **Member edits settings**: Updates mobile number and privacy checkboxes
5. **Member saves**: Form submits to `/api/profile/[token]`
6. **API validates**: Checks token is valid
7. **API updates**: Writes allowed fields to Sanity
8. **Changes reflected**: Public pages now respect privacy settings

## Privacy Logic

### Public Listing (`isPublic`)
- `true` (default): Profile appears in `/people` lists
- `false`: Profile hidden from public, only visible to Sanity admins

### Email Visibility (`canShowEmail`)
- `true`: Email shown as clickable link
- `false` (default): Email hidden from public

### Mobile Visibility (`canShowMobileNumber`)
- `true`: Phone number shown as clickable link
- `false` (default): Phone number hidden from public

## Display Logic Example

```typescript
// In your components:
{person.canShowEmail && person.email && (
  <a href={`mailto:${person.email}`}>{person.email}</a>
)}

{person.canShowMobileNumber && person.mobile && (
  <a href={`tel:${person.mobile}`}>{person.mobile}</a>
)}
```

## Security Features

✅ Token-based authentication (no passwords needed)
✅ Hard-to-guess UUIDs (cryptographically secure)
✅ Only specific fields can be updated (whitelist approach)
✅ Token validation before any updates
✅ Server-side API route (token not exposed to client)
✅ Write token stored server-side only

## Future Enhancements

You can easily add more editable fields:
1. Add field to person schema
2. Add to `allowedFields` in API route
3. Add to form in ProfileEditForm.tsx
4. Add to ProfileSchema in profile page

## Files Changed

### Studio (Sanity CMS)
- `/studio/schemaTypes/personType.ts` - Added 3 new fields
- `/studio/migrations/generateProfileTokens.ts` - New migration

### Web (Next.js)
- `/web/src/lib/sanity/env.ts` - Added SANITY_API_WRITE_TOKEN
- `/web/src/lib/sanity/live.ts` - Added writeClient
- `/web/src/lib/sanity/query/people.query.ts` - Updated queries and schemas
- `/web/src/components/ProfileEditForm.tsx` - New component
- `/web/src/app/profile/[token]/page.tsx` - New route
- `/web/src/app/api/profile/[token]/route.ts` - New API endpoint

## Notes

- Members do NOT need Sanity accounts
- Each person has a unique, permanent token
- Tokens should be kept private (sent via email)
- Public pages automatically filter by `isPublic == true`
- Privacy settings controlled by member, not admin
