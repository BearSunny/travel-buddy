import L from "leaflet";
import "leaflet/dist/leaflet.css";

const iconUrl = "/images/marker-icon.png";
const iconUrl2x = "/images/marker-icon-2x.png";
const shadowUrl = "/images/marker-shadow.png";

export function fixLeafletIcons() {
  // Remove the old method that tries to load default image paths
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl: iconUrl2x,
    shadowUrl,
  });
}
