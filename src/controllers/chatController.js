import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import {
  createTranslatedMessage,
  ensureUsersCanChat,
  getOrCreateDirectChat,
  markMessagesAsStatus,
  serializeChat,
  serializeMessage,
} from "../services/chatService.js";
import { emitToUserRoom, getIo, isUserOnline } from "../socket/socketServer.js";
import {
  validateFile,
  generateFileName,
  saveFile,
} from "../utils/fileUpload.js";
import {
  analyzeTranslationAccuracy,
  extractKeywords,
} from "../utils/translationAnalysis.js";

async function findReceiver({ receiverId, receiverPublicId }) {
  if (receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
    return User.findById(receiverId);
  }

  if (receiverPublicId) {
    return User.findOne({ publicId: receiverPublicId });
  }

  return null;
}

async function loadChatForUser(chatId, userId) {
  const chat = await Chat.findById(chatId)
    .populate(
      "participants",
      "publicId username preferredLanguage lastSeenAt avatarUrl",
    )
    .populate({
      path: "lastMessageId",
      populate: [
        { path: "senderId", select: "publicId username preferredLanguage" },
        { path: "receiverId", select: "publicId username preferredLanguage" },
      ],
    });

  if (!chat) {
    throw new AppError("Chat not found.", 404);
  }

  const isParticipant = chat.participants.some(
    (participant) => participant._id.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new AppError("You do not have access to this chat.", 403);
  }

  return chat;
}

async function emitStatusUpdate(chatId, status, actorId) {
  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 })
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage")
    .populate("chatId");

  const io = getIo();
  if (!io || messages.length === 0) {
    return messages;
  }

  const payload = {
    chatId,
    status,
    messageIds: messages.map((message) => message._id.toString()),
    actorId: actorId.toString(),
  };

  const participants = new Set();
  messages.forEach((message) => {
    participants.add(message.senderId._id.toString());
    participants.add(message.receiverId._id.toString());
  });

  participants.forEach((participantId) => {
    emitToUserRoom(
      participantId,
      status === "read" ? "message_read" : "message_delivered",
      payload,
    );
  });

  return messages;
}

export const sendMessage = asyncHandler(async (req, res) => {
  const receiver = await findReceiver(req.body);
  const initialStatus =
    receiver && isUserOnline(receiver._id.toString()) ? "delivered" : "sent";
  const populatedMessage = await createTranslatedMessage({
    sender: req.user,
    receiver,
    text: req.body.text,
    initialStatus,
  });

  const payloadForSender = serializeMessage(populatedMessage, req.user._id);
  const payloadForReceiver = serializeMessage(populatedMessage, receiver._id);
  emitToUserRoom(req.user._id.toString(), "receive_message", payloadForSender);
  emitToUserRoom(
    receiver._id.toString(),
    "receive_message",
    payloadForReceiver,
  );

  if (payloadForSender.status === "delivered") {
    await emitStatusUpdate(payloadForSender.chatId, "delivered", receiver._id);
  }

  res.status(201).json({ message: payloadForSender });
});

