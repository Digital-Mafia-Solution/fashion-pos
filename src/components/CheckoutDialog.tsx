import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CheckCircle2, Loader2, CreditCard, Banknote } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  qty: number;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  total: number;
  locationId: string;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cart, total, locationId, onSuccess }: CheckoutDialogProps) {
  const [step, setStep] = useState<"method" | "processing" | "success">("method");

  const processSale = async () => {
    setStep("processing");

    try {
      // 1. Create the Order Record
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          total_amount: total,
          status: "paid",
          fulfillment_type: "pickup",
          pickup_location_id: locationId
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Process each item (Decrement Stock)
      const promises = cart.map(async (item) => {
        // A. Record the line item
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.id,
          quantity: item.qty,
          price_at_purchase: item.price
        });

        // B. Call our database function to decrement stock
        const { error: stockError } = await supabase.rpc("process_sale", {
          p_product_id: item.id,
          p_location_id: locationId,
          p_quantity: item.qty
        });

        if (stockError) throw stockError;
      });

      await Promise.all(promises);

      // 3. Success
      setStep("success");
      toast.success(`Sale complete: R ${total.toFixed(2)}`);
      
      // Close after 2 seconds
      setTimeout(() => {
        onSuccess(); // Clear cart in parent
        onOpenChange(false);
        setStep("method");
      }, 2000);

    } catch (error: unknown) {
      console.error("Transaction error:", error);
      
      // Safe error message extraction
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Check for common Supabase error properties safely
        if ('message' in error) {
          errorMessage = String((error as { message: unknown }).message);
        } else if ('error_description' in error) {
          errorMessage = String((error as { error_description: unknown }).error_description);
        }
      }

      toast.error("Transaction failed: " + errorMessage);
      setStep("method");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === "success" ? "Payment Successful" : `Total: R ${total.toFixed(2)}`}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {step === "method" && (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 text-lg hover:border-primary hover:bg-primary/5"
                onClick={() => processSale()}
              >
                <CreditCard className="w-10 h-10 mb-2" />
                Card Payment
              </Button>
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 text-lg hover:border-primary hover:bg-primary/5"
                onClick={() => processSale()}
              >
                <Banknote className="w-10 h-10 mb-2" />
                Cash
              </Button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Processing Transaction...</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-medium">Receipt Sent</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}