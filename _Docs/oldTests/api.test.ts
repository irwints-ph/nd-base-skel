// import fetch from 'node-fetch';
import { loadSettings, login } from './loadSettings.ts';

const { host: API_HOST, token: API_TOKEN } = loadSettings();

describe('API Integration Tests', () => {
  test('POST /api/users/info returns user info', async () => {
    const uname = "u2";
    const logRes = await login(uname, "1");

    const response = await fetch(`${API_HOST}/api/users/info`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    console.log('Data Response:\n', data.data);    
    // Check top-level success flag
    expect(data).toHaveProperty('success', true);

    // Check nested user info
    expect(data).toHaveProperty('data.email');
    expect(data).toHaveProperty('data.fullname');
    expect(data.data.username).toBe(uname);
    // expect(data.data.email).toBe('root@email.org');

  });

  // … other tests
});

// import fs from 'fs';
// import path from 'path';
// import fetch from 'node-fetch';

// let API_HOST: string;
// let API_TOKEN: string;

// describe('Settings and API Integration Tests', () => {
//   beforeAll(() => {
//     const settingsPath = path.resolve(__dirname, '../../.vscode/settings.json');
//     console.log('settingsPath:', settingsPath);

//     // Check file existence
//     if (!fs.existsSync(settingsPath)) {
//       throw new Error('❌ settings.json file does not exist');
//     }

//     try {
//       const raw = fs.readFileSync(settingsPath, 'utf8');
//       const settings = JSON.parse(raw);

//       const shared = settings['rest-client.environmentVariables']['$shared'];
//       if (!shared) {
//         throw new Error('❌ Missing $shared section in settings.json');
//       }

//       API_HOST = shared['host'];
//       API_TOKEN = shared['token'];

//       if (!API_HOST || !API_TOKEN) {
//         throw new Error('❌ host or token missing in settings.json');
//       }
//     } catch (err: any) {
//       console.error(
//         '❌ settings.json is not valid JSON. Check for trailing commas, missing quotes, or comments.'
//       );
//       throw err;
//     }
//   });

//   test('POST /api/users/info returns user info', async () => {
//     const response = await fetch(`${API_HOST}/api/users/info`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${API_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     expect(response.status).toBe(200);

//     const data = await response.json();
//     expect(data).toHaveProperty('email');
//     expect(data).toHaveProperty('name');
//   });

//   test('GET /api/modules/routes returns routes', async () => {
//     const response = await fetch(`${API_HOST}/api/modules/routes`, {
//       headers: {
//         Authorization: `Bearer ${API_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     expect(response.status).toBe(200);

//     const data = await response.json();
//     expect(Array.isArray(data)).toBe(true);
//   });

//   test('GET /api/users with pagination returns list', async () => {
//     const response = await fetch(
//       `${API_HOST}/api/users?page=1&limit=5&sortField=userId&sortDirection=desc`,
//       {
//         headers: {
//           Authorization: `Bearer ${API_TOKEN}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     expect(response.status).toBe(200);

//     const data = await response.json();
//     expect(data).toHaveProperty('items');
//     expect(Array.isArray(data.items)).toBe(true);
//     expect(data.items.length).toBeLessThanOrEqual(5);
//   });
// });
