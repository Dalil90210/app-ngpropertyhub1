import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Inbox as InboxIcon } from "lucide-react";

export const Route = createFileRoute("/inbox")({ component: Inbox });

function Inbox() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-navy mb-4">Inbox</h1>
      <Card className="p-10 text-center">
        <InboxIcon className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">Your messages and notifications will appear here.</p>
      </Card>
    </div>
  );
}
