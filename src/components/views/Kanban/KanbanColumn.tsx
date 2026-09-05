import React, { useMemo, useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/types/task';
import { KanbanColumnDef } from '@/types/project';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { Plus, GripVertical, MoreHorizontal, ArrowLeft, ArrowRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';

const PRESET_COLORS = [
  { label: 'Slate', value: '#64748b' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' },
];

interface KanbanColumnProps {
  column: KanbanColumnDef;
  index: number;
  totalColumns: number;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onAddTask?: (status: TaskStatus) => void;
  onMoveColumn?: (direction: 'left' | 'right') => void;
  onRenameColumn?: (newTitle: string) => void;
  onChangeColor?: (color: string) => void;
  onDeleteColumn?: () => void;
  canDelete?: boolean;
  readOnly?: boolean;
}

export const KanbanColumn = ({
  column,
  index,
  totalColumns,
  tasks,
  onTaskClick,
  onAddTask,
  onMoveColumn,
  onRenameColumn,
  onChangeColor,
  onDeleteColumn,
  canDelete = true,
  readOnly = false,
}: KanbanColumnProps) => {
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(column.title);
  }, [column.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Column Sortable (for reordering columns horizontally)
  const {
    attributes: columnAttributes,
    listeners: columnListeners,
    setNodeRef: setColumnNodeRef,
    transform: columnTransform,
    transition: columnTransition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: readOnly || isEditing,
  });

  // Droppable zone for tasks
  const { setNodeRef: setTaskDropRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      status: column.id,
    },
  });

  const columnStyle = {
    transform: CSS.Translate.toString(columnTransform),
    transition: columnTransition,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title && onRenameColumn) {
      onRenameColumn(editTitle.trim());
    } else {
      setEditTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(column.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setColumnNodeRef}
      style={columnStyle}
      className={`flex flex-col w-[85vw] sm:w-[310px] min-w-[270px] sm:min-w-[310px] snap-center bg-gray-50/70 dark:bg-gray-900/60 rounded-xl flex-shrink-0 border border-gray-200 dark:border-gray-800 h-full max-h-full transition-opacity ${
        isColumnDragging ? 'opacity-40 shadow-xl ring-2 ring-blue-500' : 'opacity-100'
      }`}
    >
      {/* Column Accent Bar */}
      <div
        className="h-1 w-full rounded-t-xl"
        style={{ backgroundColor: column.color || '#64748b' }}
      />

      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/40">
        <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
          {/* Column Drag Handle */}
          {!readOnly && (
            <button
              {...columnAttributes}
              {...columnListeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Drag to reorder column"
              aria-label="Drag column handle"
            >
              <GripVertical size={14} />
            </button>
          )}

          {/* Color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10"
            style={{ backgroundColor: column.color || '#64748b' }}
          />

          {/* Title or Edit Input */}
          {isEditing ? (
            <div className="flex items-center space-x-1 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-xs font-semibold px-1.5 py-0.5 rounded border border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="p-0.5 text-green-600 hover:text-green-700 rounded hover:bg-green-50 dark:hover:bg-green-950/40"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setEditTitle(column.title);
                  setIsEditing(false);
                }}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <h3
              onDoubleClick={() => !readOnly && setIsEditing(true)}
              className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate cursor-pointer select-none"
              title={readOnly ? column.title : 'Double-click to rename column'}
            >
              {column.title}
            </h3>
          )}

          {/* Task count */}
          <span className="bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs py-0.5 px-2 rounded-full font-medium flex-shrink-0">
            {tasks.length}
          </span>
        </div>

        {/* Actions (Add Task & Column Menu) */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {onAddTask && !readOnly && (
            <button
              onClick={() => onAddTask(column.id)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
              title={`Add task to ${column.title}`}
            >
              <Plus size={15} />
            </button>
          )}

          {!readOnly && (
            <Dropdown>
              <DropdownTrigger>
                <button
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                  title="Column options"
                >
                  <MoreHorizontal size={15} />
                </button>
              </DropdownTrigger>
              <DropdownContent align="right" className="w-52">
                <DropdownItem onClick={() => setIsEditing(true)}>
                  <div className="flex items-center space-x-2">
                    <Pencil size={13} className="text-gray-400" />
                    <span>Rename Column</span>
                  </div>
                </DropdownItem>

                {onMoveColumn && (
                  <>
                    <DropdownItem
                      onClick={() => onMoveColumn('left')}
                      className={index === 0 ? 'opacity-40 cursor-not-allowed' : ''}
                    >
                      <div className="flex items-center space-x-2">
                        <ArrowLeft size={13} className="text-gray-400" />
                        <span>Move Left</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => onMoveColumn('right')}
                      className={index === totalColumns - 1 ? 'opacity-40 cursor-not-allowed' : ''}
                    >
                      <div className="flex items-center space-x-2">
                        <ArrowRight size={13} className="text-gray-400" />
                        <span>Move Right</span>
                      </div>
                    </DropdownItem>
                  </>
                )}

                {onChangeColor && (
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Column Color
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => onChangeColor(c.value)}
                          className={`w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                            column.color === c.value ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {onDeleteColumn && canDelete && (
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1">
                    <DropdownItem
                      destructive
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete column "${column.title}"? Any remaining tasks will be reassigned to the first column.`
                          )
                        ) {
                          onDeleteColumn();
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Trash2 size={13} />
                        <span>Delete Column</span>
                      </div>
                    </DropdownItem>
                  </div>
                )}
              </DropdownContent>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Droppable Area for Tasks */}
      <div
        ref={setTaskDropRef}
        className={`flex-1 p-2 overflow-y-auto space-y-2 transition-colors ${
          isOver ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>

        {/* Placeholder if empty */}
        {tasks.length === 0 && (
          <div className="h-28 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800/80 flex flex-col items-center justify-center p-3 text-center">
            <span className="text-xs text-gray-400">No tasks in this column</span>
            {onAddTask && !readOnly && (
              <button
                onClick={() => onAddTask(column.id)}
                className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                + Add one
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper for Sortable item
const SortableTaskCard = ({ task, onClick }: { task: Task; onClick: () => void; key?: React.Key }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
};
