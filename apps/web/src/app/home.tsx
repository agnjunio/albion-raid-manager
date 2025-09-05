import { getUserPictureUrl } from "@albion-raid-manager/discord/helpers";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeButton } from "@/components/ui/theme";
import { useAuth } from "@/lib/auth";

export function Home() {
  const { user, status, signIn } = useAuth();

  return (
    <div className="flex size-full justify-center">
      <div className="dark:bg-secondary/50 bg-secondary/40 relative z-10 basis-1/2 overflow-hidden bg-[url(/wallpapper.jpg)] bg-cover bg-[center_center] bg-no-repeat bg-blend-multiply lg:basis-1/3">
        <div className="bg-radial -translate-1/2 from-primary/15 to-bg-primary/0 absolute -left-20 top-0 size-[150vh] animate-pulse rounded-full to-85% blur-2xl [animation-duration:1780ms] [animation-timing-function:ease-in-out]" />
        <div className="bg-radial -translate-1/2 from-primary/15 to-bg-primary/0 absolute left-40 top-0 size-[80vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:2500ms]" />
        <div className="bg-radial from-primary/15 to-bg-primary/0 absolute right-0 top-0 size-[40vh] -translate-y-2/3 animate-pulse rounded-full to-100% blur-2xl [animation-duration:1500ms]" />
        <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 absolute left-[15%] top-0 size-[50vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1250ms]" />
        <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 absolute left-[35%] top-0 size-[60vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1100ms]" />
        <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 absolute left-[65%] top-0 size-[55vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1370ms]" />

        <div className="bg-radial translate-1/2 from-secondary/50 to-secondary/15 absolute bottom-0 right-0 size-[80vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:5000ms]" />

        <div className="flex size-full flex-col items-center justify-center gap-6">
          <h1 className="text-secondary-foreground font-title text-center text-6xl font-bold drop-shadow-2xl">
            Albion Raid Manager
          </h1>
          <p className="text-secondary-foreground mx-auto max-w-2xl text-center text-xl font-medium leading-relaxed">
            Command every raid with precision. Plan, strategize, and lead your guild to victory with our comprehensive
            raid management system.
          </p>
        </div>
      </div>

      <div className="relative flex basis-1/2 flex-col items-center justify-center gap-8 lg:basis-1/3">
        <ThemeButton className="absolute right-4 top-4" />
        {status === "loading" ? (
          <div className="space-y-4">
            <Skeleton className="mx-auto size-16 rounded-full" />
            <Skeleton className="mx-auto h-6 w-72" />
            <Skeleton className="mx-auto h-12 w-32" />
          </div>
        ) : status === "authenticated" && user ? (
          <div className="space-y-6 text-center">
            {user.avatar && (
              <picture className="shadow-foreground/50 dark:shadow-background mx-auto block rounded-full shadow-xl">
                <img
                  src={getUserPictureUrl(user.id, user.avatar)}
                  className="size-16 select-none rounded-full"
                  alt={user.username || "Unknown user"}
                />
              </picture>
            )}
            <div className="space-y-2">
              <div className="text-muted-foreground text-lg">Welcome back,</div>
              <div className="text-foreground text-2xl font-bold">@{user.username}</div>
            </div>

            <Link to="/dashboard" tabIndex={-1}>
              <Button variant="primary" size="lg" className="px-8 py-3 text-lg">
                Enter Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-foreground text-2xl font-bold">Get Started</h2>
              <p className="text-muted-foreground text-lg">
                Sign in with Discord to access your raid management dashboard
              </p>
            </div>

            <Button onClick={() => signIn()} size="lg" className="px-8 py-3 text-lg">
              <FontAwesomeIcon icon={faDiscord} className="mr-2" />
              Sign in with Discord
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
