"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

export function SessionDebug() {
  const { data: session, isPending, error } = useSession();

  useEffect(() => {
    console.log("Session Debug - isPending:", isPending);
    console.log("Session Debug - session:", session);
    console.log("Session Debug - error:", error);
  }, [session, isPending, error]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <div><strong>Session Debug:</strong></div>
      <div>isPending: {isPending ? 'true' : 'false'}</div>
      <div>session: {session ? 'exists' : 'null'}</div>
      <div>user: {session?.user?.email || 'none'}</div>
      <div>error: {error ? 'yes' : 'no'}</div>
    </div>
  );
}
