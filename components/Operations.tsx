"use client";
import { useState } from "react";
import {
  Ship,
  Container,
  TrainFront,
  IndianRupee,
  ArrowDown,
} from "lucide-react";
const stages = [
  {
    title: "Ship arrives at the port",
    short: "Ship arrives",
    icon: Ship,
    detail:
      "Port infrastructure and marine services support the arriving vessel.",
    income: "Potential income: vessel and marine service charges",
  },
  {
    title: "Cargo is unloaded and stored",
    short: "Cargo handling",
    icon: Container,
    detail:
      "Cargo-handling equipment transfers goods to a terminal, storage yard or warehouse.",
    income: "Potential income: cargo handling and applicable storage fees",
  },
  {
    title: "Cargo moves inland",
    short: "Inland transport",
    icon: TrainFront,
    detail:
      "Rail and road connections move cargo towards the customer’s factory, warehouse or distribution centre.",
    income: "Potential income: rail, road and logistics service fees",
  },
  {
    title: "One journey, multiple services",
    short: "Connected services",
    icon: IndianRupee,
    detail:
      "One shipment can use several services across the value chain, depending on the provider and contract.",
    income:
      "Potential income: the sum of services actually supplied, not a fee at every step for every shipment",
  },
];
export default function Operations() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="operations reading-operations">
      <div className="journey-stack" aria-label="Typical cargo journey">
        {stages.map((s, i) => (
          <div className="journey-stage" key={s.short}>
            <button
              className={
                "journey-card " +
                (i === 3 ? "journey-outcome " : "") +
                (selected === i ? "selected" : "")
              }
              onClick={() => setSelected(selected === i ? null : i)}
              aria-expanded={selected === i}
              aria-controls={"journey-detail-" + i}
            >
              <s.icon size={25} />
              <strong>
                Step {i + 1}: {s.title}
              </strong>
              <span>{s.detail}</span>
              <small>
                {selected === i
                  ? "Hide revenue detail"
                  : "Explore revenue at this step"}
              </small>
            </button>
            <div
              id={"journey-detail-" + i}
              hidden={selected !== i}
              className="journey-revenue"
              role="region"
              aria-label={s.short + " revenue detail"}
            >
              {s.income}
            </div>
            {i < stages.length - 1 && (
              <ArrowDown
                className="journey-arrow"
                size={19}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
      <p className="caption">
        Illustrative cargo journey · Actual company services and charges require
        source verification.
      </p>
    </div>
  );
}
