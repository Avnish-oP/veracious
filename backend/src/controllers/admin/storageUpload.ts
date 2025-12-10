import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client with Service Role Key for Admin privileges
// specific to Backend operations.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const getUploadUrl = async (req: Request, res: Response) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required",
      });
    }

    // Sanitize filename or create a unique path
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = filename.split(".").pop();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, "_");
    const path = `products/${cleanFilename}-${uniqueSuffix}.${extension}`;

    // Generate Signed Upload URL
    // Valid for 60 seconds
    const { data, error } = await supabase.storage
      .from("otticamart")
      .createSignedUploadUrl(path);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      url: data.signedUrl,
      path: data.path, // Store this path or full URL in DB
      fullUrl: `${supabaseUrl}/storage/v1/object/public/otticamart/${data.path}`, // Assuming public bucket for products
    });
  } catch (error: any) {
    console.error("Supabase Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate upload URL",
      error: error.message,
    });
  }
};
