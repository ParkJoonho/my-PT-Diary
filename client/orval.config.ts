import { defineConfig } from 'orval';

export default defineConfig({
  atPt: {
    input: {
      target: 'http://127.0.0.1:3000/docs-json',
    },
    output: {
      target: './src/shared/api/generated/endpoints',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'tags-split',
      clean: true,
      baseUrl: 'http://127.0.0.1:3000',
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
