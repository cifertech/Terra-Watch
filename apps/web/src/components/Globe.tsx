import { useEffect, useRef } from "react";
import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Color,
  CustomDataSource,
  Entity,
  HorizontalOrigin,
  ImageryLayer,
  JulianDate,
  LabelStyle,
  PolylineGlowMaterialProperty,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer
} from "cesium";
import type { DisasterEvent, EventLayerId, SatelliteLayer } from "@terra-watch/types";
import { latestByDate } from "@terra-watch/utils";
import { EVENT_STYLES } from "../lib/eventStyles";

interface GlobeProps {
  events: DisasterEvent[];
  selectedEventId: string | null;
  activeLayers: EventLayerId[];
  satelliteLayers: SatelliteLayer[];
  activeDate: string | null;
  onSelectEvent: (id: string) => void;
}

const SATELLITE_LAYER_IDS: EventLayerId[] = ["satelliteTrueColor", "satelliteThermal", "satelliteAerosol"];
const MAX_GLOBE_EVENTS = 500;
const WORLD_IMAGERY_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const MIN_ELLIPSE_RADIUS = 50_000;
const MAX_ELLIPSE_RADIUS = 2_500_000;
const WILDFIRE_CLUSTER_MINIMUM_SIZE = 3;
const WILDFIRE_CLUSTER_PIXEL_RANGE = 46;
const WILDFIRE_COLOR = "#FF4500";
const CLUSTER_SURFACE_COLOR = "#090b0f";
const WILDFIRE_CLUSTER_IMAGE = clusterMarkerSvg(WILDFIRE_COLOR);

function safeMagnitude(value: number | null | undefined, fallback = 1): number {
  const magnitude = Number(value);
  return Number.isFinite(magnitude) ? Math.max(0, magnitude) : fallback;
}

