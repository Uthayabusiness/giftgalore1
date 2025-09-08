import { Link } from 'wouter';
import { ArrowLeft, RefreshCw, XCircle, CreditCard, Truck, Clock, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundCancellationPolicy() {
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
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Refund & Cancellation Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Here's everything you need to know about returns, refunds, and cancellations.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Order Cancellation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Order Cancellation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Before Processing</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Orders can be cancelled within 2 hours of placement</li>
                  <li>Contact our customer support team immediately</li>
                  <li>Provide your order number and reason for cancellation</li>
                  <li>Full refund will be processed if cancellation is approved</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">After Processing</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Once order processing begins, cancellation may not be possible</li>
                  <li>Contact us immediately if you need to stop shipment</li>
                  <li>Shipping charges may apply if package is already dispatched</li>
                  <li>Return process will be initiated instead of cancellation</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">⚠️ Important Note:</p>
                <p className="text-sm text-muted-foreground">
                  Personalized or custom-made items cannot be cancelled once production begins. These items are made specifically for you and may have limited return options.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Return Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Eligibility</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Most items can be returned within 30 days of delivery</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>All original tags, labels, and accessories must be included</li>
                  <li>Product must be in the same condition as received</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Non-Returnable Items</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Personalized or custom-made products</li>
                  <li>Gift cards and digital downloads</li>
                  <li>Perishable items and consumables</li>
                  <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                  <li>Products with hygiene concerns (e.g., personal care items)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Return Process</h3>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Contact customer support within 30 days of delivery</li>
                  <li>Provide order number and reason for return</li>
                  <li>Receive return authorization and shipping label</li>
                  <li>Package item securely with all original materials</li>
                  <li>Ship using provided return label</li>
                  <li>Refund processed within 5-10 business days of receipt</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Refund Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Refund Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Refund Timeline</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li><strong>Processing Time:</strong> 5-10 business days after we receive your return</li>
                  <li><strong>Bank Processing:</strong> 3-7 business days for credit/debit card refunds</li>
                  <li><strong>Digital Wallets:</strong> 1-3 business days for most digital payment methods</li>
                  <li><strong>Bank Transfers:</strong> 5-10 business days for NEFT/IMPS transfers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refund Methods</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Refunds are processed to the original payment method</li>
                  <li>Credit/debit card refunds appear as credits on your statement</li>
                  <li>Digital wallet refunds are credited to your wallet balance</li>
                  <li>Bank transfer refunds are sent to your registered account</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Partial Refunds</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Partial refunds may apply for incomplete returns</li>
                  <li>Shipping costs are non-refundable unless item is defective</li>
                  <li>Restocking fees may apply to certain categories</li>
                  <li>Damaged or incomplete items may receive reduced refunds</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Return Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping & Return Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Return Shipping</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Free return shipping for defective or incorrect items</li>
                  <li>Customer pays return shipping for change of mind returns</li>
                  <li>Return shipping costs range from ₹50 to ₹200 depending on size/weight</li>
                  <li>We provide prepaid return labels for eligible returns</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Original Shipping</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Original shipping costs are non-refundable for change of mind returns</li>
                  <li>Full shipping refund for defective or incorrect items</li>
                  <li>Express shipping upgrades are non-refundable</li>
                  <li>International shipping costs are non-refundable</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">💡 Pro Tip:</p>
                <p className="text-sm text-muted-foreground">
                  To minimize return shipping costs, consider our size guides and detailed product descriptions before making a purchase.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Damaged or Defective Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Damaged or Defective Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Immediate Action Required</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Contact us within 48 hours of delivery</li>
                  <li>Take clear photos of the damage or defect</li>
                  <li>Do not attempt to use or repair the item</li>
                  <li>Keep all original packaging and materials</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Our Commitment</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Free return shipping for damaged/defective items</li>
                  <li>Full refund including original shipping costs</li>
                  <li>Option for replacement if available</li>
                  <li>Priority processing for damaged item returns</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">✅ Quality Guarantee:</p>
                <p className="text-sm text-green-700">
                  We stand behind the quality of our products. If you receive a damaged or defective item, we'll make it right with a full refund or replacement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Exchange Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Exchange Options</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Exchange for different size, color, or style (if available)</li>
                  <li>Exchange for different product of equal or lesser value</li>
                  <li>Exchange for product of higher value (pay difference)</li>
                  <li>Exchange for store credit for future purchases</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Exchange Process</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Contact customer support within 30 days of delivery</li>
                  <li>Specify desired exchange item or credit preference</li>
                  <li>Return original item using provided shipping label</li>
                  <li>New item shipped once return is received and processed</li>
                  <li>Any price differences are adjusted accordingly</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Timeframes & Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeframes & Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Return Deadlines</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong>Standard Returns:</strong> 30 days from delivery</li>
                    <li><strong>Holiday Orders:</strong> Extended to 45 days</li>
                    <li><strong>Defective Items:</strong> 48 hours to report</li>
                    <li><strong>Personalized Items:</strong> 7 days to report issues</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Processing Times</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong>Return Processing:</strong> 5-10 business days</li>
                    <li><strong>Refund Processing:</strong> 5-10 business days</li>
                    <li><strong>Exchange Shipping:</strong> 2-3 business days</li>
                    <li><strong>Store Credit:</strong> Immediate upon approval</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Circumstances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Special Circumstances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Force Majeure Events</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Natural disasters or extreme weather conditions</li>
                  <li>Government restrictions or lockdowns</li>
                  <li>Supply chain disruptions or shipping delays</li>
                  <li>Technical failures or system outages</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Extended Deadlines</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Return deadlines may be extended during special circumstances</li>
                  <li>We will communicate any policy changes promptly</li>
                  <li>Customer service will work with you on individual cases</li>
                  <li>Fair and reasonable accommodations will be made</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How to Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                How to Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                For any questions about returns, refunds, or cancellations, please contact our customer support team:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
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
                    <strong>WhatsApp:</strong> +91 9626804123
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Business Hours:</strong> Mon-Sat, 9:00 AM - 6:00 PM IST
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Address:</strong> GiftGalore, Nilgiris, Tamil Nadu, India
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">📞 Need Immediate Help?</p>
                <p className="text-sm text-blue-700">
                  For urgent matters, call us directly during business hours. Our team is here to help resolve any issues quickly and efficiently.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Policy Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this refund and cancellation policy from time to time. Any changes will be posted on our website with an updated "Last updated" date. 
                Your continued use of our services after such changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.
              </p>
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
