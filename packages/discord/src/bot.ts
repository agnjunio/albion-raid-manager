import axios from "axios";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function sendMessageToChannel(channelId: string, message: string) {
  await axios.post(
    `https://discord.com/api/channels/${channelId}/messages`,
    {
      content: message,
    },
    {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    },
  );
}
