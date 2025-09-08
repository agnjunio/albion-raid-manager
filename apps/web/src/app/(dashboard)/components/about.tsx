import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Props extends VariantProps<typeof buttonVariants> {
  className?: string;
}

export function AboutButton({ variant, className }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant={variant} className={cn("transition-all duration-300 ease-in-out", className)}>
          <FontAwesomeIcon icon={faQuestion} />
        </Button>
      </SheetTrigger>

      <SheetContent>
        <div className="dark:bg-secondary/50 bg-secondary/40 relative flex size-full h-full flex-col overflow-hidden bg-[url(/wallpapper.jpg)] bg-cover bg-[center_center] bg-no-repeat bg-blend-multiply">
          <div className="bg-radial -translate-1/2 from-primary/15 to-bg-primary/0 pointer-events-none absolute -left-20 top-0 size-[150vh] animate-pulse rounded-full to-85% blur-2xl [animation-duration:1780ms] [animation-timing-function:ease-in-out]" />
          <div className="bg-radial -translate-1/2 from-primary/15 to-bg-primary/0 pointer-events-none absolute left-40 top-0 size-[80vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:2500ms]" />
          <div className="bg-radial from-primary/15 to-bg-primary/0 pointer-events-none absolute right-0 top-0 size-[40vh] -translate-y-2/3 animate-pulse rounded-full to-100% blur-2xl [animation-duration:1500ms]" />
          <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 pointer-events-none absolute left-[15%] top-0 size-[50vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1250ms]" />
          <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 pointer-events-none absolute left-[35%] top-0 size-[60vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1100ms]" />
          <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 pointer-events-none absolute left-[65%] top-0 size-[55vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1370ms]" />
          <div className="bg-radial translate-1/2 from-secondary/50 to-secondary/15 pointer-events-none absolute bottom-0 right-0 size-[80vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:5000ms]" />

          <SheetHeader>
            <SheetTitle className="font-title text-3xl font-normal">Albion Raid Manager</SheetTitle>
            <SheetDescription>About us</SheetDescription>
          </SheetHeader>

          <div className="flex grow flex-col items-stretch justify-end gap-4 p-4">
            <Link
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              to="https://discord.gg/"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
            >
              <Button variant="outline" size="lg" className="w-full text-xl">
                <FontAwesomeIcon icon={faDiscord} className="size-[32px]" />
                <span className="text-lg">Discord</span>
              </Button>
            </Link>
            <Link
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              to="https://github.com/agnjunio/albion-raid-manager"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
            >
              <Button variant="outline" size="lg" className="w-full text-xl">
                <FontAwesomeIcon icon={faGithub} width={16} height={16} />
                <span className="text-lg">GitHub</span>
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
