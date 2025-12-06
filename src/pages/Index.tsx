import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Trash2, CreditCard, Store } from "lucide-react";
import { CheckoutDialog } from "../components/CheckoutDialog";
import { Toaster } from "../components/ui/sonner";
import { Badge } from "../components/ui/badge";

interface Inventory {
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  sku: string;
  inventory: Inventory[];
}

interface CartItem extends Product {
  qty: number;
}

interface Location {
  id: string;
  name: string;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name")
      .eq("type", "store")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLocations(data);
          setSelectedLocation(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;

    async function fetchInventory() {
      const { data } = await supabase
        .from("products")
        .select(`*, inventory!inner(quantity, location_id)`)
        .eq("inventory.location_id", selectedLocation);

      if (data) setProducts(data);
    }

    fetchInventory();
  }, [selectedLocation]);

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    const stock = product.inventory[0]?.quantity || 0;
    const inCart = cart.find((item) => item.id === product.id)?.qty || 0;

    if (inCart >= stock) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const stock = item.inventory[0]?.quantity || 0;
        if (item.qty + delta > stock) return item;
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxAmount = total - (total / 1.15);
  const subTotal = total - taxAmount;

  return (
    <div className="flex h-full w-full bg-muted/20 text-foreground font-sans overflow-hidden transition-colors">
      <Toaster />
      
      {/* LEFT COLUMN: Store Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header Bar */}
        <div className="bg-background border-b border-border px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Store className="text-primary" />
            Digital Mafia POS
          </h1>
          
          <div className="flex items-center gap-4 w-1/2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-muted/50 border-input focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-60 border-input bg-muted/50">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full w-full pr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {filteredProducts.map((product) => {
                const stock = product.inventory[0]?.quantity || 0;
                return (
                    <Card 
                    key={product.id} 
                    className={`cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all active:scale-95 border-border shadow-sm overflow-hidden group bg-card text-card-foreground ${stock === 0 ? 'opacity-60 grayscale pointer-events-none' : ''}`}
                    onClick={() => addToCart(product)}
                    >
                    <div className="aspect-4/3 bg-muted relative overflow-hidden">
                        {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                        )}
                        <div className="absolute top-2 right-2">
                            <Badge variant={stock > 0 ? "secondary" : "destructive"} className="shadow-md">
                                {stock} left
                            </Badge>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-3 pt-8">
                        <span className="text-white font-bold">R {product.price}</span>
                        </div>
                    </div>
                    <CardContent className="p-3">
                        <div className="font-medium text-sm truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{product.sku}</div>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
            </ScrollArea>
        </div>
      </div>

      {/* RIGHT COLUMN: Cart */}
      <div className="w-[400px] bg-card border-l border-border flex flex-col shadow-2xl z-20 h-full">
        <div className="p-5 border-b border-border bg-muted/20 shrink-0">
          <h2 className="font-bold text-lg flex justify-between items-center">
            Current Order
            <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded border border-border">
              {cart.length} items
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-hidden p-4">
             <ScrollArea className="h-full w-full pr-4">
                <div className="space-y-3 pb-4">
                    {cart.map((item) => (
                    <div key={item.id} className="bg-background border border-border rounded-lg p-3 shadow-sm flex justify-between gap-3 group">
                        <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">R {item.price} each</div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                        <div className="font-bold">R {(item.price * item.qty).toFixed(2)}</div>
                        <div className="flex items-center gap-2 bg-muted rounded-md p-0.5">
                            <button className="w-6 h-6 flex items-center justify-center hover:bg-background rounded text-xs" onClick={() => updateQty(item.id, -1)}>-</button>
                            <span className="text-xs w-4 text-center font-medium">{item.qty}</span>
                            <button className="w-6 h-6 flex items-center justify-center hover:bg-background rounded text-xs" onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>
                        </div>
                        
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                    
                    {cart.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 min-h-[300px]">
                        <Store className="w-12 h-12 opacity-20" />
                        <p>Start scanning or clicking items</p>
                      </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <div className="p-5 border-t border-border bg-muted/20 space-y-4 shrink-0">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal (Excl. Tax)</span>
              <span>R {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>VAT (15%)</span>
              <span>R {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-extrabold mt-3 pt-3 border-t border-border">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20"
            disabled={cart.length === 0 || !selectedLocation}
            onClick={() => setCheckoutOpen(true)}
          >
            <CreditCard className="w-5 h-5" />
            Charge R {total.toFixed(2)}
          </Button>
        </div>
      </div>

      <CheckoutDialog 
        open={checkoutOpen} 
        onOpenChange={setCheckoutOpen}
        cart={cart}
        total={total} 
        locationId={selectedLocation}
        onSuccess={() => setCart([])}
      />
    </div>
  );
}