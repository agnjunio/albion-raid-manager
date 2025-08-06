import { type Postprocessor } from "./types";

/**
 * Processes date and time information
 */
export const dateTimePostprocessor: Postprocessor = (context) => {
  const { aiData: parsedData, preprocessedContext: pipelineContext } = context;

  // Parse and combine date and time into full datetime
  let raidDateTime = new Date();
  raidDateTime.setHours(0, 0, 0, 0); // Default to start of today

  const aiDate = parsedData.date as string | undefined;
  const aiTime = parsedData.time as string | undefined;

  if (aiDate) {
    try {
      // Try to parse the AI's date response as a full datetime
      const parsedDate = new Date(aiDate);
      if (!isNaN(parsedDate.getTime())) {
        raidDateTime = parsedDate;
      }
    } catch {
      console.warn("Failed to parse AI date:", aiDate);
    }
  }

  // If AI provided separate time, combine it with the date
  if (aiTime && aiTime !== "Not specified") {
    try {
      // Parse time in various formats
      let hours = 0;
      let minutes = 0;
      // Try HH:MM format
      const timeMatch = aiTime.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
      } else {
        // Try HHh format
        const hourMatch = aiTime.match(/(\d{1,2})h/);
        if (hourMatch) {
          hours = parseInt(hourMatch[1], 10);
        } else {
          // Try just HH format
          const justHourMatch = aiTime.match(/^(\d{1,2})$/);
          if (justHourMatch) {
            hours = parseInt(justHourMatch[1], 10);
          }
        }
      }

      // Set the time on the raid date
      raidDateTime.setHours(hours, minutes, 0, 0);
    } catch {
      console.warn("Failed to parse AI time:", aiTime);
    }
  }

  // Extract time from message if not provided by AI
  if (pipelineContext.extractedTime && (!aiTime || aiTime === "Not specified")) {
    // Parse the extracted time string
    const timeMatch = pipelineContext.extractedTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      raidDateTime.setHours(hours, minutes, 0, 0);
    }
  }

  return {
    ...context,
    aiData: {
      ...parsedData,
      date: raidDateTime,
    },
  };
};
