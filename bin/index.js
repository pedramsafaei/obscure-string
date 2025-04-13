#!/usr/bin/env node

const { obscureString } = require('../src');

const input = process.argv[2] || '';
const prefix = Number(process.argv[3]) || 3;
const suffix = Number(process.argv[4]) || 3;

const output = obscureString(input, {
  prefixLength: prefix,
  suffixLength: suffix,
});

console.log(output);
