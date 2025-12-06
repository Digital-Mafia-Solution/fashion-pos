import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";

// 1. Define the shape of an Order
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  fulfillment_type: string;
  locations: {
    name: string;
  } | null;
}

export default function Orders() {
  // 2. Use the Order[] type instead of any[]
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          locations (name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        // 3. Cast the data to our Order type
        setOrders(data as unknown as Order[]);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>{order.locations?.name || "Unknown"}</TableCell>
                  <TableCell className="capitalize">{order.fulfillment_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    R {order.total_amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}