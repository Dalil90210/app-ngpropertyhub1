import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  getXaiKeyStatus,
  saveXaiKey,
  clearXaiKey,
  testGrok,
} from "@/lib/admin-settings.functions";

export const Route = createFileRoute("/admin-settings")({ component: AdminSettings });

type TestResult = Awaited<ReturnType<typeof testGrok>> | null;

function AdminSettings() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user || role !== "admin") {
      toast.error("Admins only");
      nav({ to: "/admin-login" });
    }
  }, [user, role, loading, nav]);

  const status = useServerFn(getXaiKeyStatus);
  const save = useServerFn(saveXaiKey);
  const clear = useServerFn(clearXaiKey);
  const test = useServerFn(testGrok);

  const statusQ = useQuery({
    queryKey: ["xai-key-status"],
    queryFn: () => status({}),
    enabled: role === "admin",
  });

  const [key, setKey] = useState("");
  const [testResult, setTestResult] = useState<TestResult>(null);

  const saveMut = useMutation({
    mutationFn: (k: string) => save({ data: { key: k } }),
    onSuccess: () => {
      toast.success("XAI_API_KEY saved");
      setKey("");
      statusQ.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clearMut = useMutation({
    mutationFn: () => clear({}),
    onSuccess: () => {
      toast.success("Override cleared — falling back to env");
      statusQ.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testMut = useMutation({
    mutationFn: () => test({}),
    onSuccess: (r) => setTestResult(r),
    onError: (e: Error) => toast.error(e.message),
  });

  if (role !== "admin") return null;

  const s = statusQ.data;

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Admin</Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Grok (xAI) API Key</h2>
              <p className="text-sm text-muted-foreground">
                A key saved here overrides the environment variable.
              </p>
            </div>
            {s && (
              <Badge variant={s.source === "none" ? "destructive" : "secondary"}>
                Source: {s.source}
              </Badge>
            )}
          </div>

          {s && s.length > 0 && (
            <div className="text-xs text-muted-foreground font-mono">
              Active key: {s.prefix}… ({s.length} chars)
              {s.updatedAt && s.source === "database" && (
                <> · updated {new Date(s.updatedAt).toLocaleString()}</>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="xai">New XAI_API_KEY</Label>
            <Input
              id="xai"
              type="password"
              autoComplete="off"
              placeholder="xai-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => saveMut.mutate(key.trim())}
              disabled={!key.trim() || saveMut.isPending}
            >
              {saveMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save key
            </Button>
            <Button
              variant="outline"
              onClick={() => clearMut.mutate()}
              disabled={s?.source !== "database" || clearMut.isPending}
            >
              Clear override
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setTestResult(null); testMut.mutate(); }}
              disabled={testMut.isPending}
            >
              {testMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test Grok connectivity
            </Button>
          </div>
        </Card>

        {testResult && (
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              {testResult.ok ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">
                {testResult.ok ? "Grok reachable" : "Grok call failed"}
              </h3>
            </div>
            <div className="text-sm text-muted-foreground">
              Model: <span className="font-mono">{testResult.model}</span> ·
              Latency: {testResult.elapsedMs}ms
              {!testResult.ok && <> · HTTP {testResult.status}</>}
            </div>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
              {testResult.ok ? testResult.content : testResult.message}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
