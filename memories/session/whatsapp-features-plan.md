# WhatsApp-Style Chat Features Implementation Plan

## Overview
Add WhatsApp-like functionality: message deletion (for everyone/me), chat-specific settings (block, clear chat, notifications), and enhanced chat management.

## Features to Implement

### 1. Message Deletion (WhatsApp Style)
- **Delete for Everyone**: Removes message from both users' views, shows "This message was deleted"
- **Delete for Me**: Removes message only from sender's view
- **Time limit**: 1 hour for delete for everyone (like WhatsApp)
- **UI**: Long-press or right-click context menu on messages

### 2. Chat-Specific Settings (WhatsApp Style)
- **Block User**: Prevent receiving messages, hide from directory
- **Clear Chat**: Delete all messages in chat (keep chat in list)
- **Mute Notifications**: Per-chat notification settings
- **Chat Wallpaper/Theme**: Per-chat customization
- **Media Visibility**: Control who can see media

### 3. Enhanced Chat Menu
- **View Contact/Profile**: Enhanced profile view
- **Media/Documents/Links**: Separate tabs for shared content
- **Search in Chat**: Find messages in chat
- **Report Chat**: Report inappropriate content

## Implementation Steps

### Phase 1: Backend Infrastructure
1. **Extend Message model** - Add deletion tracking
2. **Extend Chat model** - Add per-chat settings
3. **Add API endpoints** - Delete messages, chat settings
4. **Update socket events** - Handle message deletions

### Phase 2: Message Deletion UI
1. **Context menu component** - Right-click/long-press menu
2. **Delete confirmation dialogs** - For everyone/me options
3. **Update message rendering** - Show deleted message placeholders

### Phase 3: Chat Settings UI
1. **Chat settings panel** - WhatsApp-style settings menu
2. **Block/clear functionality** - With confirmation dialogs
3. **Notification controls** - Per-chat mute options

### Phase 4: Enhanced Features
1. **Media gallery** - View all shared media
2. **Search functionality** - Find messages in chat
3. **Chat customization** - Wallpapers, themes

## Database Schema Changes

### Message Model Additions
```javascript
{
  deletedAt: Date, // When message was deleted
  deletedBy: ObjectId, // Who deleted it (for "delete for me")
  deleteType: String, // "everyone" or "me"
  isDeleted: Boolean, // Quick check flag
}
```

### Chat Model Additions
```javascript
{
  settings: {
    isBlocked: Boolean, // User blocked this chat
    isMuted: Boolean, // Notifications muted
    muteUntil: Date, // When mute expires
    wallpaper: String, // Custom wallpaper URL
    theme: String, // Chat-specific theme
    mediaVisibility: String, // "all", "contacts", "none"
  },
  clearedAt: Date, // When chat was last cleared
  clearedBy: ObjectId, // Who cleared it
}
```

## API Endpoints to Add

### Message Management
- `DELETE /api/chat/message/:messageId` - Delete message
  - Query params: `type=everyone|me`
- `GET /api/chat/:chatId/media` - Get all media in chat
- `GET /api/chat/:chatId/search?q=query` - Search messages

### Chat Settings
- `PATCH /api/chat/:chatId/settings` - Update chat settings
- `DELETE /api/chat/:chatId/clear` - Clear all messages
- `POST /api/chat/:chatId/block` - Block/unblock chat
- `POST /api/chat/:chatId/mute` - Mute/unmute notifications

## UI Components to Create

1. **MessageContextMenu** - Right-click menu for messages
2. **ChatSettingsPanel** - WhatsApp-style settings panel
3. **DeleteConfirmationDialog** - Confirm delete actions
4. **MediaGallery** - View shared media/documents
5. **ChatSearch** - Search within conversation

## Socket Events to Add

- `message_deleted` - Notify about deleted messages
- `chat_cleared` - Notify when chat is cleared
- `chat_settings_updated` - Sync settings changes

## Verification Checkpoints

1. **Message Deletion**
   - Delete for me: Message disappears from sender's view
   - Delete for everyone: Shows "deleted" placeholder for both users
   - Time limit enforcement (1 hour)

2. **Chat Settings**
   - Block user: Can't receive/send messages
   - Clear chat: Messages gone, chat remains
   - Mute: No notifications for this chat

3. **UI/UX**
   - Context menus work on mobile/desktop
   - Settings panels match WhatsApp design
   - Confirmation dialogs prevent accidents