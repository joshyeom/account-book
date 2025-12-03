import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { categories, getCategoryById, formatCurrency } from "@/lib/data";

interface ExpenseChartProps {
  expensesByCategory: Record<string, number>;
  total: number;
}

export const ExpenseChart = ({ expensesByCategory, total }: ExpenseChartProps) => {
  const data = Object.entries(expensesByCategory)
    .map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      return {
        name: category?.name || categoryId,
        value: amount,
        color: category?.color || "hsl(0, 0%, 60%)",
      };
    })
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No expenses yet
      </div>
    );
  }

  const renderCustomLabel = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground"
      >
        <tspan x={cx} dy="-0.5em" className="text-2xl font-bold">
          {formatCurrency(total)}
        </tspan>
        <tspan x={cx} dy="1.5em" className="text-sm fill-muted-foreground">
          Total
        </tspan>
      </text>
    );
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, entry: any) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