export const sendMediaMessage = asyncHandler(async (req, res) => {
  const { receiverId, receiverPublicId, mediaType, caption } = req.body;

  if (!req.file) {
    throw new AppError("No file provided.", 400);
  }

  const validation = validateFile(
    req.file.buffer,
    req.file.mimetype,
    req.file.size,
  );
  if (!validation.valid) {
    throw new AppError(validation.error, 400);
  }

  const receiver = await findReceiver({ receiverId, receiverPublicId });
  if (!receiver) {
    throw new AppError("Receiver not found.", 404);
  }

  await ensureUsersCanChat(req.user, receiver);

  const fileName = generateFileName(req.file.originalname);
  const mediaUrl = saveFile(req.file.buffer, fileName);

  const chat = await getOrCreateDirectChat(req.user._id, receiver._id);
  const initialStatus = isUserOnline(receiver._id.toString())
    ? "delivered"
    : "sent";

  const message = await Message.create({
    chatId: chat._id,
    senderId: req.user._id,
    receiverId: receiver._id,
    originalText: caption || `[${mediaType}]`,
    translatedText: caption || `[${mediaType}]`,
    senderTranslatedText: caption || `[${mediaType}]`,
    receiverTranslatedText: caption || `[${mediaType}]`,
    senderLanguage: req.user.preferredLanguage,
    receiverLanguage: receiver.preferredLanguage,
    translationProvider: "None",
    status: initialStatus,
    messageType: mediaType,
    mediaUrl,
    mediaFileName: fileName,
    mediaMimeType: req.file.mimetype,
    mediaSize: req.file.size,
    translationAccuracy: "high",
  });

  chat.lastMessageId = message._id;
  chat.lastMessageAt = message.createdAt;
  chat.deletedBy = [];
  await chat.save();

  const populatedMessage = await Message.findById(message._id)
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage")
    .populate("chatId");

  const payloadForSender = serializeMessage(populatedMessage, req.user._id);
  const payloadForReceiver = serializeMessage(populatedMessage, receiver._id);
  emitToUserRoom(req.user._id.toString(), "receive_message", payloadForSender);
  emitToUserRoom(
    receiver._id.toString(),
    "receive_message",
    payloadForReceiver,
  );

  if (payloadForSender.status === "delivered") {
    await emitStatusUpdate(payloadForSender.chatId, "delivered", receiver._id);
  }

  res.status(201).json({ message: payloadForSender });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const limit = Number(req.query.limit || 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

  const chat = await loadChatForUser(chatId, req.user._id);

  // Get user's clear timestamp
  const clearEntry = chat.clearedByUsers.find(
    (c) => c.userId.toString() === req.user._id.toString(),
  );
  const clearedAt = clearEntry ? clearEntry.clearedAt : new Date(0);

  const query = {
    chatId,
    createdAt: { $gt: clearedAt },
    "deletedForUsers.userId": { $ne: req.user._id },
  };

  if (cursor) {
    query.createdAt.$lt = cursor;
  }

  // Filter out messages deleted for everyone (show placeholder instead)
  // or filter out if we don't want to show "This message was deleted"
  // For now, we'll keep them and handle the text in serializeMessage

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage")
    .populate("chatId");

  res.json({
    messages: messages
      .reverse()
      .map((message) => serializeMessage(message, req.user._id)),
    nextCursor:
      messages.length === limit ? messages[0].createdAt : null,
  });
});

async function buildUnreadCounts(chatItems, userId) {
  const chatIds = chatItems.map((chat) => chat._id);
  if (chatIds.length === 0) {
    return new Map();
  }

  const unreadCounts = await Message.aggregate([
    {
      $match: {
        chatId: { $in: chatIds },
        receiverId: userId,
        status: { $in: ["sent", "delivered"] },
      },
    },
    {
      $group: {
        _id: "$chatId",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    unreadCounts.map((entry) => [entry._id.toString(), entry.count]),
  );
}

export const listChats = asyncHandler(async (req, res) => {
  const blockedByUsers = await User.find({
    blockedUsers: req.user._id,
  }).select("_id");
  const restrictedIds = new Set([
    ...(req.user.blockedUsers || []).map((id) => id.toString()),
    ...blockedByUsers.map((user) => user._id.toString()),
  ]);

  const chats = await Chat.find({
    participants: req.user._id,
    deletedBy: { $ne: req.user._id },
  })
    .sort({ lastMessageAt: -1 })
    .populate(
      "participants",
      "publicId username preferredLanguage lastSeenAt avatarUrl",
    )
    .populate({
      path: "lastMessageId",
      populate: [
        { path: "senderId", select: "publicId username preferredLanguage" },
        { path: "receiverId", select: "publicId username preferredLanguage" },
      ],
    });

  const unreadCountMap = await buildUnreadCounts(chats, req.user._id);

  res.json({
    chats: chats
      .filter(
        (chat) =>
          !(chat.participants || []).some(
            (participant) =>
              participant._id.toString() !== req.user._id.toString() &&
              restrictedIds.has(participant._id.toString()),
          ),
      )
      .map((chat) => {
        const partner = chat.participants?.find(
          (participant) =>
            participant._id.toString() !== req.user._id.toString(),
        );

        return serializeChat(chat, req.user._id, {
          unreadCount: unreadCountMap.get(chat._id.toString()) || 0,
          partnerOnline: Boolean(
            partner && isUserOnline(partner._id.toString()),
          ),
        });
      }),
  });
});

export const ensureDirectChat = asyncHandler(async (req, res) => {
  const receiver = await findReceiver(req.body);
  if (!receiver) {
    throw new AppError("Receiver not found.", 404);
  }

  await ensureUsersCanChat(req.user, receiver);

  const chat = await getOrCreateDirectChat(req.user._id, receiver._id);
  const hydratedChat = await loadChatForUser(chat._id, req.user._id);

  res.status(201).json({ chat: serializeChat(hydratedChat, req.user._id) });
});

export const markChatDelivered = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  await loadChatForUser(chatId, req.user._id);
  await markMessagesAsStatus({
    chatId,
    userId: req.user._id,
    status: "delivered",
    onlyForReceiver: true,
  });
  await emitStatusUpdate(chatId, "delivered", req.user._id);
  res.json({ ok: true });
});

export const getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await loadChatForUser(chatId, req.user._id);
  const partner = chat.participants?.find(
    (participant) => participant._id.toString() !== req.user._id.toString(),
  );

  res.json({
    chat: serializeChat(chat, req.user._id, {
      partnerOnline: Boolean(partner && isUserOnline(partner._id.toString())),
    }),
  });
});

