import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const useGetParam = (key: string) => {
  const search = useLocation().search;
  const [param, setParam] = useState<string>('');

  const searchParam = () => {
    const name = new URLSearchParams(search).get(key);
    setParam(name as string);
  };

  useEffect(() => {
    searchParam();
  }, []);

  return param;
};
export default useGetParam;
