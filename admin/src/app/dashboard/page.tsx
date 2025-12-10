export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center p-10">
        <h3 className="text-2xl font-bold tracking-tight">
          Welcome to Admin Panel
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a module from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
