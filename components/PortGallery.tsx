import Image from "next/image";
export default function PortGallery() {
  return (
    <figure className="port-gallery">
      <div className="port-mosaic">
        <div className="mosaic-main">
          <Image
            src="/images/port-editorial.webp"
            alt="Aerial illustration of container cranes, ships and cargo at a generic port"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 600px"
          />
        </div>
        <div className="mosaic-water">
          <Image
            src="/images/port-editorial.webp"
            alt="Illustrative marine infrastructure at a generic seaport"
            fill
            sizes="(max-width: 700px) 40vw, 380px"
          />
        </div>
        <div className="mosaic-rail">
          <Image
            src="/images/port-editorial.webp"
            alt="Illustrative inland cargo and logistics connections"
            fill
            sizes="(max-width: 700px) 40vw, 380px"
          />
        </div>
      </div>
      <figcaption>
        Port & logistics infrastructure · Illustrative imagery, not verified
        photographs of company assets.
      </figcaption>
    </figure>
  );
}
