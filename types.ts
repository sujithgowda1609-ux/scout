
export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  attributes: {
    color?: string;
    pattern?: string;
    material?: string;
    type?: string;
  };
  flipkartUrl: string;
  imageUrl: string;
}

export interface DetectionResult {
  scene: string;
  objects: DetectedObject[];
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export enum ViewMode {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD'
}
