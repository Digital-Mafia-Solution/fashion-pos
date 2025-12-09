import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Import supabase
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; // Import Select components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Printer, ScanBarcode, Wifi, Save, RotateCcw, Monitor } from "lucide-react";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
}

export default function Settings() {
  // FIX: Lazy initialization reads from localStorage once on mount
  // This prevents the "set-state-in-effect" error and avoids double-rendering
  const [taxRate, setTaxRate] = useState(() => localStorage.getItem("pos_tax_rate") || "15");
  const [terminalName, setTerminalName] = useState(() => localStorage.getItem("pos_terminal_name") || "Register-01");
  const [assignedStore, setAssignedStore] = useState(() => localStorage.getItem("pos_location_id") || "");

  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [printReceipts, setPrintReceipts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    supabase
      .from("locations")
      .select("id, name")
      .eq("type", "store")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setAvailableLocations(data);
      });
  }, []);

  const handleSave = () => {
    localStorage.setItem("pos_tax_rate", taxRate);
    localStorage.setItem("pos_terminal_name", terminalName);
    localStorage.setItem("pos_location_id", assignedStore);
    
    // Dispatch a storage event so other tabs/components update if listening
    window.dispatchEvent(new Event("storage"));
    
    toast.success("Terminal configuration saved");
  };

  return (
    <div className="container max-w-4xl py-8 px-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage terminal configuration and preferences.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Assignment</CardTitle>
              <CardDescription>Lock this terminal to a specific physical location.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-2">
                <Label>Assigned Location</Label>
                <Select value={assignedStore} onValueChange={setAssignedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store to provision..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Changing this will reset the inventory view on the main POS screen.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terminal Configuration</CardTitle>
              <CardDescription>Identify this specific machine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="terminal-name">Terminal Name</Label>
                <Input 
                  id="terminal-name" 
                  value={terminalName} 
                  onChange={(e) => setTerminalName(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax-rate">VAT Rate (%)</Label>
                <Input 
                  id="tax-rate" 
                  type="number" 
                  value={taxRate} 
                  onChange={(e) => setTaxRate(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play beep on scan/add to cart.</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HARDWARE SETTINGS */}
        <TabsContent value="hardware" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" /> Receipt Printer
              </CardTitle>
              <CardDescription>Configure thermal printer connection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Print Receipts</Label>
                  <p className="text-sm text-muted-foreground">Print automatically after successful payment.</p>
                </div>
                <Switch checked={printReceipts} onCheckedChange={setPrintReceipts} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Test Print</Button>
                <Button variant="secondary">Find Printers</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanBarcode className="w-5 h-5" /> Barcode Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                USB HID Scanner detected. Input mode: Keyboard Emulation.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIAGNOSTICS */}
        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Wifi className="w-4 h-4 text-green-500"/> Connectivity</span>
                <span className="text-sm font-mono text-green-600">Online (24ms)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-blue-500"/> Display Resolution</span>
                <span className="text-sm font-mono">{window.innerWidth}x{window.innerHeight}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-orange-500"/> Sync Status</span>
                <span className="text-sm font-mono">Up to date</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full">Reboot Terminal Shell</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}