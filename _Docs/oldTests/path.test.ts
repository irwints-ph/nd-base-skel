import { loadSettings } from './loadSettings.ts';

describe('Settings Path Tests', () => {
  test('settings.json file exists and can be parsed', () => {
    const { host, token } = loadSettings();
    expect(host).toBeDefined();
    expect(token).toBeDefined();
  });
});


// import fs from 'fs';
// import path from 'path';

// describe('Settings Path Tests', () => {
//   const settingsPath = path.resolve(__dirname, '../../.vscode/settings.json');
//   console.log('settingsPath:', settingsPath);

//   test('settings.json file exists', () => {
//     expect(fs.existsSync(settingsPath)).toBe(true);
//   });

//   test('settings.json file can be read and parsed', () => {
//     try {
//       const raw = fs.readFileSync(settingsPath, 'utf8');
//       const settings = JSON.parse(raw);
//       expect(settings['rest-client.environmentVariables']).toBeDefined();
//       expect(settings['rest-client.environmentVariables']).toHaveProperty('$shared');

//       // expect(settings).toHaveProperty('rest-client.environmentVariables');
//       // expect(settings['rest-client.environmentVariables']).toHaveProperty('$shared');

//       const shared = settings['rest-client.environmentVariables']['$shared'];
//       expect(shared).toHaveProperty('host');
//       expect(shared).toHaveProperty('token');
//     } catch (err: any) {
//       // Custom message for common JSON issues
//       if (err instanceof SyntaxError) {
//         console.error(
//           '❌ settings.json is not valid JSON. Check for trailing commas, missing quotes, or comments.'
//         );
//       } else {
//         console.error('❌ Failed to read settings.json:', err.message);
//       }
//       throw err; // still fail the test
//     }
//   });
// });
