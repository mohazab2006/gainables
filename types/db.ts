export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          sort_order: number;
          visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          sort_order?: number;
          visible?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faqs"]["Insert"]>;
        Relationships: [];
      };
      ride_updates: {
        Row: {
          id: string;
          created_at: string;
          location: string;
          km_completed: number;
          next_checkpoint: string;
          message: string;
          lat: number | null;
          lng: number | null;
          media_url: string | null;
          media_kind: "image" | "video" | null;
          media_alt: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          location: string;
          km_completed: number;
          next_checkpoint: string;
          message: string;
          lat?: number | null;
          lng?: number | null;
          media_url?: string | null;
          media_kind?: "image" | "video" | null;
          media_alt?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ride_updates"]["Insert"]>;
        Relationships: [];
      };
      ride_positions: {
        Row: {
          id: string;
          recorded_at: string;
          lon: number;
          lat: number;
          accuracy_m: number | null;
          speed_mps: number | null;
          battery_pct: number | null;
          source: string;
          raw: Json | null;
        };
        Insert: {
          id?: string;
          recorded_at?: string;
          lon: number;
          lat: number;
          accuracy_m?: number | null;
          speed_mps?: number | null;
          battery_pct?: number | null;
          source?: string;
          raw?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["ride_positions"]["Insert"]>;
        Relationships: [];
      };
      site_content: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_content"]["Insert"]>;
        Relationships: [];
      };
      sponsors: {
        Row: {
          id: string;
          name: string;
          tier: "lead" | "supporting" | "community";
          logo_url: string | null;
          link: string | null;
          sort_order: number;
          visible: boolean;
          tagline: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tier: "lead" | "supporting" | "community";
          logo_url?: string | null;
          link?: string | null;
          sort_order?: number;
          visible?: boolean;
          tagline?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sponsors"]["Insert"]>;
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
