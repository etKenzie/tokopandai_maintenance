import { supabase } from "@/lib/supabaseClient";

export interface InvoiceRecord {
  id?: string;
  start_date: string;
  end_date: string;
  due_date: string;
  date: string;
  company: string;
  invoice_no: string;
  table_data: {
    headers: string[];
    rows: string[][];
  };
  created_at?: string;
  updated_at?: string;
}

export class InvoiceDatabaseService {
  static async createInvoice(
    invoiceData: Omit<InvoiceRecord, "id" | "created_at" | "updated_at">
  ): Promise<InvoiceRecord | null> {
    const { data, error } = await supabase.from("invoices").insert([invoiceData]).select().single();

    if (error) {
      console.error("Error inserting invoice:", error);
      throw error;
    }
    return data;
  }

  static async fetchInvoices(): Promise<InvoiceRecord[]> {
    const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
    return data || [];
  }

  static async updateInvoice(id: string, invoiceData: Partial<InvoiceRecord>): Promise<InvoiceRecord | null> {
    const { data, error } = await supabase.from("invoices").update(invoiceData).eq("id", id).select().single();

    if (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
    return data;
  }

  static async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  static async checkOverlappingPeriods(
    company: string,
    startDate: string,
    endDate: string,
    excludeInvoiceId?: string
  ): Promise<InvoiceRecord[]> {
    let query = supabase
      .from("invoices")
      .select("*")
      .eq("company", company)
      .filter("start_date", "lte", endDate)
      .filter("end_date", "gte", startDate);

    if (excludeInvoiceId) {
      query = query.neq("id", excludeInvoiceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking overlapping periods:", error);
      throw error;
    }
    return data || [];
  }
}
