import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = {
  id: number;
  label: string;
  description: string;
  productUrl?: string;
  measurementUnit?: string;
  measurementValue?: string;
};

type ServiceOffering = {
  serviceCode: string;
  serviceName: string;
  description: string;
  products: Product[];
};

const ServiceOfferings = () => {
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffering | null>(
    null
  );
  const [formData, setFormData] = useState({
    serviceCode: "",
    serviceName: "",
    description: "",
  });

  const [selectedService, setSelectedService] = useState<ServiceOffering | null>(
    null
  );

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get<ServiceOffering[]>(
        "http://localhost:3064/service-offerings"
      );
      setServices(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load service offerings");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ serviceCode: "", serviceName: "", description: "" });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        // Update service
        await axios.patch(
          `http://localhost:3064/service-offerings/${editingService.serviceCode}`,
          formData
        );
        toast.success("Service updated successfully");
      } else {
        // Create service
        await axios.post(
          `http://localhost:3064/service-offerings`,
          formData
        );
        toast.success("Service created successfully");
      }
      fetchServices();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save service");
    }
  };

  const handleEdit = (service: ServiceOffering) => {
    setEditingService(service);
    setFormData({
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      description: service.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceCode: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await axios.delete(
        `http://localhost:3064/service-offerings/${serviceCode}`
      );
      setServices(services.filter((s) => s.serviceCode !== serviceCode));
      toast.success("Service deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Service Offerings</h2>
            <p className="text-muted-foreground">
              Manage services and their products
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
                <DialogDescription>
                  {editingService
                    ? "Update service details"
                    : "Create a new service offering"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="serviceCode">Service Code</Label>
                    <Input
                      id="serviceCode"
                      value={formData.serviceCode}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceCode: e.target.value })
                      }
                      placeholder="Enter service code"
                      required
                      disabled={!!editingService} // can't change code on edit
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input
                      id="serviceName"
                      value={formData.serviceName}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceName: e.target.value })
                      }
                      placeholder="Enter service name"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Enter description"
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? "Update" : "Add"} Service
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p>Loading services...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.serviceCode} className="relative">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{service.serviceName}</CardTitle>
                      <CardDescription className="text-sm mb-2">
                        {service.description}
                      </CardDescription>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mb-2"
                        onClick={() => setSelectedService(service)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Products (
                        {service.products.length})
                      </Button>

                      {selectedService?.serviceCode === service.serviceCode && (
                        <div className="mt-2 space-y-2 max-h-64 overflow-auto border p-2 rounded">
                          {service.products.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between border-b py-1"
                            >
                              <div>
                                <p className="font-medium">{p.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {p.description} - {p.measurementValue}{" "}
                                  {p.measurementUnit}
                                </p>
                              </div>
                              {p.productUrl && (
                                <img
                                  src={p.productUrl}
                                  alt={p.label}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.serviceCode)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceOfferings;
