import { supabase } from "../config/supabase-client";
import { getOrCreatePseudoUserId } from "../utils/random";

import { subDays, format } from "date-fns";
// button types: call, share, whatsapp, direction, whatsapp

/**
 * The Interaction interface represents a record in the interaction_metrics table.
 */

export enum ButtonType {
  CALL = "call",
  SHARE = "share",
  WHATSAPP = "whatsapp",
  DIRECTION = "direction",
}

export interface Interaction {
  id?: number;
  restaurant_id?: string;
  location_id?: string;
  screen_name?: string;
  button_type: ButtonType;
  click_count?: number;
  created_at?: string;
}

type GetInteractions = {
  restaurant_id?: string;
  location_id?: string;
  button_type?: ButtonType;
  start_date?: string;
  end_date?: string;
};

/**
 * InteractionService provides CRUD operations for the `interaction_metrics` table.
 */
class InteractionService {
  /**
   * Create a new interaction record.
   */
  static async create(
    interaction: Omit<Interaction, "id" | "created_at" | "record_period">
  ): Promise<{ success: boolean; data?: Interaction[]; error?: string }> {
    try {
      const pseudoUserId = getOrCreatePseudoUserId();
      if (!pseudoUserId) {
        return { success: false, error: "Pseudo-user ID not available" };
      }

      // Calculate the 2-day period for this interaction using UTC
      const today = new Date();
      const utcToday = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate()
        )
      );
      const recordPeriod = subDays(utcToday, 2);
      console.log("recordPeriod", recordPeriod);
      const recordPeriodStr = format(recordPeriod, "yyyy-MM-dd"); // ISO formatted timestamp

      // Check if a record already exists within this period
      const { data: existing, error: queryError } = await supabase
        .from("interaction_metrics")
        .select("*")
        .eq("pseudo_user_id", pseudoUserId)
        .eq("button_type", interaction.button_type)
        .eq("record_period", recordPeriodStr)
        .single();

      if (queryError && queryError.code !== "PGRST116") {
        // Ignore "no rows found" error
        console.error(
          "Error checking for existing interaction:",
          queryError.message
        );
        return { success: false, error: queryError.message };
      }

      if (existing) {
        // If an interaction exists in this 15-day window, update the click_count
        const { data: updated, error: updateError } = await supabase
          .from("interaction_metrics")
          .update({ click_count: (existing.click_count || 1) + 1 })
          .eq("id", existing.id)
          .select();

        if (updateError) throw updateError;

        return { success: true, data: updated };
      } else {
        // Otherwise, insert a new record
        const { data, error } = await supabase
          .from("interaction_metrics")
          .insert([
            {
              ...interaction,
              pseudo_user_id: pseudoUserId,
              record_period: recordPeriodStr,
              click_count: 1,
            },
          ])
          .select();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (err: any) {
      console.error("Error creating interaction:", err.message);
      return { success: false, error: err.message };
    }
  }
  /**
   * Retrieve a list of interactions.
   * Optionally filter by restaurant_id, location_id, or button_type.
   */
  static async get(options: GetInteractions): Promise<{
    success: boolean;
    data?: Interaction[];
    error?: string;
  }> {
    try {
      let query = supabase.from("interaction_metrics").select("*");

      if (options?.restaurant_id) {
        query = query.eq("restaurant_id", options.restaurant_id);
      }
      if (options?.location_id) {
        query = query.eq("location_id", options.location_id);
      }
      if (options?.button_type) {
        query = query.eq("button_type", options.button_type);
      }

      if (options?.start_date && options?.end_date) {
        query = query
          .gte("created_at", options.start_date)
          .lte("created_at", options.end_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("Error fetching interactions:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Retrieve a single interaction by its primary key (id).
   */
  static async getById(
    id: number
  ): Promise<{ success: boolean; data?: Interaction; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("interaction_metrics")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("Error fetching interaction:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update an existing interaction record by id.
   */
  static async update(
    id: number,
    updates: Partial<Omit<Interaction, "id" | "created_at">>
  ): Promise<{ success: boolean; data?: Interaction[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("interaction_metrics")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("Error updating interaction:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete an interaction record by id.
   */
  static async delete(
    id: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("interaction_metrics")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting interaction:", err.message);
      return { success: false, error: err.message };
    }
  }
}

export default InteractionService;
