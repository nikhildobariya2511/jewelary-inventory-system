"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  _id?: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

interface Type {
  _id?: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newType, setNewType] = useState({ name: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategoriesAndTypes();
  }, []);

  const fetchCategoriesAndTypes = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        setTypes(data.types || []);
      }
    } catch (error) {
      console.error("Error fetching categories and types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories and types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (category: Category) => {
    try {
      const { _id, ...categoryData } = category;
      const method = _id ? "PUT" : "POST";
      const url = _id ? `/api/categories/${_id}` : "/api/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...categoryData, type: "category" }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Category ${
            category._id ? "updated" : "created"
          } successfully`,
        });
        fetchCategoriesAndTypes();
        setEditingCategory(null);
        setNewCategory({ name: "", description: "" });
      } else {
        throw new Error("Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const saveType = async (type: Type) => {
    try {
      const { _id, ...typeData } = type;
      const method = _id ? "PUT" : "POST";
      const url = _id ? `/api/categories/${_id}` : "/api/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...typeData, type: "type" }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Type ${type._id ? "updated" : "created"} successfully`,
        });
        fetchCategoriesAndTypes();
        setEditingType(null);
        setNewType({ name: "", description: "" });
      } else {
        throw new Error("Failed to save type");
      }
    } catch (error) {
      console.error("Error saving type:", error);
      toast({
        title: "Error",
        description: "Failed to save type",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        fetchCategoriesAndTypes();
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const deleteType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this type?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Type deleted successfully",
        });
        fetchCategoriesAndTypes();
      } else {
        throw new Error("Failed to delete type");
      }
    } catch (error) {
      console.error("Error deleting type:", error);
      toast({
        title: "Error",
        description: "Failed to delete type",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new jewelry category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="e.g., Gold, Silver, Diamond"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="Category description"
                  />
                </div>
                <Button
                  onClick={() =>
                    saveCategory({ ...newCategory, isActive: true })
                  }
                  disabled={!newCategory.name}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            category._id && deleteCategory(category._id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Types</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Type</DialogTitle>
                <DialogDescription>Create a new jewelry type</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="typeName">Type Name</Label>
                  <Input
                    id="typeName"
                    value={newType.name}
                    onChange={(e) =>
                      setNewType({ ...newType, name: e.target.value })
                    }
                    placeholder="e.g., Ring, Necklace, Earring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeDescription">Description</Label>
                  <Input
                    id="typeDescription"
                    value={newType.description}
                    onChange={(e) =>
                      setNewType({ ...newType, description: e.target.value })
                    }
                    placeholder="Type description"
                  />
                </div>
                <Button
                  onClick={() => saveType({ ...newType, isActive: true })}
                  disabled={!newType.name}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No types found
                  </TableCell>
                </TableRow>
              ) : (
                types.map((type) => (
                  <TableRow key={type._id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description}</TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? "default" : "secondary"}>
                        {type.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {type.createdAt
                        ? new Date(type.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingType(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => type._id && deleteType(type._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update category details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategoryDescription">Description</Label>
                <Input
                  id="editCategoryDescription"
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={() => saveCategory(editingCategory)}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Type Dialog */}
      {editingType && (
        <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Type</DialogTitle>
              <DialogDescription>Update type details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTypeName">Type Name</Label>
                <Input
                  id="editTypeName"
                  value={editingType.name}
                  onChange={(e) =>
                    setEditingType({ ...editingType, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTypeDescription">Description</Label>
                <Input
                  id="editTypeDescription"
                  value={editingType.description}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={() => saveType(editingType)} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Update Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
