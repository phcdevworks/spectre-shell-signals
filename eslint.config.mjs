import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
];
