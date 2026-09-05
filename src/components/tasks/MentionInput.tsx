import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import { AtSign } from 'lucide-react';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  minRows?: number;
  autoFocus?: boolean;
  users: User[];
  className?: string;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Write a comment... Use @ to mention someone',
  minRows = 3,
  autoFocus = false,
  users,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter users based on mentionQuery
  const suggestions = React.useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.toLowerCase();
    return users.filter(
      u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  }, [mentionQuery, users]);

  // Handle text changes and detect @mention trigger
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    
    // Look for @ followed by word characters up to the cursor
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_\s]{0,20})$/);

    if (match) {
      // Don't trigger if @ is preceded by a regular word character (e.g. email foo@bar)
      const atCharIndex = textBeforeCursor.lastIndexOf('@');
      if (atCharIndex > 0 && /\w/.test(textBeforeCursor[atCharIndex - 1])) {
        setMentionQuery(null);
        return;
      }
      setMentionQuery(match[1]);
      setMentionStartIndex(atCharIndex);
      setSelectedIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user: User) => {
    if (!textareaRef.current || mentionStartIndex === -1) return;

    const beforeMention = value.slice(0, mentionStartIndex);
    const cursorPos = textareaRef.current.selectionStart;
    const afterMention = value.slice(cursorPos);

    const mentionText = `@${user.name} `;
    const updated = beforeMention + mentionText + afterMention;
    
    onChange(updated);
    setMentionQuery(null);

    // Restore focus and cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = beforeMention.length + mentionText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative w-full">
      {/* Autocomplete Suggestions Dropdown */}
      {mentionQuery !== null && (
        <div className="absolute bottom-full left-0 mb-1.5 w-64 max-h-52 overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 py-1 divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider flex items-center space-x-1">
            <AtSign size={11} />
            <span>Mention teammate</span>
          </div>
          {suggestions.length === 0 ? (
            <div className="p-3 text-xs text-gray-500 text-center">
              No matching members
            </div>
          ) : (
            <div className="py-1">
              {suggestions.map((user, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevents blurring textarea
                      insertMention(user);
                    }}
                    className={`w-full px-3 py-1.5 flex items-center space-x-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Avatar name={user.name} src={user.avatar} size="xs" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Textarea */}
      <textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        value={value}
        rows={minRows}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full p-3 bg-transparent text-xs border-none focus:ring-0 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none ${className}`}
      />
    </div>
  );
};
