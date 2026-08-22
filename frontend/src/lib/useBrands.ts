import { useEffect, useState } from "react";
import { api } from "./api";
import type { Brand } from "../types";

let cache: Brand[] | null = null;

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    api
      .get<Brand[]>("/brands")
      .then((res) => {
        cache = res.data;
        setBrands(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { brands, isLoading };
}
