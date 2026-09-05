import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addComment, removeComment } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { Comment } from '@/types/task';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { nanoid } from '@reduxjs/toolkit';
import { Trash2 } from 'lucide-react';
import { useHasPermission } from '@/lib/redux/usePermissions';

export const CommentThread = ({ 
  taskId, 
  comments,
  projectId
}: { 
  taskId: string; 
  comments: Comment[];
  projectId?: string;
}) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const isManager = useHasPermission(['owner', 'admin']);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
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

  const handleDeleteComment = (commentId: string) => {
    dispatch(removeComment({ taskId, commentId }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Comments */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No comments yet. Start the conversation below!
          </div>
        ) : (
          comments.map((comment) => {
            const author = users.find(u => u.id === comment.authorId);
            if (!author) return null;
            const canDelete = currentUser?.id === author.id || isManager;

            return (
              <div key={comment.id} className="flex space-x-3 group">
                <Avatar name={author.name} src={author.avatar} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{author.name}</span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg rounded-tl-none whitespace-pre-wrap leading-relaxed shadow-xs">
                    {comment.content}
                  </div>
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
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment... (Cmd/Ctrl + Enter to send)"
                className="w-full p-3 bg-transparent text-xs border-none focus:ring-0 resize-none min-h-[75px] text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
                <div className="text-[11px] text-gray-400 font-normal">Press Ctrl/⌘+Enter to submit</div>
                <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()}>
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
