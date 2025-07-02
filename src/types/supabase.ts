export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          icon: string | null;
          is_default: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          icon?: string | null;
          is_default?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          icon?: string | null;
          is_default?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          amount: number;
          description: string | null;
          date: string;
          category_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          description?: string | null;
          date: string;
          category_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          category_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
