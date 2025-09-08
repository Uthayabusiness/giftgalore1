import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Truck, MapPin, Clock, Package, Shield, Phone, Mail } from 'lucide-react';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our shipping and delivery services
            </p>
          </div>

          <div className="space-y-8">
            {/* Shipping Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Delivery Areas</h3>
                    <p className="text-sm text-muted-foreground">
                      We currently deliver to all major cities and towns across India. 
                      Our delivery network covers over 20,000+ pin codes nationwide.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Processing Time</h3>
                    <p className="text-sm text-muted-foreground">
                      Orders are typically processed within 1-2 business days. 
                      Custom or personalized items may take 3-5 business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Shipping Options & Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Standard</Badge>
                        <span className="text-sm font-medium">5-7 Business Days</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Regular shipping for most items
                      </p>
                      <p className="font-semibold">
                        ₹99 (Free on orders above ₹1,000)
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Express</Badge>
                        <span className="text-sm font-medium">2-3 Business Days</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Faster delivery for urgent orders
                      </p>
                      <p className="font-semibold">₹199</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-800">Same Day</Badge>
                        <span className="text-sm font-medium">Same Day Delivery</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Available in select metro cities
                      </p>
                      <p className="font-semibold">₹299</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Free Shipping</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Enjoy free standard shipping on all orders above ₹1,000. 
                      No minimum order quantity required for free shipping.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Delivery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Order Placed</h4>
                      <p className="text-sm text-muted-foreground">
                        Your order is received and payment is confirmed
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        We prepare your order for shipment (1-2 business days)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Shipped</h4>
                      <p className="text-sm text-muted-foreground">
                        Your order is dispatched and tracking information is sent
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Delivered</h4>
                      <p className="text-sm text-muted-foreground">
                        Your order arrives at your doorstep
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Special Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Gift Wrapping</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a special touch with our premium gift wrapping service. 
                      Available for ₹99 per item.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Gift Messages</h3>
                    <p className="text-sm text-muted-foreground">
                      Include a personalized message with your gift. 
                      Free service available at checkout.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Scheduled Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred delivery date and time slot. 
                      Available for express and same-day orders.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay when you receive your order. Available for orders up to ₹5,000.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Important Shipping Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-sm">
                      <strong>Business Days:</strong> Monday to Saturday (excluding public holidays)
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-sm">
                      <strong>Remote Areas:</strong> Delivery may take 2-3 additional days for remote locations
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-sm">
                      <strong>Weather Conditions:</strong> Delivery may be delayed due to weather conditions
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p className="text-sm">
                      <strong>Address Accuracy:</strong> Please ensure your delivery address is complete and accurate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Need Help with Shipping?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">uthayabusiness@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">+91 9626804123</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Track Your Order</h3>
                    <p className="text-sm text-muted-foreground">
                      Use our order tracking system to get real-time updates on your shipment status.
                    </p>
                    <a 
                      href="/track-order" 
                      className="inline-flex items-center text-primary hover:underline text-sm font-medium"
                    >
                      Track Order →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
