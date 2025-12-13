#!/usr/bin/env node

'use strict';

const { obscureString } = require('../src');

const args = process.argv.slice(2);

// Help text
const HELP_TEXT = `
obscure-string - Professional-grade string obscuration CLI

USAGE:
  obscure-string <string> [options]
  echo <string> | obscure-string [options]

OPTIONS:
  --prefix, -p <number>      Number of characters to show at start (default: 3)
  --suffix, -s <number>      Number of characters to show at end (default: 3)
  --char, -c <character>     Character to use for masking (default: *)
  --percentage <number>      Mask percentage of string (0-100)
  --pattern <type>           Use pattern-specific masking: email, phone, auto
  --random                   Use random mask characters for enhanced privacy
  --help, -h                 Show this help message
  --version, -v              Show version number

EXAMPLES:
  # Basic masking
  obscure-string "mysecretkey"
  # => mys*****key

  # Custom prefix/suffix
  obscure-string "john.doe@example.com" --prefix 2 --suffix 4
  # => jo##############.com

  # Custom mask character
  obscure-string "secret" --char "#"
  # => sec##et

  # Email masking
  obscure-string "user@example.com" --pattern email
  # => u***@example.com

  # Percentage masking
  obscure-string "1234567890" --percentage 50
  # => 12***67890

  # Random masking
  obscure-string "secret" --random
  # => sec•×#t

  # From stdin
  echo "mysecret" | obscure-string --prefix 2 --suffix 2
  # => my****et

  # Multiple strings with xargs
  cat secrets.txt | xargs -I {} obscure-string "{}"

SECURITY:
  - Input sanitization and validation
  - Protection against injection attacks
  - Safe handling of Unicode and emojis
  - Memory exhaustion protection
  - No sensitive data in error messages

For more information, visit:
  https://github.com/pedramsafaei/obscure-string
`;

// Version from package.json
function getVersion() {
  try {
    const pkg = require('../package.json');
    return pkg.version;
  } catch (e) {
    return 'unknown';
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    prefixLength: 3,
    suffixLength: 3,
    maskChar: '*',
  };
  let input = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        console.log(HELP_TEXT);
        process.exit(0);
        break;

      case '--version':
      case '-v':
        console.log(`obscure-string v${getVersion()}`);
        process.exit(0);
        break;

      case '--prefix':
      case '-p':
        options.prefixLength = parseInt(args[++i], 10);
        if (isNaN(options.prefixLength)) {
          console.error('Error: --prefix must be a number');
          process.exit(1);
        }
        break;

      case '--suffix':
      case '-s':
        options.suffixLength = parseInt(args[++i], 10);
        if (isNaN(options.suffixLength)) {
          console.error('Error: --suffix must be a number');
          process.exit(1);
        }
        break;

      case '--char':
      case '-c':
        options.maskChar = args[++i];
        if (!options.maskChar) {
          console.error('Error: --char requires a value');
          process.exit(1);
        }
        break;

      case '--percentage':
        options.percentage = parseFloat(args[++i]);
        if (isNaN(options.percentage)) {
          console.error('Error: --percentage must be a number');
          process.exit(1);
        }
        break;

      case '--pattern':
        options.pattern = args[++i];
        if (!['email', 'phone', 'generic', 'auto'].includes(options.pattern)) {
          console.error('Error: --pattern must be one of: email, phone, generic, auto');
          process.exit(1);
        }
        break;

      case '--random':
        options.randomMask = true;
        break;

      default:
        if (arg.startsWith('-')) {
          console.error(`Error: Unknown option: ${arg}`);
          console.error('Use --help to see available options');
          process.exit(1);
        }
        if (!input) {
          input = arg;
        }
        break;
    }
  }

  return { input, options };
}

// Read from stdin if available
function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve(null);
      return;
    }

    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
  });
}

// Main execution
async function main() {
  const { input, options } = parseArgs(args);
  
  let stringToObscure = input;

  // If no input provided, try reading from stdin
  if (!stringToObscure) {
    stringToObscure = await readStdin();
  }

  // If still no input, show error
  if (!stringToObscure) {
    console.error('Error: No input string provided');
    console.error('Usage: obscure-string <string> [options]');
    console.error('Try: obscure-string --help');
    process.exit(1);
  }

  try {
    const result = obscureString(stringToObscure, options);
    console.log(result);
  } catch (error) {
    console.error(`Error: ${error.message.replace('obscure-string: ', '')}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  });
}

module.exports = { parseArgs };
