import { Link } from 'wouter';
import { ArrowLeft, FileText, Scale, CreditCard, Truck, Shield, Users, AlertTriangle, Gift, Package, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 gift-gradient rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our services. By using GiftGalore, you agree to these terms.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using GiftGalore's website and services, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                GiftGalore provides an online platform for purchasing gifts and related products. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Online product catalog and shopping experience</li>
                <li>Secure payment processing and order management</li>
                <li>Customer support and order tracking</li>
                <li>Product recommendations and gift guides</li>
                <li>Account management and order history</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Accounts & Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Creation</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>You are responsible for all activities under your account</li>
                  <li>Keep your contact information updated</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Use the service only for lawful purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>We strive to provide accurate product descriptions and images</li>
                  <li>Product availability is subject to change without notice</li>
                  <li>Prices are subject to change and may vary by location</li>
                  <li>All prices are listed in Indian Rupees (INR)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Pricing & Taxes</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Prices include applicable taxes where required</li>
                  <li>Shipping costs are calculated based on delivery location</li>
                  <li>Additional fees may apply for special handling or expedited shipping</li>
                  <li>We reserve the right to modify prices at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Ordering & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ordering & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Process</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Orders are confirmed via email upon successful payment</li>
                  <li>Payment must be completed before order processing begins</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Orders are processed on a first-come, first-served basis</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Payment Methods</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>We accept major credit cards, debit cards, and digital wallets</li>
                  <li>All payments are processed securely through PCI-compliant partners</li>
                  <li>Payment information is encrypted and securely transmitted</li>
                  <li>We do not store your complete payment card information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Shipping times vary by location and delivery method</li>
                  <li>Standard delivery typically takes 3-7 business days</li>
                  <li>Express delivery options are available for additional fees</li>
                  <li>International shipping may be subject to customs duties</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delivery & Risk</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>Signature may be required for high-value orders</li>
                  <li>Delivery attempts will be made during business hours</li>
                  <li>Failed deliveries may result in return to sender</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Returns & Refunds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Returns & Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Return Policy</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Most items can be returned within 30 days of delivery</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>Personalized or custom items may not be returnable</li>
                  <li>Return shipping costs are the responsibility of the customer</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refund Process</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Refunds are processed within 5-10 business days</li>
                  <li>Original payment method will be credited</li>
                  <li>Processing fees may be deducted from refunds</li>
                  <li>Damaged or defective items will be replaced or fully refunded</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You agree not to use our service for any unlawful purpose or to solicit the performance of any illegal activity. Prohibited uses include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with the service or other users' experience</li>
                <li>Using automated systems to access the service</li>
                <li>Attempting to circumvent security measures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All content on this website, including text, graphics, logos, images, and software, is the property of GiftGalore or its content suppliers 
                and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You may not reproduce, distribute, modify, or create derivative works from this content without our express written permission.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                To the maximum extent permitted by law, GiftGalore shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including but not limited to loss of profits, data, or use.
              </p>
              <p className="text-muted-foreground">
                Our total liability for any claims arising from your use of our service shall not exceed the amount you paid for the specific product or service 
                giving rise to the claim.
              </p>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Any disputes arising from these terms or your use of our service will be resolved through good faith negotiations. 
                If a resolution cannot be reached, disputes will be subject to the exclusive jurisdiction of courts in Tamil Nadu, India.
              </p>
              <p className="text-muted-foreground">
                You agree to waive any right to a jury trial and to participate in any class action lawsuit.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. 
                Your continued use of our service after such changes constitutes acceptance of the modified terms. 
                We encourage you to review these terms periodically.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These terms and your use of our service are governed by and construed in accordance with the laws of India. 
                Any legal proceedings will be subject to the exclusive jurisdiction of courts in Tamil Nadu, India.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about these terms of service, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>Email:</strong>{' '}
                  <a href="uthayabusiness@gmail.com" className="text-primary hover:underline">
                    uthayabusiness@gmail.com
                  </a>
                </p>
                <p className="text-muted-foreground">
                  <strong>Phone:</strong> +91 9626804123
                </p>
                <p className="text-muted-foreground">
                  <strong>Address:</strong> GiftGalore, Nilgiris, Tamil Nadu, India
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-12">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
