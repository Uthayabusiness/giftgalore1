import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const colorClasses = [
  'bg-gradient-to-br from-pink-100 to-pink-200',
  'bg-gradient-to-br from-blue-100 to-blue-200',
  'bg-gradient-to-br from-green-100 to-green-200',
  'bg-gradient-to-br from-purple-100 to-purple-200',
  'bg-gradient-to-br from-yellow-100 to-yellow-200',
  'bg-gradient-to-br from-red-100 to-red-200',
];

export default function FeaturedCategories() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 text-center">
                  <div className="h-12 w-12 bg-muted rounded-lg mx-auto mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-8">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category: any, index: number) => (
            <Card 
              key={category._id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              data-testid={category.slug}
            >
              <a href={`/products?category=${category._id}`}>
                <CardContent className="p-4 text-center">
                  <div className={`h-12 w-12 rounded-lg mx-auto mb-2 flex items-center justify-center ${colorClasses[index % colorClasses.length]}`}>
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package className={`h-6 w-6 text-gray-600 ${category.imageUrl ? 'hidden' : ''}`} />
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description || 'Gift category'}
                  </p>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
