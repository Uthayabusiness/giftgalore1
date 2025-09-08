import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Search, Lightbulb } from 'lucide-react';

interface HeroSectionProps {
  onGiftGuideClick?: () => void;
}

export default function HeroSection({ onGiftGuideClick }: HeroSectionProps = {}) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gift-gradient opacity-90"></div>
      
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Perfect Gifts for Every 
              <span className="text-yellow-300"> Special Moment</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Discover thousands of unique, handpicked gifts that create lasting memories. From personalized treasures to luxury collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-50" data-testid="button-explore-gifts">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Explore Gifts
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary" 
                data-testid="button-gift-guide"
                onClick={onGiftGuideClick}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Gift Guide
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="card-hover">
              <CardContent className="p-4">
                <img 
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Luxury gift collection" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-1">Luxury Collection</h3>
                <p className="text-sm text-gray-600">Premium gifts</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover mt-8">
              <CardContent className="p-4">
                <img 
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Anniversary gifts" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-1">Anniversary Gifts</h3>
                <p className="text-sm text-gray-600">Romantic moments</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-4">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Personalized gifts" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-1">Personalized</h3>
                <p className="text-sm text-gray-600">Made special</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover mt-8">
              <CardContent className="p-4">
                <img 
                  src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Corporate gifts" 
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-1">Corporate Gifts</h3>
                <p className="text-sm text-gray-600">Professional touch</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
