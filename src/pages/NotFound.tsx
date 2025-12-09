import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
      <Card className="max-w-md w-full shadow-lg border-border bg-card">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
             <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Page Not Found</h1>
            <p className="text-muted-foreground text-sm">
              We couldn't find the page you were looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          <Link to="/" className="w-full">
            <Button className="w-full gap-2" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Return to Register
            </Button>
          </Link>
          
          <div className="text-xs text-muted-foreground pt-4 border-t border-border w-full">
            Error Code: 404
          </div>
        </CardContent>
      </Card>
    </main>
  );
}