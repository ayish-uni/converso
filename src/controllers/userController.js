import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import { isUserOnline } from "../socket/socketServer.js";
import {
  validateFile,
  generateFileName,
  saveFile,
  deleteFile,
} from "../utils/fileUpload.js";
import {
  analyzeTranslationAccuracy,
  extractKeywords,
} from "../utils/translationAnalysis.js";

export const listUsers = asyncHandler(async (req, res) => {
  const blockedByUsers = await User.find({
    blockedUsers: req.user._id,
  }).select("_id");

  const excludedIds = [
    req.user._id,
    ...(req.user.blockedUsers || []),
    ...blockedByUsers.map((user) => user._id),
  ];

  const users = await User.find({
    _id: { $nin: excludedIds },
  })
    .select("publicId username preferredLanguage lastSeenAt avatarUrl")
    .sort({ lastSeenAt: -1 })
    .limit(100);

  res.json({
    users: users.map((userEntry) => ({
      id: userEntry._id.toString(),
      publicId: userEntry.publicId,
      username: userEntry.username,
      avatarUrl: userEntry.avatarUrl,
      preferredLanguage: userEntry.preferredLanguage,
      lastSeenAt: userEntry.lastSeenAt,
      isOnline: isUserOnline(userEntry._id.toString()),
    })),
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const queryText = String(req.query.q || "").trim();

  const blockedByUsers = await User.find({
    blockedUsers: req.user._id,
  }).select("_id");

  const excludedIds = [
    req.user._id,
    ...(req.user.blockedUsers || []),
    ...blockedByUsers.map((user) => user._id),
  ];

  const searchCriteria = {
    _id: { $nin: excludedIds },
  };

  if (queryText) {
    const regex = new RegExp(queryText, "i");
    searchCriteria.$or = [{ username: regex }, { publicId: regex }];
  }

  const users = await User.find(searchCriteria)
    .select("publicId username preferredLanguage lastSeenAt avatarUrl")
    .sort({ lastSeenAt: -1 })
    .limit(100);

  res.json({
    users: users.map((userEntry) => ({
      id: userEntry._id.toString(),
      publicId: userEntry.publicId,
      username: userEntry.username,
      avatarUrl: userEntry.avatarUrl,
      preferredLanguage: userEntry.preferredLanguage,
      lastSeenAt: userEntry.lastSeenAt,
      isOnline: isUserOnline(userEntry._id.toString()),
    })),
  });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const targetUser = await User.findOne({ publicId }).select(
    "publicId username avatarUrl preferredLanguage createdAt",
  );

  if (!targetUser) {
    throw new AppError("Profile not found.", 404);
  }

  res.json({
    user: {
      publicId: targetUser.publicId,
      username: targetUser.username,
      avatarUrl: targetUser.avatarUrl,
      preferredLanguage: targetUser.preferredLanguage,
      createdAt: targetUser.createdAt,
    },
  });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const { preferredLanguage, chatMode, theme, culturalTheme } = req.body;

  if (preferredLanguage) req.user.preferredLanguage = preferredLanguage;
  if (chatMode) req.user.chatMode = chatMode;
  if (theme) req.user.theme = theme;
  if (culturalTheme) req.user.culturalTheme = culturalTheme;

  await req.user.save();

  res.json({
    message: "Preferences updated.",
    user: {
      publicId: req.user.publicId,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl,
      preferredLanguage: req.user.preferredLanguage,
      chatMode: req.user.chatMode,
      theme: req.user.theme,
      culturalTheme: req.user.culturalTheme,
      email: req.user.email,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    },
  });
});

export const updateTranslationPreferences = asyncHandler(async (req, res) => {
  const { autoTranslate, displayMode, audioEnabled } = req.body;

  if (req.user.translationPreferences === undefined) {
    req.user.translationPreferences = {
      autoTranslate: true,
      displayMode: "classic",
      audioEnabled: false,
    };
  }

  if (autoTranslate !== undefined) {
    req.user.translationPreferences.autoTranslate = autoTranslate;
  }
  if (displayMode !== undefined) {
    req.user.translationPreferences.displayMode = displayMode;
  }
  if (audioEnabled !== undefined) {
    req.user.translationPreferences.audioEnabled = audioEnabled;
  }

  await req.user.save();

  res.json({
    message: "Translation preferences updated.",
    user: {
      publicId: req.user.publicId,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl,
      preferredLanguage: req.user.preferredLanguage,
      translationPreferences: req.user.translationPreferences,
      email: req.user.email,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect.", 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully." });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Promise.all([
    User.deleteOne({ _id: userId }),
    Chat.deleteMany({ participants: userId }),
    Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
    Report.deleteMany({
      $or: [{ reporterId: userId }, { reportedUserId: userId }],
    }),
    User.updateMany(
      { blockedUsers: userId },
      { $pull: { blockedUsers: userId } },
    ),
  ]);

  res.json({ message: "Account deleted." });
});

export const blockUser = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const targetUser = await User.findOne({ publicId });

  if (!targetUser) {
    throw new AppError("User not found.", 404);
  }

  req.user.blockedUsers = req.user.blockedUsers || [];
  const alreadyBlocked = req.user.blockedUsers.some(
    (blockedId) => blockedId.toString() === targetUser._id.toString(),
  );

  if (!alreadyBlocked) {
    req.user.blockedUsers.push(targetUser._id);
    await req.user.save();
  }

  res.json({ message: "User blocked." });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const targetUser = await User.findOne({ publicId });

  if (!targetUser) {
    throw new AppError("User not found.", 404);
  }

  req.user.blockedUsers = (req.user.blockedUsers || []).filter(
    (blockedId) => blockedId.toString() !== targetUser._id.toString(),
  );
  await req.user.save();

  res.json({ message: "User unblocked." });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file provided.", 400);
  }

  const validation = validateFile(
    req.file.buffer,
    req.file.mimetype,
    req.file.size,
  );
  if (!validation.valid || validation.mediaType !== "image") {
    throw new AppError(
      validation.error || "Only image files are allowed for avatars.",
      400,
    );
  }

  // Delete old avatar if it exists and is local
  if (req.user.avatarUrl && req.user.avatarUrl.startsWith("/uploads/")) {
    const oldFileName = req.user.avatarUrl.split("/").pop();
    deleteFile(oldFileName);
  }

  const fileName = generateFileName(req.file.originalname);
  const mediaUrl = saveFile(req.file.buffer, fileName);

  req.user.avatarUrl = mediaUrl;
  await req.user.save();

  res.json({
    message: "Avatar updated successfully.",
    avatarUrl: mediaUrl,
    user: {
      publicId: req.user.publicId,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl,
    },
  });
});
