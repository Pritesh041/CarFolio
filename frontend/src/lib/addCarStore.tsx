import { createContext, useContext, useState, type ReactNode } from "react";

interface AddCarContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  refreshKey: number;
  bumpRefresh: () => void;
}

const AddCarContext = createContext<AddCarContextValue | undefined>(undefined);

export function AddCarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AddCarContext.Provider
      value={{
        isOpen,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
        refreshKey,
        bumpRefresh: () => setRefreshKey((k) => k + 1),
      }}
    >
      {children}
    </AddCarContext.Provider>
  );
}

export function useAddCar() {
  const ctx = useContext(AddCarContext);
  if (!ctx) throw new Error("useAddCar must be used within AddCarProvider");
  return ctx;
}
