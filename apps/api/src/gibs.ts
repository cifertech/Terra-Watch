import type { SatelliteLayer } from "@terra-watch/types";

const GIBS_WMTS_BASE_URL = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

export function getGibsLayers(date = new Date().toISOString().slice(0, 10)): SatelliteLayer[] {
  return [
    {
      id: "satelliteTrueColor",
      label: "NASA GIBS True Color",
      layerName: "MODIS_Terra_CorrectedReflectance_TrueColor",
      tileMatrixSetId: "GoogleMapsCompatible_Level9",
      format: "image/jpeg",
      templateUrl: `${GIBS_WMTS_BASE_URL}/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
      date
    },
    {
      id: "satelliteThermal",
      label: "NASA GIBS Thermal Anomalies",
      layerName: "MODIS_Terra_Thermal_Anomalies_Day",
      tileMatrixSetId: "GoogleMapsCompatible_Level7",
      format: "image/png",
      templateUrl: `${GIBS_WMTS_BASE_URL}/MODIS_Terra_Thermal_Anomalies_Day/default/${date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
      date
    },
    {
      id: "satelliteAerosol",
      label: "NASA GIBS Aerosol",
      layerName: "MODIS_Terra_Aerosol",
      tileMatrixSetId: "GoogleMapsCompatible_Level6",
      format: "image/png",
      templateUrl: `${GIBS_WMTS_BASE_URL}/MODIS_Terra_Aerosol/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
      date
    }
  ];
}
