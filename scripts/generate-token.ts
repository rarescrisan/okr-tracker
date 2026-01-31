import { SignJWT } from 'jose';

interface Args {
  role: 'view' | 'admin';
  expiry: number | 'never';
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let role: 'view' | 'admin' = 'view';
  let expiry: number | 'never' = 24;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--role' && args[i + 1]) {
      const r = args[i + 1];
      if (r !== 'view' && r !== 'admin') {
        console.error('Error: Role must be "view" or "admin"');
        process.exit(1);
      }
      role = r;
    }
    if (args[i] === '--expiry' && args[i + 1]) {
      const e = args[i + 1];
      if (e === 'never') {
        expiry = 'never';
      } else {
        const hours = parseInt(e, 10);
        if (isNaN(hours) || hours <= 0) {
          console.error('Error: Expiry must be a positive number of hours or "never"');
          process.exit(1);
        }
        expiry = hours;
      }
    }
  }

  return { role, expiry };
}

function printUsage() {
  console.log(`
Usage: npm run generate-token -- --role <view|admin> --expiry <hours|never>

Options:
  --role    User role: "view" or "admin" (default: view)
  --expiry  Token expiry in hours, or "never" for no expiration (default: 24)

Examples:
  npm run generate-token -- --role admin --expiry 720    # Admin token, 30 days
  npm run generate-token -- --role view --expiry never   # View token, never expires
  npm run generate-token -- --role admin --expiry 24     # Admin token, 24 hours

Note: JWT_SECRET environment variable must be set.
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const { role, expiry } = parseArgs();

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('Error: JWT_SECRET environment variable is required');
    console.error('');
    console.error('Set it before running:');
    console.error('  JWT_SECRET=your-secret-here npm run generate-token -- --role admin --expiry 720');
    process.exit(1);
  }

  if (secret.length < 32) {
    console.error('Error: JWT_SECRET should be at least 32 characters for security');
    process.exit(1);
  }

  const secretBytes = new TextEncoder().encode(secret);

  let builder = new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (expiry !== 'never') {
    builder = builder.setExpirationTime(`${expiry}h`);
  }

  const token = await builder.sign(secretBytes);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  console.log('');
  console.log('=== JWT Token Generated ===');
  console.log('');
  console.log('Role:', role);
  console.log('Expiry:', expiry === 'never' ? 'Never' : `${expiry} hours`);
  console.log('');
  console.log('Token:');
  console.log(token);
  console.log('');
  console.log('URL with token:');
  console.log(`${appUrl}?token=${token}`);

  if (role === 'admin') {
    console.log('');
    console.log('Admin URL:');
    console.log(`${appUrl}/admin?token=${token}`);
  }
  console.log('');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
