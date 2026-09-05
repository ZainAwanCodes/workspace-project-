import { ProjectTemplate } from '@/types/project';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty board and custom workflow.',
    icon: 'folder',
    color: '#64748b',
    tasks: []
  },
  {
    id: 'product-launch',
    name: 'Product Launch Plan',
    description: 'Go-to-market strategy, launch assets, beta onboarding, and press outreach.',
    icon: 'rocket',
    color: '#8b5cf6',
    tasks: [
      {
        title: 'Finalize Value Proposition & Target Audience',
        description: 'Define clear messaging pillars, customer personas, and primary problem statements.',
        status: 'done',
        priority: 'high',
        labels: ['strategy', 'marketing'],
        subtasks: ['Draft core positioning statement', 'Review with leadership']
      },
      {
        title: 'Design & Code Launch Landing Page',
        description: 'Build responsive landing page highlighting features, testimonials, and email signup.',
        status: 'in-progress',
        priority: 'urgent',
        labels: ['design', 'frontend'],
        subtasks: ['Hero graphic & CTA', 'Mobile responsiveness audit', 'SEO meta tags & OG images']
      },
      {
        title: 'Product Hunt & Hacker News Launch Kit',
        description: 'Prepare maker comment, screenshots, GIF assets, and coordinate launch day schedule.',
        status: 'todo',
        priority: 'high',
        labels: ['launch', 'marketing'],
        subtasks: ['Draft first comment', 'Prepare 5 thumbnail galleries', 'Notify beta community']
      },
      {
        title: 'Record 90-Second Walkthrough Video',
        description: 'Screen capture core workflows with dynamic zoom and voiceover narration.',
        status: 'todo',
        priority: 'medium',
        labels: ['content', 'video']
      },
      {
        title: 'Configure Analytics & Conversion Funnels',
        description: 'Verify event triggers for signup, workspace creation, and feature activation.',
        status: 'todo',
        priority: 'medium',
        labels: ['analytics']
      }
    ]
  },
  {
    id: 'software-sprint',
    name: 'Software Sprint Board',
    description: '2-week agile sprint covering active features, bug triage, code reviews, and QA testing.',
    icon: 'code',
    color: '#3b82f6',
    tasks: [
      {
        title: 'Release v1.2.0 Staging Verification',
        description: 'Verify all pull requests merged to staging pass regression test suite.',
        status: 'done',
        priority: 'high',
        labels: ['release', 'devops']
      },
      {
        title: 'Implement Session Refresh & Timeout Handling',
        description: 'Gracefully handle token expiration and refresh tokens in background without interrupting user flow.',
        status: 'in-progress',
        priority: 'high',
        labels: ['security', 'backend'],
        subtasks: ['Simulate JWT refresh lifecycle', 'Idle timeout detection']
      },
      {
        title: 'Fix Kanban Drag-and-Drop Stutter on Firefox',
        description: 'Prevent layout re-measuring during sensor drag events by memoizing column metrics.',
        status: 'review',
        priority: 'urgent',
        labels: ['frontend', 'bug']
      },
      {
        title: 'Database Query Indexing Optimization',
        description: 'Audit slow query logs and add composite indices on task workspaceId and status.',
        status: 'todo',
        priority: 'medium',
        labels: ['database', 'performance']
      },
      {
        title: 'Automated End-to-End Test Suite for Task Drawer',
        description: 'Cover comment posting, subtask checklist toggles, and file attachment handling.',
        status: 'todo',
        priority: 'medium',
        labels: ['qa', 'testing']
      }
    ]
  },
  {
    id: 'design-system',
    name: 'Design System & UI Kit',
    description: 'Tokens, primitive UI components, accessibility patterns, and documentation.',
    icon: 'palette',
    color: '#ec4899',
    tasks: [
      {
        title: 'Establish Neutral & Semantic Color Scale',
        description: 'Define 10-step scales for neutral, brand, success, warning, and destructive tokens in light & dark mode.',
        status: 'done',
        priority: 'high',
        labels: ['tokens', 'foundations']
      },
      {
        title: 'Typography Scale & Line Height Ratios',
        description: 'Harmonize heading steps, display sizes, and body text line-heights (1.5-1.7).',
        status: 'done',
        priority: 'medium',
        labels: ['tokens', 'typography']
      },
      {
        title: 'Form Primitives: Input, Select & Checkbox',
        description: 'Build fully accessible form controls with default, hover, focus-ring, disabled, and error states.',
        status: 'in-progress',
        priority: 'urgent',
        labels: ['components', 'forms'],
        subtasks: ['Focus ring tokens', 'Error message slot', 'Helper text layout']
      },
      {
        title: 'Accessible Modal & Drawer Focus Trapping',
        description: 'Ensure focus traps properly, ESC closes, and focus returns to trigger element upon closing.',
        status: 'todo',
        priority: 'high',
        labels: ['accessibility', 'components']
      },
      {
        title: 'Component Showcase & Documentation Guide',
        description: 'Create interactive examples and prop tables for all design system primitives.',
        status: 'todo',
        priority: 'low',
        labels: ['documentation']
      }
    ]
  }
];
