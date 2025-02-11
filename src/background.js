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
  // Allow Google domains (safeguard)
  {
    id: 5,
    priority: 1,
    action: { type: "allow" },
    condition: {
      urlFilter: "||google.com^",
      resourceTypes: ["main_frame", "sub_frame", "script", "image"],
    },
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
