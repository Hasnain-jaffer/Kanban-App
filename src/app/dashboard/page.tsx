import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        Logged in as <strong>{session?.user?.name}</strong> ({session?.user?.email})
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Role: <strong>{session?.user?.role}</strong>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Workspace ID: <code>{session?.user?.workspaceId}</code>
      </p>
    </div>
  );
}