import { FlatCompat } from '@eslint/eslintrc'
import type { Linter } from 'eslint'

const compat = new FlatCompat()

export const nextConfig: Linter.FlatConfig[] = [
  ...compat.extends('next/core-web-vitals'),
]
