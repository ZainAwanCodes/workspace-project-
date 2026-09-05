import React, { useRef } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addAttachment, removeAttachment } from '@/lib/redux/slices/taskSlice';
import { Task, FileAttachment } from '@/types/task';
import { Paperclip, X, File, Image as ImageIcon, Download } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

export const TaskAttachments = ({ task }: { task: Task }) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        if (base64Data) {
          const attachment: FileAttachment = {
            id: nanoid(),
            fileName: file.name,
            fileType: file.type,
            data: base64Data
          };
          
          dispatch(addAttachment({ taskId: task.id, attachment }));
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (attachmentId: string) => {
    dispatch(removeAttachment({ taskId: task.id, attachmentId }));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
          <Paperclip size={16} className="mr-2" /> Attachments
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {task.attachments.length} files
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {task.attachments.map(attachment => (
          <div 
            key={attachment.id}
            className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 group"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                {attachment.fileType.startsWith('image/') ? (
                  <img src={attachment.data} alt={attachment.fileName} className="w-full h-full object-cover rounded-md" />
                ) : (
                  getFileIcon(attachment.fileType)
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={attachment.fileName}>
                  {attachment.fileName}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {attachment.fileType.split('/')[1] || 'FILE'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
              <a 
                href={attachment.data}
                download={attachment.fileName}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                title="Download"
              >
                <Download size={14} />
              </a>
              <button
                onClick={() => handleRemove(attachment.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                title="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Upload Button */}
        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors h-14">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Paperclip size={16} />
            <span className="text-sm font-medium">Add file</span>
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
