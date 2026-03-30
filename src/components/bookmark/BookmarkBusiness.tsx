
import { useBookmarkedItems } from "@/hooks/api/use-bookmark";
import { Loader2, Store } from "lucide-react";
import { BookmarkBusinessCard } from "./BookmarkBusinessCard";


export default function BookmarkedBusinesses() {
    const { data: businesses, isLoading } = useBookmarkedItems('Business');
// 1. Initialize the hook here at the TOP LEVEL
    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>;

    if (!businesses || businesses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                <Store className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">You haven't followed any stores yet.</p>
            </div>
        );
    }

return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businesses.map((biz: any) => (
        <BookmarkBusinessCard key={biz._id} biz={biz} />
      ))}
    </div>
  );
}