import fs from 'fs';
import path from 'path';
// import fetch from 'node-fetch';

export function loadSettings() {
  const settingsPath = path.resolve(__dirname, '../../.vscode/settings.json');

  if (!fs.existsSync(settingsPath)) {
    throw new Error('❌ settings.json file does not exist');
  }

  const raw = fs.readFileSync(settingsPath, 'utf8');
  const settings = JSON.parse(raw);

  const shared = settings['rest-client.environmentVariables']['$shared'];
  if (!shared) {
    throw new Error('❌ Missing $shared section in settings.json');
  }

  return {
    host: shared['host'],
    token: shared['token'],
    clientId: shared['ClientId'],
    clientSecret: shared['ClientSecret'],
    settingsPath,
    settings,
  };
}

export async function login(username: string = "root", password: string = "1"): Promise<string> {
  const { host, headers } = loadSettings();
  console.log("host: ", host, headers);

  const response = await fetch(`${host}/api/auth/login`, {
    method: "POST",
    headers,
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token; // adjust if your API returns differently
}

export async function login(uname: string = 'root', pass: string = '1') {
  // console.log('[START] Starting login process...');
  const { host, clientId, clientSecret, settingsPath, settings } = loadSettings();

  // console.log('[INFO] Host from settings:', host);
  // console.log('[LOGIN] Attempting login for user:', uname);

  const loginUrl = `${host}/api/auth/token`;
  // console.log('[INFO] Login URL:', loginUrl);

  try {
    const body = new URLSearchParams();
    body.append('username', uname);
    body.append('password', pass);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Client-ID': clientId,
        'X-Client-Secret': clientSecret,
      },
      body,
    });

    const data = await response.json();

    // Accept either "token" or "accessToken"
    const newToken = data.token || data.accessToken;

    if (response.ok && data.success && newToken) {
      console.log('[SUCCESS] Login successful!');
      // settings['rest-client.environmentVariables']['$shared']['token'] = newToken;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      // console.log('[SUCCESS] Token successfully updated in .vscode/settings.json');
      // console.log('[SUCCESS] Login process completed successfully!');
      // console.log('   Username:', uname);
      // console.log('   Host:', host);
      // console.log('   Token Length:', newToken.length, 'characters');
      // console.log('   Settings Updated:', settingsPath);
      // console.log('[INFO] You can now use the updated token in your REST client tests.');
      // console.log('\n[TOKEN] New Token (for manual use):\n', newToken);
      return newToken;
    } else {
      console.error('[ERROR] Login failed - no token in response');
      console.error('Response received:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (err: any) {
    console.error('[ERROR] Login request failed:', err.message);
    return null;
  }
}

// import fs from 'fs';
// import path from 'path';

// export function loadSettings() {
//   const settingsPath = path.resolve(__dirname, '../../.vscode/settings.json');

//   if (!fs.existsSync(settingsPath)) {
//     throw new Error('❌ settings.json file does not exist');
//   }

//   const raw = fs.readFileSync(settingsPath, 'utf8');
//   const settings = JSON.parse(raw);

//   const shared = settings['rest-client.environmentVariables']['$shared'];
//   if (!shared) {
//     throw new Error('❌ Missing $shared section in settings.json');
//   }

//   return {
//     host: shared['host'],
//     token: shared['token'],
//   };
// }

// export function login(uname:string = "root", pass:string = "1") 
// {
//   //os command li ${uname} ${pass}
// }