import { useState, useEffect } from "react";

const App = () => {
  const [content, setContent] = useState("motivation");
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState([]);
  const [adBlockCount, setAdBlockCount] = useState(0);

  useEffect(() => {
    const loadPreferences = async () => {
      if (chrome?.storage?.local) {
        chrome.storage.local.get(["adContent", "activities", "adBlockCount"], (result) => {
          if (result.adContent) setContent(result.adContent);
          if (result.activities) setActivities(result.activities);
          if (result.adBlockCount) setAdBlockCount(result.adBlockCount);
        });
      } else {
        // Fallback for non-extension testing
        setContent(localStorage.getItem("adContent") || "motivation");
        setActivities(JSON.parse(localStorage.getItem("activities")) || []);
        setAdBlockCount(parseInt(localStorage.getItem("adBlockCount")) || 0);
      }
    };
    loadPreferences();
  }, []);

  const savePreference = async () => {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ adContent: content }, () => {
        alert("Preference saved!");
      });
    } else {
      localStorage.setItem("adContent", content);
      alert("Preference saved!");
    }
  };

  const addActivity = async () => {
    if (activity.trim() === "") return;
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);
    setActivity("");
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ activities: updatedActivities });
    } else {
      localStorage.setItem("activities", JSON.stringify(updatedActivities));
    }
  };

  const removeActivity = async (index) => {
    const updatedActivities = activities.filter((_, i) => i !== index);
    setActivities(updatedActivities);
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ activities: updatedActivities });
    } else {
      localStorage.setItem("activities", JSON.stringify(updatedActivities));
    }
  };

  return (
    <div className="w-full h-full mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200 flex justify-center align-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">🎯 AdFriend</h2>

      {/* Show ad block count */}
      <p className="text-lg font-semibold text-green-600">
        🚀 Ads Blocked Today: <span className="text-blue-500">{adBlockCount}</span>
      </p>

      {/* Select ad replacement content */}
      <div className="mt-4">
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
        <div className="mt-6">
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
              ➕ Add
            </button>
          </div>

          {/* List of activities */}
          <ul className="mt-4 space-y-2">
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
