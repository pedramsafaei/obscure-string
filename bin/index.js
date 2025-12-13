#!/usr/bin/env node

const { obscureString } = require('../src');

// Parse command line arguments
const args = process.argv.slice(2);

// Show help if requested or no arguments
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
🕶️  obscure-string CLI

USAGE:
  obscure-string <string> [options]

OPTIONS:
  --prefix, -p <num>        Number of visible chars at start (default: 3)
  --suffix, -s <num>        Number of visible chars at end (default: 3)
  --char, -c <char>         Mask character (default: *)
  --full                    Mask entire string
  --reverse                 Show middle, hide edges
  --percentage <num>        Mask percentage 0-100
  --preset <type>           Use preset: email, creditCard, phone
  --min-mask <num>          Minimum masked characters required
  --max-length <num>        Maximum string length (DoS protection)
  --help, -h                Show this help message

EXAMPLES:
  obscure-string "mysecretkey"
  # → mys*****key

  obscure-string "john@example.com" --preset email
  # → jo**@example.com

  obscure-string "4111111111111111" --preset creditCard
  # → ************1111

  obscure-string "sensitive" --full
  # → *********

  obscure-string "data" --percentage 50
  # → d**a

  obscure-string "test" -p 1 -s 1 -c "#"
  # → t##t

For more info: https://github.com/pedramsafaei/obscure-string
  `);
  process.exit(0);
}

// Extract the input string (first non-flag argument)
let input = '';
let i = 0;
if (args[0] && !args[0].startsWith('-')) {
  input = args[0];
  i = 1;
}

// Parse options
const options = {};

while (i < args.length) {
  const arg = args[i];
  const next = args[i + 1];

  switch (arg) {
    case '--prefix':
    case '-p':
      options.prefixLength = Number(next);
      i += 2;
      break;

    case '--suffix':
    case '-s':
      options.suffixLength = Number(next);
      i += 2;
      break;

    case '--char':
    case '-c':
      options.maskChar = next;
      i += 2;
      break;

    case '--percentage':
      options.percentage = Number(next);
      i += 2;
      break;

    case '--preset':
      options.preset = next;
      i += 2;
      break;

    case '--min-mask':
      options.minMaskLength = Number(next);
      i += 2;
      break;

    case '--max-length':
      options.maxLength = Number(next);
      i += 2;
      break;

    case '--full':
      options.fullMask = true;
      i += 1;
      break;

    case '--reverse':
      options.reverseMask = true;
      i += 1;
      break;

    default:
      console.error(`Unknown option: ${arg}`);
      console.error('Run "obscure-string --help" for usage information.');
      process.exit(1);
  }
}

// Validate input
if (!input) {
  console.error('Error: No input string provided');
  console.error('Run "obscure-string --help" for usage information.');
  process.exit(1);
}

// Process the input
try {
  const output = obscureString(input, options);
  console.log(output);
  process.exit(0);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
