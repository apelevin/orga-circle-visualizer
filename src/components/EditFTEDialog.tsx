
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

const formSchema = z.object({
  fte: z
    .number()
    .min(0.1, { message: "FTE must be at least 0.1" })
    .max(3, { message: "FTE cannot be more than 3" })
});

interface EditFTEDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFTE: number) => void;
  title: string;
  description: string;
  currentFTE: number;
  entityName: string;
  entityType: 'role' | 'person';
}

const EditFTEDialog: React.FC<EditFTEDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  description,
  currentFTE,
  entityName,
  entityType
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fte: currentFTE
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      onSave(values.fte);
      toast.success(`Updated ${entityType === 'role' ? 'role' : 'person'} FTE successfully`);
      onClose();
    } catch (error) {
      toast.error(`Failed to update FTE: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="fte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FTE Value for {entityName}</FormLabel>
                  <div className="space-y-4">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="3"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <Slider
                      value={[field.value]}
                      min={0.1}
                      max={3}
                      step={0.1}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFTEDialog;