export const markChatRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  await loadChatForUser(chatId, req.user._id);
  await markMessagesAsStatus({
    chatId,
    userId: req.user._id,
    status: "read",
    onlyForReceiver: true,
  });
  await emitStatusUpdate(chatId, "read", req.user._id);
  res.json({ ok: true });
});

export const reportMessage = asyncHandler(async (req, res) => {
  const { reportedUserPublicId, reason, messageId } = req.body;
  const reportedUser = await User.findOne({ publicId: reportedUserPublicId });

  if (!reportedUser) {
    throw new AppError("Reported user not found.", 404);
  }

  let messageRef = null;
  if (messageId) {
    messageRef = await Message.findById(messageId);
    if (!messageRef) {
      throw new AppError("Reported message not found.", 404);
    }
  }

  const report = await Report.create({
    reporterId: req.user._id,
    reportedUserId: reportedUser._id,
    messageId: messageRef?._id || null,
    reason,
  });

  res.status(201).json({ report });
});

export const getAdminReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("reporterId", "publicId username")
    .populate("reportedUserId", "publicId username")
    .populate("messageId")
    .sort({ createdAt: -1 });

  res.json({ reports });
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  if (!["open", "reviewed", "dismissed"].includes(status)) {
    throw new AppError("Invalid report status.", 400);
  }

  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError("Report not found.", 404);
  }

  report.status = status;
  await report.save();

  res.json({ report });
});

// WhatsApp-style message deletion
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { type = "me" } = req.query; // "everyone" or "me"

  const message = await Message.findById(messageId)
    .populate("senderId", "_id")
    .populate("receiverId", "_id");

  if (!message) {
    throw new AppError("Message not found.", 404);
  }

  const isSender = message.senderId._id.toString() === req.user._id.toString();
  const isReceiver =
    message.receiverId._id.toString() === req.user._id.toString();

  if (!isSender && !isReceiver) {
    throw new AppError("You cannot delete this message.", 403);
  }

  if (type === "me") {
    // Add to deletedForUsers if not already there
    const alreadyDeleted = message.deletedForUsers.some(
      (d) => d.userId.toString() === req.user._id.toString(),
    );
    if (!alreadyDeleted) {
      message.deletedForUsers.push({
        userId: req.user._id,
        deletedAt: new Date(),
      });
      await message.save();
    }
  } else {
    // delete for everyone
    if (!isSender) {
      throw new AppError("Only the sender can delete for everyone.", 403);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.createdAt < oneHourAgo) {
      throw new AppError(
        "Messages can only be deleted within 1 hour of sending.",
        400,
      );
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user._id;
    message.deleteType = "everyone";
    await message.save();
  }

  // Emit deletion event
  const io = getIo();
  if (io) {
    const payload = {
      messageId: message._id.toString(),
      chatId: message.chatId.toString(),
      deleteType: type,
      deletedBy: req.user._id.toString(),
    };

    if (type === "everyone") {
      emitToUserRoom(
        message.senderId._id.toString(),
        "message_deleted",
        payload,
      );
      emitToUserRoom(
        message.receiverId._id.toString(),
        "message_deleted",
        payload,
      );
    } else {
      emitToUserRoom(req.user._id.toString(), "message_deleted", payload);
    }
  }

  res.json({
    message: "Message deleted successfully.",
    deleteType: type,
  });
});

// Get media files from chat
export const getChatMedia = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const limit = Number(req.query.limit || 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

  await loadChatForUser(chatId, req.user._id);

  const query = {
    chatId,
    messageType: { $in: ["image", "video", "document", "voice"] },
    isDeleted: false,
  };

  if (cursor) {
    query.createdAt = { $lt: cursor };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "publicId username")
    .select(
      "mediaUrl mediaFileName mediaMimeType mediaSize mediaDuration messageType createdAt",
    );

  res.json({
    media: messages.reverse(),
    nextCursor: messages.length === limit ? messages[0].createdAt : null,
  });
});

