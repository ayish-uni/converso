import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Trash2, UserX, VolumeX, Search, Image, FileText, Phone } from 'lucide-react';
import { api } from '../lib/api';

export function MessageContextMenu({ message, isOwn, onClose, position, token }) {
  const menuRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleReact = async (emoji) => {
    try {
      await api.post(`/messages/reaction/${message._id}`, { emoji }, token);
      onClose();
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const handleDeleteMessage = async (deleteType) => {
    try {
      await api.delete(`/messages/message/${message._id}?type=${deleteType}`, token);
      onClose();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 w-80 rounded-2xl border border-white/10 bg-[#0d1220]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 200),
        }}
      >
        <div className="space-y-3">
          <div className="text-sm font-semibold text-white">
            Delete message?
          </div>
          <div className="text-xs text-converso-subtext">
            {message.originalText.length > 100
              ? `${message.originalText.substring(0, 100)}...`
              : message.originalText}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-white transition hover:bg-white/5"
            >
              Cancel
            </button>
            {isOwn && (
              <button
                onClick={() => handleDeleteMessage('everyone')}
                className="flex-1 rounded-xl bg-rose-500/20 py-2 text-sm text-rose-200 transition hover:bg-rose-500/30"
              >
                Delete for everyone
              </button>
            )}
            <button
              onClick={() => handleDeleteMessage('me')}
              className="flex-1 rounded-xl bg-orange-500/20 py-2 text-sm text-orange-200 transition hover:bg-orange-500/30"
            >
              Delete for me
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 rounded-2xl border border-white/10 bg-[#0d1220]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
      style={{
        left: Math.min(position.x, window.innerWidth - 200),
        top: Math.min(position.y, window.innerHeight - 200),
      }}
    >
      <div className="mb-2 flex justify-between border-b border-white/10 pb-2 px-1">
        {['❤️', '👍', '😂', '😮', '😢', '🙏'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className="rounded-lg p-1.5 text-lg transition hover:bg-white/10 hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {isOwn && (
          <button
            onClick={() => {
              alert("Edit mode activated (UI demo)");
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-converso-cyan transition hover:bg-converso-cyan/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit message
          </button>
        )}
        <button
          onClick={() => {
            alert("Message pinned to top! (UI demo)");
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-converso-gold transition hover:bg-converso-gold/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.24V6a3 3 0 0 0-3-3h-0a3 3 0 0 0-3 3v5.24a2 2 0 0 1-1.11 1.31l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
          Pin message
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-400/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete message
        </button>
      </div>
    </div>
  );
}