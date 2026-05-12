import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../context/useTheme";
import { fmt, getSpendingByCategory } from "../utils/calcFinance";
import { IconChart } from "./icons";

/** Brand palette for charts (works on light section background). */
const BAR_GREEN = "#10b981";
const BAR_BLUE = "#2563eb";

export default function Charts({ transactions }) {
  const { colors: COLORS } = useTheme();
  const data = getSpendingByCategory(transactions).sort((a, b) => b.amount - a.amount);

  if (data.length === 0) {
    return (
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "16px",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          color: COLORS.textSecondary,
          fontSize: "14px",
          boxShadow: COLORS.shadowSm,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <IconChart size={22} color={COLORS.textMuted} />
        </div>
        No expense categories yet — add spending to see your breakdown chart.
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((d) => ({
    name: d.name.length > 12 ? `${d.name.slice(0, 11)}…` : d.name,
    fullName: d.name,
    amount: d.amount,
    percent: d.percent,
  }));

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "16px",
        padding: "1.25rem 1rem 1rem",
        boxShadow: COLORS.shadowSm,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
          paddingLeft: "4px",
        }}
      >
        <IconChart size={18} color={COLORS.green} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: COLORS.textPrimary }}>
          Spending by category
        </span>
      </div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: COLORS.surfaceHover }}
              contentStyle={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                fontSize: "12px",
                color: COLORS.textPrimary,
              }}
              formatter={(value, _name, item) => [
                    `${fmt(value)} (${item.payload.percent}%)`,
                    item.payload.fullName,
                  ]}
            />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={18}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? BAR_GREEN : BAR_BLUE} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
