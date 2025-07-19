// packages/shared/src/types/chat.types.ts

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: ChatMessageType;
  timestamp: Date;
  tableId?: string;
  gameId?: string;
  isSystemMessage: boolean;
  metadata?: ChatMessageMetadata;
}

export type ChatMessageType =
  | 'text'
  | 'emote'
  | 'system'
  | 'action'
  | 'dealer'
  | 'tournament'
  | 'moderator';

export interface ChatMessageMetadata {
  edited?: boolean;
  editedAt?: Date;
  moderated?: boolean;
  moderatedBy?: string;
  moderatedReason?: string;
  translation?: {
    originalLanguage: string;
    translatedText: string;
    targetLanguage: string;
  };
}

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name?: string;
  participants: ChatParticipant[];
  settings: ChatRoomSettings;
  lastActivity: Date;
  messageCount: number;
}

export type ChatRoomType =
  | 'table'
  | 'tournament'
  | 'private'
  | 'global'
  | 'support';

export interface ChatParticipant {
  userId: string;
  username: string;
  role: ChatRole;
  joinedAt: Date;
  lastSeen: Date;
  permissions: ChatPermission[];
  isMuted: boolean;
  muteExpiresAt?: Date;
}

export type ChatRole = 'player' | 'moderator' | 'admin' | 'dealer' | 'observer';

export type ChatPermission =
  | 'send_message'
  | 'send_emote'
  | 'moderate'
  | 'mute_users'
  | 'kick_users'
  | 'view_history';

export interface ChatRoomSettings {
  isPublic: boolean;
  allowEmotes: boolean;
  allowImages: boolean;
  slowMode: boolean;
  slowModeInterval: number; // seconds
  maxMessageLength: number;
  autoModeration: boolean;
  wordFilter: boolean;
  allowedLanguages?: string[];
}

export interface ChatFilter {
  bannedWords: string[];
  allowedDomains: string[];
  spamThreshold: number;
  floodThreshold: number;
}

export interface ChatModeration {
  action: ModerationAction;
  targetUserId: string;
  moderatorId: string;
  reason: string;
  duration?: number; // minutes
  messageId?: string;
  timestamp: Date;
}

export type ModerationAction =
  | 'warn'
  | 'mute'
  | 'kick'
  | 'ban'
  | 'delete_message'
  | 'edit_message';

export interface ChatEmote {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  isCustom: boolean;
  isAnimated: boolean;
  requiresSubscription?: boolean;
  createdBy?: string;
}

export interface ChatCommand {
  command: string;
  args: string[];
  senderId: string;
  timestamp: Date;
  roomId: string;
}

export type ChatCommandType =
  | 'help'
  | 'mute'
  | 'unmute'
  | 'kick'
  | 'ban'
  | 'unban'
  | 'clear'
  | 'slow'
  | 'info'
  | 'whisper';

export interface ChatHistory {
  roomId: string;
  messages: ChatMessage[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}
