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

// Function to fetch a random quote from an API
async function fetchQuote() {
  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();
    return { quote: data.content, author: data.author };
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    return { quote: "Stay inspired!", author: "" };
  }
}

// Function to fetch activities from Chrome storage
async function getActivities() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["activities"], (result) => {
      resolve(result.activities || []);
    });
  });
}

// Function to update the ad block counter
async function updateAdBlockCount() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["adBlockCount"], (result) => {
      let count = (result.adBlockCount || 0) + 1;
      chrome.storage.local.set({ adBlockCount: count }, () => resolve(count));
    });
  });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchQuote") {
    fetchQuote().then(sendResponse);
    return true; 
  }

  if (message.action === "fetchActivities") {
    getActivities().then(sendResponse);
    return true;
  }

  if (message.action === "updateAdBlockCount") {
    updateAdBlockCount().then(sendResponse);
    return true;
  }
});
