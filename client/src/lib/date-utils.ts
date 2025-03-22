import { useState, useEffect } from "react";

export const useCurrentDateTime = () => {
  const [dateTime, setDateTime] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
      };

      setDateTime({
        date: now.toLocaleDateString("en-US", dateOptions),
        time: now.toLocaleTimeString("en-US", timeOptions),
      });
    };

    updateDateTime(); // Initialize
    const intervalId = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return dateTime;
};
