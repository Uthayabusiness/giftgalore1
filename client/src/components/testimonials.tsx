import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Gift, Heart, Award } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  initials: string;
  role: string;
  rating: number;
  content: string;
  occasion: string;
  verified: boolean;
  location: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    initials: "PS",
    role: "Software Engineer",
    rating: 5,
    content: "I ordered a personalized photo frame for my parents' anniversary and they absolutely loved it! The quality was exceptional and the delivery was right on time. GiftVault made it so easy to find the perfect gift.",
    occasion: "Anniversary",
    verified: true,
    location: "Mumbai",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Raj Kumar",
    initials: "RK",
    role: "Business Owner",
    rating: 5,
    content: "Needed corporate gifts for our team and clients. The entire process was seamless - from selection to delivery. The packaging was professional and everyone was impressed with the quality.",
    occasion: "Corporate",
    verified: true,
    location: "Delhi",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "Anita Desai",
    initials: "AD",
    role: "Teacher",
    rating: 5,
    content: "The gift guide feature is amazing! It helped me find the perfect birthday gift for my teenage daughter. She was so happy with the trendy jewelry set I chose based on the recommendations.",
    occasion: "Birthday",
    verified: true,
    location: "Bangalore",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Arjun Mehta",
    initials: "AM",
    role: "Marketing Manager",
    rating: 5,
    content: "Fast delivery, beautiful packaging, and excellent customer service. I've been using GiftVault for all my gifting needs for the past year. Never disappointed!",
    occasion: "Various",
    verified: true,
    location: "Pune",
    date: "1 week ago"
  },
  {
    id: 5,
    name: "Sneha Patel",
    initials: "SP",
    role: "Doctor",
    rating: 5,
    content: "Ordered a luxury watch for my husband's promotion. The quality exceeded my expectations and the gift wrapping was beautiful. He was thrilled with the surprise!",
    occasion: "Promotion",
    verified: true,
    location: "Ahmedabad",
    date: "2 months ago"
  },
  {
    id: 6,
    name: "Vikram Singh",
    initials: "VS",
    role: "Entrepreneur",
    rating: 5,
    content: "The personalized gifts section is fantastic. Got a custom engraved pen set for my mentor and the craftsmanship was outstanding. Will definitely order again!",
    occasion: "Thank You",
    verified: true,
    location: "Jaipur",
    date: "3 weeks ago"
  }
];

export default function Testimonials() {
  const getOccasionColor = (occasion: string) => {
    switch (occasion.toLowerCase()) {
      case 'anniversary': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'birthday': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'corporate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'promotion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'thank you': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getOccasionIcon = (occasion: string) => {
    switch (occasion.toLowerCase()) {
      case 'anniversary': return Heart;
      case 'birthday': return Gift;
      case 'corporate': return Award;
      default: return Star;
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from customers who found the perfect gifts and created unforgettable moments
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => {
            const OccasionIcon = getOccasionIcon(testimonial.occasion);
            return (
              <Card key={testimonial.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300" data-testid={`testimonial-${testimonial.id}`}>
                <div className="absolute top-4 right-4">
                  <Quote className="h-6 w-6 text-primary/20" />
                </div>
                
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2" data-testid={`rating-${testimonial.id}`}>
                      ({testimonial.rating}.0)
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-6 leading-relaxed" data-testid={`content-${testimonial.id}`}>
                    "{testimonial.content}"
                  </p>

                  {/* Occasion Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getOccasionColor(testimonial.occasion)}`}>
                      <OccasionIcon className="h-3 w-3" />
                    </div>
                    <Badge className={getOccasionColor(testimonial.occasion)} data-testid={`occasion-${testimonial.id}`}>
                      {testimonial.occasion}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{testimonial.initials}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm" data-testid={`name-${testimonial.id}`}>
                            {testimonial.name}
                          </p>
                          {testimonial.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground" data-testid={`date-${testimonial.id}`}>
                        {testimonial.date}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
            <div className="text-sm text-muted-foreground">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Customer Support</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-sm">Award Winning Service</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <span className="text-sm">Quality Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-sm">Loved by Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
