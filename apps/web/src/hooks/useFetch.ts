import { useEffect, useState } from "react";

const useFetch = (url: string, options?: RequestInit) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, options);
        const json = await res.json();
        setResponse(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { loading, response, error };
};

export default useFetch;
