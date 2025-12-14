const { execSync } = require('child_process');
const path = require('path');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'index.js');

function runCLI(args) {
  try {
    const result = execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: result.trim(), stderr: '', exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout ? error.stdout.toString().trim() : '',
      stderr: error.stderr ? error.stderr.toString().trim() : '',
      exitCode: error.status || 1,
    };
  }
}

describe('CLI - Basic Usage', () => {
  test('masks with default settings', () => {
    const result = runCLI('"mysecretkey"');
    expect(result.stdout).toBe('mys*****key');
    expect(result.exitCode).toBe(0);
  });

  test('shows help with --help flag', () => {
    const result = runCLI('--help');
    expect(result.stdout).toContain('obscure-string CLI');
    expect(result.stdout).toContain('USAGE:');
    expect(result.exitCode).toBe(0);
  });

  test('shows help with -h flag', () => {
    const result = runCLI('-h');
    expect(result.stdout).toContain('obscure-string CLI');
    expect(result.exitCode).toBe(0);
  });

  test('shows help when no arguments provided', () => {
    const result = runCLI('');
    expect(result.stdout).toContain('obscure-string CLI');
    expect(result.exitCode).toBe(0);
  });
});

describe('CLI - Options', () => {
  test('respects --prefix option', () => {
    const result = runCLI('"mysecretkey" --prefix 2');
    expect(result.stdout).toBe('my******key');
    expect(result.exitCode).toBe(0);
  });

  test('respects -p short option', () => {
    const result = runCLI('"mysecretkey" -p 2');
    expect(result.stdout).toBe('my******key');
    expect(result.exitCode).toBe(0);
  });

  test('respects --suffix option', () => {
    const result = runCLI('"mysecretkey" --suffix 2');
    expect(result.stdout).toBe('mys******ey');
    expect(result.exitCode).toBe(0);
  });

  test('respects -s short option', () => {
    const result = runCLI('"mysecretkey" -s 2');
    expect(result.stdout).toBe('mys******ey');
    expect(result.exitCode).toBe(0);
  });

  test('respects --char option', () => {
    const result = runCLI('"test" --char "#"');
    expect(result.stdout).toBe('test'); // Too short with defaults
    expect(result.exitCode).toBe(0);
  });

  test('respects -c short option', () => {
    const result = runCLI('"teststring" -c "#"');
    expect(result.stdout).toBe('tes####ing');
    expect(result.exitCode).toBe(0);
  });

  test('combines multiple options', () => {
    const result = runCLI('"mysecretkey" -p 2 -s 2 -c "#"');
    expect(result.stdout).toBe('my#######ey');
    expect(result.exitCode).toBe(0);
  });
});

describe('CLI - Presets', () => {
  test('email preset', () => {
    const result = runCLI('"john.doe@example.com" --preset email');
    expect(result.stdout).toContain('@example.com');
    expect(result.exitCode).toBe(0);
  });

  test('creditCard preset', () => {
    const result = runCLI('"4111111111111111" --preset creditCard');
    expect(result.stdout).toBe('************1111');
    expect(result.exitCode).toBe(0);
  });

  test('phone preset', () => {
    const result = runCLI('"1234567890" --preset phone');
    expect(result.stdout).toBe('******7890');
    expect(result.exitCode).toBe(0);
  });
});

describe('CLI - Advanced Features', () => {
  test('full mask', () => {
    const result = runCLI('"sensitive" --full');
    expect(result.stdout).toBe('*********');
    expect(result.exitCode).toBe(0);
  });

  test('reverse mask', () => {
    const result = runCLI('"1234567890" --reverse');
    expect(result.stdout).toBe('***4567***');
    expect(result.exitCode).toBe(0);
  });

  test('percentage mask', () => {
    const result = runCLI('"1234567890" --percentage 50');
    expect(result.stdout).toBe('12*****890');
    expect(result.exitCode).toBe(0);
  });

  test('min-mask option', () => {
    const result = runCLI('"test" --min-mask 5 -p 1 -s 1');
    expect(result.stdout).toBe('test'); // Not enough chars to mask
    expect(result.exitCode).toBe(0);
  });
});

describe('CLI - Error Handling', () => {
  test('handles unknown option', () => {
    const result = runCLI('"test" --unknown');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unknown option');
  });

  test('handles invalid percentage', () => {
    const result = runCLI('"test" --percentage 150');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Error');
  });

  test('handles invalid prefix', () => {
    const result = runCLI('"test" --prefix -1');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Error');
  });
});

describe('CLI - Special Characters', () => {
  test('handles strings with spaces', () => {
    const result = runCLI('"my secret key"');
    expect(result.stdout).toBe('my *******key');
    expect(result.exitCode).toBe(0);
  });

  test('handles strings with special chars', () => {
    const result = runCLI('"test@#$%test"');
    expect(result.stdout).toContain('tes');
    expect(result.exitCode).toBe(0);
  });

  test('handles unicode', () => {
    const result = runCLI('"🔐secret🔑"');
    expect(result.exitCode).toBe(0);
  });
});