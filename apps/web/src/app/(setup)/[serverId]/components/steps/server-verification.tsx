import { CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";

export function ServerVerification() {
  return (
    <CardContent>
      <Loading label="Please wait while we verify your server..." />
    </CardContent>
  );
}
