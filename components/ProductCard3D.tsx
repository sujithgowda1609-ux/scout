
import React from 'react';
import { ExternalLink, ShieldCheck, ShoppingCart } from 'lucide-react';
import { DetectedObject } from '../types';

interface ProductCard3DProps {
  product: DetectedObject;
}

const ProductCard3D: React.FC<ProductCard3DProps> = ({ product }) => {
  return (
    <div className="group relative w-full perspective-1000">
      <div className="relative glass p-4 rounded-2xl transition-all duration-500 transform-gpu group-hover:-rotate-y-12 group-hover:scale-105 group-hover:shadow-[20px_20px_60px_-15px_rgba(255,0,0,0.3)] border-white/5 group-hover:border-red-500/30">
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-white/5">
          <img 
            src={product.imageUrl} 
            alt={product.label} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="bg-green-500/20 backdrop-blur-md text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
              <ShieldCheck size={10} /> {(product.confidence * 100).toFixed(0)}% MATCH
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-red-400 transition-colors">
            {product.label}
          </h3>
          <div className="flex flex-wrap gap-2 py-2">
            {Object.entries(product.attributes).map(([key, value]) => value && (
              <span key={key} className="text-[10px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-0.5 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => window.open(product.flipkartUrl, '_blank')}
          className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all transform active:scale-95 group/btn overflow-hidden relative"
        >
          <ShoppingCart size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          <span>Buy on Flipkart</span>
          <ExternalLink size={14} className="opacity-50" />
          
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard3D;
