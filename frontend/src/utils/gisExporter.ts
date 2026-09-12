import { MissionV3Target } from '../data/missionV3Data';

export function exportGeoJsonDossier(targets: MissionV3Target[], missionId: string = 'MX-026') {
  const geojson = {
    type: 'FeatureCollection',
    name: `SONARX_MoES_${missionId}_Hazard_Inventory`,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features: targets.map((t) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [t.longitude, t.latitude, -t.depth],
      },
      properties: {
        target_id: t.id,
        classification: t.label,
        category: t.category,
        confidence_pct: Number((t.confidence * 100).toFixed(1)),
        status: t.status,
        priority: t.priority,
        depth_m: t.depth,
        shadow_relief_m: t.shadowLength,
        length_m: t.length,
        width_m: t.width,
        volumetric_footprint_m3: Number((t.length * t.width * t.shadowLength * 0.5).toFixed(2)),
        microplastic_risk_kg: t.category === 'GHOST NET' ? Number((t.length * t.width * 14.2).toFixed(0)) : 0,
        survey_site: 'Mumbai Shelf Corridor',
        detection_timestamp: new Date().toISOString(),
        detection_engine: 'YOLOv8s-ONNX-v2',
      },
    })),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `SONARX_${missionId}_WGS84_Hazards.geojson`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
