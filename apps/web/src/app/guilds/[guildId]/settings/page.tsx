import React from "react";

const GuildSettingsPage: React.FC = () => {
  return (
    <div>
      <h1>Guild Settings</h1>
      <form>
        <div>
          <label htmlFor="guildName">Guild Name:</label>
          <input type="text" id="guildName" name="guildName" />
        </div>
        <div>
          <label htmlFor="guildDescription">Guild Description:</label>
          <textarea id="guildDescription" name="guildDescription"></textarea>
        </div>
        <div>
          <label htmlFor="guildLeader">Guild Leader:</label>
          <input type="text" id="guildLeader" name="guildLeader" />
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default GuildSettingsPage;
