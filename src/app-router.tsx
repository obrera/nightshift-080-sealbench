import { createBrowserRouter, Navigate } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { ShellFeature, ShellUiLoader } from '@/shell/feature'

export const appRouter = createBrowserRouter(
  [
    {
      children: [
        { element: <Navigate replace to="/sealbench" />, index: true },
        {
          lazy: () => import('@/features/evidence/feature/evidence-feature-dashboard'),
          path: 'sealbench',
        },
        {
          lazy: () => import('@/shell/feature/shell-not-found-feature'),
          loader: (): ShellNotFoundProps => ({
            links: [
              {
                description: 'Open the legal-document provenance workbench.',
                title: 'SealBench',
                to: '/sealbench',
              },
            ],
          }),
          path: '*',
        },
      ],
      element: <ShellFeature links={[{ label: 'Workbench', to: '/sealbench' }]} />,
      hydrateFallbackElement: <ShellUiLoader fullScreen />,
    },
  ],
  {
    // Set the base URL for router links and redirects, removing trailing slashes if present, independent of the base
    basename: import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, ''),
  },
)
