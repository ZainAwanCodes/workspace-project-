import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addComment, updateComment, removeComment } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { addNotification } from '@/lib/redux/slices/notificationSlice';
import { Comment } from '@/types/task';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { nanoid } from '@reduxjs/toolkit';
import { Trash2, Edit2, Check, X, AtSign } from 'lucide-react';
import { useHasPermission } from '@/lib/redux/usePermissions';
import { MentionInput } from './MentionInput';

interface CommentThreadProps {
  taskId: string;
  comments: Comment[];
  projectId?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ 
  taskId, 
  comments,
  projectId
}) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const task = useAppSelector(state => state.tasks.entities[taskId]);
  const isManager = useHasPermission(['owner', 'admin']);

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Helper to send mention notifications
  const notifyMentionedUsers = (text: string) => {
    if (!currentUser) return;
    users.forEach(user => {
      // Check if user was tagged with @UserName
      if (text.includes(`@${user.name}`) && user.id !== currentUser.id) {
        dispatch(addNotification({
          id: nanoid(),
          userId: user.id,
          type: 'mentioned',
          message: `${currentUser.name} mentioned you in a comment on "${task?.title || 'a task'}"`,
          isRead: false,
          taskId,
          createdAt: new Date().toISOString()
        }));
      }
    });
  };

  const handleCreateComment = () => {
    if (!newComment.trim() || !currentUser) return;

    const commentId = nanoid();
    const comment: Comment = {
      id: commentId,
      taskId,
      authorId: currentUser.id,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch(addComment({ taskId, comment }));
    notifyMentionedUsers(newComment);

    if (projectId) {
      dispatch(logActivity({
        id: nanoid(),
        taskId,
        projectId,
        actorId: currentUser.id,
        action: 'commented',
        details: `"${newComment.slice(0, 40)}${newComment.length > 40 ? '...' : ''}"`,
        createdAt: new Date().toISOString(),
      }));
    }

    setNewComment('');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingContent.trim() || !currentUser) return;

    dispatch(updateComment({
      taskId,
      commentId,
      content: editingContent.trim()
    }));

    notifyMentionedUsers(editingContent);

    if (projectId) {
      dispatch(logActivity({
        id: nanoid(),
        taskId,
        projectId,
        actorId: currentUser.id,
        action: 'edited',
        details: `edited a comment on "${task?.title || 'task'}"`,
        createdAt: new Date().toISOString(),
      }));
    }

    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    dispatch(removeComment({ taskId, commentId }));
    setConfirmDeleteId(null);

    if (projectId && currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId,
        projectId,
        actorId: currentUser.id,
        action: 'deleted',
        details: `deleted a comment`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  // Helper to render content with highlighted @mentions
  const renderFormattedContent = (content: string) => {
    const userNames = users.map(u => u.name);
    if (userNames.length === 0) return content;

    const sortedNames = [...userNames].sort((a, b) => b.length - a.length);
    const escapedNames = sortedNames.map(n => n.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|');
    const regex = new RegExp(`(@(?:${escapedNames}))`, 'g');

    const parts = content.split(regex);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const candidateName = part.slice(1);
        if (userNames.includes(candidateName)) {
          const isCurrentUser = currentUser?.name === candidateName;
          return (
            <span 
              key={index} 
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold mx-0.5 transition-colors ${
                isCurrentUser 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <AtSign size={10} className="mr-0.5 opacity-70" />
              {candidateName}
            </span>
          );
        }
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing Comments */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No comments yet. Start the conversation below using @mentions!
          </div>
        ) : (
          comments.map((comment) => {
            const author = users.find(u => u.id === comment.authorId);
            if (!author) return null;
            const canModify = currentUser?.id === author.id || isManager;
            const isEditing = editingCommentId === comment.id;
            const isConfirmingDelete = confirmDeleteId === comment.id;

            return (
              <div key={comment.id} className="flex space-x-3 group">
                <Avatar name={author.name} src={author.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {author.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.updatedAt && (
                        <span className="text-[10px] text-gray-400 italic">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Action buttons (Edit / Delete) */}
                    {canModify && !isEditing && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isConfirmingDelete ? (
                          <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded text-[10px]">
                            <span className="text-red-600 dark:text-red-400 font-medium">Delete?</span>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-0.5 text-red-600 hover:text-red-800"
                              title="Confirm delete"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-0.5 text-gray-400 hover:text-gray-600"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(comment)}
                              className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                              title="Edit comment"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(comment.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Body or Edit Input */}
                  {isEditing ? (
                    <div className="border border-blue-400 dark:border-blue-500 rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm mt-1">
                      <MentionInput
                        value={editingContent}
                        onChange={setEditingContent}
                        onSubmit={() => handleSaveEdit(comment.id)}
                        users={users}
                        minRows={2}
                        autoFocus
                        placeholder="Edit comment... Use @ to mention"
                      />
                      <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
                        <span className="text-[10px] text-gray-400">Ctrl/⌘+Enter to save</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveEdit(comment.id)} 
                            disabled={!editingContent.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg rounded-tl-none whitespace-pre-wrap leading-relaxed shadow-xs">
                      {renderFormattedContent(comment.content)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input */}
      {currentUser && (
        <div className="flex items-start space-x-3">
          <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
          <div className="flex-1">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white dark:bg-gray-950">
              <MentionInput
                value={newComment}
                onChange={setNewComment}
                onSubmit={handleCreateComment}
                users={users}
                placeholder="Write a comment... (type @ to mention a teammate)"
                minRows={3}
              />
              <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-normal">
                  <span>Press Ctrl/⌘+Enter to submit</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <AtSign size={11} className="mr-0.5 text-blue-500" />
                    type @ to mention
                  </span>
                </div>
                <Button size="sm" onClick={handleCreateComment} disabled={!newComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
