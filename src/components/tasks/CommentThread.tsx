import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addComment } from '@/lib/redux/slices/taskSlice';
import { Comment } from '@/types/task';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { nanoid } from '@reduxjs/toolkit';

export const CommentThread = ({ taskId, comments }: { taskId: string; comments: Comment[] }) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim() || !currentUser) return;

    const comment: Comment = {
      id: nanoid(),
      taskId,
      authorId: currentUser.id,
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    dispatch(addComment({ taskId, comment }));
    setNewComment('');
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
        {comments.map((comment) => {
          const author = users.find(u => u.id === comment.authorId);
          if (!author) return null;

          return (
            <div key={comment.id} className="flex space-x-3">
              <Avatar name={author.name} src={author.avatar} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{author.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg rounded-tl-none">
                  {comment.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Comment Input */}
      {currentUser && (
        <div className="flex items-start space-x-3">
          <Avatar name={currentUser.name} src={currentUser.avatar} size="md" />
          <div className="flex-1">
            <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment... (Cmd/Ctrl + Enter to send, use @ to mention)"
                className="w-full p-3 bg-white dark:bg-gray-950 text-sm border-none focus:ring-0 resize-none min-h-[80px] text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-400 font-medium">Supports markdown and @mentions</div>
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
