// Address autocomplete via Photon (OpenStreetMap data, built for search-as-you-type, no API key).
// Point VITE_GEOCODER_URL at your own Photon instance for production, or swap these two functions for Google Places / Mapbox.
const BASE=(import.meta.env.VITE_GEOCODER_URL||'https://photon.komoot.io').replace(/\/$/,'');
export const label=p=>{const street=[p.housenumber,p.street].filter(Boolean).join(' ');
  const parts=[p.name&&p.name!==p.street?p.name:'',street,p.district,p.city,p.state,p.postcode,p.country].filter(Boolean);
  return [...new Set(parts)].join(', ')};
const toItem=f=>({label:label(f.properties),lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0]});
export async function searchAddress(q,signal){
  const r=await fetch(`${BASE}/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`,{signal});
  if(!r.ok)throw new Error('Address search is unavailable right now.');
  const seen=new Set();return (await r.json()).features.map(toItem).filter(i=>i.label&&!seen.has(i.label)&&seen.add(i.label))}
export async function reverseGeocode(lat,lon){
  const r=await fetch(`${BASE}/reverse?lat=${lat}&lon=${lon}&lang=en`);if(!r.ok)throw new Error('Could not look up your location.');
  const f=(await r.json()).features[0];if(!f)throw new Error('No address found for your location.');return toItem(f)}
