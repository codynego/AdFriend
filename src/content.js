// Function to fetch a random quote
async function fetchQuote() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchQuote" }, (response) => {
      if (response) {
        resolve(`${response.quote} - ${response.author}`);
      } else {
        resolve("Stay inspired!");
      }
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

// Function to replace ads with inspirational content
async function replaceAds() {
  const adSelectors = [
    "iframe[src*='ads']", "iframe[src*='adserver']", "iframe[src*='doubleclick']", 
    "iframe[src*='googleads']", "iframe[src*='adform']", "iframe[src*='adtech']", "iframe[name*='googlefcPresent']",
    "iframe[src*='openx']", "iframe[src*='pubmatic']", "iframe[src*='rubiconproject']",
    "img[src*='advert banner']", "img[alt*='advert banner']", "img[alt*='advert']",
    "img[alt*='sponsor']", "img[alt*='banner']", "img[alt*='ad']", "img[title*='ads']",
    "img[data-src*='ad']", "ins[class*='adsbygoogle']", "div[class*='ads']", 
    "div[class*='advert']", "div[class*='advertisement']", "div[class*='banner']", 
    "div[class*='sponsor']", "div[class*='promo']", "div[class*='popup']", "a[rel*='sponsored']"
  ]

  const activities = await fetchActivities();
  const adContent = await fetchAdContent();
  const adStats = await fetchAdStats();
  let shuffledActivities = shuffleArray([...activities]);

  let ads = [];
  adSelectors.forEach((selector) => {
    ads.push(...document.querySelectorAll(selector));
  });


  if (ads.length === 0) return;

  let quotes = [];

  if (adContent === "motivation") {
    // Fetch multiple quotes in parallel (one per ad)
    quotes = await Promise.all(ads.map(() => fetchQuote()));
  } else if (adContent === "reminder") {
    quotes = ads.map(() => activities[Math.floor(Math.random() * activities.length)] || "Stay inspired!");
  } else {
    quotes = ads.map(() => "Stay inspired!");
  }
  console.log("length2", ads.length)
  const adLength = ads.length


  ads.forEach((ad, index) => {
    ad.innerHTML = `
      <div style="padding: 10px; border: 2px solid #ccc; text-align: center; border-radius: 10px; background: #f9f9f9;">
        <h3>Stay Inspired!</h3>
        <p>${quotes[index]}</p>
      </div>
    `;
    ad.style.pointerEvents = "none";
  });

  chrome.runtime.sendMessage({ action: "updateAdStats", adsLength: adLength });

}

replaceAds();
