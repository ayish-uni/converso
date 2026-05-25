import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";
import { AppError } from "../utils/appError.js";
import { moderateContent } from "../utils/contentModeration.js";
import { translateHybrid } from "./translationService.js";

function normalizeId(value) {
  return value?.toString();
}

export async function ensureUsersCanChat(sender, receiver) {
  if (!receiver) {
    throw new AppError("Receiver not found.", 404);
  }

  const senderBlocked = sender.blockedUsers.some(
    (userId) => normalizeId(userId) === normalizeId(receiver._id),
  );
  const receiverBlocked = receiver.blockedUsers.some(
    (userId) => normalizeId(userId) === normalizeId(sender._id),
  );

  if (senderBlocked || receiverBlocked) {
    throw new AppError("Messaging is unavailable with this user.", 403);
  }
}

export async function getOrCreateDirectChat(senderId, receiverId) {
  let chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId], $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [senderId, receiverId],
      lastMessageAt: new Date(),
    });
  }

  return chat;
}

export async function createTranslatedMessage({
  sender,
  receiver,
  text,
  initialStatus = "sent",
}) {
  await ensureUsersCanChat(sender, receiver);

  const cleanText = String(text || "").trim();
  if (!cleanText) {
    throw new AppError("Message text is required.", 400);
  }

  const chat = await getOrCreateDirectChat(sender._id, receiver._id);
  const moderation = moderateContent(cleanText);

  if (moderation.flagged) {
    // Check if it's a critical violation
    const critical = moderation.details.some((d) =>
      ["self_harm", "violence", "adult", "harassment"].includes(d.category),
    );
    if (critical) {
      throw new AppError(`Message blocked: ${moderation.reasons[0]}`, 400);
    }
  }

  // Translate message into the receiver's preferred language (always)
  // Determine receiver's language; fallback to English if undefined
  const receiverLang = (receiver.preferredLanguage || 'en').toLowerCase();
  let receiverTranslation;
  try {
    receiverTranslation = await translateHybrid(
      cleanText,
      sender.preferredLanguage, // Use sender's preferred language as fallback source
      receiverLang,
    );
  } catch (err) {
    console.error('[Translation] Receiver translation failed:', err);
    // Fallback – use original text and mark as failed
    receiverTranslation = {
      originalText: cleanText,
      translatedText: cleanText,
      sourceLanguage: sender.preferredLanguage || 'unknown',
      targetLanguage: receiver.preferredLanguage?.toLowerCase() || 'unknown',
      provider: 'Fallback',
      accuracy: 'low',
    };
    // Override status to indicate failure
    initialStatus = 'failed';
  }

  // Optional: also translate for the sender's view (so they see their own language)
  let senderTranslation = receiverTranslation;
  try {
    senderTranslation = await translateHybrid(
      cleanText,
      receiverTranslation.sourceLanguage,
      sender.preferredLanguage,
    );
  } catch (err) {
    console.error('[Translation] Sender translation fallback:', err);
    // Keep senderTranslation as same as receiverTranslation
  }

  const message = await Message.create({
    chatId: chat._id,
    senderId: sender._id,
    receiverId: receiver._id,
    originalText: cleanText,
    translatedText: receiverTranslation.translatedText,
    senderTranslatedText: senderTranslation.translatedText,
    receiverTranslatedText: receiverTranslation.translatedText,
    senderLanguage: receiverTranslation.sourceLanguage || sender.preferredLanguage,
    receiverLanguage: receiver.preferredLanguage,
    translationProvider: receiverTranslation.provider,
    translationAccuracy: receiverTranslation.accuracy || 'medium',
    status: initialStatus,
    moderationFlagged: moderation.flagged,
    moderationReasons: moderation.reasons,
    originalLanguage: receiverTranslation.sourceLanguage,
    translationMetadata: {
      detectedLanguage: receiverTranslation.sourceLanguage,
      translationProvider: receiverTranslation.provider,
      confidence: receiverTranslation.confidence || null,
    },
  });

  chat.lastMessageId = message._id;
  chat.lastMessageAt = message.createdAt;
  chat.deletedBy = [];
  await chat.save();

  return Message.findById(message._id)
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage")
    .populate("chatId");
}

