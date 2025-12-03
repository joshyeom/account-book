import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { CategorySelector } from "@/components/CategorySelector";
import { NameAutocomplete } from "@/components/NameAutocomplete";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { mockExpenses, getUniqueExpenseNames } from "@/lib/data";

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const suggestions = getUniqueExpenseNames(mockExpenses);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    // Only allow numbers (no decimals for KRW)
    if (/^\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const formatAmountDisplay = (value: string) => {
    if (!value) return "";
    return Number(value).toLocaleString("ko-KR");
  };

  const handleSave = () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an expense name.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would save to database here
    toast({
      title: "지출 추가 완료",
      description: `₩${Number(amount).toLocaleString("ko-KR")} - ${name}`,
    });

    navigate("/");
  };

  const isValid = amount && Number(amount) > 0 && name.trim() && category;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header title="Add Expense" showBack />

      <main className="flex-1 px-4 pb-24 pt-6">
        {/* Amount Input */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Amount
          </label>
          <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-foreground">
              ₩
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={formatAmountDisplay(amount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="h-20 w-full rounded-xl border-2 border-border bg-card pl-12 pr-4 text-4xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Name Input with Autocomplete */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Name
          </label>
          <NameAutocomplete
            value={name}
            onChange={setName}
            suggestions={suggestions}
            placeholder="What was this expense for?"
          />
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-muted-foreground">
            Category
          </label>
          <CategorySelector selected={category} onSelect={setCategory} />
        </div>

        {/* Date Picker */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </main>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4">
        <Button
          onClick={handleSave}
          disabled={!isValid}
          className="h-14 w-full text-lg font-semibold"
        >
          Save Expense
        </Button>
      </div>
    </div>
  );
};

export default AddExpense;
