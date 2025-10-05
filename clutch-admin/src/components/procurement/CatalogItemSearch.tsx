"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Eye,
  Clock,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface CatalogItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  description: string;
  unitPrice: number;
  currency: string;
  moq: number;
  leadTime: number;
  specifications: string;
  inStock: boolean;
  stockLevel: number;
  restockDate: string;
  supplierId: string;
  supplierName: string;
  category: string;
  validFrom: string;
  validTo: string;
  priceBreaks: Array<{
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
  }>;
}

interface CatalogItemSearchProps {
  onItemSelect: (item: CatalogItem) => void;
  onAddToCart: (item: CatalogItem, quantity: number) => void;
  selectedItems?: CatalogItem[];
  showCart?: boolean;
  onViewCart?: () => void;
}

export default function CatalogItemSearch({
  onItemSelect,
  onAddToCart,
  selectedItems = [],
  showCart = true,
  onViewCart
}: CatalogItemSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'supplier' | 'leadTime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Array<{ item: CatalogItem; quantity: number }>>([]);

  const categories = [
    'Office Supplies', 'IT Equipment', 'Furniture', 'Software', 'Services',
    'Maintenance', 'Raw Materials', 'Professional Services', 'Electronics'
  ];

  const suppliers = [
    'ABC Supplies Ltd', 'Tech Solutions Inc', 'Office Depot', 'Global Services',
    'Premium Materials', 'Digital Solutions', 'Quality Products'
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'leadTime', label: 'Lead Time' }
  ];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would be an API call
      const mockItems: CatalogItem[] = [
        {
          itemId: '1',
          itemName: 'Office Chair - Ergonomic',
          itemCode: 'CHAIR-001',
          description: 'High-quality ergonomic office chair with lumbar support',
          unitPrice: 2500,
          currency: 'EGP',
          moq: 1,
          leadTime: 7,
          specifications: 'Material: Leather, Weight: 15kg, Color: Black',
          inStock: true,
          stockLevel: 25,
          restockDate: '2024-02-15',
          supplierId: 'supplier-1',
          supplierName: 'ABC Supplies Ltd',
          category: 'Furniture',
          validFrom: '2024-01-01',
          validTo: '2024-12-31',
          priceBreaks: [
            { minQuantity: 1, maxQuantity: 9, unitPrice: 2500 },
            { minQuantity: 10, maxQuantity: 49, unitPrice: 2300 },
            { minQuantity: 50, maxQuantity: 99, unitPrice: 2100 }
          ]
        },
        {
          itemId: '2',
          itemName: 'Laptop - Dell Inspiron',
          itemCode: 'LAPTOP-002',
          description: 'Dell Inspiron 15 3000 Series laptop with Intel Core i5',
          unitPrice: 15000,
          currency: 'EGP',
          moq: 1,
          leadTime: 14,
          specifications: 'Intel Core i5, 8GB RAM, 256GB SSD, Windows 11',
          inStock: true,
          stockLevel: 8,
          restockDate: '2024-02-20',
          supplierId: 'supplier-2',
          supplierName: 'Tech Solutions Inc',
          category: 'IT Equipment',
          validFrom: '2024-01-01',
          validTo: '2024-12-31',
          priceBreaks: [
            { minQuantity: 1, maxQuantity: 4, unitPrice: 15000 },
            { minQuantity: 5, maxQuantity: 9, unitPrice: 14500 },
            { minQuantity: 10, maxQuantity: 19, unitPrice: 14000 }
          ]
        },
        {
          itemId: '3',
          itemName: 'Office Desk - Executive',
          itemCode: 'DESK-003',
          description: 'Executive office desk with drawers and cable management',
          unitPrice: 3500,
          currency: 'EGP',
          moq: 1,
          leadTime: 10,
          specifications: 'Material: Wood, Dimensions: 120x60x75cm, Color: Oak',
          inStock: false,
          stockLevel: 0,
          restockDate: '2024-03-01',
          supplierId: 'supplier-1',
          supplierName: 'ABC Supplies Ltd',
          category: 'Furniture',
          validFrom: '2024-01-01',
          validTo: '2024-12-31',
          priceBreaks: [
            { minQuantity: 1, maxQuantity: 4, unitPrice: 3500 },
            { minQuantity: 5, maxQuantity: 9, unitPrice: 3300 },
            { minQuantity: 10, maxQuantity: 19, unitPrice: 3100 }
          ]
        }
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSupplier = !selectedSupplier || item.supplierName === selectedSupplier;
    const matchesStock = !inStockOnly || item.inStock;
    
    const matchesPrice = (!priceRange.min || item.unitPrice >= parseInt(priceRange.min)) &&
                        (!priceRange.max || item.unitPrice <= parseInt(priceRange.max));

    return matchesSearch && matchesCategory && matchesSupplier && matchesStock && matchesPrice;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.itemName.localeCompare(b.itemName);
        break;
      case 'price':
        comparison = a.unitPrice - b.unitPrice;
        break;
      case 'supplier':
        comparison = a.supplierName.localeCompare(b.supplierName);
        break;
      case 'leadTime':
        comparison = a.leadTime - b.leadTime;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const addToCart = (item: CatalogItem, quantity: number) => {
    const existingItem = cart.find(cartItem => cartItem.item.itemId === item.itemId);
    
    if (existingItem) {
      setCart(prev => prev.map(cartItem => 
        cartItem.item.itemId === item.itemId 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart(prev => [...prev, { item, quantity }]);
    }
    
    onAddToCart(item, quantity);
  };

  const getPriceForQuantity = (item: CatalogItem, quantity: number) => {
    const priceBreak = item.priceBreaks.find(pb => 
      quantity >= pb.minQuantity && quantity <= pb.maxQuantity
    );
    return priceBreak ? priceBreak.unitPrice : item.unitPrice : item.unitPrice;
  };

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (item: CatalogItem) => {
    if (!item.inStock) {
      return { status: 'Out of Stock', color: 'text-red-600', icon: AlertTriangle };
    }
    if (item.stockLevel < 10) {
      return { status: 'Low Stock', color: 'text-yellow-600', icon: AlertTriangle };
    }
    return { status: 'In Stock', color: 'text-green-600', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Catalog</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Items</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, code, or description"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Suppliers</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
              />
              <Label htmlFor="inStock">In Stock Only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label>Price Range:</Label>
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-20"
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-20"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Catalog Items ({filteredItems.length})</span>
                {showCart && cart.length > 0 && (
                  <Button variant="outline" onClick={onViewCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Cart ({cart.length})
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredItems.map(item => {
                    const stockStatus = getStockStatus(item);
                    const StockIcon = stockStatus.icon;
                    
                    return (
                      <Card key={item.itemId} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{item.itemName}</h3>
                              <Badge variant="outline">{item.itemCode}</Badge>
                              <Badge variant="secondary">{item.category}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">
                                  {formatCurrency(item.unitPrice, item.currency)}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{item.leadTime} days</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Package className="h-4 w-4" />
                                <span>MOQ: {item.moq}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <StockIcon className={`h-4 w-4 ${stockStatus.color}`} />
                                <span className={stockStatus.color}>{stockStatus.status}</span>
                              </div>
                            </div>
                            
                            {item.specifications && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Specifications:</strong> {item.specifications}
                                </p>
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">
                                <strong>Supplier:</strong> {item.supplierName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onItemSelect(item)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            <Button
                              size="sm"
                              onClick={() => addToCart(item, 1)}
                              disabled={!item.inStock}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Shopping Cart</span>
                  <Badge variant="outline">{cart.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {cart.map((cartItem, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{cartItem.item.itemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {cartItem.quantity} × {formatCurrency(cartItem.item.unitPrice)}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(cartItem.quantity * cartItem.item.unitPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          cart.reduce((sum, item) => sum + (item.quantity * item.item.unitPrice), 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
