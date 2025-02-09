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