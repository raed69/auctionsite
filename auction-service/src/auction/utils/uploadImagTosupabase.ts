import { BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service'; // Import SupabaseService

// Function to upload image to Supabase and return the public URL
export async function uploadImageToSupabase(
  image: Express.Multer.File,
  supabaseService: SupabaseService,
): Promise<string> {
  const supabase = supabaseService.getClient(); // Use the SupabaseService instance passed as a parameter
  const fileName = `auctions/${Date.now()}-${image.originalname}`;

  // Upload the image to Supabase storage
  const { error } = await supabase.storage
    .from('auction-images') // Your Supabase storage bucket
    .upload(fileName, image.buffer, {
      contentType: image.mimetype,
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    throw new BadRequestException('Image upload failed: ' + error.message);
  }

  // Get the public URL of the uploaded image
  const { data } = supabase.storage
    .from('auction-images')
    .getPublicUrl(fileName);

  if (!data) {
    throw new BadRequestException('Error fetching public URL');
  }

  return data.publicUrl; // Return the public URL of the uploaded image
}
