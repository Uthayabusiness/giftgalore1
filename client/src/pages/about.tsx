import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Gift, 
  Heart, 
  Users, 
  Award, 
  Truck, 
  Shield, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link } from 'wouter';

export default function About() {
  const teamMembers = [
    {
      name: "Uthayakrishna",
      role: "Founder & CEO",
      description: "Passionate about creating meaningful connections through thoughtful gifting.",
      initials: "AS"
    },
    {
      name: "Udhayaprakash",
      role: "Head of Curation",
      description: "Expert in selecting unique and high-quality gifts that create lasting memories.",
      initials: "PP"
    },
    {
      name: "Tharani & Parimaladevi",
      role: "Customer Experience",
      description: "Dedicated to ensuring every customer finds the perfect gift for their loved ones.",
      initials: "RK"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Meaningful Connections",
      description: "Every gift should strengthen relationships and create lasting memories."
    },
    {
      icon: Award,
      title: "Quality First",
      description: "We carefully curate only the finest products that meet our high standards."
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Your satisfaction and joy in giving is our primary motivation."
    },
    {
      icon: Shield,
      title: "Trust & Reliability",
      description: "Secure transactions, authentic products, and dependable service."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "GiftVault Founded",
      description: "Started with a vision to make gifting more meaningful and accessible."
    },
    {
      year: "2025",
      title: "1,000+ Products",
      description: "Expanded our catalog to include gifts for every occasion and relationship."
    },
    {
      year: "2025",
      title: "10,000+ Happy Customers",
      description: "Reached a major milestone in customer satisfaction and trust."
    }
  ];

  const faqs = [
    {
      question: "What makes GiftVault different from other gift stores?",
      answer: "We focus on curation over quantity. Every product in our store is handpicked for its quality, uniqueness, and ability to create meaningful moments. Our personalized gift guide and expert recommendations ensure you find the perfect gift every time."
    },
    {
      question: "Do you offer gift wrapping services?",
      answer: "Yes! We provide complimentary gift wrapping for all orders. You can also choose from premium gift wrapping options during checkout for an additional fee. Each gift comes with a personalized message card."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all products in their original condition. If you're not completely satisfied with your purchase, we'll provide a full refund or exchange. Custom and personalized items may have different return terms."
    },
    {
      question: "How fast is your delivery?",
      answer: "Standard delivery takes 3-5 business days across India. We also offer express delivery (1-2 days) and same-day delivery in select cities. All orders above ₹1,000 qualify for free standard shipping."
    },
    {
      question: "Can I track my order?",
      answer: "Absolutely! Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order status in real-time through your account dashboard."
    },
    {
      question: "Do you offer corporate gifting solutions?",
      answer: "Yes, we have a dedicated corporate gifting program with bulk discounts, custom packaging, and account management. Contact our corporate team for personalized solutions for your business needs."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 gift-gradient rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
              Making Every Moment <span className="text-primary">Special</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              At GiftVault, we believe that the perfect gift has the power to strengthen relationships, 
              create lasting memories, and bring joy to both the giver and receiver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gift-gradient" data-testid="button-shop-now">
                <Link href="/products">
                  <Gift className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-contact-us">
                <Link href="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground">How we started and where we're headed</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-4">Founded on the Belief that Gifts Matter</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  GiftVault was born from a simple observation: in our digital age, the art of thoughtful 
                  gifting was getting lost. We started this company to bring back the magic of giving 
                  meaningful presents that truly connect people.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  What began as a small collection of handpicked gifts has grown into a comprehensive 
                  platform that serves thousands of customers across India. Every product we add to our 
                  catalog is tested against one simple question: "Would this gift create a special moment?"
                </p>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">50,000+</div>
                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1,500+</div>
                    <div className="text-sm text-muted-foreground">Unique Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Customer Rating</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <Gift className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Curated Selection</h4>
                    <p className="text-sm text-muted-foreground">Every product is hand-selected for quality and meaning</p>
                  </div>
                </Card>
                <Card className="p-4 mt-8">
                  <div className="text-center">
                    <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Personal Touch</h4>
                    <p className="text-sm text-muted-foreground">Personalized recommendations for every occasion</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Truck className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Fast Delivery</h4>
                    <p className="text-sm text-muted-foreground">Quick and reliable shipping across India</p>
                  </div>
                </Card>
                <Card className="p-4 mt-8">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Secure Shopping</h4>
                    <p className="text-sm text-muted-foreground">Safe and protected transactions always</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground">The principles that guide everything we do</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="w-12 h-12 gift-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground">Key milestones in our growth story</p>
            </div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 gift-gradient rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-px h-16 bg-border mt-4"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary">{milestone.year}</Badge>
                      <h3 className="font-semibold text-lg">{milestone.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground">The passionate people behind GiftVault</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{member.initials}</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16" id="faq">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Everything you need to know about shopping with us</p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gift-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Ready to Create Special Moments?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust GiftVault to help them express their love and appreciation through meaningful gifts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" data-testid="button-cta-shop">
              <Link href="/products">
                <Gift className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" data-testid="button-cta-contact">
              <Link href="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
