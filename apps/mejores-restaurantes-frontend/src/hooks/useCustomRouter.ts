import { useRouter, useSearchParams } from "next/navigation";

const useCustomRouter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const push = (path: string) => {
    const searchQuery = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    router.push(`${path}${searchQuery}`);
  };

  return { push };
};

export default useCustomRouter;
