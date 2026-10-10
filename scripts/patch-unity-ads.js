const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'capacitor-unity-ads', 'ios', 'Sources', 'UnityadsPlugin', 'Unityads.swift');

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8');
  if (content.includes('state == .completed')) {
    content = content.replace('state == .completed', 'state == .ShowCompletionStateCompleted');
    fs.writeFileSync(target, content, 'utf8');
    console.log('[Patch] Successfully patched Unityads.swift: state == .ShowCompletionStateCompleted');
  } else {
    console.log('[Patch] Unityads.swift already patched.');
  }
} else {
  console.log('[Patch] Target Unityads.swift not found (skipping).');
}
