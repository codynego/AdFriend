// Enhanced Ad-Blocking Core for Manifest V3
// ========================================

// 1. Mutation Observer with Deep Inspection
// -----------------------------------------
const observerConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: []
  };
  
  const observer = new MutationObserver((mutations) => {
    let adsFound = 0;
    mutations.forEach((mutation) => {
      // Handle added nodes
      mutation.addedNodes.forEach((node) => {
        if (inspectNode(node)) adsFound++;
      });
  
      // Handle attribute changes (e.g., ads that morph after injection)
      if (mutation.type === "attributes" && inspectNode(mutation.target)) {
        adsFound++;
      }
    });
  
    if (adsFound > 0) {
      chrome.runtime.sendMessage({ action: "updateAdStats", adsLength: adsFound });
    }
  });
  
  // 2. Universal Node Inspector
  // ---------------------------
  function inspectNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
  
    let adDetected = false;
  
    // Check if node matches ad patterns
    if (isAd(node)) {
      blockAd(node);
      adDetected = true;
    }
  
    // Deep-inspect child nodes
    node.querySelectorAll("*").forEach((child) => {
      if (isAd(child)) {
        blockAd(child);
        adDetected = true;
      }
    });
  
    return adDetected;
  }
  
  // 3. Advanced Ad Detection Logic
  // ------------------------------
  function isAd(element) {
    // Generic Ad Patterns
    const adPatterns = [
      "[src*='ads']", "[id*='ads']", "[class*='ads']", 
      "[href*='ads']", "[data-ad]", "[data-src*='ads']", "[aria-label*='ads']",
      
      // // Common Ad Sizes (e.g., 300x250, 728x90)
      // "[width='300'][height='250']", "[width='728'][height='90']",
      
      // Behavioral Patterns
      "iframe", "embed", "object", // Embedded content
      "div:has(> script)",         // Script containers
      "div:empty:not([class])",    // Suspicious empty divs
      "div[role='banner']",        // Common banner ads
  
      // Additional Specific Ad Patterns
      "iframe[src*='ads']", "iframe[src*='adserver']", "iframe[src*='doubleclick']", 
      "iframe[src*='googleads']", "iframe[src*='adform']", "iframe[src*='adtech']", 
      "iframe[name*='googlefcPresent']", "iframe[src*='openx']", "iframe[src*='pubmatic']", 
      "iframe[src*='rubiconproject']", "iframe[id^='__clb-']", "iframe[src*='bidvertiser']", 
      "iframe[src*='revcontent']", "iframe[src*='mgid']", "iframe[src*='taboola']", 
      "iframe[src*='outbrain']", "img[src*='advert banner']", "img[alt*='advert banner']", 
      "img[alt*='advert']", "img[alt*='sponsor']", "img[alt*='banner']", "img[alt*='ads']", 
      "img[title*='ads']", "img[data-src*='ads']", "ins[class*='adsbygoogle']", 
      "div[class*='ads']", "div[class*='advert']", "div[class*='advertisement']", 
      "div[class*='banner']", "div[class*='sponsor']", "div[class*='promo']", 
      "a[rel*='sponsored']"
    ].join(", ");
  
    // Heuristic Checks
    const isSizeAd = element.offsetWidth > 200 && element.offsetHeight > 100;
    const isIframeAd = element.tagName === "IFRAME" && !element.src.includes("youtube.com");
    const hasAdKeywords = /ads|banner|sponsor|promo|track|commercial/i.test(element.outerHTML);
  
    return (
      element.matches(adPatterns) ||
      isSizeAd ||
      isIframeAd ||
      hasAdKeywords
    );
  }
  
  // 4. Ad Replacement System
  // ------------------------
  async function blockAd(element) {
    console.warn("Blocked dynamic ad:", element);
  
    // Remove ad from DOM
    element.remove();
  
    // Replace with custom content
    const replacement = document.createElement("div");
    replacement.className = "ad-replacement";
    replacement.innerHTML = `
      <div style="padding: 10px; border: 2px solid #ccc; text-align: center; border-radius: 10px; background: #f9f9f9;">
        <h3>Ad Blocked 🛡️</h3>
        <p>${await fetchInspirationalContent()}</p>
      </div>
    `;
  
    element.parentNode?.replaceChild(replacement, element);
  }
  
  // 5. Shadow DOM & Network Request Interceptor
  // ------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Monitor shadow DOMs for hidden ads
    document.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) {
        new MutationObserver((mutations) => {
          mutations.forEach((mutation) => inspectNode(mutation.target));
        }).observe(element.shadowRoot, observerConfig);
      }
    });
  });
  
  // Utilities
  // ---------
  async function fetchInspirationalContent() {
    try {
      const response = await fetch("https://api.quotable.io/random");
      const data = await response.json();
      return data.content || "Stay focused. You’re ad-free!";
    } catch {
      return "Stay focused. You’re ad-free!";
    }
  }
  
  // Initialize Observer
  observer.observe(document.documentElement, observerConfig);
  
  // Listen for Messages from background.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchQuote") {
      fetchInspirationalContent().then(sendResponse);
      return true;
    }
  
    if (request.action === "adContent") {
      sendResponse("motivation");
      return true;
    }
  
    if (request.action === "fetchActivities") {
      sendResponse([]);
      return true;
    }
  });
  