import React from "react";
import ReactDOM from "react-dom";

const Widget = () => {
  return (
    <div style={{ background: "#f3f3f3", padding: "10px", borderRadius: "5px", textAlign: "center" }}>
      <p>🚀 Stay Motivated! 🚀</p>
      <p>"Believe in yourself!"</p>
    </div>
  );
};

// Find all ad replacement containers
document.querySelectorAll("#adfriend-widget").forEach(widget => {
  ReactDOM.render(<Widget />, widget);
});


// Fetch a random quote from the background script
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

// Fetch activities from the background script
async function fetchActivities() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchActivities" }, (response) => {
      resolve(response || []);
    });
  });
}

// Fetch ad content preference from the background script
async function fetchAdContent() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchAdContent" }, (response) => {
      resolve(response);
    });
  });
}

// Update ad block counter in background script
async function updateAdBlockCount() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "updateAdBlockCount" }, (response) => {
      resolve(response);
    });
  });
}

// Function to replace ads dynamically
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

  let ads = [];
  adSelectors.forEach((selector) => {
    ads.push(...document.querySelectorAll(selector));
  });

  if (ads.length === 0) return;

  const adContent = await fetchAdContent();
  let quotes = [];
  let activities = await fetchActivities();

  if (adContent === "motivation") {
    quotes = await Promise.all(ads.map(() => fetchQuote())); // Fetch multiple quotes in parallel
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

  await updateAdBlockCount(); // Update ad block count after replacing ads
}

// Initial run
replaceAds();
