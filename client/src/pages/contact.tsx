import { useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  Gift,
  HeadphonesIcon,
  ShoppingCart,
  Users
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "+91 9626804123",
      description: "Mon-Sat, 9 AM - 8 PM",
      color: "text-blue-600"
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "uthayabusiness@gmail.com",
      description: "We'll respond within 24 hours",
      color: "text-green-600"
    },
    {
      icon: MapPin,
      title: "Head Office",
      details: "7/73 kottaipady, kolapalli post",
      description: "Gudalur,The Nilgiris, India",
      color: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Monday - Saturday",
      description: "9:00 AM - 8:00 PM IST",
      color: "text-orange-600"
    }
  ];

  const supportCategories = [
    {
      icon: ShoppingCart,
      title: "Order Support",
      description: "Track orders, delivery issues, returns"
    },
    {
      icon: Gift,
      title: "Product Inquiries",
      description: "Gift recommendations, customization"
    },
    {
      icon: Users,
      title: "Account Help",
      description: "Login issues, profile management"
    },
    {
      icon: HeadphonesIcon,
      title: "General Support",
      description: "Other questions and feedback"
    }
  ];

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    try {
      // Simulate form submission - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 gift-gradient rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Have questions about our products or need help with your order? 
              We're here to assist you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center`}>
                  <info.icon className={`h-6 w-6 ${info.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                <p className="font-medium text-primary mb-1" data-testid={`contact-${info.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {info.details}
                </p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Support Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          className={errors.name ? 'border-destructive' : ''}
                          data-testid="input-contact-name"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          className={errors.email ? 'border-destructive' : ''}
                          data-testid="input-contact-email"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          className={errors.phone ? 'border-destructive' : ''}
                          data-testid="input-contact-phone"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select onValueChange={(value) => setValue('category', value)}>
                          <SelectTrigger className={errors.category ? 'border-destructive' : ''} data-testid="select-contact-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="order-support">Order Support</SelectItem>
                            <SelectItem value="product-inquiry">Product Inquiry</SelectItem>
                            <SelectItem value="account-help">Account Help</SelectItem>
                            <SelectItem value="corporate-gifts">Corporate Gifts</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        {...register('subject')}
                        className={errors.subject ? 'border-destructive' : ''}
                        placeholder="Brief description of your inquiry"
                        data-testid="input-contact-subject"
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        className={errors.message ? 'border-destructive' : ''}
                        placeholder="Please provide details about your inquiry..."
                        rows={5}
                        data-testid="input-contact-message"
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full gift-gradient hover:opacity-90"
                      size="lg"
                      disabled={isSubmitting}
                      data-testid="button-send-message"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Support Categories */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How Can We Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportCategories.map((category, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{category.title}</h4>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Immediate Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Call Us Now</p>
                      <p className="text-sm text-muted-foreground">+91 9626804123</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm"></p>
                      <p className="text-sm text-muted-foreground">Available 9 AM - 8 PM</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" data-testid="button-live-chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild data-testid="link-order-tracking">
                    <a href="/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Track Your Order
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild data-testid="link-faq">
                    <a href="/about#faq">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View FAQ
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild data-testid="link-return-policy">
                    <a href="/about">
                      <Gift className="mr-2 h-4 w-4" />
                      Return Policy
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-bold mb-4">Visit Our Office</h2>
              <p className="text-muted-foreground">
                We'd love to meet you in person at our Mumbai headquarters
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="h-64 bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Interactive map coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    7/73 kottaipady, Pandalur, The Nilgiris, TamilNadu, 643253
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gift-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Ready to Find the Perfect Gift?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Browse our collection of thoughtfully curated gifts for every occasion and relationship.
          </p>
          <Button asChild size="lg" variant="secondary" data-testid="button-cta-browse-gifts">
            <a href="/products">
              <Gift className="mr-2 h-5 w-5" />
              Browse Gifts
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
