// Pinned implementation guides. Bump versions deliberately (see scripts/ig-watch.js)
// and record them in every report.
export const FHIR_VERSION = '4.0.1';

export const IGS = {
  lab: {
    title: 'HL7 Europe Laboratory Report',
    package: 'hl7.fhir.eu.laboratory',
    version: '2.1.0',
    profile: 'http://hl7.eu/fhir/laboratory/StructureDefinition/Bundle-eu-lab',
  },
  hdr: {
    title: 'HL7 Europe Hospital Discharge Report',
    package: 'hl7.fhir.eu.hdr',
    version: '1.0.0',
    profile: 'http://hl7.eu/fhir/hdr/StructureDefinition/bundle-eu-hdr',
  },
  ips: {
    title: 'International Patient Summary',
    package: 'hl7.fhir.uv.ips',
    version: '2.0.1',
    profile: 'http://hl7.org/fhir/uv/ips/StructureDefinition/Bundle-uv-ips',
  },
};

export function getIg(key) {
  const ig = IGS[key];
  if (!ig) {
    throw new Error(`Unknown IG "${key}". Use one of: ${Object.keys(IGS).join(', ')}`);
  }
  return { key, ...ig, ref: `${ig.package}#${ig.version}` };
}
