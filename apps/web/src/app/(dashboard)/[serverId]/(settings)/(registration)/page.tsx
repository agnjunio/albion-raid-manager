import { faBuilding, faHandshake, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useSettingsForm } from "../hooks/use-settings-form";

export function RegistrationPage() {
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-8 p-6">
          <FormField
            control={form.control}
            name="serverGuildId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faBuilding} className="text-primary h-4 w-4" />
                  </div>
                  Albion Guild ID
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your Albion Online guild ID"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  The Albion Online guild ID for member verification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="memberRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faUser} className="text-primary h-4 w-4" />
                  </div>
                  Member Role
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Discord role ID for guild members"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  Role assigned to verified guild members
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="friendRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faHandshake} className="text-primary h-4 w-4" />
                  </div>
                  Friend Role
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Discord role ID for friends/allies"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  Role assigned to friends and allies
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
