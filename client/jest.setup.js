globalThis.__granite = {
  ...globalThis.__granite,
  meta: {
    ...globalThis.__granite?.meta,
    env: {
      ...globalThis.__granite?.meta?.env,
      API_BASE_URL: 'http://127.0.0.1:3000',
      ASSET_BASE_URL: 'http://127.0.0.1:9000/pt-diary-assets/v1',
    },
  },
};
