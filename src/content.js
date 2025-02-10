async function getUserPreference() {
  return new Promise((resolve) => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(["adContent", "activities"], (result) => {
        console.log("Retrieved from chrome.storage:", result);
        resolve({
          adContent: result.adContent || "motivation",
          activities: result.activities || [],
        });
      });
    } else {
      console.log("Retrieved from localStorage:", localStorage.getItem("adContent"));
      resolve({
        adContent: localStorage.getItem("adContent") || "motivation",
        activities: JSON.parse(localStorage.getItem("activities") || "[]"),
      });
    }
  });
}

async function fetchQuote() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchQuote" }, (response) => {
      if (response) {
        resolve(`${response.quote} - ${response.author}`);
      } else {
        resolve("Stay inspired!"); // Fallback message
      }
    });
  });
}



async function replaceAds() {
  const adSelectors = [
    "iframe[src*='ads']", "iframe[src*='adserver']", "iframe[src*='doubleclick']", 
    "iframe[src*='googleads']", "iframe[src*='adform']", "iframe[src*='adtech']",
    "iframe[src*='openx']", "iframe[src*='pubmatic']", "iframe[src*='rubiconproject']",
    "img[src*='advert banner']", "img[alt*='advert banner']", "img[alt*='advert']",
    "img[alt*='sponsor']", "img[alt*='banner']", "img[alt*='ad']", "img[title*='ads']",
    "img[data-src*='ad']", "ins[class*='adsbygoogle']", "div[class*='ads']", 
    "div[class*='advert']", "div[class*='advertisement']", "div[class*='banner']", 
    "div[class*='sponsor']", "div[class*='promo']", "div[class*='popup']", "a[rel*='sponsored']"
  ];

  const { adContent, activities } = await getUserPreference();

  let ads = [];
  adSelectors.forEach((selector) => {
    ads.push(...document.querySelectorAll(selector));
  });

  if (ads.length === 0) return; // No ads found, exit early

  let quotes = [];

  if (adContent === "motivation") {
    // Fetch multiple quotes in parallel (one per ad)
    quotes = await Promise.all(ads.map(() => fetchQuote()));
  } else if (activities.length > 0) {
    quotes = ads.map(() => activities[Math.floor(Math.random() * activities.length)]);
  } else {
    quotes = ads.map(() => "Stay inspired!");
  }

  ads.forEach((ad, index) => {
    ad.innerHTML = `
      <div style="padding: 10px; border: 2px solid #ccc; text-align: center; border-radius: 10px; background: #f9f9f9;">
        <h3>Stay Inspired!</h3>
        <p>${quotes[index]}</p>
      </div>
    `;
    ad.style.pointerEvents = "none";
  });
}

// Initial run
replaceAds();
