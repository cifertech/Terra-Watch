# Adding a Terra Watch Layer

Terra Watch layers follow the same path from API source to globe UI.

1. Add or extend the shared contract in `packages/types/src/index.ts`.
2. Add a source fetcher in `apps/api/src` that returns normalized `DisasterEvent[]`.
3. Register the fetcher and TTL in `apps/api/src/index.ts`.
4. Add an `EventLayerId` toggle in `apps/web/src/components/LayerLegend.tsx`.
5. Add marker or imagery behavior in `apps/web/src/components/Globe.tsx`.
6. Add panel/dashboard display details only when the data adds useful context.

Every layer should degrade gracefully when an upstream API is offline or an optional API key is missing. Return a source warning, preserve cached data when possible, and keep the globe interactive.

## Current Layers

- NASA EONET hazards: wildfires, storms, volcanoes, floods, drought, sea ice, and other events.
- USGS earthquakes with magnitude-scaled ripple markers.
- NOAA tropical storms with wind-speed rings.
- NASA GIBS satellite overlays: true color, thermal anomalies, and aerosol.
- Population density fallback rings and event-level population estimates.
- GDELT headlines and Wikipedia summaries in the event panel.
