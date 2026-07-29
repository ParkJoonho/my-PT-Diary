import { defineConfig } from 'orval';
import { OPENAPI_SCHEMA_URL } from './config/environment';

export default defineConfig({
  atPt: {
    input: {
      target: OPENAPI_SCHEMA_URL,
    },
    output: {
      target: './src/shared/api/generated/endpoints',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'tags-split',
      clean: true,
      baseUrl: {
        runtime: 'import.meta.env.API_BASE_URL',
      },
      override: {
        query: {
          signal: false,
          useQuery: false,
          useSuspenseQuery: true,
        },
      },
    },
  },
});
