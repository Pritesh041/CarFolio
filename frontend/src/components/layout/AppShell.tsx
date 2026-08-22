import { Outlet, useNavigate } from "react-router-dom";
import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";
import { EmailVerificationBanner } from "./EmailVerificationBanner";
import { useAddCar } from "../../lib/addCarStore";
import { CarFormModal } from "../cars/CarFormModal";

export function AppShell() {
  const addCar = useAddCar();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <TopNav />
      <EmailVerificationBanner />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-8 sm:px-8 sm:pb-12">
        <Outlet />
      </main>

      <MobileNav onAddCar={addCar.openModal} />

      <CarFormModal
        open={addCar.isOpen}
        onClose={addCar.closeModal}
        onSaved={() => {
          addCar.closeModal();
          addCar.bumpRefresh();
          navigate("/collection");
        }}
      />
    </div>
  );
}
