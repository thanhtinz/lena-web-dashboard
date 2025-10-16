export async function getUserGuilds(accessToken: string) {
  try {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch guilds from Discord API');
    }

    const guilds = await response.json();
    return guilds;
  } catch (error) {
    console.error('Error fetching Discord guilds:', error);
    throw error;
  }
}
