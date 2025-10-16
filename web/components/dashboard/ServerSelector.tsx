"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export default function ServerSelector({ 
  userId, 
  accessToken 
}: { 
  userId: string; 
  accessToken?: string;
}) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuilds() {
      try {
        const response = await fetch("/api/discord/guilds");
        const data = await response.json();
        
        // Filter guilds where user has MANAGE_SERVER permission
        const manageableGuilds = data.filter((guild: Guild) => {
          const permissions = BigInt(guild.permissions);
          return (permissions & BigInt(0x20)) === BigInt(0x20); // MANAGE_SERVER
        });

        setGuilds(manageableGuilds);
        if (manageableGuilds.length > 0) {
          setSelectedGuild(manageableGuilds[0]);
        }
      } catch (error) {
        console.error("Failed to fetch guilds:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGuilds();
  }, []);

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-1/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-white text-center">
        <p className="text-muted-foreground mb-4">
          No servers found. Add Lena to your server to get started!
        </p>
        <a
          href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="h-5 w-5" />
          Add to Server
        </a>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedGuild?.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
              alt={selectedGuild.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">
                {selectedGuild?.name[0]}
              </span>
            </div>
          )}
          <div>
            <div className="font-semibold">{selectedGuild?.name}</div>
            <div className="text-sm text-muted-foreground">
              {guilds.length} server{guilds.length !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition">
          <span className="hidden md:inline">Switch Server</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
