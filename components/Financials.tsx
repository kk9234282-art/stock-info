"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartNoAxesCombined } from "lucide-react";
import { metricDefinitions, type ResearchContent } from "@/lib/content";
export default function Financials({
  metrics,
  sources,
}: {
  metrics: ResearchContent["metrics"];
  sources: ResearchContent["sources"];
}) {
  const [key, setKey] = useState("revenue");
  const [basis, setBasis] = useState("consolidated");
  const rows = metrics
    .filter((m) => m.key === key && m.basis === basis)
    .sort((a, b) => a.year.localeCompare(b.year));
  return (
    <div className="financials">
      <div className="chart-toolbar">
        <label>
          Metric
          <select value={key} onChange={(e) => setKey(e.target.value)}>
            {metricDefinitions.slice(0, 10).map((m) => (
              <option value={m[0]} key={m[0]}>
                {m[1]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reporting basis
          <select value={basis} onChange={(e) => setBasis(e.target.value)}>
            <option value="consolidated">Consolidated</option>
            <option value="standalone">Standalone</option>
          </select>
        </label>
        <span>Annual · ₹ crore unless stated</span>
      </div>
      {rows.length ? (
        <>
          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#167965"
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table>
            <caption>
              {metricDefinitions.find((m) => m[0] === key)?.[1]} · {basis}
            </caption>
            <thead>
              <tr>
                <th>Period</th>
                <th>Value</th>
                <th>Definition & source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m, i) => {
                const s = sources.find((s) => s.id === m.sourceId);
                return (
                  <tr key={i}>
                    <td>{m.year}</td>
                    <td>
                      {m.value.toLocaleString("en-IN")} {m.unit}
                    </td>
                    <td>
                      {m.definition}
                      <br />
                      {s && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.title} · verified {s.verifiedAt}
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <div className="chart-empty">
          <ChartNoAxesCombined size={32} />
          <strong>Verified financial data is not available yet.</strong>
          <p>
            No estimates, sample values or zero-filled charts.
            <br />
            Audited annual observations will appear after source review.
          </p>
        </div>
      )}
    </div>
  );
}
