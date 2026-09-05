import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addAttachment, removeAttachment } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { Task, FileAttachment } from '@/types/task';
import { Paperclip, X, File, Image as ImageIcon, Download, UploadCloud } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

export const TaskAttachments = ({ task }: { task: Task }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        if (base64Data) {
          const attachment: FileAttachment = {
            id: nanoid(),
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            data: base64Data
          };
          
          dispatch(addAttachment({ taskId: task.id, attachment }));

          if (currentUser) {
            dispatch(logActivity({
              id: nanoid(),
              taskId: task.id,
              projectId: task.projectId,
              actorId: currentUser.id,
              action: 'attachment_added',
              details: `Uploaded ${file.name}`,
              createdAt: new Date().toISOString(),
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = (attachmentId: string) => {
    dispatch(removeAttachment({ taskId: task.id, attachmentId }));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon size={18} className="text-blue-500" />;
    return <File size={18} className="text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
          <Paperclip size={16} className="mr-2" /> Attachments
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
          {task.attachments.length} files
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {task.attachments.map(attachment => (
          <div 
            key={attachment.id}
            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 group shadow-xs"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex-shrink-0 w-9 h-9 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                {attachment.fileType.startsWith('image/') ? (
                  <img src={attachment.data} alt={attachment.fileName} className="w-full h-full object-cover rounded-md" />
                ) : (
                  getFileIcon(attachment.fileType)
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate" title={attachment.fileName}>
                  {attachment.fileName}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {attachment.fileType.split('/')[1] || 'FILE'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
              <a 
                href={attachment.data}
                download={attachment.fileName}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                title="Download"
              >
                <Download size={13} />
              </a>
              <button
                onClick={() => handleRemove(attachment.id)}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Remove file"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Upload Box with Drag & Drop */}
        <label 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-800 hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/40'
          }`}
        >
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <UploadCloud size={16} className={isDragOver ? 'text-blue-500' : ''} />
            <span className="text-xs font-medium">
              {isDragOver ? 'Drop files here' : 'Add file (or drag & drop)'}
            </span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
          />
        </label>
      </div>
    </div>
  );
};
