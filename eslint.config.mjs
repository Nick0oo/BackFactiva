import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';
import process from 'node:process';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    plugins: {
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public'
        }
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }],
      
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-const-assign': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'error',
      'valid-typeof': 'error',
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'error',
      'require-await': ['error', { 'ignoreRefinements': true }],
      'no-throw-literal': 'error',
      'no-unused-private-class-members': 'error',
      'no-useless-catch': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-sequences': 'error',
      'no-unmodified-loop-condition': 'error',
      
      // Code style
      'max-len': ['error', { 
        'code': 100,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
        'ignoreRegExpLiterals': true
      }],
      'max-lines-per-function': ['error', { 
        'max': 50,
        'skipBlankLines': true,
        'skipComments': true
      }],
      'max-params': ['error', { 'max': 3 }],
      'no-nested-ternary': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'no-trailing-spaces': 'error',
      'no-whitespace-before-property': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      
      // NestJS specific rules
      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'no-empty-function': ['error', { 'allow': ['constructors'] }],
      
      // Documentation
      // 'jsdoc/require-jsdoc': ['error', {
      //   'publicOnly': true,
      //   'require': {
      //     'FunctionDeclaration': true,
      //     'MethodDefinition': true,
      //     'ClassDeclaration': true,
      //     'ArrowFunctionExpression': false,
      //     'FunctionExpression': false
      //   }
      // }],
      // 'jsdoc/require-param': 'error',
      // 'jsdoc/require-returns': 'error',
      // 'jsdoc/require-description': 'error',
      // 'jsdoc/check-param-names': 'error',
      // 'jsdoc/check-tag-names': 'error',
      // 'jsdoc/check-types': 'error',
    },
  },
];
