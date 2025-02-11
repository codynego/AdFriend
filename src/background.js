const maliciousDomains = [
  "weegraphooph.net",
  "malicious-site.com",
  "another-bad-site.com",
  "more-bad-stuff.org",
  "even-worse.com",
];

const adBlockingRules = [
  // Block ads from known ad servers
  {
    id: 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||doubleclick.net^",
      resourceTypes: ["script", "image"],
    },
  },
  {
    id: 2,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||googleadservices.com^",
      resourceTypes: ["script", "image"],
    },
  },
  // Block redirects to known malicious domains
  {
    id: 3,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||weegraphooph.net^",
      resourceTypes: ["main_frame"], // Block page navigations
    },
  },
  {
    id: 4,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||popads.net^",
      resourceTypes: ["main_frame", "sub_frame"], // Block popups and iframes
    },
  },
  {
    id: 5,
    priority: 1,
    action: { type: "allow" },
    condition: {
      urlFilter: "||google.com^",
      resourceTypes: ["main_frame", "sub_frame", "script", "image"],
    },
  },
  {
    id: 6,
    priority: 1,
    action: { "type": "block" },
    condition: {
      urlFilter: "*ad*|*popup*|*tracking*|*clickbait*|*sponsored*",
      resourceTypes: ["main_frame", "sub_frame"]
    }
  },
];


const maliciousDomainRules = maliciousDomains.map((domain, index) => ({
  id: 100 + index, // Start IDs from 100 to avoid conflicts with existing rules
  priority: 1,
  action: { type: "block" },
  condition: {
    urlFilter: `||${domain}^`,
    resourceTypes: ["main_frame"], // Block page navigations
  },
}));

const allRules = [...adBlockingRules, ...maliciousDomainRules];

chrome.declarativeNetRequest.updateDynamicRules(
  {
    addRules: allRules,
    removeRuleIds: allRules.map((rule) => rule.id),
  },
  () => {
    console.log("All rules (existing + malicious domains) added!");
  }
);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchQuote") {
    fetch("https://zenquotes.io/api/random")
      .then((response) => response.json())
      .then((data) => {
        sendResponse({ quote: data[0]?.q, author: data[0]?.a });
      })
      .catch((error) => {
        console.error("Failed to fetch quote:", error);
        sendResponse({ quote: "Stay positive!", author: "Unknown" });
      });

    return true; // Required to keep the message channel open for async response
  }

  if (request.action === "adContent") {
    chrome.storage.local.get("adContent", (data) => {
      console.log("fetched adCoontent", data.adContent)
      sendResponse(data.adContent || "motivation");
    });

    return true;
  }
  if (request.action === "fetchActivities") {
    chrome.storage.local.get("activities", (data) => {
      console.log("fetched activities", data.activities)
      sendResponse(data.activities || [] );
    });

    return true;
  }
});


async function getAdStats() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["adCount", "siteCount", "resetTime"], (data) => {
      const now = Date.now();
      if (!data.resetTime || now - data.resetTime > 24 * 60 * 60 * 1000) {
        // Reset if more than 24 hours have passed
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

      console.log("new length", adsLength)
      adCount += adsLength;
      console.log("adcount", adCount)
      console.log("ad increment", adsLength)
      siteCount += 1; // Increment site count only when ads are detected

      chrome.storage.local.set({ adCount, siteCount, resetTime: resetTime || now }, () => {
        resolve({ adCount, siteCount });
      });
    });
  });
}


// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAdStats") {
    getAdStats().then(sendResponse);
    return true; // Keep the message channel open for async response
  }

  if (request.action === "updateAdStats") {
    updateAdStats(request.adsLength).then(sendResponse);
    return true; // Keep the message channel open for async response
  }
});


chrome.windows.onCreated.addListener((window) => {
  if (window.type === "popup") {
    chrome.windows.remove(window.id);
  }
});
