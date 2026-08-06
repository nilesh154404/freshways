import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const CustomerProductCustomizationsDialog = ({
  product,
  open,
  baseAmount,
  onOpenChange,
  onConfirm,
}: {
  product: any;
  open: boolean;
  baseAmount: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (finalAmount: number, notesText: string) => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | number[]>>({});

  useEffect(() => {
    if (open) {
      setSelectedOptions({});
    }
  }, [open, product]);

  if (!product) return null;

  const handleSingleSelect = (groupId: number, optionId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: optionId
    }));
  };

  const handleMultiSelect = (groupId: number, optionId: number, checked: boolean) => {
    setSelectedOptions(prev => {
      const current = (prev[groupId] as number[]) || [];
      if (checked) {
        return { ...prev, [groupId]: [...current, optionId] };
      } else {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      }
    });
  };

  const calculateFinalAmountAndNotes = () => {
    let extraAmount = 0;
    const notesParts: string[] = [];

    const groups = product.customizationGroups || [];
    for (const group of groups) {
      const selection = selectedOptions[group.id];
      if (!selection) continue;

      if (group.selectionType === 'SINGLE') {
        const opt = group.options.find((o: any) => o.id === selection);
        if (opt) {
          extraAmount += Number(opt.additionalPrice);
          notesParts.push(opt.name);
        }
      } else {
        const selectedIds = selection as number[];
        for (const optId of selectedIds) {
          const opt = group.options.find((o: any) => o.id === optId);
          if (opt) {
            extraAmount += Number(opt.additionalPrice);
            notesParts.push(opt.name);
          }
        }
      }
    }

    return {
      finalAmount: baseAmount + extraAmount,
      notesText: notesParts.join(", ")
    };
  };

  const handleConfirm = () => {
    const { finalAmount, notesText } = calculateFinalAmountAndNotes();
    onConfirm(finalAmount, notesText);
    onOpenChange(false);
  };

  const { finalAmount } = calculateFinalAmountAndNotes();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {product.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {(product.customizationGroups || []).map((group: any) => (
            <div key={group.id} className="space-y-3">
              <div className="font-semibold">{group.name} {group.isRequired && <span className="text-red-500">*</span>}</div>
              
              {group.selectionType === 'SINGLE' ? (
                <RadioGroup 
                  value={selectedOptions[group.id]?.toString()} 
                  onValueChange={(val) => handleSingleSelect(group.id, Number(val))}
                >
                  {group.options.map((opt: any) => (
                    <div key={opt.id} className="flex items-center justify-between space-x-2 border p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.id.toString()} id={`opt-${opt.id}`} />
                        <Label htmlFor={`opt-${opt.id}`}>{opt.name}</Label>
                      </div>
                      {Number(opt.additionalPrice) > 0 && (
                        <span className="text-sm text-muted-foreground">+₹{opt.additionalPrice}</span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {group.options.map((opt: any) => {
                    const isChecked = ((selectedOptions[group.id] as number[]) || []).includes(opt.id);
                    return (
                      <div key={opt.id} className="flex items-center justify-between space-x-2 border p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`opt-${opt.id}`} 
                            checked={isChecked}
                            onCheckedChange={(checked) => handleMultiSelect(group.id, opt.id, checked as boolean)}
                          />
                          <Label htmlFor={`opt-${opt.id}`}>{opt.name}</Label>
                        </div>
                        {Number(opt.additionalPrice) > 0 && (
                          <span className="text-sm text-muted-foreground">+₹{opt.additionalPrice}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-lg">Total: ₹{finalAmount}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Add to List</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
