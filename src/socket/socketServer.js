import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import {
  createTranslatedMessage,
  markMessagesAsStatus,
  serializeMessage,
} from "../services/chatService.js";

const onlineUsers = new Map();
let io;

export function isUserOnline(userId) {
  return onlineUsers.has(userId.toString());
}

export function getIo() {
  return io;
}

export function emitToUserRoom(userId, eventName, payload) {
  if (!io) {
    return;
  }

  io.to(userId.toString()).emit(eventName, payload);
}

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isVerified) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
}

async function updateChatStatus({ chatId, userId, status }) {
  const messages = await markMessagesAsStatus({
    chatId,
    userId,
    status,
    onlyForReceiver: true,
  });

  const payload = {
    chatId,
    status,
    actorId: userId.toString(),
    messageIds: messages.map((message) => message._id.toString()),
  };

  const eventName = status === "read" ? "message_read" : "message_delivered";
  const participantIds = new Set();

  messages.forEach((message) => {
    participantIds.add(message.senderId._id.toString());
    participantIds.add(message.receiverId._id.toString());
  });

  participantIds.forEach((participantId) =>
    emitToUserRoom(participantId, eventName, payload),
  );
}

async function handleSendMessage(socket, payload, callback) {
  try {
    const receiver =
      (payload.receiverId && (await User.findById(payload.receiverId))) ||
      (payload.receiverPublicId &&
        (await User.findOne({ publicId: payload.receiverPublicId })));

    const initialStatus =
      receiver && isUserOnline(receiver._id.toString()) ? "delivered" : "sent";
    const populatedMessage = await createTranslatedMessage({
      sender: socket.user,
      receiver,
      text: payload.text,
      initialStatus,
    });

    const messageForSender = serializeMessage(
      populatedMessage,
      socket.user._id,
    );
    const messageForReceiver = serializeMessage(populatedMessage, receiver._id);

    emitToUserRoom(
      socket.user._id.toString(),
      "receive_message",
      messageForSender,
    );
    emitToUserRoom(
      receiver._id.toString(),
      "receive_message",
      messageForReceiver,
    );
    emitToUserRoom(
      socket.user._id.toString(),
      "message_sent",
      messageForSender,
    );

    if (messageForSender.status === "delivered") {
      await updateChatStatus({
        chatId: messageForSender.chatId,
        userId: receiver._id,
        status: "delivered",
      });
    }

    callback?.({ ok: true, message: messageForSender });
  } catch (error) {
    callback?.({ error: error.message || "Failed to send message." });
  }
}

export function createSocketServer(httpServer) {
  const allowedOrigins = [
    env.clientUrl,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    socket.join(socket.user.publicId);

    socket.on("typing", ({ receiverId, receiverPublicId, chatId }) => {
      const target = receiverId || receiverPublicId;
      if (!target) {
        return;
      }

      emitToUserRoom(target, "typing", {
        fromId: userId,
        fromPublicId: socket.user.publicId,
        fromUsername: socket.user.username,
        chatId,
      });
    });

    socket.on("stop_typing", ({ receiverId, receiverPublicId, chatId }) => {
      const target = receiverId || receiverPublicId;
      if (!target) {
        return;
      }

      emitToUserRoom(target, "stop_typing", {
        fromId: userId,
        fromPublicId: socket.user.publicId,
        fromUsername: socket.user.username,
        chatId,
      });
    });

    socket.on("send_message", (payload, callback) =>
      handleSendMessage(socket, payload, callback),
    );

    socket.on("message:send", ({ receiverPublicId, text }, callback) =>
      handleSendMessage(socket, { receiverPublicId, text }, callback),
    );

    socket.on("typing:start", ({ receiverPublicId, chatId }) => {
      emitToUserRoom(receiverPublicId, "typing", {
        fromId: userId,
        fromPublicId: socket.user.publicId,
        fromUsername: socket.user.username,
        chatId,
      });
    });

    socket.on("typing:stop", ({ receiverPublicId, chatId }) => {
      emitToUserRoom(receiverPublicId, "stop_typing", {
        fromId: userId,
        fromPublicId: socket.user.publicId,
        fromUsername: socket.user.username,
        chatId,
      });
    });

    socket.on("message_delivered", async ({ chatId }) => {
      if (!chatId) {
        return;
      }

      await updateChatStatus({
        chatId,
        userId: socket.user._id,
        status: "delivered",
      });
    });

    socket.on("message_read", async ({ chatId }) => {
      if (!chatId) {
        return;
      }

      await updateChatStatus({
        chatId,
        userId: socket.user._id,
        status: "read",
      });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(socket.user._id, { lastSeenAt: new Date() });
    });
  });

  return io;
}
