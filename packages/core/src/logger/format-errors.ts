import winston from "winston";

export const formatErrors = winston.format((info) => {
  // Check all properties for Error objects and serialize them properly
  Object.keys(info).forEach((key) => {
    if (info[key] instanceof Error) {
      const error = info[key];
      info[key] = {
        ...error, // Include any custom properties
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }
  });
  return info;
});
