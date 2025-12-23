import pluginJs from '@eslint/js'
import globals from 'globals'

export default [
	{
		languageOptions: {
			globals: globals.node,
			ecmaVersion: 2024,
			sourceType: 'module',
		},
		files: ['**/*.js'],
		ignores: ['node_modules/**/*'],
		rules: {
			'no-unused-vars': 'error',
			semi: ['error', 'never'],
			'no-case-declarations': 'off',
			'no-undef': 'warn',
			'no-duplicate-imports': 'warn',
			'no-irregular-whitespace': [
				'error',
				{ skipStrings: true, skipTemplates: true },
			],
			'default-case': 'error',
			eqeqeq: ['error', 'always'],
			'space-before-function-paren': ['error', 'always'],
			quotes: ['error', 'single'],
			'keyword-spacing': ['error', { before: true, after: true }],
			'no-extra-semi': 'error',
			'object-curly-spacing': ['error', 'always', { objectsInObjects: false }],
			'comma-spacing': ['error', { before: false, after: true }],
			indent: ['error', 'tab'],
		},
	},
	pluginJs.configs.recommended,
]
