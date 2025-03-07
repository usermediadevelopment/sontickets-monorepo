import { supabase } from "../config/supabase-client";

export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  restaurantId: string;
  locationId: string;
  createdAt?: string;
}

type GetLeads = {
  restaurantId?: string;
  filters?: LeadFilters;
};
// Get all leads (Optional: Filter by restaurant_id)
type LeadFilters = {
  dateRange?: { startDate: string; endDate: string };
  locationId?: string;
};

class SBLeadsService {
  // Create a new lead
  async create(
    lead: Lead
  ): Promise<{ success: boolean; data?: Lead[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            restaurant_id: lead.restaurantId,
            location_id: lead.locationId,
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating lead:", error.message);
      return { success: false, error: error.message };
    }
  }

  async getLeads({ restaurantId, filters }: GetLeads): Promise<{
    success: boolean;
    data?: Lead[];
    error?: string;
  }> {
    try {
      // add a filter by range of dates(created_at)
      let query = supabase.from("leads").select("*").order("created_at", {
        ascending: false,
      });
      if (filters?.dateRange?.startDate && filters?.dateRange?.endDate) {
        query = query
          .gte("created_at", filters.dateRange?.startDate)
          .lte("created_at", filters.dateRange?.endDate);
      }
      if (filters?.locationId) {
        query = query.eq("location_id", filters.locationId);
      }

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;
      const dataMapped = data?.map((item) => {
        return {
          id: Number(item.id) ?? 0,
          name: item.name ?? "",
          email: item.email ?? "",
          phone: item.phone ?? "",
          restaurantId: item.restaurant_id ?? "",
          locationId: item.location_id ?? "",
          createdAt: item.created_at ?? "",
        };
      });

      if (error) throw error;
      return { success: true, data: dataMapped };
    } catch (error: any) {
      console.error("Error fetching leads:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Get a single lead by ID
  async getLeadById(
    leadId: number
  ): Promise<{ success: boolean; data?: Lead; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching lead:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Update an existing lead
  async update(
    leadId: number,
    updates: Partial<Lead>
  ): Promise<{ success: boolean; data?: Lead[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating lead:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Delete a lead
  async delete(leadId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", leadId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting lead:", error.message);
      return { success: false, error: error.message };
    }
  }

  suscribeToInsertLeads(
    restaurantId: string,
    callback?: (payload: Lead) => void
  ) {
    console.log("restaurantId", restaurantId);
    const channels = supabase
      .channel("leads-insert-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const newPayload = {
            id: Number(payload.new.id),
            name: payload.new.name ?? "",
            email: payload.new.email ?? "",
            phone: payload.new.phone ?? "",
            restaurantId: payload.new.restaurant_id ?? "",
            locationId: payload.new.location_id ?? "",
            createdAt: payload.new.created_at,
          };
          console.log("New lead inserted:", newPayload);
          callback && callback(newPayload);
        }
      )
      .subscribe();

    return channels;
  }
}

export default SBLeadsService;
