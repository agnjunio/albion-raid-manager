import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (stepNumber: number) => void;
}

export function Stepper({ currentStep, totalSteps, stepLabels, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-between px-2">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Connector Line */}
            {index > 0 && (
              <div
                className={cn("mx-4 h-0.5 w-8 transition-colors", {
                  "bg-primary": stepNumber < currentStep,
                  "bg-muted-foreground": stepNumber >= currentStep,
                })}
              />
            )}

            {/* Step Circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  {
                    "border-primary bg-primary text-primary-foreground": isCurrent || isCompleted,
                    "border-muted-foreground bg-background text-muted-foreground": isUpcoming,
                    "cursor-pointer hover:scale-105": onStepClick && (isCompleted || isCurrent),
                    "cursor-not-allowed": onStepClick && isUpcoming,
                  },
                )}
                onClick={() => onStepClick && (isCompleted || isCurrent) && onStepClick(stepNumber)}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <div
                className={cn("block text-center text-xs font-medium transition-colors sm:hidden", {
                  "hover:text-primary cursor-pointer": onStepClick && (isCompleted || isCurrent),
                  "cursor-not-allowed": onStepClick && isUpcoming,
                })}
                onClick={() => onStepClick && (isCompleted || isCurrent) && onStepClick(stepNumber)}
              >
                {stepLabels[index]}
              </div>
            </div>

            {/* Step Label - Inline on larger screens */}
            <div className="ml-3 hidden text-nowrap sm:block">
              <p
                className={cn("text-xs font-medium transition-colors", {
                  "text-primary": isCurrent || isCompleted,
                  "text-muted-foreground": isUpcoming,
                  "hover:text-primary cursor-pointer": onStepClick && (isCompleted || isCurrent),
                  "cursor-not-allowed": onStepClick && isUpcoming,
                })}
                onClick={() => onStepClick && (isCompleted || isCurrent) && onStepClick(stepNumber)}
              >
                {stepLabels[index]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