function safeEllipseRadius(value: number, min = MIN_ELLIPSE_RADIUS, max = MAX_ELLIPSE_RADIUS): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function clusterMarkerSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
    <defs>
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="13" cy="13" r="9" fill="rgba(9,11,15,0.52)" stroke="${color}" stroke-opacity="0.82" stroke-width="1.2" filter="url(#glow)"/>
    <circle cx="13" cy="13" r="6.2" fill="rgba(9,11,15,0.38)" stroke="rgba(255,255,255,0.16)" stroke-width="0.6"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function Globe({ events, selectedEventId, activeLayers, satelliteLayers, activeDate, onSelectEvent }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const imageryLayerRef = useRef<ImageryLayer | null>(null);
  const wildfireDataSourceRef = useRef<CustomDataSource | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) {
      return;
    }

    const baseImagery = new UrlTemplateImageryProvider({
      url: WORLD_IMAGERY_TILE_URL,
      credit: "Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, GIS User Community",
      maximumLevel: 19
    });

    const viewer = new Viewer(containerRef.current, {
      animation: false,
      baseLayer: ImageryLayer.fromProviderAsync(Promise.resolve(baseImagery), {}),
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      skyAtmosphere: false,
      skyBox: false,
      timeline: false
    });

    viewerRef.current = viewer;
    viewer.scene.backgroundColor = Color.fromCssColorString("#282c34");
    viewer.scene.globe.baseColor = Color.fromCssColorString("#1e2228");
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.show = true;

    const wildfireDataSource = new CustomDataSource("wildfire-events");
    wildfireDataSource.clustering.enabled = true;
    wildfireDataSource.clustering.minimumClusterSize = WILDFIRE_CLUSTER_MINIMUM_SIZE;
    wildfireDataSource.clustering.pixelRange = WILDFIRE_CLUSTER_PIXEL_RANGE;
    wildfireDataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
      cluster.label.show = true;
      cluster.label.text = String(clusteredEntities.length);
      cluster.label.fillColor = Color.WHITE;
      cluster.label.outlineColor = Color.fromCssColorString(CLUSTER_SURFACE_COLOR).withAlpha(0.85);
      cluster.label.outlineWidth = 1.5;
      cluster.label.style = LabelStyle.FILL_AND_OUTLINE;
      cluster.label.font = "600 10px Fira Code, JetBrains Mono, monospace";
      cluster.label.horizontalOrigin = HorizontalOrigin.CENTER;
      cluster.label.verticalOrigin = VerticalOrigin.CENTER;
      cluster.label.pixelOffset = new Cartesian2(0, 0);

      cluster.billboard.show = true;
      cluster.billboard.image = WILDFIRE_CLUSTER_IMAGE;
      cluster.billboard.width = 26;
      cluster.billboard.height = 26;
      cluster.billboard.horizontalOrigin = HorizontalOrigin.CENTER;
      cluster.billboard.verticalOrigin = VerticalOrigin.CENTER;
      cluster.point.show = false;
    });
    void viewer.dataSources.add(wildfireDataSource);
    wildfireDataSourceRef.current = wildfireDataSource;

    baseImagery.errorEvent.addEventListener((error) => {
      console.error("[Terra Watch] Esri imagery tile failed", error);
    });

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(20, 0, 34_000_000)
    });

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(movement.position) as { id?: Entity } | undefined;
      const properties = picked?.id?.properties?.getValue(JulianDate.now()) as { eventId?: string } | undefined;

      if (properties?.eventId) {
        onSelectEvent(properties.eventId);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
    handlerRef.current = handler;

    return () => {
      handlerRef.current?.destroy();
      viewer.destroy();
      viewerRef.current = null;
      handlerRef.current = null;
      wildfireDataSourceRef.current = null;
    };
  }, [onSelectEvent]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    if (imageryLayerRef.current) {
      viewer.imageryLayers.remove(imageryLayerRef.current, true);
      imageryLayerRef.current = null;
    }

    const activeSatelliteId = activeLayers.find((layer) => SATELLITE_LAYER_IDS.includes(layer));
    const layer = satelliteLayers.find((item) => item.id === activeSatelliteId);
    if (!layer) {
      return;
    }

    const imageryProvider = new UrlTemplateImageryProvider({
      url: layer.templateUrl,
      credit: layer.label
    });
    imageryLayerRef.current = viewer.imageryLayers.addImageryProvider(imageryProvider);
    imageryLayerRef.current.alpha = 0.78;
  }, [activeLayers, satelliteLayers]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.entities.removeAll();
    wildfireDataSourceRef.current?.entities.removeAll();

    const globeEvents = events.slice(0, MAX_GLOBE_EVENTS);

    globeEvents.forEach((event, index) => {
      const point = latestByDate(event.geometry);
      if (!point || !Number.isFinite(point.lon) || !Number.isFinite(point.lat)) {
        return;
      }

      const style = EVENT_STYLES[event.category];
      const cesiumColor = Color.fromCssColorString(style.color);
      const selected = event.id === selectedEventId;
      const phase = index * 0.55;

      const entityCollection = event.category === "wildfires" ? wildfireDataSourceRef.current?.entities : viewer.entities;
      entityCollection?.add({
        id: event.id,
        name: event.title,
        position: Cartesian3.fromDegrees(point.lon, point.lat, selected ? 180_000 : 80_000),
        properties: {
          eventId: event.id
        },
        point: {
          pixelSize: new CallbackProperty(() => {
            const pulse = Math.sin(performance.now() / 420 + phase);
            const baseSize = event.category === "earthquakes" ? 9 + (event.magnitude.value ?? 1) : 11;
            return (selected ? baseSize + 8 : baseSize) + pulse * (selected ? 5 : 3);
          }, false),
          color: new CallbackProperty(() => {
            const alpha = selected ? 0.95 : 0.62 + Math.sin(performance.now() / 520 + phase) * 0.18;
            return cesiumColor.withAlpha(alpha);
          }, false),
          outlineColor: cesiumColor.withAlpha(selected ? 0.75 : 0.38),
          outlineWidth: selected ? 4 : 2
        }
      });

      if (event.category === "earthquakes") {
        const earthquakeMagnitude = safeMagnitude(event.magnitude.value, 2);
        const rippleColor = Color.fromCssColorString(style.color);

        viewer.entities.add({
          id: `${event.id}:ripple`,
          polyline: {
            positions: new CallbackProperty(() => {
              const pulse = (Math.sin(performance.now() / 620 + phase) + 1) / 2;
              const radius = safeEllipseRadius(90_000 + pulse * earthquakeMagnitude * 70_000);
              return circlePolylinePositions(point.lon, point.lat, radius, 40_000);
            }, false),
            width: 2,
            material: rippleColor.withAlpha(0.45)
          }
        });
      }

      if (event.category === "severeStorms") {
        const ringSize = safeEllipseRadius(280_000 + safeMagnitude(event.magnitude.value, 20) * 4_500);
        const stormColor = Color.fromCssColorString(style.color);

        viewer.entities.add({
          id: `${event.id}:wind-ring`,
          polyline: {
            positions: circlePolylinePositions(point.lon, point.lat, ringSize, 70_000),
            width: selected ? 3 : 2,
            material: stormColor.withAlpha(selected ? 0.75 : 0.35)
          }
        });
      }
    });

    viewer.entities.add({
      id: "day-night-terminator",
      polyline: {
        positions: buildTerminatorPositions(activeDate),
        width: 2,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Color.fromCssColorString("#9cdef2").withAlpha(0.48)
        })
      }
    });
  }, [events, selectedEventId, activeDate, activeLayers]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_42%,rgba(124,211,255,0.12)_55%,rgba(80,180,255,0.22)_60%,transparent_68%)] mix-blend-screen" />
    </div>
  );
}

function circlePolylinePositions(lon: number, lat: number, radiusMeters: number, height: number): Cartesian3[] {
  const latRadians = (lat * Math.PI) / 180;
  const cosLat = Math.max(Math.cos(latRadians), 0.15);
  const metersPerDegreeLon = 111_320 * cosLat;
  const metersPerDegreeLat = 110_540;
  const steps = 48;

  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = (index / steps) * Math.PI * 2;
    const eastMeters = radiusMeters * Math.cos(angle);
    const northMeters = radiusMeters * Math.sin(angle);

    return Cartesian3.fromDegrees(
      lon + eastMeters / metersPerDegreeLon,
      lat + northMeters / metersPerDegreeLat,
      height
    );
  });
}

function buildTerminatorPositions(activeDate: string | null): Cartesian3[] {
  const date = activeDate ? new Date(activeDate) : new Date();
  const dayOfYear = Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86_400_000);
  const declination = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const subsolarLon = 180 - utcHours * 15;

  return Array.from({ length: 145 }, (_, index) => {
    const lon = -180 + index * 2.5;
    const lat = Math.atan(-Math.cos(((lon - subsolarLon) * Math.PI) / 180) / Math.tan((declination * Math.PI) / 180)) * (180 / Math.PI);
    return Cartesian3.fromDegrees(lon, Number.isFinite(lat) ? lat : 0, 130_000);
  });
}
