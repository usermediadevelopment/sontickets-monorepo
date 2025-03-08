/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/config/supabase/client";

export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  restaurantId: string;
  locationId: string;
}

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

  // Get all leads (Optional: Filter by restaurant_id)
  async getLeads(
    restaurant_id?: number
  ): Promise<{ success: boolean; data?: Lead[]; error?: string }> {
    try {
      let query = supabase.from("leads").select("*");

      if (restaurant_id) {
        query = query.eq("restaurant_id", restaurant_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
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
}

export default SBLeadsService;
