
import React from 'react';
import { DetectedObject } from '../types';

interface ObjectOverlayProps {
  objects: DetectedObject[];
  visible: boolean;
  onSelectObject: (obj: DetectedObject) => void;
}

const ObjectOverlay: React.FC<ObjectOverlayProps> = ({ objects, visible, onSelectObject }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {objects.map((obj) => {
        // [ymin, xmin, ymax, xmax] normalized 0-1000
        const top = `${obj.box[0] / 10}%`;
        const left = `${obj.box[1] / 10}%`;
        const height = `${(obj.box[2] - obj.box[0]) / 10}%`;
        const width = `${(obj.box[3] - obj.box[1]) / 10}%`;

        return (
          <div
            key={obj.id}
            className="absolute border-2 border-red-500 group pointer-events-auto cursor-pointer flex flex-col justify-end"
            style={{ top, left, width, height }}
            onClick={() => onSelectObject(obj)}
          >
            {/* Animated Bounding Box Corner */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
            
            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-full">
              {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ObjectOverlay;
