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
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          locations (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) console.error("Error fetching orders:", error);
      if (data) setOrders(data as unknown as Order[]);
    };

    fetchOrders();

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="container mx-auto h-full flex flex-col py-6 px-6 bg-background text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <Badge variant="secondary" className="text-sm">
          Live Feed
        </Badge>
      </div>
      
      <div className="rounded-md border border-border bg-card flex-1 overflow-auto shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 bg-muted z-10">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Store Location</TableHead>
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
                  <TableCell className="font-medium font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    {order.locations?.name || <span className="text-muted-foreground italic">Courier / Unknown</span>}
                  </TableCell>
                  <TableCell className="capitalize text-xs">
                    <Badge variant="outline">{order.fulfillment_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="capitalize bg-green-600 hover:bg-green-700 text-white">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold font-mono">
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