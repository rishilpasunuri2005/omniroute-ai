import { AppSidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(222,47%,4%)]">
      <AppSidebar />
      <main className="min-h-screen px-4 pb-8 pt-20 transition-all lg:ml-[264px] lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
