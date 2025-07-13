import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, User } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

interface ReviewSectionProps {
  productId?: string;
  reviews?: Review[];
}

export const ReviewSection = ({ productId, reviews = [] }: ReviewSectionProps) => {
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });
  
  const [localReviews, setLocalReviews] = useState<Review[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent quality and fast shipping! Highly recommended.',
      date: '2024-01-15',
      avatar: ''
    },
    {
      id: '2',
      name: 'Mike Chen',
      rating: 4,
      comment: 'Great product, good value for money. Will buy again.',
      date: '2024-01-10',
      avatar: ''
    },
    {
      id: '3',
      name: 'Emily Davis',
      rating: 5,
      comment: 'Perfect fit and amazing design. Love it!',
      date: '2024-01-08',
      avatar: ''
    }
  ]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.name && newReview.rating > 0 && newReview.comment) {
      const review: Review = {
        id: Date.now().toString(),
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0]
      };
      
      setLocalReviews([review, ...localReviews]);
      setNewReview({ name: '', rating: 0, comment: '' });
    }
  };

  const averageRating = localReviews.length > 0 
    ? localReviews.reduce((sum, review) => sum + review.rating, 0) / localReviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <StarRating rating={averageRating} readonly size="sm" />
          <span className="text-sm text-muted-foreground">
            ({localReviews.length} reviews)
          </span>
        </div>
      </div>

      {/* Add Review Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Write a Review
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <Label htmlFor="reviewer-name">Your Name</Label>
            <Input
              id="reviewer-name"
              value={newReview.name}
              onChange={(e) => setNewReview({...newReview, name: e.target.value})}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <Label>Rating</Label>
            <div className="mt-2">
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview({...newReview, rating})}
                size="lg"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="review-comment">Your Review</Label>
            <Textarea
              id="review-comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              placeholder="Share your experience with this product..."
              rows={4}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="bg-destructive hover:bg-destructive/90"
            disabled={!newReview.name || !newReview.rating || !newReview.comment}
          >
            Submit Review
          </Button>
        </form>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {localReviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.avatar} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{review.name}</h4>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{review.date}</p>
                <p className="text-foreground">{review.comment}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};