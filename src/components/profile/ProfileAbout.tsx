
import { MapPin, Phone, Globe, Clock, User, Store, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ProfileAboutProps {
  profile: any; // Using the ProfileResponse structure
  isBusinessPage: boolean; // Explicitly pass the context of the current view
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({ profile, isBusinessPage }) => {
  const { user, business } = profile;

  // VIEW A: USER PROFILE CONTEXT
  if (!isBusinessPage) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* User Bio Card */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
            <User size={18} className="text-orange-500" />
            <h3>Personal Bio</h3>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
            {user?.bio || "No bio added yet."}
          </p>
        </section>

        {/* Business Link (Only if viewing a user who happens to own a business) */}
        {user?.isBusinessOwner && business && (
          <button className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100 group transition-all hover:bg-orange-100">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Store size={20} className="text-orange-600" />
              </div>
              <div>

                <p className="text-[10px] font-black text-orange-400 uppercase tracking-tighter">View Official Business</p>
                <p className="text-sm font-bold text-gray-900">{business.businessName}</p>


              </div>
            </div>
            <Link
              to={`/dashboard/profile/business/${business._id}`}
            >
              <ChevronRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />

            </Link>
          </button>
        )}
      </div>
    );
  }

  // VIEW B: BUSINESS PAGE CONTEXT
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* About Section */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 uppercase text-[11px] tracking-widest text-orange-500">
          About the Business
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm italic">
          "{business?.about || "Welcome to our store. We provide quality service and products."}"
        </p>
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address */}
        {business?.address?.fullAddress && (
          <DetailItem
            icon={<MapPin size={18} />}
            label="Location"
            content={business.address.fullAddress}
          />
        )}

        {/* Contact */}
        {business?.contact?.phone && (
          <DetailItem
            icon={<Phone size={18} />}
            label="Phone"
            content={business.contact.phone}
            isLink
            href={`tel:${business.contact.phone}`}
          />
        )}

        {/* Website */}
        {business?.contact?.website && (
          <DetailItem
            icon={<Globe size={18} />}
            label="Website"
            content={business.contact.website.replace(/^https?:\/\//, '')}
            isLink
            href={business.contact.website}
          />
        )}

        {/* Operating Hours */}
        {business?.operatingHours && (
          <DetailItem
            icon={<Clock size={18} />}
            label="Business Hours"
            content="Check full schedule below"
          />
        )}
      </div>

      {/* Operating Hours List (Detailed) */}
      {business?.operatingHours?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-[11px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <Clock size={14} /> Daily Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {business.operatingHours.map((slot: any) => (
              <div key={slot._id} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                <span className="font-medium text-gray-500">{slot.day}</span>
                <span className={cn("font-bold", slot.open === "Closed" ? "text-red-400" : "text-gray-900")}>
                  {slot.open === "Closed" ? "Closed" : `${slot.open} - ${slot.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Preview */}
      {/* Google Map Preview - No API Key Version */}
      {business?.address?.fullAddress && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden h-60 border border-gray-100 shadow-sm relative group">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                business.address.fullAddress
              )}&output=embed`}
              title="Business Location"
              className="grayscale hover:grayscale-0 transition-all duration-700 contrast-110"
            />
          </div>

          {/* Action Button for Mobile Users */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address.fullAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-colors"
          >
            <MapPin size={14} />
            OPEN IN GOOGLE MAPS APP
          </a>
        </div>
      )}


    </div>
  );
};

// Internal Helper Component
const DetailItem = ({ icon, label, content, isLink, href }: any) => (
  <div className="bg-white p-4 rounded-xl border border-gray-50 flex items-start gap-3">
    <div className="text-orange-500 mt-1">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
      {isLink ? (
        <a href={href} target="_blank" className="text-sm font-bold text-gray-900 hover:text-orange-600 truncate block">
          {content}
        </a>
      ) : (
        <p className="text-sm font-bold text-gray-900 leading-tight">{content}</p>
      )}
    </div>
  </div>
);

export default ProfileAbout;