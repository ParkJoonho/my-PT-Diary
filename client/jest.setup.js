globalThis.__granite = {
  ...globalThis.__granite,
  meta: {
    ...globalThis.__granite?.meta,
    env: {
      ...globalThis.__granite?.meta?.env,
      API_BASE_URL: 'http://127.0.0.1:3000',
    },
  },
};
