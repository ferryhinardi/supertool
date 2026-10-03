import type { ToolFamilyCategory } from '@/components/features/tools/ToolFamilyNav'

export interface CategoryWorkspaceConfig {
  href: string
  backLabel: string
  workspaceTitle: string
  defaultEyebrow: string
  backFeature: string
  backDestination: string
  showBrowserChip: boolean
  highlightLimit: number | null
  wrapTitle: boolean
}

export const categoryWorkspace: Record<ToolFamilyCategory, CategoryWorkspaceConfig> = {
  data: {
    href: '/tools/data',
    backLabel: 'Data Processing',
    workspaceTitle: 'Data Processing',
    defaultEyebrow: 'Data Processing',
    backFeature: 'data_tool_back',
    backDestination: 'data_hub',
    showBrowserChip: true,
    highlightLimit: null,
    wrapTitle: false,
  },
  productivity: {
    href: '/tools/productivity',
    backLabel: 'Productivity Tools',
    workspaceTitle: 'Productivity',
    defaultEyebrow: 'Productivity',
    backFeature: 'productivity_tool_back',
    backDestination: 'productivity_hub',
    showBrowserChip: true,
    highlightLimit: 3,
    wrapTitle: false,
  },
  development: {
    href: '/tools/development',
    backLabel: 'Developer Tools',
    workspaceTitle: 'Developer Tools',
    defaultEyebrow: 'Developer workspace',
    backFeature: 'development_tool_back',
    backDestination: 'development_hub',
    showBrowserChip: false,
    highlightLimit: 3,
    wrapTitle: false,
  },
  media: {
    href: '/tools/media',
    backLabel: 'Media Tools',
    workspaceTitle: 'Media Tools',
    defaultEyebrow: 'Media',
    backFeature: 'media_tool_back',
    backDestination: 'media_hub',
    showBrowserChip: false,
    highlightLimit: 3,
    wrapTitle: false,
  },
  security: {
    href: '/tools/security',
    backLabel: 'Security Tools',
    workspaceTitle: 'Security Tools',
    defaultEyebrow: 'Security',
    backFeature: 'security_tool_back',
    backDestination: 'security_hub',
    showBrowserChip: false,
    highlightLimit: 3,
    wrapTitle: true,
  },
  finance: {
    href: '/tools/finance',
    backLabel: 'Finance Tools',
    workspaceTitle: 'Finance Tools',
    defaultEyebrow: 'Finance',
    backFeature: 'finance_tool_back',
    backDestination: 'finance_hub',
    showBrowserChip: false,
    highlightLimit: 3,
    wrapTitle: false,
  },
  design: {
    href: '/tools/design',
    backLabel: 'Design & Visual Tools',
    workspaceTitle: 'Design & Visual Tools',
    defaultEyebrow: 'Design',
    backFeature: 'design_tool_back',
    backDestination: 'design_hub',
    showBrowserChip: false,
    highlightLimit: 3,
    wrapTitle: false,
  },
}
