import baseConfig from '@onboarding/config/eslint';

export default [
  ...baseConfig,
  {
    rules: {
      // Allow console.log in API for request logging
      'no-console': 'off',
    },
  },
];
