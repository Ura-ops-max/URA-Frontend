
import { 
  MapPin, Phone, Globe, Clock,
  Calendar, Mail, User, Store, ArrowRight,
  ChevronRight, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutTabProps {
  profile: any; // The full response you shared
  viewType: 'user' | 'business'; // To determine which perspective we are in
}

export const AboutTab = ({ profile, viewType }: AboutTabProps) => {
  const { user, business } = profile;

  // 1. Logic for Personal User View
  if (viewType === 'user') {
    return (
      <div className="flex flex-col gap-6 p-4 lg:p-0 max-w-3xl mx-auto">
        {/* BIO SECTION */}
        <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <User size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">About {user.firstName}</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {user.bio || "No bio provided yet."}
          </p>
        </section>

        {/* BUSINESS OWNER SHORTCUT (If user owns a business) */}
        {user.isBusinessOwner && business && (
          <div className="group relative bg-orange-600 rounded-[32px] p-6 text-white overflow-hidden shadow-xl">
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Store size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Visit {business.businessName}</h4>
                    <p className="text-orange-100 text-xs">Official Business Profile</p>
                  </div>
                </div>
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </div>
             {/* Decorative circles */}
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
        )}

        {/* ACCOUNT DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard icon={<Calendar size={18}/>} label="Joined" value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
          <InfoCard icon={<Mail size={18}/>} label="Email Status" value={user.emailVerified ? "Verified Account" : "Basic Account"} />
        </div>
      </div>
    );
  }

  // 2. Logic for Business View
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-0">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ABOUT & CONTACT */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-[32px] p-8 border border-gray-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4">The Story</h3>
            <p className="text-gray-600 text-lg leading-relaxed italic">
              "{business.about}"
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContactCard 
              icon={<Phone size={20} className="text-blue-500"/>} 
              label="Phone" 
              value={business.contact?.phone || "N/A"} 
              action={`tel:${business.contact?.phone}`}
            />
            <ContactCard 
              icon={<Globe size={20} className="text-purple-500"/>} 
              label="Website" 
              value={business.contact?.website?.replace('http://', '') || "N/A"} 
              action={business.contact?.website}
            />
          </div>

          {/* MAP PLACEHOLDER */}
          <section className="bg-gray-100 rounded-[32px] overflow-hidden h-[300px] relative group border-4 border-white shadow-inner">
             <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={40} className="mx-auto text-gray-400 mb-2 group-hover:bounce transition-all" />
                  <p className="text-gray-500 font-bold text-sm px-10">{business.address?.fullAddress}</p>
                </div>
             </div>
             {/* Open in Google Maps overlay */}
             <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address?.fullAddress)}`}
              target="_blank"
              className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2 hover:bg-black hover:text-white transition-all"
             >
               OPEN IN GOOGLE MAPS <ExternalLink size={14}/>
             </a>
          </section>
        </div>

        {/* RIGHT COLUMN: OPERATING HOURS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 sticky top-4">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={20} className="text-orange-500" />
              <h3 className="font-black text-gray-900">Operating Hours</h3>
            </div>
            
            <div className="space-y-3">
              {business.operatingHours?.map((slot: any) => {
                const isToday = slot.day === today;
                const isClosed = slot.open === "Closed";
                
                return (
                  <div 
                    key={slot._id} 
                    className={cn(
                      "flex justify-between items-center p-3 rounded-2xl transition-all",
                      isToday ? "bg-orange-50 border border-orange-100" : "bg-transparent"
                    )}
                  >
                    <span className={cn("text-sm font-bold", isToday ? "text-orange-600" : "text-gray-500")}>
                      {slot.day}
                    </span>
                    <span className={cn("text-sm font-black", isClosed ? "text-red-400" : "text-gray-900")}>
                      {isClosed ? "Closed" : `${slot.open} - ${slot.close}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Small components
const InfoCard = ({ icon, label, value }: any) => (
  <div className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 flex items-center gap-4">
    <div className="text-orange-500">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ContactCard = ({ icon, label, value, action }: any) => (
  <a href={action} target="_blank" className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[24px] hover:shadow-md transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-all">{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-gray-300" />
  </a>
);