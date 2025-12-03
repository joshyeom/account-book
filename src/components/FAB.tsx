import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FAB = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/add")}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Add expense"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
};
