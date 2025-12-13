import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CheckCircle2, Loader2, CreditCard, Banknote } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { printReceipt } from "../lib/printer";
import type { Tables, TablesInsert } from "../lib/database.types";

type Product = Tables<"products">;

type InventoryItem = Tables<"inventory">;

type CartItem = Product & {
  price: number;
  qty: number;
  selectedSize?: string | null;
  inventory: InventoryItem[];
};

const findInventoryRow = (item: CartItem): InventoryItem => {
  const desiredSize = item.selectedSize?.trim();
  if (desiredSize) {
    const sizeMatch = item.inventory.find(
      (inv) => inv.size_name?.trim() === desiredSize
    );
    if (sizeMatch) return sizeMatch;
  }
  const fallback = item.inventory[0];
  if (!fallback) {
    throw new Error(`Missing inventory entry for ${item.name}`);
  }
  return fallback;
};

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  total: number;
  locationId: string;
  cashierId?: string;
  cashierName?: string;
  storeName?: string;
  onSuccess: () => void;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  cart,
  total,
  locationId,
  cashierId,
  cashierName = "Staff",
  storeName = "Store",
  onSuccess,
}: CheckoutDialogProps) {
  const [step, setStep] = useState<"method" | "processing" | "success">(
    "method"
  );

  const processSale = async () => {
    setStep("processing");

    try {
      const orderPayload: TablesInsert<"orders"> = {
        total_amount: total,
        status: "pos_complete",
        fulfillment_type: "pickup",
      };
      if (locationId) orderPayload.pickup_location_id = locationId;
      if (cashierId) orderPayload.cashier_id = cashierId;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const promises = cart.map(async (item) => {
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.id,
          quantity: item.qty,
          price_at_purchase: item.price,
        });

        const inventoryRow = findInventoryRow(item);
        if (inventoryRow.quantity === null) {
          throw new Error(
            `Invalid stock record for ${item.name}: quantity is null`
          );
        }
        const newQuantity = inventoryRow.quantity - item.qty;
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        const { error: stockError } = await supabase
          .from("inventory")
          .update({ quantity: newQuantity })
          .eq("id", inventoryRow.id);

        if (stockError) throw stockError;
      });

      await Promise.all(promises);

      setStep("success");
      toast.success(`Sale complete: R ${total.toFixed(2)}`);

      const shouldPrint =
        localStorage.getItem("pos_print_receipts") !== "false";
      if (shouldPrint) {
        printReceipt(order.id, total, cart, storeName, cashierName);
      }

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setStep("method");
      }, 2000);
    } catch (error: unknown) {
      console.error("Transaction error:", error);

      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        if ("message" in error) {
          errorMessage = String((error as { message: unknown }).message);
        } else if ("error_description" in error) {
          errorMessage = String(
            (error as { error_description: unknown }).error_description
          );
        }
      }

      toast.error("Transaction failed: " + errorMessage);
      setStep("method");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-foreground">
            {step === "success"
              ? "Payment Successful"
              : `Total: R ${total.toFixed(2)}`}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {step === "method" && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 text-lg hover:border-primary hover:bg-primary/10 hover:text-primary transition-all bg-card text-foreground"
                onClick={() => processSale()}
              >
                <CreditCard className="w-10 h-10 mb-2" />
                Card Payment
              </Button>
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3 text-lg hover:border-primary hover:bg-primary/10 hover:text-primary transition-all bg-card text-foreground"
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
              <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
              <p className="text-lg font-medium text-foreground">
                Receipt Sent
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
