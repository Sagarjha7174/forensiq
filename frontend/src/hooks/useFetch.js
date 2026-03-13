import { useEffect, useState } from 'react';

const useFetch = (fetchFn) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchFn();
        if (!mounted) return;
        setData(response.data || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || 'Something went wrong');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchFn]);

  return { data, loading, error };
};

export default useFetch;
