import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/AuthProvider";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Search, Trash2, CreditCard, Store, AlertCircle, ShoppingCart, Menu } from "lucide-react";
import { CheckoutDialog } from "../components/CheckoutDialog";
import { useScanDetection } from "../hooks/use-scan-detection";
import { toast } from "sonner";
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

export default function POS() {
  const { profile } = useAuth(); // Get profile
  const [products, setProducts] = useState<Product[]>([]);
  const storeId = profile?.assigned_location_id;
  const [storeName, setStoreName] = useState<string>("Loading...");
  
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Mobile view state: 'products' or 'cart'
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');

  // 1. Check for Configured Store and Listen for Changes
  useEffect(() => {
    if (storeId) {
        supabase.from("locations").select("name").eq("id", storeId).single()
            .then(({ data }) => {
                if (data) setStoreName(data.name);
            });
    }
  }, [storeId]);

  // 2. Fetch Inventory specific to this Store
  useEffect(() => {
    if (!storeId) return;

    async function fetchInventory() {
      const { data } = await supabase
        .from("products")
        .select(`*, inventory!inner(quantity, location_id)`)
        .eq("inventory.location_id", storeId);

      if (data) setProducts(data);
    }

    fetchInventory();
  }, [storeId]);

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

  useScanDetection((skuCode) => {
    // Find product by SKU
    const product = products.find(p => p.sku === skuCode);
    
    if (product) {
      addToCart(product);
      toast.success(`Scanned: ${product.name}`);
    } else {
      toast.error(`Product not found: ${skuCode}`);
    }
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxAmount = total - (total / 1.15); 
  const subTotal = total - taxAmount;

  if (!storeId) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
            <div className="text-center space-y-4 px-6">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold">No Store Assigned</h1>
                <p className="text-muted-foreground max-w-md">
                    Your account ({profile?.email}) is not linked to a specific store location.
                    Please ask an administrator to assign you to a location.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-muted/20 text-foreground font-sans overflow-hidden transition-colors relative flex-col md:flex-row">
      <Toaster />
      
      {/* LEFT COLUMN: Store Interface */}
      {/* Hidden on mobile if view is 'cart' */}
      <div className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ${mobileView === 'cart' ? 'hidden md:flex' : 'flex'}`}>
        {/* Header Bar */}
        <div className="bg-background border-b border-border px-4 md:px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0 gap-2">
          <h1 className="text-lg md:text-xl font-bold flex items-center gap-2 truncate">
            <Store className="text-primary h-5 w-5 md:h-6 md:w-6" />
            <span className="truncate">{storeName}</span>
          </h1>
          
          <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none justify-end w-full md:w-1/2">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-muted/50 border-input focus-visible:ring-primary w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-hidden p-2 md:p-4 pb-16 md:pb-4">
            <ScrollArea className="h-full w-full md:pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 pb-4">
                {filteredProducts.map((product) => {
                const stock = product.inventory[0]?.quantity || 0;
                return (
                    <Card 
                    key={product.id} 
                    className={`cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all active:scale-95 border-border shadow-sm overflow-hidden group bg-card text-card-foreground ${stock === 0 ? 'opacity-60 grayscale pointer-events-none' : ''}`}
                    onClick={() => {
                      addToCart(product);
                      // Optional: Provide visual feedback or auto-switch on mobile?
                      // keeping it manual for faster multi-add
                    }}
                    >
                    <div className="aspect-4/3 bg-muted relative overflow-hidden">
                        {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-sm">No Image</div>
                        )}
                        <div className="absolute top-2 right-2">
                            <Badge variant={stock > 0 ? "secondary" : "destructive"} className="shadow-md text-[10px] md:text-xs">
                                {stock} left
                            </Badge>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-2 md:p-3 pt-8">
                        <span className="text-white font-bold text-sm md:text-base">R {product.price}</span>
                        </div>
                    </div>
                    <CardContent className="p-2 md:p-3">
                        <div className="font-medium text-xs md:text-sm truncate">{product.name}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground mt-1">{product.sku}</div>
                    </CardContent>
                    </Card>
                );
                })}
            </div>
            </ScrollArea>
        </div>
      </div>

      {/* RIGHT COLUMN: Cart */}
      {/* Hidden on mobile if view is 'products' */}
      <div className={`w-full md:w-[400px] bg-card border-l border-border flex flex-col shadow-2xl z-20 h-full transition-all duration-300 ${mobileView === 'products' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-5 border-b border-border bg-muted/20 shrink-0">
          <h2 className="font-bold text-lg flex justify-between items-center">
            Current Order
            <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded border border-border">
              {cart.length} items
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-hidden p-2 md:p-4 pb-20 md:pb-4">
             <ScrollArea className="h-full w-full pr-0 md:pr-4">
                <div className="space-y-2 md:space-y-3 pb-4">
                    {cart.map((item) => (
                    <div key={item.id} className="bg-background border border-border rounded-lg p-3 shadow-sm flex justify-between gap-3 group">
                        <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm md:text-base">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">R {item.price} each</div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-sm md:text-base">R {(item.price * item.qty).toFixed(2)}</div>
                        <div className="flex items-center gap-2 bg-muted rounded-md p-0.5">
                            <button className="w-6 h-6 flex items-center justify-center hover:bg-background rounded text-xs" onClick={() => updateQty(item.id, -1)}>-</button>
                            <span className="text-xs w-4 text-center font-medium">{item.qty}</span>
                            <button className="w-6 h-6 flex items-center justify-center hover:bg-background rounded text-xs" onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>
                        </div>
                        
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive md:opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                    
                    {cart.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 min-h-[200px] md:min-h-[300px]">
                        <Store className="w-12 h-12 opacity-20" />
                        <p>Start adding items</p>
                      </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <div className="p-4 md:p-5 border-t border-border bg-muted/20 space-y-4 shrink-0 mb-14 md:mb-0">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal (Excl. Tax)</span>
              <span>R {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>VAT (15%)</span>
              <span>R {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl md:text-2xl font-extrabold mt-3 pt-3 border-t border-border">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full h-12 md:h-14 text-base md:text-lg gap-2 shadow-lg shadow-primary/20"
            disabled={cart.length === 0 || !storeId}
            onClick={() => setCheckoutOpen(true)}
          >
            <CreditCard className="w-5 h-5" />
            Charge R {total.toFixed(2)}
          </Button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 grid grid-cols-2 gap-2 z-50 pb-safe">
        <Button 
          variant={mobileView === 'products' ? 'default' : 'ghost'} 
          onClick={() => setMobileView('products')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs">Products</span>
        </Button>
        <Button 
          variant={mobileView === 'cart' ? 'default' : 'ghost'} 
          onClick={() => setMobileView('cart')}
          className="flex flex-col items-center gap-1 h-auto py-2 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </Button>
      </div>

      <CheckoutDialog 
        open={checkoutOpen} 
        onOpenChange={setCheckoutOpen}
        cart={cart}
        total={total} 
        locationId={storeId} 
        cashierId={profile?.id}
        cashierName={profile?.full_name || "Staff"}
        storeName={storeName}
        onSuccess={() => setCart([])}
      />
    </div>
  );
}