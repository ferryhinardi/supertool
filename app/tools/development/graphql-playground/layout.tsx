import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'GraphQL Playground - Test GraphQL APIs Online',
  description:
    'Interactive GraphQL playground and API tester. Write queries, explore schemas, test mutations, and inspect responses with real-time validation. Features include schema introspection, auto-completion, variables panel, and query history.',
  keywords: [
    'graphql playground',
    'graphql tester',
    'graphql api',
    'graphql query builder',
    'graphql explorer',
    'test graphql online',
    'graphql client',
    'graphql schema',
    'graphql mutations',
    'graphql subscriptions',
    'graphql introspection',
    'graphql ide',
    'graphql tool',
    'api tester',
  ],
  category: 'development',
  path: '/tools/development/graphql-playground',
})

export default function GraphQLPlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
