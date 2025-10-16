"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

export default function AdminNav({ user }: { user: any }) {
  return (
    <div className="h-14 border-b border-slate-800 bg-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faShieldAlt} className="h-4 w-4 text-blue-400" />
        <h2 className="font-semibold text-sm text-white">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt={user.username}
              className="w-7 h-7 rounded-full"
            />
          )}
          <div>
            <div className="text-xs font-medium text-white">{user.username}</div>
            <div className="text-xs text-slate-400">Super Admin</div>
          </div>
        </div>

        <Link
          href="/api/auth/logout"
          className="p-1.5 hover:bg-slate-700 rounded-md transition text-red-400"
          title="Sign out"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