export function serializeMessage(message, viewerId = null) {
  const sender = message.senderId || {};
  const receiver = message.receiverId || {};
  const viewerIsSender =
    normalizeId(viewerId) === normalizeId(sender._id || message.senderId);
  const senderTranslatedText =
    message.senderTranslatedText || message.translatedText;
  const receiverTranslatedText =
    message.receiverTranslatedText || message.translatedText;
  const displayText = viewerIsSender
    ? senderTranslatedText
    : receiverTranslatedText;

  // Handle deleted messages
  const isDeletedForEveryone = message.isDeleted && message.deleteType === "everyone";
  const isDeletedForMe = message.deletedForUsers?.some(
    (d) => normalizeId(d.userId) === normalizeId(viewerId),
  );

  if (isDeletedForMe) {
    return {
      _id: normalizeId(message._id),
      chatId: normalizeId(message.chatId?._id || message.chatId),
      isHidden: true,
      createdAt: message.createdAt,
    };
  }

  if (isDeletedForEveryone) {
    return {
      _id: normalizeId(message._id),
      chatId: normalizeId(message.chatId?._id || message.chatId),
      senderId: normalizeId(sender._id || message.senderId),
      receiverId: normalizeId(receiver._id || message.receiverId),
      senderPublicId: sender.publicId,
      receiverPublicId: receiver.publicId,
      senderUsername: sender.username,
      receiverUsername: receiver.username,
      originalText: "This message was deleted",
      translatedText: "This message was deleted",
      senderTranslatedText: null,
      receiverTranslatedText: null,
      displayText: "This message was deleted",
      senderLanguage: message.senderLanguage,
      receiverLanguage: message.receiverLanguage,
      translationProvider: message.translationProvider,
      status: message.status,
      messageType: "text",
      isDeleted: true,
      deletedAt: message.deletedAt,
      deletedBy: normalizeId(message.deletedBy),
      deleteType: "everyone",
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  return {
    _id: normalizeId(message._id),
    chatId: normalizeId(message.chatId?._id || message.chatId),
    senderId: normalizeId(sender._id || message.senderId),
    receiverId: normalizeId(receiver._id || message.receiverId),
    senderPublicId: sender.publicId,
    receiverPublicId: receiver.publicId,
    senderUsername: sender.username,
    receiverUsername: receiver.username,
    originalText: message.originalText,
    translatedText: message.translatedText,
    senderTranslatedText,
    receiverTranslatedText,
    displayText,
    senderLanguage: message.senderLanguage,
    receiverLanguage: message.receiverLanguage,
    translationProvider: message.translationProvider,
    status: message.status,
    moderationFlagged: Boolean(message.moderationFlagged),
    moderationReasons: message.moderationReasons || [],
    messageType: message.messageType || "text",
    mediaUrl: message.mediaUrl,
    mediaFileName: message.mediaFileName,
    mediaMimeType: message.mediaMimeType,
    mediaDuration: message.mediaDuration,
    mediaSize: message.mediaSize,
    translationAccuracy: message.translationAccuracy || "medium",
    originalLanguage: message.originalLanguage,
    translationMetadata: message.translationMetadata || {},
    audioPhonetic: message.audioPhonetic || {},
    isDeleted: false,
    reactions: message.reactions || [],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export function serializeChat(chat, currentUserId, options = {}) {
  const currentId = normalizeId(currentUserId);
  const partner =
    chat.participants?.find(
      (participant) => normalizeId(participant._id) !== currentId,
    ) || {};

  // Check if last message is before clear time
  const clearEntry = chat.clearedByUsers?.find(
    (c) => normalizeId(c.userId) === currentId,
  );
  const clearedAt = clearEntry ? new Date(clearEntry.clearedAt) : new Date(0);

  let lastMessage = null;
  if (chat.lastMessageId) {
    const serialized = serializeMessage(chat.lastMessageId, currentUserId);
    const messageCreatedAt = new Date(
      chat.lastMessageId.createdAt || serialized.createdAt,
    );

    if (messageCreatedAt <= clearedAt) {
      serialized.isHidden = true;
    }
    lastMessage = serialized;
  }

  return {
    _id: normalizeId(chat._id),
    participants: (chat.participants || []).map((participant) => ({
      id: normalizeId(participant._id),
      publicId: participant.publicId,
      username: participant.username,
      preferredLanguage: participant.preferredLanguage,
      lastSeenAt: participant.lastSeenAt,
      avatarUrl: participant.avatarUrl,
    })),
    partner: {
      id: normalizeId(partner._id),
      publicId: partner.publicId,
      username: partner.username,
      preferredLanguage: partner.preferredLanguage,
      lastSeenAt: partner.lastSeenAt,
      avatarUrl: partner.avatarUrl,
    },
    lastMessage,
    lastMessageAt: lastMessage?.isHidden ? null : chat.lastMessageAt,
    unreadCount: Number(options.unreadCount || 0),
    partnerOnline: Boolean(options.partnerOnline),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

export async function markMessagesAsStatus({
  chatId,
  userId,
  status,
  onlyForReceiver = false,
}) {
  const query = {
    chatId,
    status: { $ne: status },
  };

  if (onlyForReceiver) {
    query.receiverId = userId;
  }

  await Message.updateMany(query, { $set: { status } });

  return Message.find({ chatId })
    .sort({ createdAt: 1 })
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage")
    .populate("chatId");
}
