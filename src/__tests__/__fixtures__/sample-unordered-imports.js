// This file has intentionally unordered imports to test import sorting rules
import { readFile } from 'fs'
import React from 'react'
import { z } from 'zod'
import { helper } from './utils/helper'
import axios from 'axios'
import { useState } from 'react'
import { LOCAL_CONSTANT } from './constants'
import path from 'path'

// This should trigger import/newline-after-import
const data = { test: true }

export function testFunction() {
  // This unused variable should NOT trigger an error (no-unused-vars is off)
  const unused = 'test'
  
  return helper(data)
}