import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Booking, mockBookings } from "@/data/bookings";

interface BookingRow {
  id: string;
  location_id: string;
  guest_name: string;
  email: string;
  phone: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  created_at: string;
}

const mapRow = (row: BookingRow): Booking => ({
  id: row.id,
  locationId: row.location_id,
  guestName: row.guest_name,
  email: row.email,
  phone: row.phone ?? "",
  checkIn: new Date(row.check_in),
  checkOut: new Date(row.check_out),
  guests: row.guests,
  status: (row.status as Booking["status"]) ?? "pending",
  createdAt: new Date(row.created_at),
});

export const useBookings = (demo = false) => {
  const [bookings, setBookings] = useState<Booking[]>(demo ? mockBookings : []);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (demo) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setBookings([]);
    } else {
      setError(null);
      setBookings((data as BookingRow[]).map(mapRow));
    }
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    if (demo) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      return { error: null };
    }
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
    return { error };
  };

  return { bookings, loading, error, refetch: fetchBookings, updateStatus };
};
