import { useState, useEffect } from "react";

export function useDateTime() {
  const [dateTime, setDateTime] = useState("");
  
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      
      setDateTime(now.toLocaleDateString('en-US', options));
    };
    
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { dateTime };
}
