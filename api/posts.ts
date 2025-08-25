import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method, query, body } = req;

  try {
    switch (method) {
      case "GET":
        if (query.id) {
          const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("id", query.id)
            .single();
          if (error) return res.status(404).json({ error: error.message });
          return res.status(200).json(data);
        } else {
          const { data, error } = await supabase.from("posts").select("*");
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json(data);
        }

      case "POST":
        const { data: inserted, error: insertError } = await supabase
          .from("posts")
          .insert([body])
          .select()
          .single();
        if (insertError)
          return res.status(500).json({ error: insertError.message });
        return res.status(201).json(inserted);

      case "PUT":
        if (!query.id) return res.status(400).json({ error: "id required" });
        const { data: updated, error: updateError } = await supabase
          .from("posts")
          .update(body)
          .eq("id", query.id)
          .select()
          .single();
        if (updateError)
          return res.status(404).json({ error: updateError.message });
        return res.status(200).json(updated);

      case "DELETE":
        if (!query.id) return res.status(400).json({ error: "id required" });
        const { error: deleteError } = await supabase
          .from("posts")
          .delete()
          .eq("id", query.id);
        if (deleteError)
          return res.status(404).json({ error: deleteError.message });
        return res.status(200).json({ message: "Deleted successfully" });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
