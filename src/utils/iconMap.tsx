import React from 'react';
import { 
  Briefcase, Folder, Rocket, Megaphone, Layout, Sparkles, 
  Code2, Target, Shield, Terminal, Palette, Zap, Globe, 
  Layers, Users, Building, Star, CheckSquare
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'folder', label: 'Folder', icon: Folder },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'megaphone', label: 'Megaphone', icon: Megaphone },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'target', label: 'Target', icon: Target },
  { id: 'shield', label: 'Shield', icon: Shield },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'palette', label: 'Palette', icon: Palette },
  { id: 'zap', label: 'Zap', icon: Zap },
  { id: 'globe', label: 'Globe', icon: Globe },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'users', label: 'Team', icon: Users },
  { id: 'building', label: 'Building', icon: Building },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'check-square', label: 'Tasks', icon: CheckSquare },
];

export const PRESET_COLORS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#64748b', // slate
];

interface DynamicIconProps {
  name?: string;
  size?: number;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 18, className }) => {
  const match = AVAILABLE_ICONS.find(item => item.id === name?.toLowerCase());
  const IconComponent = match ? match.icon : Folder;
  return <IconComponent size={size} className={className} />;
};
