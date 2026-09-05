import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { updateProfile } from '@/lib/redux/slices/authSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Camera, User as UserIcon } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when modal opens or user changes
  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setAvatar(currentUser.avatar);
    }
  }, [currentUser, isOpen]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setAvatar(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    dispatch(updateProfile({
      name,
      email,
      avatar
    }));
    
    onClose();
  };

  if (!currentUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className="text-gray-400" />
              )}
            </div>
            
            {/* Avatar Upload Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
              <Camera size={24} className="text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div className="text-sm text-center">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Change Photo
            </button>
            {avatar && (
              <span className="text-gray-500 mx-2">|</span>
            )}
            {avatar && (
              <button 
                type="button" 
                onClick={() => setAvatar(undefined)}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter your name" 
            required 
          />
          <Input 
            label="Email Address" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || !email.trim()}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
