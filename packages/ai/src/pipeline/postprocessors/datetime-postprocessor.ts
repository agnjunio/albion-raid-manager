import { type Postprocessor } from "./types";

export const dateTimePostprocessor: Postprocessor = (context) => {
  const { aiData, preprocessedContext, parsedData } = context;

  let raidDateTime = new Date();
  raidDateTime.setHours(0, 0, 0, 0);

  const aiTimestamp = aiData.timestamp as string | undefined;
  if (aiTimestamp && aiTimestamp !== "Not specified") {
    try {
      const parsedTimestamp = new Date(aiTimestamp);
      if (!isNaN(parsedTimestamp.getTime())) {
        raidDateTime = parsedTimestamp;
      }
    } catch {
      console.warn("Failed to parse AI timestamp:", aiTimestamp);
    }
  }

  if (preprocessedContext.extractedTime) {
    const timeMatch = preprocessedContext.extractedTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      raidDateTime.setHours(hours, minutes, 0, 0);
    }
  }

  return {
    ...context,
    aiData: {
      ...aiData,
      date: raidDateTime,
    },
    parsedData: {
      ...parsedData,
      date: raidDateTime,
    },
  };
};
