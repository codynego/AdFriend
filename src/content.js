// Function to fetch a random quote
async function fetchQuote() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchQuote" }, (response) => {
      resolve(response ? `${response.quote} - ${response.author}` : "Stay inspired!");
    });
  });
}

// Function to fetch ad content preference
async function fetchAdContent() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "adContent" }, (response) => {
      resolve(response || "motivation");
    });
  });
}

// Function to fetch user activities
async function fetchActivities() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchActivities" }, (response) => {
      resolve(response || []);
    });
  });
}

// Function to fetch ad statistics
async function fetchAdStats() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getAdStats" }, (response) => {
      resolve(response || { adCount: 0, siteCount: 0 });
    });
  });
}

// Function to shuffle an array
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Function to create replacement content
function createReplacementContent(content) {
  const replacementDiv = document.createElement("div");
  replacementDiv.style.cssText = "padding: 6px;display: flex; justify-center: center; align-items: center; text-align: center; border-radius: 10px;";
  replacementDiv.innerHTML = `<div style="border: 2px solid #ccc; text-align: center; margin: auto; width: 60%; float: center;  background: #f9f9f9;"><h3>Stay Inspired!</h3><p>${content}</p></div>`;
  return replacementDiv;
}
const adSelectors = [
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

// Function to remove detected ads and replace with inspirational content
async function replaceAds() {


  const activities = await fetchActivities();
  const adContent = await fetchAdContent();
  let shuffledActivities = shuffleArray([...activities]);

  let ads = document.querySelectorAll(adSelectors);

  document.addEventListener("click", (event) => {
    let target = event.target.closest("a");
    if (target && target.href.includes("redirect")) {
      event.preventDefault();
      console.warn("Blocked a forced redirect:", target.href);
    }
  });

  if (ads.length === 0) return;

  let content = [];

  if (adContent === "motivation") {
    content = await Promise.all(Array.from(ads).map(() => fetchQuote()));
  } else {
    content = Array.from(ads).map(() => shuffledActivities.pop() || "Stay inspired!");
  }

  console.log("Blocked Ads:", ads.length);

  ads.forEach((ad, index) => {
    ad.replaceWith(createReplacementContent(content[index]));
  });

  chrome.runtime.sendMessage({ action: "updateAdStats", adsLength: ads.length });
}

// Debounced MutationObserver
let observerTimeout;
const observer = new MutationObserver((mutations) => {
  if (observerTimeout) clearTimeout(observerTimeout);
  observerTimeout = setTimeout(() => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.matches(adSelectors)) {
          replaceAds();
        }
      });
    });
  }, 100); // Debounce for 100ms
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial replacement of existing ads
replaceAds();