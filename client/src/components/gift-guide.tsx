import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, Heart, Star, Users, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface GiftGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionData {
  occasion: string;
  relationship: string;
  ageGroup: string;
  budget: string;
  interests: string[];
  personality: string;
}

export default function GiftGuide({ isOpen, onClose }: GiftGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<QuestionData>>({
    interests: []
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const steps = [
    { number: 1, title: "Occasion", description: "What's the special event?" },
    { number: 2, title: "Relationship", description: "Who are you buying for?" },
    { number: 3, title: "Details", description: "Tell us more about them" },
    { number: 4, title: "Preferences", description: "Their interests & style" },
    { number: 5, title: "Results", description: "Perfect gift recommendations" }
  ];

  const occasions = [
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
    { value: "wedding", label: "Wedding" },
    { value: "valentine", label: "Valentine's Day" },
    { value: "graduation", label: "Graduation" },
    { value: "baby-shower", label: "Baby Shower" },
    { value: "housewarming", label: "Housewarming" },
    { value: "promotion", label: "Job Promotion" },
    { value: "retirement", label: "Retirement" },
    { value: "just-because", label: "Just Because" }
  ];

  const relationships = [
    { value: "spouse", label: "Spouse/Partner" },
    { value: "parent", label: "Parent" },
    { value: "child", label: "Child" },
    { value: "sibling", label: "Sibling" },
    { value: "friend", label: "Friend" },
    { value: "colleague", label: "Colleague" },
    { value: "boss", label: "Boss" },
    { value: "teacher", label: "Teacher" },
    { value: "neighbor", label: "Neighbor" },
    { value: "other", label: "Other" }
  ];

  const ageGroups = [
    { value: "child", label: "Child (0-12)" },
    { value: "teen", label: "Teenager (13-17)" },
    { value: "young-adult", label: "Young Adult (18-30)" },
    { value: "adult", label: "Adult (31-50)" },
    { value: "senior", label: "Senior (51+)" }
  ];

  const budgetRanges = [
    { value: "under-500", label: "Under ₹500" },
    { value: "500-1500", label: "₹500 - ₹1,500" },
    { value: "1500-5000", label: "₹1,500 - ₹5,000" },
    { value: "5000-10000", label: "₹5,000 - ₹10,000" },
    { value: "over-10000", label: "Over ₹10,000" }
  ];

  const interests = [
    "Technology", "Books", "Sports", "Music", "Art", "Cooking",
    "Travel", "Fashion", "Photography", "Gaming", "Fitness", "Nature",
    "Movies", "Crafts", "Business", "Wellness", "Home Decor", "Beauty"
  ];

  const personalities = [
    { value: "practical", label: "Practical & Functional" },
    { value: "sentimental", label: "Emotional & Sentimental" },
    { value: "adventurous", label: "Adventurous & Spontaneous" },
    { value: "luxury", label: "Luxury & Premium" },
    { value: "minimalist", label: "Simple & Minimalist" },
    { value: "creative", label: "Creative & Artistic" }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
    
    // Generate recommendations on final step
    if (currentStep === 4) {
      generateRecommendations();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = answers.interests || [];
    if (currentInterests.includes(interest)) {
      setAnswers({
        ...answers,
        interests: currentInterests.filter(i => i !== interest)
      });
    } else {
      setAnswers({
        ...answers,
        interests: [...currentInterests, interest]
      });
    }
  };

  const generateRecommendations = () => {
    // Mock recommendation logic - in real app this would be more sophisticated
    const mockRecommendations = [
      {
        id: 1,
        name: "Personalized Photo Album",
        category: "Sentimental",
        price: "₹1,299",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
        reason: "Perfect for preserving precious memories",
        match: 95
      },
      {
        id: 2,
        name: "Premium Jewelry Box",
        category: "Luxury",
        price: "₹2,499",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
        reason: "Elegant storage for special accessories",
        match: 88
      },
      {
        id: 3,
        name: "Artisanal Candle Set",
        category: "Wellness",
        price: "₹899",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        reason: "Creates a relaxing atmosphere at home",
        match: 82
      }
    ];
    
    setRecommendations(mockRecommendations);
  };

  const resetGuide = () => {
    setCurrentStep(1);
    setAnswers({ interests: [] });
    setRecommendations([]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!answers.occasion;
      case 2: return !!answers.relationship;
      case 3: return !!answers.ageGroup && !!answers.budget;
      case 4: return !!answers.personality && (answers.interests?.length || 0) > 0;
      default: return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Gift Finder Guide
          </DialogTitle>
          <DialogDescription>
            Answer a few questions and we'll recommend the perfect gifts
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.number 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.number}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px mx-4 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {/* Step 1: Occasion */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">What's the occasion?</h3>
                <p className="text-muted-foreground">This helps us suggest the most appropriate gifts</p>
              </div>
              
              <RadioGroup 
                value={answers.occasion} 
                onValueChange={(value) => setAnswers({ ...answers, occasion: value })}
                className="grid grid-cols-2 gap-4"
              >
                {occasions.map((occasion) => (
                  <div key={occasion.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value={occasion.value} id={occasion.value} />
                    <Label htmlFor={occasion.value} className="cursor-pointer">{occasion.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Relationship */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Who are you buying for?</h3>
                <p className="text-muted-foreground">The relationship helps us personalize our suggestions</p>
              </div>
              
              <RadioGroup 
                value={answers.relationship} 
                onValueChange={(value) => setAnswers({ ...answers, relationship: value })}
                className="grid grid-cols-2 gap-4"
              >
                {relationships.map((relationship) => (
                  <div key={relationship.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value={relationship.value} id={relationship.value} />
                    <Label htmlFor={relationship.value} className="cursor-pointer">{relationship.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tell us more details</h3>
                <p className="text-muted-foreground">Age group and budget help narrow down the options</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Age Group</Label>
                  <Select value={answers.ageGroup} onValueChange={(value) => setAnswers({ ...answers, ageGroup: value })}>
                    <SelectTrigger data-testid="select-age-group">
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map((age) => (
                        <SelectItem key={age.value} value={age.value}>{age.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Budget Range</Label>
                  <Select value={answers.budget} onValueChange={(value) => setAnswers({ ...answers, budget: value })}>
                    <SelectTrigger data-testid="select-budget">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget.value} value={budget.value}>{budget.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">What are their interests?</h3>
                <p className="text-muted-foreground">Select their personality type and interests</p>
              </div>
              
              <div>
                <Label className="text-base font-semibold mb-3 block">Personality Type</Label>
                <RadioGroup 
                  value={answers.personality} 
                  onValueChange={(value) => setAnswers({ ...answers, personality: value })}
                  className="grid grid-cols-1 gap-3"
                >
                  {personalities.map((personality) => (
                    <div key={personality.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value={personality.value} id={personality.value} />
                      <Label htmlFor={personality.value} className="cursor-pointer">{personality.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Interests (Select multiple)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={answers.interests?.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer p-2 text-center hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleInterestToggle(interest)}
                      data-testid={`interest-${interest.toLowerCase()}`}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Perfect Gift Recommendations</h3>
                <p className="text-muted-foreground">Based on your answers, here are our top suggestions</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={rec.image} 
                        alt={rec.name}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        {rec.match}% Match
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2" data-testid={`recommendation-${rec.id}`}>{rec.name}</h4>
                      <Badge variant="secondary" className="mb-2">{rec.category}</Badge>
                      <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{rec.price}</span>
                        <Button size="sm" asChild data-testid={`view-product-${rec.id}`}>
                          <Link href="/products">View Product</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button variant="outline" onClick={resetGuide} className="mr-4" data-testid="button-restart-guide">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
                <Button asChild data-testid="button-browse-all">
                  <Link href="/products">
                    <Gift className="mr-2 h-4 w-4" />
                    Browse All Gifts
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            {currentStep < 5 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="gift-gradient"
                data-testid="button-next"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onClose} className="gift-gradient" data-testid="button-done">
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