// Search messages in chat
export const getChatSearch = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { q } = req.query;
  const limit = Number(req.query.limit || 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

  await loadChatForUser(chatId, req.user._id);

  const query = {
    chatId,
    isDeleted: false,
    $or: [
      { originalText: { $regex: q, $options: "i" } },
      { translatedText: { $regex: q, $options: "i" } },
    ],
  };

  if (cursor) {
    query.createdAt = { $lt: cursor };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage");

  res.json({
    messages: messages
      .reverse()
      .map((message) => serializeMessage(message, req.user._id)),
    nextCursor: messages.length === limit ? messages[0].createdAt : null,
  });
});

// Update chat settings
export const updateChatSettings = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const updates = req.body;

  const chat = await loadChatForUser(chatId, req.user._id);

  // Update settings
  if (updates.isBlocked !== undefined) {
    chat.settings.isBlocked = updates.isBlocked;
  }
  if (updates.isMuted !== undefined) {
    chat.settings.isMuted = updates.isMuted;
    if (updates.isMuted && updates.muteUntil) {
      chat.settings.muteUntil = new Date(updates.muteUntil);
    } else if (!updates.isMuted) {
      chat.settings.muteUntil = null;
    }
  }
  if (updates.wallpaper !== undefined) {
    chat.settings.wallpaper = updates.wallpaper;
  }
  if (updates.theme !== undefined) {
    chat.settings.theme = updates.theme;
  }
  if (updates.mediaVisibility !== undefined) {
    chat.settings.mediaVisibility = updates.mediaVisibility;
  }

  await chat.save();

  // Emit settings update to both participants
  const io = getIo();
  if (io) {
    const payload = {
      chatId: chat._id.toString(),
      settings: chat.settings,
      updatedBy: req.user._id.toString(),
    };

    chat.participants.forEach((participantId) => {
      emitToUserRoom(
        participantId.toString(),
        "chat_settings_updated",
        payload,
      );
    });
  }

  res.json({
    chat: serializeChat(chat, req.user._id),
    settings: chat.settings,
  });
});

// Clear chat (delete all messages for user)
export const clearChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError("Chat not found.", 404);
  }

  // Update clearedByUsers
  const clearEntryIndex = chat.clearedByUsers.findIndex(
    (c) => c.userId.toString() === req.user._id.toString(),
  );

  const now = new Date();
  if (clearEntryIndex > -1) {
    chat.clearedByUsers[clearEntryIndex].clearedAt = now;
  } else {
    chat.clearedByUsers.push({ userId: req.user._id, clearedAt: now });
  }

  await chat.save();

  // Emit clear event to the user
  const io = getIo();
  if (io) {
    const payload = {
      chatId: chat._id.toString(),
      clearedBy: req.user._id.toString(),
      clearedAt: now,
    };
    emitToUserRoom(req.user._id.toString(), "chat_cleared", payload);
  }

  res.json({
    message: "Chat cleared successfully.",
    clearedAt: now,
  });
});

// Delete chat for user
export const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError("Chat not found.", 404);
  }

  // Add user to deletedBy if not already there
  const alreadyDeleted = chat.deletedBy.some(
    (id) => id.toString() === req.user._id.toString(),
  );
  if (!alreadyDeleted) {
    chat.deletedBy.push(req.user._id);
  }

  // Also clear the chat for this user
  const clearEntryIndex = chat.clearedByUsers.findIndex(
    (c) => c.userId.toString() === req.user._id.toString(),
  );

  const now = new Date();
  if (clearEntryIndex > -1) {
    chat.clearedByUsers[clearEntryIndex].clearedAt = now;
  } else {
    chat.clearedByUsers.push({ userId: req.user._id, clearedAt: now });
  }

  await chat.save();

  // Emit delete event to the user
  const io = getIo();
  if (io) {
    const payload = {
      chatId: chat._id.toString(),
      deletedBy: req.user._id.toString(),
      deletedAt: now,
    };

    emitToUserRoom(req.user._id.toString(), "chat_deleted", payload);
  }

  res.json({
    message: "Chat deleted successfully.",
    chatId: chat._id,
  });
});

export const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError("Message not found.", 404);
  }

  // Remove existing reaction from this user if any
  message.reactions = message.reactions.filter(
    (r) => r.userId.toString() !== req.user._id.toString(),
  );

  // Add new reaction
  message.reactions.push({
    userId: req.user._id,
    emoji,
  });

  await message.save();

  const populatedMessage = await Message.findById(messageId)
    .populate("senderId", "publicId username preferredLanguage")
    .populate("receiverId", "publicId username preferredLanguage")
    .populate("chatId");

  const payload = serializeMessage(populatedMessage);

  const io = getIo();
  if (io) {
    emitToUserRoom(message.senderId.toString(), "message_updated", payload);
    emitToUserRoom(message.receiverId.toString(), "message_updated", payload);
  }

  res.json({ message: payload });
});
