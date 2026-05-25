import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalText: {
      type: String,
      required: true,
      trim: true,
    },
    translatedText: {
      type: String,
      required: true,
      trim: true,
    },
    senderTranslatedText: {
      type: String,
      default: null,
      trim: true,
    },
    receiverTranslatedText: {
      type: String,
      default: null,
      trim: true,
    },
    senderLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    receiverLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    translationProvider: {
      type: String,
      enum: [
        "DeepL",
        "Google",
        "Google Translate (Free API)",
        "None",
        "Neural Relay (Local)",
        "Neural Relay Fallback",
        "Neural Relay (Verified)",
        "MyMemory",
      ],
      default: "None",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },
    moderationFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    moderationReasons: {
      type: [String],
      default: [],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "voice", "document", "video"],
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaFileName: {
      type: String,
      default: null,
    },
    mediaMimeType: {
      type: String,
      default: null,
    },
    mediaDuration: {
      type: Number,
      default: null,
    },
    mediaSize: {
      type: Number,
      default: null,
    },
    translationAccuracy: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    originalLanguage: {
      type: String,
      default: null,
    },
    translationMetadata: {
      detectedLanguage: {
        type: String,
        default: null,
      },
      translationProvider: {
        type: String,
        enum: [
          "DeepL",
          "Google",
          "Google Translate (Free API)",
          "None",
          "Neural Relay (Local)",
          "Neural Relay Fallback",
          "Neural Relay (Verified)",
          "MyMemory",
        ],
        default: "None",
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
      },
    },
    audioPhonetic: {
      word: {
        type: String,
        default: null,
      },
      pronunciation: {
        type: String,
        default: null,
      },
      audioUrl: {
        type: String,
        default: null,
      },
    },
    // WhatsApp-style message deletion
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deleteType: {
      type: String,
      enum: ["everyone", "me", null],
      default: null,
    },
    deletedForUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: Date.now },
      },
    ],
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
