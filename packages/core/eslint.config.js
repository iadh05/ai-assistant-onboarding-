import baseConfig from '@onboarding/config/eslint';

export default [
  ...baseConfig,
  {
    rules: {
      // Allow console for debugging in core package
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
];
