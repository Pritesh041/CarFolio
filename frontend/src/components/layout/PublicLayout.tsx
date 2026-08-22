import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <TopNav />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
