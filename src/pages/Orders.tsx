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
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { format } from "date-fns";
import { Package, Calendar, MapPin, Store } from "lucide-react";

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
  const storeId = localStorage.getItem("pos_location_id");

  useEffect(() => {
    if (!storeId) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          locations (
            name
          )
        `)
        .eq("pickup_location_id", storeId)
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
        { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'orders',
            filter: `pickup_location_id=eq.${storeId}` 
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  // Helper to format status for display
  const getStatusBadge = (status: string) => {
    if (status === 'pos_complete') {
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">POS Sale</Badge>;
    }
    if (status === 'delivered') {
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Delivered</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{status}</Badge>;
  };

  if (!storeId) {
      return <div className="p-6 text-center text-muted-foreground">Please configure store location in Settings.</div>
  }

  return (
    <div className="container mx-auto h-full flex flex-col py-4 px-4 md:py-6 md:px-6 bg-background text-foreground">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Transaction History</h1>
        <Badge variant="secondary" className="text-xs md:text-sm">
          Live Feed
        </Badge>
      </div>
      
      {/* DESKTOP VIEW: Table */}
      <div className="hidden md:block rounded-md border border-border bg-card flex-1 overflow-auto shadow-sm">
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
                  No physical transactions found for this location.
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
                    {order.locations?.name || <span className="text-muted-foreground italic">Unknown</span>}
                  </TableCell>
                  <TableCell className="capitalize text-xs">
                    <Badge variant="outline">
                        {order.status === 'pos_complete' ? 'In-Store' : order.fulfillment_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
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

      {/* MOBILE VIEW: Card List */}
      <div className="md:hidden flex-1 overflow-hidden -mx-4 px-4">
        <ScrollArea className="h-full">
            <div className="space-y-3 pb-20">
                {orders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No transactions found.
                    </div>
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="shadow-sm border-border bg-card">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-mono text-muted-foreground">
                                    #{order.id.slice(0, 8)}
                                </CardTitle>
                                {getStatusBadge(order.status)}
                            </CardHeader>
                            <CardContent className="p-4 pt-2 grid gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-3.5 w-3.5" />
                                        {format(new Date(order.created_at), "MMM dd, HH:mm")}
                                    </div>
                                    <div className="font-bold text-lg">
                                        R {order.total_amount.toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                    <div className="flex items-center">
                                        <Package className="mr-1 h-3 w-3" />
                                        <span className="capitalize">
                                            {order.status === 'pos_complete' ? 'Instant' : order.fulfillment_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        {order.status === 'pos_complete' ? <Store className="mr-1 h-3 w-3" /> : <MapPin className="mr-1 h-3 w-3" />}
                                        <span className="truncate max-w-[100px]">
                                            {order.locations?.name || "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}