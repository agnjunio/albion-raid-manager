import { faCrown, faMask, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useSettingsForm } from "../hooks/use-settings-form";

export function PermissionsPage() {
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-8 p-6">
          <FormField
            control={form.control}
            name="adminRoles"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faCrown} className="text-primary h-4 w-4" />
                    </div>
                    Admin Roles
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {field.value.length} role{field.value.length !== 1 ? "s" : ""} configured
                    </span>
                    {field.value.length > 0 && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                  </div>
                </div>
                <FormControl>
                  <Input
                    placeholder="Role IDs separated by commas (e.g., 123456789,987654321)"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    value={field.value.join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  Discord role IDs that have admin access to all features
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="raidRoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faShield} className="text-primary h-4 w-4" />
                  </div>
                  Raid Roles
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Role IDs separated by commas"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    value={field.value.join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  Roles that can create and manage raids
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="compositionRoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faMask} className="text-primary h-4 w-4" />
                  </div>
                  Composition Roles
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Role IDs separated by commas"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    value={field.value.join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  Roles that can manage raid compositions and builds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </Form>
  );
}
