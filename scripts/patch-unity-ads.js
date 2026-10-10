const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'capacitor-unity-ads', 'ios', 'Sources', 'UnityadsPlugin', 'Unityads.swift');

const patchedSwiftContent = `import Foundation
import UnityAds
import UIKit

@objc public class Unityads: NSObject {
    var isInitialized = false
    private var testMode = false
    private var currentRewardedPlacementId: String?
    private var currentInterstitialPlacementId: String?
    var rewardedVideoLoaded = false
    var interstitialLoaded = false
    private var initDelegate: InitializationDelegate?
    
    // Callback types
    typealias InitializationCallback = (Bool, String?) -> Void
    typealias AdLoadCallback = (Bool, String?) -> Void
    typealias RewardedVideoCallback = (Bool, [String: Any]?, String?) -> Void
    typealias InterstitialCallback = (Bool, String?) -> Void
    
    private func getRootViewController() -> UIViewController? {
        if let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) ?? UIApplication.shared.windows.first {
            if let root = window.rootViewController {
                return root
            }
        }
        for scene in UIApplication.shared.connectedScenes {
            if let windowScene = scene as? UIWindowScene {
                if let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first {
                    if let root = window.rootViewController {
                        return root
                    }
                }
            }
        }
        return nil
    }
    
    func initialize(gameId: String, testMode: Bool, callback: @escaping InitializationCallback) {
        print("[UnityAds] Initializing with Game ID: \\(gameId)")
        
        self.testMode = testMode
        self.initDelegate = InitializationDelegate(callback: callback, parent: self)
        
        UnityAds.initialize(gameId, testMode: testMode, initializationDelegate: self.initDelegate)
    }
    
    func loadRewardedVideo(placementId: String, callback: @escaping AdLoadCallback) {
        guard isInitialized else {
            callback(false, "Unity Ads not initialized")
            return
        }
        
        print("[UnityAds] Loading rewarded video with placement ID: \\(placementId)")
        
        currentRewardedPlacementId = placementId
        rewardedVideoLoaded = false
        
        UnityAds.load(placementId, loadDelegate: RewardedVideoLoadDelegate(callback: callback, parent: self))
    }
    
    func showRewardedVideo(callback: @escaping RewardedVideoCallback) {
        guard isInitialized else {
            callback(false, nil, "Unity Ads not initialized")
            return
        }
        
        guard let placementId = currentRewardedPlacementId, rewardedVideoLoaded else {
            callback(false, nil, "Rewarded video not loaded")
            return
        }
        
        guard let rootViewController = getRootViewController() else {
            callback(false, nil, "Root view controller not found")
            return
        }
        
        print("[UnityAds] Showing rewarded video")
        
        UnityAds.show(rootViewController, placementId: placementId, showDelegate: RewardedVideoShowDelegate(callback: callback, parent: self))
    }
    
    func isRewardedVideoLoaded() -> Bool {
        return rewardedVideoLoaded && currentRewardedPlacementId != nil
    }
    
    func loadInterstitial(placementId: String, callback: @escaping AdLoadCallback) {
        guard isInitialized else {
            callback(false, "Unity Ads not initialized")
            return
        }
        
        print("[UnityAds] Loading interstitial with placement ID: \\(placementId)")
        
        currentInterstitialPlacementId = placementId
        interstitialLoaded = false
        
        UnityAds.load(placementId, loadDelegate: InterstitialLoadDelegate(callback: callback, parent: self))
    }
    
    func showInterstitial(callback: @escaping InterstitialCallback) {
        guard isInitialized else {
            callback(false, "Unity Ads not initialized")
            return
        }
        
        guard let placementId = currentInterstitialPlacementId, interstitialLoaded else {
            callback(false, "Interstitial not loaded")
            return
        }
        
        guard let rootViewController = getRootViewController() else {
            callback(false, "Root view controller not found")
            return
        }
        
        print("[UnityAds] Showing interstitial")
        
        UnityAds.show(rootViewController, placementId: placementId, showDelegate: InterstitialShowDelegate(callback: callback, parent: self))
    }
    
    func isInterstitialLoaded() -> Bool {
        return interstitialLoaded && currentInterstitialPlacementId != nil
    }
    
    func setTestMode(enabled: Bool) {
        print("[UnityAds] Setting test mode: \\(enabled)")
        self.testMode = enabled
    }
    
    func getVersion() -> String {
        return UnityAds.getVersion()
    }
}

// MARK: - Initialization Delegate

class InitializationDelegate: NSObject, UnityAdsInitializationDelegate {
    private let callback: Unityads.InitializationCallback
    private weak var parent: Unityads?
    
    init(callback: @escaping Unityads.InitializationCallback, parent: Unityads) {
        self.callback = callback
        self.parent = parent
    }
    
    func initializationComplete() {
        print("[UnityAds] Initialized successfully")
        parent?.isInitialized = true
        callback(true, nil)
    }
    
    func initializationFailed(_ error: UnityAdsInitializationError, withMessage message: String) {
        print("[UnityAds] Initialization failed: \\(message)")
        callback(false, message)
    }
}

// MARK: - Load Delegates

class RewardedVideoLoadDelegate: NSObject, UnityAdsLoadDelegate {
    private let callback: Unityads.AdLoadCallback
    private weak var parent: Unityads?
    
    init(callback: @escaping Unityads.AdLoadCallback, parent: Unityads) {
        self.callback = callback
        self.parent = parent
    }
    
    func unityAdsAdLoaded(_ placementId: String) {
        print("[UnityAds] Rewarded video loaded successfully")
        parent?.rewardedVideoLoaded = true
        callback(true, nil)
    }
    
    func unityAdsAdFailed(toLoad placementId: String, withError error: UnityAdsLoadError, withMessage message: String) {
        print("[UnityAds] Rewarded video failed to load: \\(message)")
        parent?.rewardedVideoLoaded = false
        callback(false, "Failed to load rewarded video: \\(message)")
    }
}

class InterstitialLoadDelegate: NSObject, UnityAdsLoadDelegate {
    private let callback: Unityads.AdLoadCallback
    private weak var parent: Unityads?
    
    init(callback: @escaping Unityads.AdLoadCallback, parent: Unityads) {
        self.callback = callback
        self.parent = parent
    }
    
    func unityAdsAdLoaded(_ placementId: String) {
        print("[UnityAds] Interstitial loaded successfully")
        parent?.interstitialLoaded = true
        callback(true, nil)
    }
    
    func unityAdsAdFailed(toLoad placementId: String, withError error: UnityAdsLoadError, withMessage message: String) {
        print("[UnityAds] Interstitial failed to load: \\(message)")
        parent?.interstitialLoaded = false
        callback(false, "Failed to load interstitial: \\(message)")
    }
}

// MARK: - Show Delegates

class RewardedVideoShowDelegate: NSObject, UnityAdsShowDelegate {
    private let callback: Unityads.RewardedVideoCallback
    private weak var parent: Unityads?
    
    init(callback: @escaping Unityads.RewardedVideoCallback, parent: Unityads) {
        self.callback = callback
        self.parent = parent
    }
    
    func unityAdsShowStart(_ placementId: String) {
        print("[UnityAds] Rewarded video show started")
    }
    
    func unityAdsShowClick(_ placementId: String) {
        print("[UnityAds] Rewarded video clicked")
    }
    
    func unityAdsShowComplete(_ placementId: String, withFinish state: UnityAdsShowCompletionState) {
        print("[UnityAds] Rewarded video show completed with state: \\(state.rawValue)")
        
        parent?.rewardedVideoLoaded = false
        
        if state == .showCompletionStateCompleted {
            let reward = ["type": "coins", "amount": 1] as [String : Any]
            callback(true, reward, nil)
        } else {
            callback(false, nil, nil)
        }
    }
    
    func unityAdsShowFailed(_ placementId: String, withError error: UnityAdsShowError, withMessage message: String) {
        print("[UnityAds] Rewarded video show failed: \\(message)")
        parent?.rewardedVideoLoaded = false
        callback(false, nil, "Failed to show rewarded video: \\(message)")
    }
}

class InterstitialShowDelegate: NSObject, UnityAdsShowDelegate {
    private let callback: Unityads.InterstitialCallback
    private weak var parent: Unityads?
    
    init(callback: @escaping Unityads.InterstitialCallback, parent: Unityads) {
        self.callback = callback
        self.parent = parent
    }
    
    func unityAdsShowStart(_ placementId: String) {
        print("[UnityAds] Interstitial show started")
        callback(true, nil)
    }
    
    func unityAdsShowClick(_ placementId: String) {
        print("[UnityAds] Interstitial clicked")
    }
    
    func unityAdsShowComplete(_ placementId: String, withFinish state: UnityAdsShowCompletionState) {
        print("[UnityAds] Interstitial show completed")
        parent?.interstitialLoaded = false
    }
    
    func unityAdsShowFailed(_ placementId: String, withError error: UnityAdsShowError, withMessage message: String) {
        print("[UnityAds] Interstitial show failed: \\(message)")
        parent?.interstitialLoaded = false
        callback(false, "Failed to show interstitial: \\(message)")
    }
}
`;

if (fs.existsSync(target)) {
  fs.writeFileSync(target, patchedSwiftContent, 'utf8');
  console.log('[Patch] Successfully wrote fully compatible Unityads.swift for UnityAds 4.9.3 + Xcode 16.');
} else {
  console.log('[Patch] Target Unityads.swift not found (skipping).');
}
