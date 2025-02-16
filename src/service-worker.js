const adBlockingPatterns = [
  "*://*.doubleclick.net/*",
  "*://*.googleadservices.com/*",
  "*://*.popads.net/*",
  "*://*/*popup*",
  "*://*/*tracking*",
  "*://*/*clickbait*",
  "*://*/*sponsored*",
  "*://*.googlesyndication.com/*",
  "*://*.google-analytics.com/*",
  "*://*.quantserve.com/*",
  "*://*.scorecardresearch.com/*",
  "*://*.zedo.com/*",
  "*://partner.googleadservices.com/*",
  "*://creative.ak.fbcdn.net/*",
  "*://*.adbrite.com/*",
  "*://*.exponential.com/*",
];

// Generate rules from patterns
const dynamicRules = adBlockingPatterns.map((pattern, index) => ({
  id: index + 1,
  priority: 1,
  action: { type: "block" },
  condition: {
    urlFilter: pattern, // Fixed here
    resourceTypes: ["script", "image", "stylesheet"],
  },
}));

// Remove old rules first, then add new ones
chrome.declarativeNetRequest.updateDynamicRules(
  { removeRuleIds: dynamicRules.map((rule) => rule.id) },
  () => {
    chrome.declarativeNetRequest.updateDynamicRules({ addRules: dynamicRules });
  }
);

// Block third-party trackers
chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      id: 1000,
      priority: 1,
      action: { type: "block" },
      condition: {
        initiatorDomains: ["facebook.com", "google-analytics.com"],
        resourceTypes: ["xmlhttprequest"],
      },
    },
  ],
  removeRuleIds: [1000],
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Ad Blocker installed. Rules updated!");
});

// Fetch random quote
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchQuote") {
    fetch("http://api.quotable.io/random") // Fixed API URL
      .then((response) => response.json())
      .then((data) => {
        sendResponse({ quote: data.content, author: data.author });
      })
      .catch((error) => {
        console.error("Failed to fetch quote:", error);
        sendResponse({ quote: "Stay positive!", author: "Unknown" });
      });

    return true; // Keep message channel open
  }

  if (request.action === "adContent") {
    chrome.storage.local.get("adContent", (data) => {
      sendResponse(data.adContent || "motivation");
    });
    return true;
  }

  if (request.action === "fetchActivities") {
    chrome.storage.local.get("activities", (data) => {
      sendResponse(data.activities || []);
    });
    return true;
  }
});

// Get and update ad stats
async function getAdStats() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["adCount", "siteCount", "resetTime"], (data) => {
      const now = Date.now();
      if (!data.resetTime || now - data.resetTime > 24 * 60 * 60 * 1000) {
        chrome.storage.local.set({ adCount: 0, siteCount: 0, resetTime: now }, () => {
          resolve({ adCount: 0, siteCount: 0 });
        });
      } else {
        resolve({ adCount: data.adCount || 0, siteCount: data.siteCount || 0 });
      }
    });
  });
}

async function updateAdStats(adsLength) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["adCount", "siteCount", "resetTime"], (data) => {
      const now = Date.now();
      let { adCount = 0, siteCount = 0, resetTime } = data;

      adCount += adsLength;
      siteCount += 1; // Increment site count only when ads are detected

      chrome.storage.local.set({ adCount, siteCount, resetTime: resetTime || now }, () => {
        resolve({ adCount, siteCount });
      });
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAdStats") {
    getAdStats().then(sendResponse);
    return true;
  }

  if (request.action === "updateAdStats") {
    updateAdStats(request.adsLength).then(sendResponse);
    return true;
  }
});

// Block popups more intelligently
chrome.windows.onCreated.addListener((window) => {
  if (window.type === "popup") {
    chrome.tabs.query({ windowId: window.id }, (tabs) => {
      const blockedSites = ["ad-popup-site.com"];
      if (tabs.some(tab => blockedSites.some(site => tab.url.includes(site)))) {
        chrome.windows.remove(window.id);
      }
    });
  }
});
