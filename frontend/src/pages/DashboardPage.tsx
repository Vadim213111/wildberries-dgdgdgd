import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import Layout from "@/components/Layout";

interface Store {
  id: string;
  name: string;
  wbSellerID: string;
  isActive: boolean;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  avgRating: number;
  activeProducts: number;
}

export default function DashboardPage() {
  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data } = await apiClient.get<Store[]>("/stores");
      return data;
    },
  });

  const stats: DashboardStats = {
    totalSales: 245000,
    totalOrders: 1234,
    avgRating: 4.8,
    activeProducts: 567,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm font-medium text-muted-foreground">Total Sales</div>
            <div className="text-3xl font-bold text-foreground mt-2">₽{stats.totalSales.toLocaleString()}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
            <div className="text-3xl font-bold text-foreground mt-2">{stats.totalOrders}</div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
            <div className="text-3xl font-bold text-foreground mt-2">{stats.avgRating} ⭐</div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-sm font-medium text-muted-foreground">Active Products</div>
            <div className="text-3xl font-bold text-foreground mt-2">{stats.activeProducts}</div>
          </div>
        </div>

        {/* Stores Section */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Stores</h2>
          {stores && stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <div key={store.id} className="p-4 border border-border rounded-lg hover:bg-muted transition">
                  <h3 className="font-semibold text-foreground">{store.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {store.wbSellerID}</p>
                  <div className="mt-2 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${store.isActive ? "bg-green-500" : "bg-gray-500"}`}></span>
                    <span className="ml-2 text-xs text-muted-foreground">{store.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No stores connected yet. Add your first WB store to get started.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
