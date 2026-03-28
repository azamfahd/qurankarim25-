import React, { useState, useEffect } from 'react';
import { X, Compass, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coordinates, Qibla } from 'adhan';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({ isOpen, onClose }) => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const fetchLocation = async () => {
        try {
          const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          const latitude = parseFloat(data.latitude);
          const longitude = parseFloat(data.longitude);
          const coords = new Coordinates(latitude, longitude);
          const direction = Qibla(coords);
          setQiblaDirection(direction);
        } catch (error) {
          console.error("Geolocation error for Qibla:", error);
        }
      };
      
      fetchLocation();

      // Listen for device orientation to rotate the compass
      const handleOrientation = (event: any) => {
        if (event.webkitCompassHeading) {
          // For iOS
          setRotation(event.webkitCompassHeading);
        } else if (event.alpha !== null) {
          // For Android
          setRotation(360 - event.alpha);
        }
      };

      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
      }

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="modal-backdrop flex items-center justify-center p-4 z-50" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">اتجاه القبلة</h2>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Compass Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-50 shadow-inner"></div>
              
              {/* Compass Face */}
              <motion.div 
                className="relative w-56 h-56 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center"
                style={{ rotate: -rotation }}
              >
                <div className="absolute top-2 font-black text-red-500 text-lg">N</div>
                <div className="absolute bottom-2 font-black text-gray-300 text-lg">S</div>
                <div className="absolute left-2 font-black text-gray-300 text-lg">W</div>
                <div className="absolute right-2 font-black text-gray-300 text-lg">E</div>
                
                {/* Qibla Indicator */}
                {qiblaDirection !== null && (
                  <motion.div 
                    className="absolute w-full h-full flex flex-col items-center pt-4"
                    style={{ rotate: qiblaDirection }}
                  >
                    <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm border-2 border-white z-20"></div>
                    <div className="w-1 h-24 bg-gradient-to-t from-green-500 to-transparent rounded-full -mt-2"></div>
                    <p className="text-[10px] font-bold text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">الكعبة</p>
                  </motion.div>
                )}
                
                <Compass size={48} className="text-gray-200" />
              </motion.div>
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 w-full">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm text-[var(--color-primary)]">
                  <MapPin size={18} />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ضع هاتفك بشكل مسطح وقم بتدويره حتى يشير المؤشر الأخضر إلى اتجاه الكعبة المشرفة.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
