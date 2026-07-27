import { config } from '#index.js'

export default config(
  {
<<<<<<< before updating
    ignores: ['vitest.config.ts'],
||||||| last update
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message:
                'Please use absolute imports instead of relative imports.',
            },
          ],
        },
      ],
    },
=======
    typescript: { typeChecked: true },
>>>>>>> after updating
    errorHandling: {},
  },
)
