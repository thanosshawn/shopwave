
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  // In a real app, you'd fetch these stats from your backend/services
  const stats = [
    { title: "Total Revenue", value: "$12,345", icon: DollarSign, color: "text-green-500" },
    { title: "Total Products", value: "150", icon: Package, color: "text-blue-500" },
    { title: "Total Users", value: "1,200", icon: Users, color: "text-purple-500" },
    { title: "Pending Orders", value: "12", icon: Activity, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
        <Button asChild>
            <Link href="/admin/products/add">Add New Product</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for recent activity feed */}
          <p className="text-muted-foreground">No recent activity to display.</p>
          <p className="mt-2 text-sm">Future enhancements could include a log of new orders, user sign-ups, or product updates.</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild className="w-full">
                <Link href="/admin/products">Manage Products</Link>
            </Button>
            {/* <Button variant="outline" asChild className="w-full">
                <Link href="/admin/orders">View Orders</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
                <Link href="/admin/users">Manage Users</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
                <Link href="/admin/settings">Site Settings</Link>
            </Button> */}
        </CardContent>
      </Card>

    </div>
  );
}
