# Lovable Prompt Templates

## Template 1: Fix Broken Button

```
I need to fix the [BUTTON_NAME] button in [COMPONENT_PATH].

Current Issue: [DESCRIBE_ISSUE]

Expected Behavior: [DESCRIBE_EXPECTED]

Tech Spec Reference: Page [PAGE_NUMBER]

Context from docs:
- Component: [COMPONENT_NAME] at [FILE_PATH]
- Related components: [LIST_RELATED]
- Integration points: [LIST_INTEGRATIONS]
```

**Example**:
```
I need to fix the "Send Message" button in ChatInterface.

Current Issue: Button doesn't disable during message sending

Expected Behavior: Button should be disabled while isLoading is true

Tech Spec Reference: Page 13-14

Context from docs:
- Component: ChatInterface at src/components/chat/ChatInterface.tsx
- Related components: MessageInput, MessageBubble
- Integration points: conversationService, ai-chat edge function
```

---

## Template 2: Add New Form Field

```
Add a new [FIELD_TYPE] field to [FORM_COMPONENT].

Field Name: [FIELD_NAME]
Validation Rules: [DESCRIBE_RULES]
Database Column: [TABLE.COLUMN]

Pattern to follow: See Form Handling Pattern in docs/04-Code-Patterns-Examples.md

Tech Spec Reference: Page [PAGE_NUMBER]
```

---

## Template 3: Create New Component

```
Create a new component called [COMPONENT_NAME] in [DIRECTORY].

Purpose: [DESCRIBE_PURPOSE]

Props needed:
- [PROP_1]: [TYPE] - [DESCRIPTION]
- [PROP_2]: [TYPE] - [DESCRIPTION]

Should follow: Component Creation Pattern from docs/04-Code-Patterns-Examples.md

Integration with: [LIST_COMPONENTS]
```

---

## Template 4: Debug API Error

```
Debug API error in [SERVICE_NAME].

Error message: [ERROR_TEXT]

Service file: [FILE_PATH]
API endpoint: [ENDPOINT]
Expected response: [DESCRIBE]

Check:
1. RLS policies for [TABLE_NAME]
2. Authentication token
3. Tenant isolation
4. Error handling pattern from docs/04-Code-Patterns-Examples.md
```

---

## References
- **All Patterns**: docs/04-Code-Patterns-Examples.md
- **Components**: docs/03-Component-API-Reference-Map.md
- **Features**: docs/02-Complete-Feature-Inventory.md
