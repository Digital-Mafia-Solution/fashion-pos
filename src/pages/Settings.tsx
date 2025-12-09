import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Printer,
  ScanBarcode,
  Wifi,
  Save,
  RotateCcw,
  Monitor,
  UserPlus,
  Shield,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "../components/AuthProvider";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  assigned_location_id: string | null;
}

export default function Settings() {
  const { profile } = useAuth();

  // Local Settings
  const [taxRate, setTaxRate] = useState(
    () => localStorage.getItem("pos_tax_rate") || "15"
  );
  const [terminalName, setTerminalName] = useState(
    () => localStorage.getItem("pos_terminal_name") || "Register-01"
  );
  const [printReceipts, setPrintReceipts] = useState(
    () => localStorage.getItem("pos_print_receipts") !== "false"
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Data State
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Create Cashier State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCashier, setNewCashier] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Fetch staff assigned to the same location
  const fetchStaff = useCallback(async (locationId: string) => {
    setLoadingStaff(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("assigned_location_id", locationId);

    if (data) setStaff(data as unknown as UserProfile[]);
    setLoadingStaff(false);
  }, []);

  // Use primitive dependency to prevent infinite loops
  const locationId = profile?.assigned_location_id;

  useEffect(() => {
    if (locationId) {
      fetchStaff(locationId);
    }
  }, [locationId, fetchStaff]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem("pos_tax_rate", taxRate);
      localStorage.setItem("pos_terminal_name", terminalName);
      localStorage.setItem("pos_print_receipts", String(printReceipts));
      window.dispatchEvent(new Event("storage"));
      toast.success("Terminal configuration saved");
      setIsSaving(false);
    }, 600);
  };

  const handleCreateCashier = async () => {
    if (!newCashier.email || !newCashier.password || !newCashier.fullName) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      // Use the 'create-user' Edge Function
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: newCashier.email,
          password: newCashier.password,
          fullName: newCashier.fullName,
          role: "cashier", // Automatically set role
          location_id: profile?.assigned_location_id, // Automatically assign to manager's store
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Cashier account created successfully");
      setIsCreateOpen(false);
      setNewCashier({ fullName: "", email: "", password: "" });

      // Refresh the list
      if (locationId) fetchStaff(locationId);
    } catch (error: unknown) {
      console.error(error);
      let msg = "Failed to create account";
      if (error instanceof Error) msg = error.message;
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage terminal configuration and team.
          </p>
        </div>
        {/* Only Managers/Admins can save config changes */}
        {(profile?.role === "manager" || profile?.role === "admin") && (
          <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden md:inline">
              {isSaving ? "Saving..." : "Save Changes"}
            </span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px] mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Terminal Configuration</CardTitle>
              <CardDescription>Identify this specific machine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Terminal Name</Label>
                <Input
                  value={terminalName}
                  onChange={(e) => setTerminalName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>VAT Rate (%)</Label>
                <Input
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
                  <p className="text-sm text-muted-foreground">
                    Play beep on scan/add to cart.
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEAM MANAGEMENT */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Manage users assigned to{" "}
                <strong>
                  {profile?.assigned_location_id
                    ? "this store"
                    : "your location"}
                </strong>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center border-b pb-6">
                <div className="space-y-1">
                  <h3 className="font-medium">Store Team</h3>
                  <p className="text-sm text-muted-foreground">
                    Cashiers can process sales but cannot access global
                    settings.
                  </p>
                </div>

                {/* RESTRICTION: Only Managers can see the button */}
                {profile?.role === "manager" && (
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    disabled={!profile?.assigned_location_id}
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Register New Cashier
                  </Button>
                )}
              </div>

              {/* Staff List */}
              <div className="space-y-4">
                {loadingStaff ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                  </div>
                ) : staff.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground italic border rounded-lg border-dashed">
                    No other staff assigned to this location.
                  </div>
                ) : (
                  staff.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {user.full_name || "Unknown User"}
                            {user.id === profile?.id && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5"
                              >
                                You
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user.role === "manager" ? "default" : "outline"
                          }
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                        <Shield className="w-4 h-4 text-muted-foreground opacity-50" />
                      </div>
                    </div>
                  ))
                )}
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
              <CardDescription>
                Configure thermal printer connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Print Receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Print automatically after successful payment.
                  </p>
                </div>
                <Switch
                  checked={printReceipts}
                  onCheckedChange={setPrintReceipts}
                />
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
                <span className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-500" /> Connectivity
                </span>
                <span className="text-sm font-mono text-green-600">
                  Online (24ms)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-500" /> Display
                  Resolution
                </span>
                <span className="text-sm font-mono">
                  {window.innerWidth}x{window.innerHeight}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-500" /> Sync Status
                </span>
                <span className="text-sm font-mono">Up to date</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full">
                Reboot Terminal Shell
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE CASHIER DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Cashier</DialogTitle>
            <DialogDescription>
              Create an account for a staff member. They will be assigned to
              this store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={newCashier.fullName}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, fullName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={newCashier.email}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, email: e.target.value })
                }
                placeholder="john@store.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newCashier.password}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, password: e.target.value })
                }
                placeholder="Set a secure password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCashier} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
