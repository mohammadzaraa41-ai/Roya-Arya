const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'capacitor-unity-ads', 'ios', 'Sources', 'UnityadsPlugin', 'Unityads.swift');

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8');
  let changed = false;

  // 1. Fix Swift completion enum case (Xcode 16 / Swift 6 renamed ShowCompletionStateCompleted to showCompletionStateCompleted)
  if (content.includes('state == .completed')) {
    content = content.replace(/state == \.completed/g, 'state == .showCompletionStateCompleted');
    changed = true;
  }
  if (content.includes('state == .ShowCompletionStateCompleted')) {
    content = content.replace(/state == \.ShowCompletionStateCompleted/g, 'state == .showCompletionStateCompleted');
    changed = true;
  }

  // 2. Fix access level so delegate classes in the same file can access loaded state
  if (content.includes('private var rewardedVideoLoaded')) {
    content = content.replace(/private var rewardedVideoLoaded/g, 'var rewardedVideoLoaded');
    changed = true;
  }

  if (content.includes('private var interstitialLoaded')) {
    content = content.replace(/private var interstitialLoaded/g, 'var interstitialLoaded');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(target, content, 'utf8');
    console.log('[Patch] Successfully patched Unityads.swift for Xcode 16 / Swift 6 compatibility.');
  } else {
    console.log('[Patch] Unityads.swift is already up to date.');
  }
} else {
  console.log('[Patch] Target Unityads.swift not found (skipping).');
}
