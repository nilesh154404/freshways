import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

type Option = {
  id?: number;
  name: string;
  additionalPrice: number;
  displayOrder: number;
  status: boolean;
};

type Group = {
  id?: number;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  isRequired: boolean;
  displayOrder: number;
  status: boolean;
  options: Option[];
};

export const ProductCustomizationsDialog = ({
  product,
  open,
  onOpenChange,
}: {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      if (product.customizationGroups) {
        setGroups(product.customizationGroups.map((g: any) => ({
          ...g,
          options: g.options || []
        })));
      } else {
        setGroups([]);
      }
    }
  }, [product, open]);

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        name: "",
        selectionType: "SINGLE",
        isRequired: false,
        displayOrder: groups.length,
        status: true,
        options: [],
      },
    ]);
  };

  const updateGroup = (index: number, field: string, value: any) => {
    const newGroups = [...groups];
    (newGroups[index] as any)[field] = value;
    setGroups(newGroups);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const addOption = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options.push({
      name: "",
      additionalPrice: 0,
      displayOrder: newGroups[groupIndex].options.length,
      status: true,
    });
    setGroups(newGroups);
  };

  const updateOption = (groupIndex: number, optionIndex: number, field: string, value: any) => {
    const newGroups = [...groups];
    (newGroups[groupIndex].options[optionIndex] as any)[field] = value;
    setGroups(newGroups);
  };

  const removeOption = (groupIndex: number, optionIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options.splice(optionIndex, 1);
    setGroups(newGroups);
  };

  const handleSave = async () => {
    if (!product) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/products/${product.id}/customizations`, groups);
      toast.success("Customizations saved successfully");
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save customizations");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Customizations for {product.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="border p-4 rounded-lg space-y-4 bg-muted/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    value={group.name}
                    onChange={(e) => updateGroup(groupIndex, "name", e.target.value)}
                    placeholder="e.g. Cooking Preference"
                  />
                </div>
                <div className="w-48 space-y-2">
                  <Label>Selection Type</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={group.selectionType}
                    onChange={(e) => updateGroup(groupIndex, "selectionType", e.target.value)}
                  >
                    <option value="SINGLE">Single Select (Radio)</option>
                    <option value="MULTIPLE">Multi Select (Checkbox)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox
                    id={`required-${groupIndex}`}
                    checked={group.isRequired}
                    onCheckedChange={(checked) => updateGroup(groupIndex, "isRequired", checked)}
                  />
                  <Label htmlFor={`required-${groupIndex}`}>Required</Label>
                </div>
                <Button variant="ghost" size="icon" className="mt-6" onClick={() => removeGroup(groupIndex)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="pl-6 border-l-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Options</Label>
                  <Button variant="outline" size="sm" onClick={() => addOption(groupIndex)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
                {group.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-3 bg-background p-2 rounded border">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Input
                      className="flex-1"
                      placeholder="Option Name (e.g. Extra Cheese)"
                      value={option.name}
                      onChange={(e) => updateOption(groupIndex, optionIndex, "name", e.target.value)}
                    />
                    <div className="flex items-center gap-2 w-32">
                      <span className="text-sm">₹</span>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={option.additionalPrice}
                        onChange={(e) => updateOption(groupIndex, optionIndex, "additionalPrice", Number(e.target.value))}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeOption(groupIndex, optionIndex)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full border-dashed" onClick={addGroup}>
            <Plus className="h-4 w-4 mr-2" /> Add Customization Group
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Customizations"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
