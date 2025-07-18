// app/page.tsx
import ComponentsDashboardSales from "./components/Dashboard/LeadsDashboard";
import Header from "./components/Layouts/Header";
import Sidebar from "./components/Layouts/Sidebar";

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-gray-50 dark:bg-black">
        <Header />
        <ComponentsDashboardSales />
      </main>
    </div>
  );
}
