// packages/shared/src/interfaces/chat.interface.ts
import {
  ChatMessage,
  ChatRoom,
  ChatParticipant,
  ChatModeration,
  ChatEmote,
  ChatCommand,
  ChatHistory,
  ChatFilter,
} from '../types/chat.types';

export interface IChatService {
  // Message management
  sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    type?: ChatMessage['type']
  ): Promise<ChatMessage>;
  editMessage(
    messageId: string,
    newContent: string,
    editorId: string
  ): Promise<ChatMessage>;
  deleteMessage(messageId: string, deleterId: string): Promise<void>;
  getMessage(messageId: string): Promise<ChatMessage | null>;

  // Room management
  createRoom(
    type: ChatRoom['type'],
    name?: string,
    ownerId?: string
  ): Promise<ChatRoom>;
  joinRoom(roomId: string, userId: string): Promise<void>;
  leaveRoom(roomId: string, userId: string): Promise<void>;
  getRoom(roomId: string): Promise<ChatRoom | null>;
  getRoomsForUser(userId: string): Promise<ChatRoom[]>;

  // Message history
  getMessageHistory(
    roomId: string,
    limit?: number,
    before?: Date
  ): Promise<ChatHistory>;
  searchMessages(
    roomId: string,
    query: string,
    limit?: number
  ): Promise<ChatMessage[]>;

  // Moderation
  moderateMessage(
    messageId: string,
    action: ChatModeration['action'],
    moderatorId: string,
    reason: string
  ): Promise<void>;
  muteUser(
    roomId: string,
    userId: string,
    duration: number,
    moderatorId: string,
    reason: string
  ): Promise<void>;
  unmuteUser(
    roomId: string,
    userId: string,
    moderatorId: string
  ): Promise<void>;
  kickUser(
    roomId: string,
    userId: string,
    moderatorId: string,
    reason: string
  ): Promise<void>;
  banUser(
    roomId: string,
    userId: string,
    moderatorId: string,
    reason: string,
    duration?: number
  ): Promise<void>;

  // Emotes
  getAvailableEmotes(userId: string): Promise<ChatEmote[]>;
  addCustomEmote(
    emote: Partial<ChatEmote>,
    uploaderId: string
  ): Promise<ChatEmote>;
  removeEmote(emoteId: string): Promise<void>;

  // Commands
  executeCommand(command: ChatCommand): Promise<void>;
  getAvailableCommands(userId: string, roomId: string): Promise<string[]>;
}

export interface IChatRepository {
  // Messages
  saveMessage(message: Partial<ChatMessage>): Promise<ChatMessage>;
  findMessageById(id: string): Promise<ChatMessage | null>;
  findMessagesByRoom(
    roomId: string,
    limit?: number,
    before?: Date
  ): Promise<ChatMessage[]>;
  updateMessage(
    id: string,
    updates: Partial<ChatMessage>
  ): Promise<ChatMessage>;
  deleteMessage(id: string): Promise<void>;
  searchMessages(roomId: string, query: string): Promise<ChatMessage[]>;

  // Rooms
  saveRoom(room: Partial<ChatRoom>): Promise<ChatRoom>;
  findRoomById(id: string): Promise<ChatRoom | null>;
  findRoomsByUser(userId: string): Promise<ChatRoom[]>;
  updateRoom(id: string, updates: Partial<ChatRoom>): Promise<ChatRoom>;
  deleteRoom(id: string): Promise<void>;

  // Participants
  addParticipant(
    roomId: string,
    participant: Partial<ChatParticipant>
  ): Promise<ChatParticipant>;
  removeParticipant(roomId: string, userId: string): Promise<void>;
  updateParticipant(
    roomId: string,
    userId: string,
    updates: Partial<ChatParticipant>
  ): Promise<ChatParticipant>;
  getParticipants(roomId: string): Promise<ChatParticipant[]>;
}

export interface IChatModerationService {
  // Content filtering
  filterMessage(
    content: string,
    filter: ChatFilter
  ): Promise<{ allowed: boolean; filteredContent: string; reasons: string[] }>;
  detectSpam(
    message: ChatMessage,
    userHistory: ChatMessage[]
  ): Promise<boolean>;
  detectFlood(messages: ChatMessage[]): Promise<boolean>;

  // User moderation
  getModerationHistory(userId: string): Promise<ChatModeration[]>;
  isUserMuted(roomId: string, userId: string): Promise<boolean>;
  isUserBanned(roomId: string, userId: string): Promise<boolean>;
  getUserPermissions(
    roomId: string,
    userId: string
  ): Promise<ChatParticipant['permissions']>;

  // Auto-moderation
  setupAutoModeration(
    roomId: string,
    rules: AutoModerationRule[]
  ): Promise<void>;
  processAutoModeration(message: ChatMessage): Promise<ModerationAction | null>;
}

export interface IEmoteService {
  getEmoteById(id: string): Promise<ChatEmote | null>;
  getEmotesByCategory(category: string): Promise<ChatEmote[]>;
  getUserEmotes(userId: string): Promise<ChatEmote[]>;
  uploadEmote(
    file: File,
    name: string,
    category: string,
    uploaderId: string
  ): Promise<ChatEmote>;
  deleteEmote(id: string): Promise<void>;
  validateEmote(file: File): Promise<{ valid: boolean; errors: string[] }>;
}

export interface IChatNotificationService {
  notifyNewMessage(message: ChatMessage, recipients: string[]): Promise<void>;
  notifyMention(message: ChatMessage, mentionedUserId: string): Promise<void>;
  notifyModeration(
    moderation: ChatModeration,
    targetUserId: string
  ): Promise<void>;
  notifyRoomInvite(
    roomId: string,
    invitedUserId: string,
    inviterId: string
  ): Promise<void>;
}

interface AutoModerationRule {
  id: string;
  type: 'word_filter' | 'spam_detection' | 'flood_protection' | 'link_filter';
  enabled: boolean;
  action: 'warn' | 'mute' | 'delete' | 'ban';
  duration?: number; // for mute/ban actions
  parameters: Record<string, any>;
}

interface ModerationAction {
  action: ChatModeration['action'];
  reason: string;
  duration?: number;
  deleteMessage?: boolean;
}
