import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { UserSettings, UserLocation } from '../types';

interface PrayerTimesWidgetProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({ settings, onUpdateSettings }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Use location from settings or default to Makkah
  useEffect(() => {
    const latitude = settings.location?.latitude ?? 21.4225;
    const longitude = settings.location?.longitude ?? 39.8262;
    
    const coords = new Coordinates(latitude, longitude);
    const params = CalculationMethod.MuslimWorldLeague();
    const date = new Date();
    const times = new PrayerTimes(coords, date, params);
    setPrayerTimes(times);
  }, [settings.location]);

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);
      const name = data.city ? `${data.city}، ${data.country}` : 'موقعك الحالي';
      
      const newLocation: UserLocation = {
        latitude,
        longitude,
        name
      };

      onUpdateSettings({
        ...settings,
        location: newLocation
      });
    } catch (error) {
      console.error("Geolocation error:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!prayerTimes) return null;

  const times = [
    { name: 'الفجر', time: formatTime(prayerTimes.fajr) },
    { name: 'الظهر', time: formatTime(prayerTimes.dhuhr) },
    { name: 'العصر', time: formatTime(prayerTimes.asr) },
    { name: 'المغرب', time: formatTime(prayerTimes.maghrib) },
    { name: 'العشاء', time: formatTime(prayerTimes.isha) },
  ];

  const currentLocationName = settings.location?.name || 'مكة المكرمة';

  return (
    <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-3xl p-6 text-white shadow-lg border border-white/10 relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
            <Clock size={20} />
          </div>
          <h3 className="font-bold text-lg">مواقيت الصلاة</h3>
        </div>
        <button 
          onClick={requestLocation}
          disabled={isLoadingLocation}
          className="flex items-center gap-1.5 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
          title="تحديث الموقع"
        >
          <MapPin size={10} className={isLoadingLocation ? "animate-pulse" : ""} />
          <span>{isLoadingLocation ? 'جاري التحديد...' : currentLocationName}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-5 gap-2 relative z-10">
        {times.map((t, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 p-2 rounded-2xl transition-colors border border-white/5">
            <p className="text-[10px] opacity-70 font-medium">{t.name}</p>
            <p className="font-bold text-xs sm:text-sm">{t.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
