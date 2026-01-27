'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, Filter, Star, Heart, ShoppingBag, Truck } from 'lucide-react';

export default function ShopEquipmentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [equipment] = useState([
    {
      id: 1,
      name: 'MikroTik RB4011iGS+RM',
      description: 'High-performance router with 10 Gigabit Ethernet ports',
      price: 45000,
      currency: 'KES',
      category: 'routers',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      reviews: 24,
      inStock: true,
      brand: 'MikroTik',
      features: ['10x Gigabit Ethernet', 'Dual Core ARM CPU', '1GB RAM', 'RouterOS']
    },
    {
      id: 2,
      name: 'Ubiquiti UniFi Dream Machine',
      description: 'All-in-one security gateway and WiFi 6 access point',
      price: 38000,
      currency: 'KES',
      category: 'gateways',
      image: '/api/placeholder/300/200',
      rating: 4.6,
      reviews: 18,
      inStock: true,
      brand: 'Ubiquiti',
      features: ['WiFi 6', 'Security Gateway', '4x Gigabit Ethernet', 'UniFi OS']
    },
    {
      id: 3,
      name: 'TP-Link Omada EAP670',
      description: 'High-performance WiFi 6 access point for business',
      price: 25000,
      currency: 'KES',
      category: 'access-points',
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 12,
      inStock: false,
      brand: 'TP-Link',
      features: ['WiFi 6', '2.5Gbps Port', 'Omada SDN', 'Easy Setup']
    },
    {
      id: 4,
      name: 'Cisco Catalyst 2960-L',
      description: 'Managed switch with 24 Gigabit Ethernet ports',
      price: 32000,
      currency: 'KES',
      category: 'switches',
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviews: 31,
      inStock: true,
      brand: 'Cisco',
      features: ['24x Gigabit Ethernet', 'Managed Switch', 'PoE+', 'Cisco IOS']
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Equipment', count: equipment.length },
    { id: 'routers', name: 'Routers', count: equipment.filter(item => item.category === 'routers').length },
    { id: 'gateways', name: 'Gateways', count: equipment.filter(item => item.category === 'gateways').length },
    { id: 'access-points', name: 'Access Points', count: equipment.filter(item => item.category === 'access-points').length },
    { id: 'switches', name: 'Switches', count: equipment.filter(item => item.category === 'switches').length }
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-pink-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Equipment</h1>
          <p className="text-gray-600">Professional networking equipment for your ISP business</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {!item.inStock && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                  </div>
                )}
                <button className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{item.brand}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{item.rating}</span>
                    <span className="text-xs text-gray-500">({item.reviews})</span>
                  </div>
                </div>

                <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {item.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} className="bg-gray-100 text-gray-700 text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {item.features.length > 2 && (
                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                      +{item.features.length - 2} more
                    </Badge>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(item.price, item.currency)}</p>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!item.inStock}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No equipment found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search criteria
            </p>
          )}
        </Card>
      )}

      {/* Shipping Info */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Shipping & Support</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Free shipping on orders over KES 50,000</p>
              <p>• Professional installation support available</p>
              <p>• 1-year warranty on all equipment</p>
              <p>• Technical support and configuration assistance</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
