'use client'

import {
  BookOpen,
  Check,
  Clock,
  Copy,
  GitBranch,
  History,
  Lightbulb,
  Play,
  RotateCcw,
  Settings,
  Terminal,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RelatedTools } from '@/components/ui/related-tools'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { css } from '@/styled-system/css'

// Git command categories and their commands
interface GitOption {
  flag: string
  description: string
  requiresValue?: boolean
  valuePlaceholder?: string
}

interface GitCommand {
  name: string
  description: string
  baseCommand: string
  options: GitOption[]
  examples: string[]
  category: string
}

const gitCommands: Record<string, GitCommand[]> = {
  basic: [
    {
      name: 'init',
      description: 'Initialize a new Git repository',
      baseCommand: 'git init',
      category: 'basic',
      options: [
        { flag: '--bare', description: 'Create a bare repository' },
        {
          flag: '-b',
          description: 'Initial branch name',
          requiresValue: true,
          valuePlaceholder: 'main',
        },
        {
          flag: '--template',
          description: 'Template directory',
          requiresValue: true,
          valuePlaceholder: 'path',
        },
      ],
      examples: ['git init', 'git init --bare', 'git init -b main'],
    },
    {
      name: 'clone',
      description: 'Clone a repository into a new directory',
      baseCommand: 'git clone',
      category: 'basic',
      options: [
        {
          flag: '--depth',
          description: 'Shallow clone depth',
          requiresValue: true,
          valuePlaceholder: '1',
        },
        {
          flag: '--branch',
          description: 'Checkout specific branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        { flag: '--single-branch', description: 'Clone only one branch' },
        { flag: '--recursive', description: 'Clone submodules' },
        { flag: '--shallow-submodules', description: 'Shallow clone submodules' },
      ],
      examples: [
        'git clone <url>',
        'git clone --depth 1 <url>',
        'git clone --branch develop <url>',
      ],
    },
    {
      name: 'status',
      description: 'Show the working tree status',
      baseCommand: 'git status',
      category: 'basic',
      options: [
        { flag: '-s', description: 'Short format output' },
        { flag: '-b', description: 'Show branch info in short format' },
        { flag: '--porcelain', description: 'Machine-readable output' },
        {
          flag: '-u',
          description: 'Show untracked files',
          requiresValue: true,
          valuePlaceholder: 'no|normal|all',
        },
      ],
      examples: ['git status', 'git status -s', 'git status -sb'],
    },
    {
      name: 'add',
      description: 'Add file contents to the staging area',
      baseCommand: 'git add',
      category: 'basic',
      options: [
        { flag: '-A', description: 'Add all changes (new, modified, deleted)' },
        { flag: '-u', description: 'Update tracked files only' },
        { flag: '-p', description: 'Interactive patch mode' },
        { flag: '-n', description: 'Dry run (show what would be added)' },
        { flag: '-f', description: 'Force add ignored files' },
      ],
      examples: ['git add .', 'git add -A', 'git add -p', 'git add file.txt'],
    },
    {
      name: 'commit',
      description: 'Record changes to the repository',
      baseCommand: 'git commit',
      category: 'basic',
      options: [
        {
          flag: '-m',
          description: 'Commit message',
          requiresValue: true,
          valuePlaceholder: 'message',
        },
        { flag: '-a', description: 'Stage all modified files' },
        { flag: '--amend', description: 'Amend the previous commit' },
        { flag: '--no-edit', description: 'Use previous commit message (with --amend)' },
        { flag: '-S', description: 'GPG sign the commit' },
        { flag: '--allow-empty', description: 'Allow empty commit' },
      ],
      examples: ['git commit -m "message"', 'git commit -am "message"', 'git commit --amend'],
    },
  ],
  branching: [
    {
      name: 'branch',
      description: 'List, create, or delete branches',
      baseCommand: 'git branch',
      category: 'branching',
      options: [
        { flag: '-a', description: 'List all branches (local and remote)' },
        { flag: '-r', description: 'List remote branches only' },
        {
          flag: '-d',
          description: 'Delete branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        {
          flag: '-D',
          description: 'Force delete branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        {
          flag: '-m',
          description: 'Rename branch',
          requiresValue: true,
          valuePlaceholder: 'new-name',
        },
        { flag: '-v', description: 'Show last commit on each branch' },
        { flag: '--merged', description: 'List merged branches' },
        { flag: '--no-merged', description: 'List unmerged branches' },
      ],
      examples: ['git branch', 'git branch -a', 'git branch feature', 'git branch -d old-branch'],
    },
    {
      name: 'checkout',
      description: 'Switch branches or restore files',
      baseCommand: 'git checkout',
      category: 'branching',
      options: [
        {
          flag: '-b',
          description: 'Create and switch to new branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        {
          flag: '-B',
          description: 'Create/reset and switch to branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        { flag: '--track', description: 'Set up tracking for new branch' },
        { flag: '-f', description: 'Force checkout (discard local changes)' },
        {
          flag: '--orphan',
          description: 'Create orphan branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
      ],
      examples: ['git checkout main', 'git checkout -b feature', 'git checkout -- file.txt'],
    },
    {
      name: 'switch',
      description: 'Switch branches (Git 2.23+)',
      baseCommand: 'git switch',
      category: 'branching',
      options: [
        {
          flag: '-c',
          description: 'Create and switch to new branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        {
          flag: '-C',
          description: 'Create/reset and switch to branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        { flag: '-d', description: 'Switch to detached HEAD' },
        { flag: '--discard-changes', description: 'Discard local changes' },
      ],
      examples: ['git switch main', 'git switch -c feature', 'git switch -'],
    },
    {
      name: 'merge',
      description: 'Join two or more development histories',
      baseCommand: 'git merge',
      category: 'branching',
      options: [
        { flag: '--no-ff', description: 'Create merge commit even if fast-forward' },
        { flag: '--ff-only', description: 'Only allow fast-forward merges' },
        { flag: '--squash', description: 'Squash commits into one' },
        {
          flag: '-m',
          description: 'Merge commit message',
          requiresValue: true,
          valuePlaceholder: 'message',
        },
        { flag: '--abort', description: 'Abort current merge' },
        { flag: '--continue', description: 'Continue merge after conflict resolution' },
      ],
      examples: ['git merge feature', 'git merge --no-ff feature', 'git merge --squash feature'],
    },
    {
      name: 'rebase',
      description: 'Reapply commits on top of another base',
      baseCommand: 'git rebase',
      category: 'branching',
      options: [
        {
          flag: '-i',
          description: 'Interactive rebase',
          requiresValue: true,
          valuePlaceholder: 'commit',
        },
        {
          flag: '--onto',
          description: 'Rebase onto specific base',
          requiresValue: true,
          valuePlaceholder: 'newbase',
        },
        { flag: '--abort', description: 'Abort rebase' },
        { flag: '--continue', description: 'Continue rebase after conflict resolution' },
        { flag: '--skip', description: 'Skip current commit' },
        { flag: '-p', description: 'Preserve merge commits' },
      ],
      examples: ['git rebase main', 'git rebase -i HEAD~3', 'git rebase --onto main feature'],
    },
  ],
  remote: [
    {
      name: 'remote',
      description: 'Manage remote repositories',
      baseCommand: 'git remote',
      category: 'remote',
      options: [
        { flag: '-v', description: 'Show remote URLs' },
        {
          flag: 'add',
          description: 'Add a remote',
          requiresValue: true,
          valuePlaceholder: 'name url',
        },
        {
          flag: 'remove',
          description: 'Remove a remote',
          requiresValue: true,
          valuePlaceholder: 'name',
        },
        {
          flag: 'rename',
          description: 'Rename a remote',
          requiresValue: true,
          valuePlaceholder: 'old new',
        },
        {
          flag: 'set-url',
          description: 'Change remote URL',
          requiresValue: true,
          valuePlaceholder: 'name url',
        },
      ],
      examples: ['git remote -v', 'git remote add origin <url>', 'git remote remove origin'],
    },
    {
      name: 'fetch',
      description: 'Download objects and refs from remote',
      baseCommand: 'git fetch',
      category: 'remote',
      options: [
        { flag: '--all', description: 'Fetch from all remotes' },
        { flag: '-p', description: 'Prune deleted remote branches' },
        { flag: '--tags', description: 'Fetch all tags' },
        {
          flag: '--depth',
          description: 'Shallow fetch depth',
          requiresValue: true,
          valuePlaceholder: 'depth',
        },
        { flag: '--dry-run', description: 'Show what would be fetched' },
      ],
      examples: ['git fetch', 'git fetch origin', 'git fetch --all -p'],
    },
    {
      name: 'pull',
      description: 'Fetch and integrate with local branch',
      baseCommand: 'git pull',
      category: 'remote',
      options: [
        { flag: '--rebase', description: 'Rebase instead of merge' },
        { flag: '--no-rebase', description: 'Merge (default)' },
        { flag: '--ff-only', description: 'Only allow fast-forward' },
        { flag: '--no-commit', description: 'Do not auto-commit' },
        { flag: '--autostash', description: 'Stash and pop changes' },
      ],
      examples: ['git pull', 'git pull --rebase', 'git pull origin main'],
    },
    {
      name: 'push',
      description: 'Update remote refs and objects',
      baseCommand: 'git push',
      category: 'remote',
      options: [
        {
          flag: '-u',
          description: 'Set upstream for branch',
          requiresValue: true,
          valuePlaceholder: 'remote branch',
        },
        { flag: '--force', description: 'Force push (dangerous!)' },
        { flag: '--force-with-lease', description: 'Safer force push' },
        { flag: '--tags', description: 'Push all tags' },
        {
          flag: '--delete',
          description: 'Delete remote branch',
          requiresValue: true,
          valuePlaceholder: 'branch',
        },
        { flag: '--dry-run', description: 'Show what would be pushed' },
      ],
      examples: ['git push', 'git push -u origin main', 'git push --force-with-lease'],
    },
  ],
  history: [
    {
      name: 'log',
      description: 'Show commit history',
      baseCommand: 'git log',
      category: 'history',
      options: [
        { flag: '--oneline', description: 'One line per commit' },
        { flag: '--graph', description: 'Show ASCII graph' },
        {
          flag: '-n',
          description: 'Limit number of commits',
          requiresValue: true,
          valuePlaceholder: 'number',
        },
        {
          flag: '--author',
          description: 'Filter by author',
          requiresValue: true,
          valuePlaceholder: 'pattern',
        },
        {
          flag: '--since',
          description: 'Show commits since date',
          requiresValue: true,
          valuePlaceholder: 'date',
        },
        {
          flag: '--until',
          description: 'Show commits until date',
          requiresValue: true,
          valuePlaceholder: 'date',
        },
        { flag: '-p', description: 'Show patches (diffs)' },
        { flag: '--stat', description: 'Show diffstat' },
        { flag: '--all', description: 'Show all branches' },
        {
          flag: '--grep',
          description: 'Search commit messages',
          requiresValue: true,
          valuePlaceholder: 'pattern',
        },
      ],
      examples: ['git log --oneline', 'git log --graph --oneline --all', 'git log -n 10 --stat'],
    },
    {
      name: 'diff',
      description: 'Show changes between commits, files, etc.',
      baseCommand: 'git diff',
      category: 'history',
      options: [
        { flag: '--staged', description: 'Show staged changes' },
        { flag: '--cached', description: 'Same as --staged' },
        { flag: '--stat', description: 'Show diffstat only' },
        { flag: '--name-only', description: 'Show only file names' },
        { flag: '--name-status', description: 'Show file names and status' },
        { flag: '-w', description: 'Ignore whitespace' },
        { flag: '--color-words', description: 'Word-level diff with colors' },
      ],
      examples: ['git diff', 'git diff --staged', 'git diff HEAD~1', 'git diff branch1..branch2'],
    },
    {
      name: 'show',
      description: 'Show various types of objects',
      baseCommand: 'git show',
      category: 'history',
      options: [
        { flag: '--stat', description: 'Show diffstat' },
        { flag: '--name-only', description: 'Show only file names' },
        {
          flag: '--format',
          description: 'Output format',
          requiresValue: true,
          valuePlaceholder: 'format',
        },
        { flag: '-q', description: 'Suppress diff output' },
      ],
      examples: ['git show', 'git show HEAD~1', 'git show --stat abc123'],
    },
    {
      name: 'blame',
      description: 'Show who changed each line',
      baseCommand: 'git blame',
      category: 'history',
      options: [
        {
          flag: '-L',
          description: 'Line range',
          requiresValue: true,
          valuePlaceholder: 'start,end',
        },
        { flag: '-w', description: 'Ignore whitespace' },
        { flag: '-M', description: 'Detect moved lines' },
        { flag: '-C', description: 'Detect copied lines' },
        {
          flag: '--since',
          description: 'Start from date',
          requiresValue: true,
          valuePlaceholder: 'date',
        },
      ],
      examples: ['git blame file.txt', 'git blame -L 10,20 file.txt', 'git blame -w file.txt'],
    },
    {
      name: 'reflog',
      description: 'Show reference logs',
      baseCommand: 'git reflog',
      category: 'history',
      options: [
        {
          flag: '-n',
          description: 'Limit entries',
          requiresValue: true,
          valuePlaceholder: 'number',
        },
        { flag: '--all', description: 'Show all refs' },
        {
          flag: '--date',
          description: 'Date format',
          requiresValue: true,
          valuePlaceholder: 'format',
        },
      ],
      examples: ['git reflog', 'git reflog -n 20', 'git reflog show HEAD'],
    },
  ],
  undo: [
    {
      name: 'reset',
      description: 'Reset current HEAD to specified state',
      baseCommand: 'git reset',
      category: 'undo',
      options: [
        { flag: '--soft', description: 'Keep changes staged' },
        { flag: '--mixed', description: 'Keep changes unstaged (default)' },
        { flag: '--hard', description: 'Discard all changes (dangerous!)' },
        { flag: '--keep', description: 'Keep working tree changes' },
      ],
      examples: ['git reset HEAD~1', 'git reset --soft HEAD~1', 'git reset --hard origin/main'],
    },
    {
      name: 'revert',
      description: 'Create new commit that undoes changes',
      baseCommand: 'git revert',
      category: 'undo',
      options: [
        { flag: '-n', description: 'Do not auto-commit' },
        { flag: '--no-edit', description: 'Use default commit message' },
        {
          flag: '-m',
          description: 'Parent number for merge commits',
          requiresValue: true,
          valuePlaceholder: 'number',
        },
        { flag: '--abort', description: 'Abort revert' },
        { flag: '--continue', description: 'Continue revert after conflict' },
      ],
      examples: ['git revert HEAD', 'git revert abc123', 'git revert -n HEAD~3..HEAD'],
    },
    {
      name: 'restore',
      description: 'Restore working tree files (Git 2.23+)',
      baseCommand: 'git restore',
      category: 'undo',
      options: [
        { flag: '--staged', description: 'Unstage files' },
        { flag: '--worktree', description: 'Restore working tree (default)' },
        {
          flag: '-s',
          description: 'Restore from source',
          requiresValue: true,
          valuePlaceholder: 'commit',
        },
        { flag: '-p', description: 'Interactive patch mode' },
      ],
      examples: [
        'git restore file.txt',
        'git restore --staged file.txt',
        'git restore -s HEAD~1 file.txt',
      ],
    },
    {
      name: 'stash',
      description: 'Stash changes in working directory',
      baseCommand: 'git stash',
      category: 'undo',
      options: [
        { flag: 'push', description: 'Stash changes (default)' },
        { flag: 'pop', description: 'Apply and remove top stash' },
        { flag: 'apply', description: 'Apply stash without removing' },
        { flag: 'list', description: 'List all stashes' },
        { flag: 'drop', description: 'Remove a stash' },
        { flag: 'clear', description: 'Remove all stashes' },
        { flag: '-u', description: 'Include untracked files' },
        {
          flag: '-m',
          description: 'Stash message',
          requiresValue: true,
          valuePlaceholder: 'message',
        },
      ],
      examples: ['git stash', 'git stash pop', 'git stash list', 'git stash -u -m "WIP"'],
    },
    {
      name: 'clean',
      description: 'Remove untracked files',
      baseCommand: 'git clean',
      category: 'undo',
      options: [
        { flag: '-n', description: 'Dry run (show what would be removed)' },
        { flag: '-f', description: 'Force (required to actually clean)' },
        { flag: '-d', description: 'Remove untracked directories too' },
        { flag: '-x', description: 'Remove ignored files too' },
        { flag: '-X', description: 'Remove only ignored files' },
        { flag: '-i', description: 'Interactive mode' },
      ],
      examples: ['git clean -n', 'git clean -fd', 'git clean -fdx'],
    },
  ],
  advanced: [
    {
      name: 'cherry-pick',
      description: 'Apply changes from specific commits',
      baseCommand: 'git cherry-pick',
      category: 'advanced',
      options: [
        { flag: '-n', description: 'Do not auto-commit' },
        { flag: '-x', description: 'Append cherry-pick reference' },
        {
          flag: '-m',
          description: 'Parent number for merge commits',
          requiresValue: true,
          valuePlaceholder: 'number',
        },
        { flag: '--abort', description: 'Abort cherry-pick' },
        { flag: '--continue', description: 'Continue after conflict' },
      ],
      examples: [
        'git cherry-pick abc123',
        'git cherry-pick abc123..def456',
        'git cherry-pick -n abc123',
      ],
    },
    {
      name: 'tag',
      description: 'Create, list, or delete tags',
      baseCommand: 'git tag',
      category: 'advanced',
      options: [
        {
          flag: '-a',
          description: 'Create annotated tag',
          requiresValue: true,
          valuePlaceholder: 'tagname',
        },
        {
          flag: '-m',
          description: 'Tag message',
          requiresValue: true,
          valuePlaceholder: 'message',
        },
        { flag: '-d', description: 'Delete tag', requiresValue: true, valuePlaceholder: 'tagname' },
        {
          flag: '-l',
          description: 'List tags matching pattern',
          requiresValue: true,
          valuePlaceholder: 'pattern',
        },
        { flag: '-f', description: 'Force replace existing tag' },
      ],
      examples: [
        'git tag',
        'git tag v1.0.0',
        'git tag -a v1.0.0 -m "Release"',
        'git tag -d v1.0.0',
      ],
    },
    {
      name: 'bisect',
      description: 'Binary search for bug introduction',
      baseCommand: 'git bisect',
      category: 'advanced',
      options: [
        { flag: 'start', description: 'Start bisect session' },
        { flag: 'bad', description: 'Mark current/commit as bad' },
        { flag: 'good', description: 'Mark commit as good' },
        { flag: 'reset', description: 'End bisect session' },
        { flag: 'skip', description: 'Skip current commit' },
        {
          flag: 'run',
          description: 'Auto-bisect with script',
          requiresValue: true,
          valuePlaceholder: 'script',
        },
      ],
      examples: [
        'git bisect start',
        'git bisect bad',
        'git bisect good abc123',
        'git bisect reset',
      ],
    },
    {
      name: 'worktree',
      description: 'Manage multiple working trees',
      baseCommand: 'git worktree',
      category: 'advanced',
      options: [
        {
          flag: 'add',
          description: 'Create new worktree',
          requiresValue: true,
          valuePlaceholder: 'path branch',
        },
        { flag: 'list', description: 'List worktrees' },
        {
          flag: 'remove',
          description: 'Remove worktree',
          requiresValue: true,
          valuePlaceholder: 'path',
        },
        { flag: 'prune', description: 'Prune stale worktrees' },
      ],
      examples: [
        'git worktree list',
        'git worktree add ../feature feature-branch',
        'git worktree remove ../feature',
      ],
    },
    {
      name: 'submodule',
      description: 'Manage submodules',
      baseCommand: 'git submodule',
      category: 'advanced',
      options: [
        {
          flag: 'add',
          description: 'Add submodule',
          requiresValue: true,
          valuePlaceholder: 'url path',
        },
        { flag: 'init', description: 'Initialize submodules' },
        { flag: 'update', description: 'Update submodules' },
        { flag: '--init', description: 'Init then update' },
        { flag: '--recursive', description: 'Update recursively' },
        { flag: 'status', description: 'Show submodule status' },
        {
          flag: 'deinit',
          description: 'Deinitialize submodule',
          requiresValue: true,
          valuePlaceholder: 'path',
        },
      ],
      examples: [
        'git submodule update --init --recursive',
        'git submodule add <url> path',
        'git submodule status',
      ],
    },
  ],
}

const categoryInfo: Record<string, { name: string; icon: React.ElementType; description: string }> =
  {
    basic: {
      name: 'Basic',
      icon: Terminal,
      description: 'Essential Git commands for everyday use',
    },
    branching: { name: 'Branching', icon: GitBranch, description: 'Branch management and merging' },
    remote: { name: 'Remote', icon: Upload, description: 'Working with remote repositories' },
    history: {
      name: 'History',
      icon: History,
      description: 'Viewing and searching commit history',
    },
    undo: { name: 'Undo', icon: RotateCcw, description: 'Reverting and undoing changes' },
    advanced: { name: 'Advanced', icon: Settings, description: 'Power user commands' },
  }

interface SelectedOption {
  flag: string
  value?: string
}

interface HistoryItem {
  id: string
  command: string
  timestamp: number
  description: string
}

export default function GitGeneratorPage() {
  useTrackToolView({
    toolId: 'git-generator',
    title: 'Git Command Generator',
    href: '/tools/development/git-generator',
    iconName: 'GitBranch',
    gradient: 'from-orange-500 to-red-500',
  })

  const [selectedCategory, setSelectedCategory] = useState<string>('basic')
  const [selectedCommand, setSelectedCommand] = useState<GitCommand | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [additionalArgs, setAdditionalArgs] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('git-generator-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  // Save history to localStorage
  const saveToHistory = useCallback(
    (command: string, description: string) => {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        command,
        timestamp: Date.now(),
        description,
      }
      const newHistory = [newItem, ...history.slice(0, 19)] // Keep last 20
      setHistory(newHistory)
      localStorage.setItem('git-generator-history', JSON.stringify(newHistory))
    },
    [history]
  )

  // Build the complete command
  const generatedCommand = useMemo(() => {
    if (!selectedCommand) return ''

    let cmd = selectedCommand.baseCommand

    for (const opt of selectedOptions) {
      if (opt.value) {
        // Handle special cases for commands like 'remote add', 'stash push', etc.
        if (!opt.flag.startsWith('-')) {
          cmd += ` ${opt.flag} ${opt.value}`
        } else {
          cmd += ` ${opt.flag} ${opt.value}`
        }
      } else {
        cmd += ` ${opt.flag}`
      }
    }

    if (additionalArgs.trim()) {
      cmd += ` ${additionalArgs.trim()}`
    }

    return cmd
  }, [selectedCommand, selectedOptions, additionalArgs])

  const handleCopy = useCallback(async () => {
    if (!generatedCommand) return

    try {
      await navigator.clipboard.writeText(generatedCommand)
      setCopied(true)
      toast.success('Command copied to clipboard')
      saveToHistory(generatedCommand, selectedCommand?.description || '')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy command')
    }
  }, [generatedCommand, selectedCommand, saveToHistory])

  const handleSelectCommand = useCallback((cmd: GitCommand) => {
    setSelectedCommand(cmd)
    setSelectedOptions([])
    setAdditionalArgs('')
  }, [])

  const handleToggleOption = useCallback((option: GitOption) => {
    setSelectedOptions((prev) => {
      const exists = prev.find((o) => o.flag === option.flag)
      if (exists) {
        return prev.filter((o) => o.flag !== option.flag)
      }
      return [...prev, { flag: option.flag, value: option.requiresValue ? '' : undefined }]
    })
  }, [])

  const handleOptionValueChange = useCallback((flag: string, value: string) => {
    setSelectedOptions((prev) => prev.map((o) => (o.flag === flag ? { ...o, value } : o)))
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('git-generator-history')
    toast.success('History cleared')
  }, [])

  const handleUseHistoryItem = useCallback((item: HistoryItem) => {
    navigator.clipboard.writeText(item.command)
    toast.success('Command copied from history')
  }, [])

  const faqItems = [
    {
      question: 'What is the difference between git merge and git rebase?',
      answer:
        'Git merge creates a new merge commit that combines two branches, preserving the complete history. Git rebase moves or replays commits from one branch onto another, creating a linear history. Use merge for collaborative work to preserve context; use rebase for cleaning up local branches before sharing.',
    },
    {
      question: 'How do I undo the last commit?',
      answer:
        'Use `git reset --soft HEAD~1` to undo the commit but keep changes staged. Use `git reset --mixed HEAD~1` to undo and unstage changes. Use `git reset --hard HEAD~1` to completely discard the commit and changes (dangerous!). If already pushed, use `git revert HEAD` to create a new commit that undoes the changes.',
    },
    {
      question: 'What is the difference between git fetch and git pull?',
      answer:
        'Git fetch downloads changes from a remote repository but does not integrate them into your local branch. Git pull is essentially git fetch followed by git merge (or git rebase with --rebase flag). Use fetch when you want to review changes before integrating; use pull for quick updates.',
    },
    {
      question: 'How do I resolve merge conflicts?',
      answer:
        'When a conflict occurs: 1) Open the conflicted files and look for conflict markers (<<<<<<<, =======, >>>>>>>). 2) Edit the file to resolve conflicts manually. 3) Stage the resolved files with `git add`. 4) Complete the merge with `git commit` or `git merge --continue`. You can abort with `git merge --abort`.',
    },
    {
      question: 'What is git stash and when should I use it?',
      answer:
        'Git stash temporarily saves your uncommitted changes, allowing you to switch branches or pull updates without committing incomplete work. Use `git stash` to save, `git stash pop` to restore and remove, or `git stash apply` to restore without removing. Great for context switching or pulling when you have local changes.',
    },
  ]

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ spaceY: '4' })}>
        <Badge
          className={css({
            bg: 'orange.500/10',
            color: 'orange.400',
            border: '1px solid',
            borderColor: 'orange.500/20',
          })}
        >
          <GitBranch className={css({ w: '3', h: '3', mr: '1' })} />
          Development Tool
        </Badge>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            letterSpacing: 'tight',
            background: 'linear-gradient(to right, #f97316, #ef4444)',
            backgroundClip: 'text',
            color: 'transparent',
          })}
        >
          Git Command Generator
        </h1>
        <p
          className={css({
            fontSize: { base: 'md', md: 'lg' },
            color: 'gray.400',
            maxW: '3xl',
          })}
        >
          Build Git commands interactively with options and flags. Select a command, customize
          options, and copy the generated command to your clipboard.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          gap: '6',
          w: 'full',
        })}
      >
        {/* Category Selection */}
        <Card
          className={css({
            bg: 'gray.900/50',
            border: '1px solid',
            borderColor: 'orange.500/20',
            backdropFilter: 'blur(8px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <BookOpen className={css({ w: '5', h: '5', color: 'orange.400' })} />
              Categories
            </CardTitle>
            <CardDescription>Select a command category</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '2' })}>
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = info.icon
              const isSelected = selectedCategory === key
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key)
                    setSelectedCommand(null)
                    setSelectedOptions([])
                    setAdditionalArgs('')
                  }}
                  className={css({
                    w: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    p: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: isSelected ? 'orange.500/50' : 'gray.700',
                    bg: isSelected ? 'orange.500/10' : 'gray.800/50',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'orange.500/30',
                      bg: 'gray.800',
                    },
                  })}
                >
                  <Icon
                    className={css({
                      w: '5',
                      h: '5',
                      color: isSelected ? 'orange.400' : 'gray.500',
                    })}
                  />
                  <div>
                    <div
                      className={css({
                        fontWeight: 'medium',
                        color: isSelected ? 'orange.400' : 'gray.200',
                      })}
                    >
                      {info.name}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      {info.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Command Selection */}
        <Card
          className={css({
            bg: 'gray.900/50',
            border: '1px solid',
            borderColor: 'orange.500/20',
            backdropFilter: 'blur(8px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Terminal className={css({ w: '5', h: '5', color: 'orange.400' })} />
              Commands
            </CardTitle>
            <CardDescription>Select a Git command</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '2', maxH: '400px', overflowY: 'auto' })}>
            {gitCommands[selectedCategory]?.map((cmd) => {
              const isSelected = selectedCommand?.name === cmd.name
              return (
                <button
                  type="button"
                  key={cmd.name}
                  onClick={() => handleSelectCommand(cmd)}
                  className={css({
                    w: 'full',
                    display: 'flex',
                    flexDir: 'column',
                    alignItems: 'flex-start',
                    gap: '1',
                    p: '3',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: isSelected ? 'orange.500/50' : 'gray.700',
                    bg: isSelected ? 'orange.500/10' : 'gray.800/50',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    _hover: {
                      borderColor: 'orange.500/30',
                      bg: 'gray.800',
                    },
                  })}
                >
                  <div
                    className={css({
                      fontFamily: 'mono',
                      fontWeight: 'medium',
                      color: isSelected ? 'orange.400' : 'gray.200',
                    })}
                  >
                    git {cmd.name}
                  </div>
                  <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                    {cmd.description}
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Options & Output */}
        <Card
          className={css({
            bg: 'gray.900/50',
            border: '1px solid',
            borderColor: 'orange.500/20',
            backdropFilter: 'blur(8px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Settings className={css({ w: '5', h: '5', color: 'orange.400' })} />
              Options
            </CardTitle>
            <CardDescription>
              {selectedCommand
                ? `Configure ${selectedCommand.name} options`
                : 'Select a command first'}
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {selectedCommand ? (
              <>
                <div className={css({ spaceY: '2', maxH: '200px', overflowY: 'auto' })}>
                  {selectedCommand.options.map((option) => {
                    const isChecked = selectedOptions.some((o) => o.flag === option.flag)
                    const currentValue =
                      selectedOptions.find((o) => o.flag === option.flag)?.value || ''

                    return (
                      <div
                        key={option.flag}
                        className={css({
                          p: '2',
                          rounded: 'md',
                          bg: isChecked ? 'orange.500/5' : 'transparent',
                          border: '1px solid',
                          borderColor: isChecked ? 'orange.500/20' : 'transparent',
                        })}
                      >
                        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                          <input
                            type="checkbox"
                            id={option.flag}
                            checked={isChecked}
                            onChange={() => handleToggleOption(option)}
                            className={css({
                              h: '4',
                              w: '4',
                              rounded: 'sm',
                              border: '2px solid',
                              borderColor: 'gray.600',
                              cursor: 'pointer',
                              _checked: { bg: 'orange.500', borderColor: 'orange.500' },
                            })}
                          />
                          <Label
                            htmlFor={option.flag}
                            className={css({
                              fontFamily: 'mono',
                              fontSize: 'sm',
                              color: isChecked ? 'orange.400' : 'gray.300',
                              cursor: 'pointer',
                            })}
                          >
                            {option.flag}
                          </Label>
                          <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                            {option.description}
                          </span>
                        </div>
                        {option.requiresValue && isChecked && (
                          <Input
                            placeholder={option.valuePlaceholder}
                            value={currentValue}
                            onChange={(e) => handleOptionValueChange(option.flag, e.target.value)}
                            className={css({
                              mt: '2',
                              ml: '6',
                              h: '8',
                              fontSize: 'sm',
                              bg: 'gray.800',
                              border: '1px solid',
                              borderColor: 'gray.700',
                            })}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className={css({ spaceY: '2' })}>
                  <Label className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Additional arguments
                  </Label>
                  <Input
                    placeholder="e.g., file.txt, branch-name, commit-hash"
                    value={additionalArgs}
                    onChange={(e) => setAdditionalArgs(e.target.value)}
                    className={css({
                      bg: 'gray.800',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
              </>
            ) : (
              <div
                className={css({
                  textAlign: 'center',
                  py: '8',
                  color: 'gray.500',
                })}
              >
                Select a command to see available options
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Command Output */}
      <Card
        className={css({
          bg: 'gray.900/50',
          border: '1px solid',
          borderColor: 'orange.500/20',
          backdropFilter: 'blur(8px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Play className={css({ w: '5', h: '5', color: 'orange.400' })} />
            Generated Command
          </CardTitle>
          <CardDescription>Copy and run this command in your terminal</CardDescription>
        </CardHeader>
        <CardContent className={css({ spaceY: '4' })}>
          <div
            className={css({
              p: '4',
              rounded: 'lg',
              bg: 'gray.950',
              border: '1px solid',
              borderColor: 'gray.800',
              fontFamily: 'mono',
              fontSize: { base: 'sm', md: 'base' },
              color: generatedCommand ? 'green.400' : 'gray.500',
              minH: '60px',
              display: 'flex',
              alignItems: 'center',
            })}
          >
            {generatedCommand || 'Select a command and options to generate...'}
          </div>

          <div className={css({ display: 'flex', gap: '2' })}>
            <Button
              onClick={handleCopy}
              disabled={!generatedCommand}
              className={css({
                flex: '1',
                bg: 'orange.500',
                color: 'white',
                _hover: { bg: 'orange.600' },
                _disabled: { opacity: 0.5, cursor: 'not-allowed' },
              })}
            >
              {copied ? (
                <>
                  <Check className={css({ w: '4', h: '4', mr: '2' })} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                  Copy Command
                </>
              )}
            </Button>
          </div>

          {/* Examples */}
          {selectedCommand && selectedCommand.examples.length > 0 && (
            <div className={css({ spaceY: '2' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Lightbulb className={css({ w: '4', h: '4', color: 'yellow.500' })} />
                <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Examples:</span>
              </div>
              <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                {selectedCommand.examples.map((example) => (
                  <button
                    type="button"
                    key={example}
                    onClick={() => {
                      navigator.clipboard.writeText(example)
                      toast.success('Example copied')
                    }}
                    className={css({
                      px: '3',
                      py: '1',
                      rounded: 'md',
                      bg: 'gray.800',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      fontFamily: 'mono',
                      fontSize: 'xs',
                      color: 'gray.300',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        borderColor: 'orange.500/30',
                        bg: 'gray.700',
                      },
                    })}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command History */}
      {history.length > 0 && (
        <Card
          className={css({
            bg: 'gray.900/50',
            border: '1px solid',
            borderColor: 'orange.500/20',
            backdropFilter: 'blur(8px)',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <div>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Clock className={css({ w: '5', h: '5', color: 'orange.400' })} />
                  Recent Commands
                </CardTitle>
                <CardDescription>Your recently generated commands</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className={css({
                  color: 'gray.400',
                  _hover: { color: 'red.400', bg: 'red.500/10' },
                })}
              >
                <Trash2 className={css({ w: '4', h: '4', mr: '1' })} />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '2', maxH: '300px', overflowY: 'auto' })}>
              {history.map((item) => (
                <div
                  key={item.id}
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: '3',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _hover: { borderColor: 'orange.500/20' },
                  })}
                >
                  <div className={css({ flex: '1', minW: '0' })}>
                    <div
                      className={css({
                        fontFamily: 'mono',
                        fontSize: 'sm',
                        color: 'green.400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {item.command}
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mt: '1' })}>
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUseHistoryItem(item)}
                    className={css({
                      color: 'gray.400',
                      _hover: { color: 'orange.400' },
                    })}
                  >
                    <Copy className={css({ w: '4', h: '4' })} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reference */}
      <Card
        className={css({
          bg: 'gray.900/50',
          border: '1px solid',
          borderColor: 'orange.500/20',
          backdropFilter: 'blur(8px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <BookOpen className={css({ w: '5', h: '5', color: 'orange.400' })} />
            Quick Reference
          </CardTitle>
          <CardDescription>Common Git workflows at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: '4',
              w: 'full',
            })}
          >
            {[
              {
                title: 'Start a new repository',
                commands: ['git init', 'git add .', 'git commit -m "Initial commit"'],
              },
              {
                title: 'Clone and setup',
                commands: ['git clone <url>', 'cd <repo>', 'git checkout -b feature'],
              },
              {
                title: 'Save your work',
                commands: ['git add -A', 'git commit -m "message"', 'git push'],
              },
              {
                title: 'Update from remote',
                commands: ['git fetch --all', 'git pull --rebase', 'git push'],
              },
              {
                title: 'Create a feature branch',
                commands: ['git checkout main', 'git pull', 'git checkout -b feature'],
              },
              {
                title: 'Merge feature branch',
                commands: ['git checkout main', 'git merge --no-ff feature', 'git push'],
              },
            ].map((workflow) => (
              <div
                key={workflow.title}
                className={css({
                  p: '4',
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <div className={css({ fontWeight: 'medium', color: 'gray.200', mb: '2' })}>
                  {workflow.title}
                </div>
                <div className={css({ spaceY: '1' })}>
                  {workflow.commands.map((cmd) => (
                    <div
                      key={`${workflow.title}-${cmd}`}
                      className={css({
                        fontFamily: 'mono',
                        fontSize: 'xs',
                        color: 'green.400',
                        p: '1',
                        rounded: 'sm',
                        bg: 'gray.900/50',
                      })}
                    >
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card
        className={css({
          bg: 'gray.900/50',
          border: '1px solid',
          borderColor: 'orange.500/20',
          backdropFilter: 'blur(8px)',
        })}
      >
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about Git commands</CardDescription>
        </CardHeader>
        <CardContent>
          <FAQAccordion faqs={faqItems} />
        </CardContent>
      </Card>

      {/* Related Tools */}
      <RelatedTools currentToolPath="/tools/development/git-generator" category="development" />

      {/* Tool Rating */}
      <ToolRating toolId="git-generator" toolName="Git Command Generator" />

      {/* Tool Search */}
      <ToolSearch />
    </main>
  )
}
