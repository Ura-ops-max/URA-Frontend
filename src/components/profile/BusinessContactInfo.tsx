import { cn } from "@/lib/utils";
import { MapPin, Phone, Globe, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";

export const BusinessContactInfo = ({ business }: { business: any }) => {
  const [showAllHours, setShowAllHours] = useState(false);

  // Get current day name (e.g., "Monday")
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todaySchedule = business.operatingHours?.find((h: any) => h.day === todayName);
  const isOpenToday = todaySchedule?.open !== "Closed";

  // Google Map URL Generation (using the text address)
  const encodedAddress = encodeURIComponent(business.address?.fullAddress || "");
  // const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;
  // NOTE: If you don't have an API key yet, use the "search" link version:
  const simpleMapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 pt-6 border-t border-gray-100 mt-2">
      
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Reach Us</h4>
      
      <div className="space-y-4">
        {/* Basic Info Rows */}
        <div className="space-y-2">
          {business.address?.fullAddress && (
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-orange-500 mt-0.5" />
              <span className="text-sm text-gray-700 leading-tight">{business.address.fullAddress}</span>
            </div>
          )}
          {business.contact?.phone && <InfoRow icon={<Phone size={16} />} text={business.contact.phone} />}
          {business.contact?.website && (
            <InfoRow 
              icon={<Globe size={16} />} 
              text={business.contact.website.replace(/^https?:\/\//, '')} 
              link={business.contact.website} 
            />
          )}
        </div>

        {/* OPENING HOURS SECTION */}
        {business.operatingHours && business.operatingHours.length >=1 &&(
          <div className="bg-gray-50 rounded-2xl p-4 border-b space-y-4">
            <button 
              onClick={() => setShowAllHours(!showAllHours)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-3">
                <Clock size={18} className={isOpenToday ? "text-green-500" : "text-red-500"} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {isOpenToday ? `Open: ${todaySchedule.open} - ${todaySchedule.close}` : "Closed Today"}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">Business Hours</p>
                </div>
              </div>
              <ChevronDown 
                size={18} 
                className={cn("text-gray-400 transition-transform duration-300", showAllHours && "rotate-180")} 
              />
            </button>

            {/* Expandable Full Week Schedule */}
            {showAllHours && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 animate-fadeIn">
                {business.operatingHours.map((schedule: any) => (
                  <div 
                    key={schedule._id} 
                    className={cn(
                      "flex justify-between items-center text-xs",
                      schedule.day === todayName ? "font-bold text-orange-600" : "text-gray-600"
                    )}
                  >
                    <span>{schedule.day}</span>
                    <span>
                      {schedule?.open === "Closed" ? "Closed" : `${schedule?.open} - ${schedule?.close}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GOOGLE MAP FRAME */}
        {business.address?.fullAddress && (
          <div className="w-full h-40 rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={simpleMapUrl}
              className="grayscale-[0.5] contrast-[1.1]"
            ></iframe>
          </div>
        )}


      </div>
    </div>
  );
};


const InfoRow = ({ icon, text, link }: { icon: React.ReactNode; text: string; link?: string }) => (
  <div className="flex items-center gap-3 text-[13px] text-gray-600 group">
    <div className="text-orange-500 shrink-0 bg-orange-50 p-1.5 rounded-lg">{icon}</div>
    {link ? (
      <a href={link} target="_blank" rel="noreferrer" className="hover:text-orange-600 font-medium truncate underline decoration-orange-200 underline-offset-4 decoration-2">{text}</a>
    ) : (
      <span className="font-medium line-clamp-1">{text}</span>
    )}
  </div>
);