import { AppsInToss } from '@apps-in-toss/framework';
import { QueryClientProvider } from '@tanstack/react-query';
import type { InitialProps } from '@granite-js/react-native';
import type { PropsWithChildren } from 'react';
import { appQueryClient } from './shared/api/query-client';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return (
    <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
  );
}

export default AppsInToss.registerApp(AppContainer, { context });
