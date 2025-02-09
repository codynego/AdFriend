// Function to get the user's ad replacement preference
async function getUserPreference() {
  return new Promise((resolve) => {
    if (chrome?.storage?.local) {
      console.log("from chrome")
      chrome.storage.local.get(["adContent", "activities"], (result) => {
        resolve({
          adContent: result.adContent || "motivation",
          activities: result.activities || [],
        });
      });
    } else {
      console.log("from local")
      // Fallback for non-extension testing
      resolve({
        adContent: localStorage.getItem("adContent") || "motivation",
        activities: JSON.parse(localStorage.getItem("activities") || "[]"),
      });
    }
  });
}

// Function to update the ad block counter in Chrome storage
// async function updateAdBlockCount() {
//   return new Promise((resolve) => {
//     if (chrome?.storage?.local) {
//       chrome.storage.local.get(["adBlockCount"], (result) => {
//         let count = result.adBlockCount || 0;
//         count += 1; // Increment the count
//         chrome.storage.local.set({ adBlockCount: count }, () => resolve(count));
//       });
//     } else {
//       // Fallback for non-extension testing
//       let count = parseInt(localStorage.getItem("adBlockCount")) || 0;
//       count += 1;
//       localStorage.setItem("adBlockCount", count);
//       resolve(count);
//     }
//   });
// }

// Function to replace ads
async function replaceAds() {
  const adSelectors = [
    "iframe[src*='ads']", "iframe[src*='adserver']", "iframe[src*='doubleclick']", 
    "iframe[src*='googleads']", "iframe[src*='adform']", "iframe[src*='adtech']",
    "iframe[src*='openx']", "iframe[src*='pubmatic']", "iframe[src*='rubiconproject']",
    "img[src*='advert banner']", "img[alt*='advert banner']", "img[alt*='advert']",
    "img[alt*='sponsor']", "img[alt*='banner']", "img[alt*='ad']", "img[title*='ads']",
    "img[data-src*='ad']", "ins[class*='adsbygoogle']", "div[class*='ads']", 
    "div[class*='advert']", "div[class*='advertisement']", "div[class*='banner']", 
    "div[class*='sponsor']", "div[class*='promo']", "div[class*='popup']",
  ];

  const { adContent, activities } = await getUserPreference();
  const zenQuote = adContent === "motivation" 
    ? "Stay motivated! The only limit to our realization of tomorrow is our doubts of today." 
    : null;

  adSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach(async (ad) => {
      ad.innerHTML = `
        <div style="padding: 10px; border: 2px solid #ccc; text-align: center; border-radius: 10px; background: #f9f9f9;">
          <h3>Stay Inspired!</h3>
          <p>${adContent === "motivation" ? zenQuote : activities[0] || "No activities set."}</p>
        </div>
      `;
      ad.style.pointerEvents = "none";
      // await updateAdBlockCount();
    });
  });
}

// Debounce the MutationObserver to avoid excessive calls
let timeout;
const observer = new MutationObserver(() => {
  clearTimeout(timeout);
  timeout = setTimeout(replaceAds, 100);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

// Initial run
replaceAds();
