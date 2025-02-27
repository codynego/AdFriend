import { useState, useEffect } from "react";

const App = () => {
  const [content, setContent] = useState("motivation");
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState([]);
  const [adBlockCount, setAdBlockCount] = useState(0);
  const [siteCount, setSiteCount] = useState(0);

  useEffect(() => {
    const loadPreferences = async () => {
      chrome.storage.local.get(["adContent", "activities", "adCount", "siteCount", "resetTime"], (data) => {
        const currentTime = Date.now();

        if (data.resetTime && currentTime > data.resetTime) {
          chrome.storage.local.set({ adCount: 0, siteCount: 0, resetTime: currentTime + 86400000 });
          setAdBlockCount(0);
          setSiteCount(0);
        } else {
          setAdBlockCount(data.adCount || 0);
          setSiteCount(data.siteCount || 0);
        }

        setContent(data.adContent || "motivation");
        setActivities(data.activities || []);
      });
    };

    loadPreferences();
  }, []);

  const savePreference = () => {
    chrome.storage.local.set({ adContent: content }, () => {
      alert("Preference saved!");
    });
  };

  const addActivity = () => {
    if (activity.trim() === "") return;
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);
    setActivity("");

    chrome.storage.local.set({ activities: updatedActivities });
  };

  const removeActivity = (index) => {
    const updatedActivities = activities.filter((_, i) => i !== index);
    setActivities(updatedActivities);
    
    chrome.storage.local.set({ activities: updatedActivities });
  };

  return (
    <div className="w-full h-full mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">🎯 AdFriend</h2>

      {/* Show ad block count and site count */}
      <p className="text-lg font-semibold text-green-600">
        🚀 Ads Blocked Today: <span className="text-blue-500">{adBlockCount}</span>
      </p>
      <p className="text-lg font-semibold text-purple-600">
        🌍 Sites Affected: <span className="text-red-500">{siteCount}</span>
      </p>

      {/* Select ad replacement content */}
      <div className="mt-4 w-full">
        <label className="block text-gray-600 font-medium">Replace Ads with:</label>
        <select
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="motivation">💡 Motivational Quotes</option>
          <option value="reminder">🏃 Activity Reminders</option>
        </select>
      </div>

      <button
        onClick={savePreference}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Save Preferences
      </button>

      {/* Activity Input (only if reminder is selected) */}
      {content === "reminder" && (
        <div className="mt-6 w-full">
          <h3 className="text-xl font-semibold text-gray-700">🏋️ Activity Reminders</h3>
          <div className="flex mt-2">
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Enter an activity"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <button
              onClick={addActivity}
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
            >
              Add
            </button>
          </div>

          {/* List of activities */}
          <ul className="mt-4 space-y-2 w-full">
            {activities.map((act, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-gray-100 rounded-lg"
              >
                <span className="text-gray-700">{act}</span>
                <button
                  onClick={() => removeActivity(index)}
                  className="text-red-500 hover:text-red-600 transition duration-200"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
