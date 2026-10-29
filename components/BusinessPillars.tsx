import Image from "next/image";
const pillars = [
  {
    title: "Port operations",
    crop: "port",
    description:
      "The port is the entry and exit point for cargo. Ships bring containers, bulk commodities and other goods to a terminal.",
    services: [
      "Loading and unloading cargo.",
      "Vessel-related and terminal services.",
      "Cargo handling and storage.",
    ],
    driver: "Cargo volume, cargo mix and revenue per tonne or container.",
  },
  {
    title: "Logistics",
    crop: "rail",
    description:
      "The inland connection moves cargo between a port and a factory, warehouse or distribution centre.",
    services: [
      "Container rail and road transport.",
      "Warehousing and logistics facilities.",
      "Freight forwarding and supply-chain services.",
    ],
    driver: "Transport volumes, utilisation and end-to-end service contracts.",
  },
  {
    title: "Marine services",
    crop: "marine",
    description:
      "Vessels, equipment and crews can support shipping and port operations.",
    services: [
      "Towage and vessel support.",
      "Marine service contracts.",
      "Fleet and equipment operations.",
    ],
    driver: "Contract terms, fleet utilisation and service demand.",
  },
  {
    title: "SEZ & industrial infrastructure",
    crop: "yard",
    description:
      "Industrial infrastructure can connect land, facilities and services with customers that operate near a trade gateway.",
    services: [
      "Permitted land and facility leases.",
      "Industrial infrastructure services.",
      "Supporting utilities and amenities.",
    ],
    driver: "Occupancy, contracted income and concession terms.",
  },
];
export default function BusinessPillars() {
  return (
    <div className="business-pillars">
      {pillars.map((p, i) => (
        <section className="pillar-row" key={p.title}>
          <div className={"pillar-photo " + p.crop}>
            <Image
              src="/images/port-editorial.webp"
              alt="Illustrative port and logistics infrastructure, not a photograph of an APSEZ asset"
              fill
              sizes="(max-width: 600px) 96px, 140px"
            />
          </div>
          <div>
            <h3>
              {i + 1}. {p.title}
            </h3>
            <p>{p.description}</p>
            <ul>
              {p.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="pillar-driver">
              <strong>Main driver:</strong> {p.driver}
            </p>
          </div>
        </section>
      ))}
      <p className="caption">
        Industry learning categories · APSEZ’s current statutory reporting
        segments still require official verification.
      </p>
    </div>
  );
}
