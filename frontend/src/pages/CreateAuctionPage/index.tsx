// index.tsx — CreateAuctionPage entry point
// Composes: AuctionForm + TipsSidebar
// Owns: form state (via hook), image list, submit + draft handlers
import { useState, useCallback } from 'react';
import { useFormState } from './useFormState';
import AuctionForm from './AuctionForm';
import TipsSidebar from './TipsSidebar';
import type { CreateAuctionDTO } from '../../types/auction';

export default function CreateAuctionPage() {
  const { form, setField, isValid } = useFormState();
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const payload: CreateAuctionDTO = { ...form, imageUrls: images };
    // TODO: auctionService.create(payload)
    console.log('Submit:', payload);
  }, [form, images, isValid]);

  const handleSaveDraft = useCallback(() => {
    const draft: CreateAuctionDTO = { ...form, imageUrls: images };
    // TODO: persist draft
    console.log('Draft:', draft);
  }, [form, images]);

  return (
    <main className="pt-16 pb-24 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
      <div className="flex-grow max-w-3xl">
        <header className="mb-12 pt-8">
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
            Curate a New Lot
          </h1>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed">
            Present your piece to the world's most discerning collectors. Precision in detail ensures the highest final hammer price.
          </p>
        </header>
        <AuctionForm
          form={form}
          setField={setField}
          isValid={isValid}
          onImagesChange={setImages}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </div>
      <TipsSidebar />
    </main>
  );
}
