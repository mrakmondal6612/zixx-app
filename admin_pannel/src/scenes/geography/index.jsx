import React from "react";
import { Box, useTheme } from "@mui/material";
import { useGetGeographyQuery, useGetClientsUsersQuery } from "@state/api";
import Header from "@components/Header";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoData } from "@state/geoData";

const Geography = () => {
  const theme = useTheme();
  const { data: apiData, isLoading, isError } = useGetGeographyQuery();

  // fetch clients' user records so we can plot individual user locations
  const { data: usersData } = useGetClientsUsersQuery();

  const [markers, setMarkers] = React.useState([]);
  const [geoProgress, setGeoProgress] = React.useState({ done: 0, total: 0 });

  // simple sessionStorage-backed cache for geocoding results to avoid rate limits
  const geoCacheKey = "geo_cache_v1";

  const geocodeAddress = async (q) => {
    if (!q) return null;
    try {
      const cache = JSON.parse(sessionStorage.getItem(geoCacheKey) || "{}");
      if (cache[q]) return cache[q];
      // Nominatim free geocoding
      // include optional email param to be a good citizen; set VITE_GEOCODER_EMAIL if available
      const email = import.meta.env.VITE_GEOCODER_EMAIL || '';
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1${email ? `&email=${encodeURIComponent(email)}` : ''}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const { lat, lon } = arr[0];
      const coords = { lat: Number(lat), lon: Number(lon) };
      cache[q] = coords;
      try { sessionStorage.setItem(geoCacheKey, JSON.stringify(cache)); } catch (e) {}
      return coords;
    } catch (e) {
      return null;
    }
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!usersData || !Array.isArray(usersData)) return;
      const results = [];
      const batch = usersData.slice(0, 200);
      setGeoProgress({ done: 0, total: batch.length });
      for (let i = 0; i < batch.length; i++) {
        const u = batch[i];
        try {
          const addr = u && u.address ? u.address : null;
          const parts = [];
          if (addr) {
            if (addr.address_village) parts.push(addr.address_village);
            if (addr.landmark) parts.push(addr.landmark);
            if (addr.city) parts.push(addr.city);
            if (addr.state) parts.push(addr.state);
            if (addr.country) parts.push(addr.country);
          }
          const q = parts.filter(Boolean).join(", ") || u.email || u._id;
          const geo = await geocodeAddress(q);
          if (geo) {
            results.push({
              id: u._id || u.email || q,
              coords: [geo.lon, geo.lat], // [lon, lat]
              label: parts.filter(Boolean).join(", ") || u.email || q,
            });
          }
        } catch (e) {
          // continue on error
        }
        // throttling to be gentle with geocoder (300ms between requests)
        try { await new Promise((r) => setTimeout(r, 300)); } catch (e) {}
        setGeoProgress((p) => ({ ...p, done: p.done + 1 }));
      }
      if (mounted) setMarkers(results);
      setGeoProgress((p) => ({ ...p, done: p.total }));
    })();
    return () => { mounted = false; };
  }, [usersData]);

  // normalize and validate API response to an array of { id: string, value: number }
  const chartData = React.useMemo(() => {
    if (!apiData) return null;
    if (!Array.isArray(apiData)) {
      console.warn('Geography: unexpected API response, expected array but got', apiData);
      return null;
    }
    return apiData
      .map((d) => {
        if (!d) return null;
        return { id: String(d.id), value: Number(d.value) || 0 };
      })
      .filter(Boolean);
  }, [apiData]);

  // compute domain dynamically so color scale fits data
  const domain = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return [0, 1];
    const max = Math.max(...chartData.map((d) => d.value || 0));
    return [0, Math.max(1, max)];
  }, [chartData]);

  // filter geoData.features to remove malformed features that can cause Nivo to produce
  // invalid SVG paths (e.g. missing geometry or empty coordinates)
  const filteredFeatures = React.useMemo(() => {
    try {
      if (!geoData || !Array.isArray(geoData.features)) return [];
      return geoData.features.filter((f) => {
        if (!f || !f.geometry) return false;
        const { geometry } = f;
        if (!geometry.type || !geometry.coordinates) return false;
        // expect Polygon or MultiPolygon with non-empty coordinates
        if (geometry.type === 'Polygon') {
          return Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0;
        }
        if (geometry.type === 'MultiPolygon') {
          return Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0 && geometry.coordinates.some((p) => Array.isArray(p) && p.length > 0);
        }
        return false;
      });
    } catch (e) {
      return [];
    }
  }, [geoData]);

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Geography" subtitle="Find where your users are located." />

      <Box
        mt="40px"
        height="75vh"
        border={`1px solid ${theme.palette.secondary[200]}`}
        borderRadius="4px"
      >
        {isLoading ? (
          <> Loading ...</>
        ) : isError ? (
          <> Error loading geography data</>
        ) : chartData && chartData.length > 0 && filteredFeatures && filteredFeatures.length > 0 ? (
          <ResponsiveChoropleth
            data={chartData}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: theme.palette.secondary[200],
                  },
                },
                legend: {
                  text: {
                    fill: theme.palette.secondary[200],
                  },
                },
                ticks: {
                  line: {
                    stroke: theme.palette.secondary[200],
                    strokeWidth: 1,
                  },
                  text: {
                    fill: theme.palette.secondary[200],
                  },
                },
              },
              legends: {
                text: {
                  fill: theme.palette.secondary[200],
                },
              },
              tooltip: {
                container: {
                  color: theme.palette.primary.main,
                },
              },
            }}
            features={filteredFeatures}
            margin={{ top: 0, right: 0, bottom: 0, left: -50 }}
            domain={domain}
            unknownColor="#666666"
            label="properties.name"
            valueFormat=".2s"
            projectionScale={150}
            projectionTranslation={[0.45, 0.6]}
            projectionRotation={[0, 0, 0]}
            enableGraticule={true}
            borderWidth={1.3}
            borderColor="#ffffff"
            // custom layer to draw user markers on top of the choropleth
            layers={[
              "features",
              "graticule",
              // custom markers layer (guarded) - avoid projection errors or invalid coords
              function UserMarkers({ features, projection }) {
                try {
                  if (!projection || !markers || markers.length === 0) return null;
                  // cluster markers by screen proximity (simple O(n^2) since markers limited)
                  const clusters = [];
                  const used = new Array(markers.length).fill(false);
                  const pxThreshold = 20; // pixels
                  for (let i = 0; i < markers.length; i++) {
                    if (used[i]) continue;
                    const m = markers[i];
                    if (!m || !Array.isArray(m.coords) || m.coords.length < 2) continue;
                    let pt;
                    try { pt = projection(m.coords); } catch (e) { continue; }
                    if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) continue;
                    const cluster = { x: pt[0], y: pt[1], items: [m], id: m.id };
                    used[i] = true;
                    for (let j = i + 1; j < markers.length; j++) {
                      if (used[j]) continue;
                      const m2 = markers[j];
                      if (!m2 || !Array.isArray(m2.coords) || m2.coords.length < 2) continue;
                      let pt2;
                      try { pt2 = projection(m2.coords); } catch (e) { continue; }
                      if (!pt2 || !isFinite(pt2[0]) || !isFinite(pt2[1])) continue;
                      const dx = pt2[0] - pt[0];
                      const dy = pt2[1] - pt[1];
                      if (Math.hypot(dx, dy) <= pxThreshold) {
                        used[j] = true;
                        cluster.items.push(m2);
                        // recompute cluster centroid
                        cluster.x = (cluster.x * (cluster.items.length - 1) + pt2[0]) / cluster.items.length;
                        cluster.y = (cluster.y * (cluster.items.length - 1) + pt2[1]) / cluster.items.length;
                      }
                    }
                    clusters.push(cluster);
                  }

                  return (
                    <g>
                      {clusters.map((c, idx) => {
                        if (!c || !c.items || c.items.length === 0) return null;
                        const isCluster = c.items.length > 1;
                        const key = `cluster-${idx}-${c.id}`;
                        return (
                          <g key={key} transform={`translate(${c.x}, ${c.y})`}>
                            {isCluster ? (
                              <>
                                <circle r={8 + Math.min(12, c.items.length)} fill="#ff7043" stroke="#fff" strokeWidth={1.2} />
                                <text x={0} y={4} textAnchor="middle" fontSize={10} fill="#fff">{c.items.length}</text>
                                <title>{c.items.map((it) => it.label).slice(0,5).join('; ')}</title>
                              </>
                            ) : (
                              <>
                                <circle r={5} fill="#ff5722" stroke="#fff" strokeWidth={1} />
                                <title>{c.items[0].label}</title>
                              </>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                } catch (e) {
                  // fail safe: do not render markers if anything goes wrong
                  return null;
                }
              },
              "legends",
            ]}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: true,
                translateX: 0,
                translateY: -125,
                itemsSpacing: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemDirection: "left-to-right",
                itemTextColor: theme.palette.secondary[200],
                itemOpacity: 0.85,
                symbolSize: 18,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: theme.palette.background.alt,
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        ) : (
          <> Loading ...</>
        )}
      </Box>
    </Box>
  );
};

export default Geography;
