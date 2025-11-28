-- Create newsletter_subscriptions table for storing newsletter subscriptions
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  language TEXT NOT NULL DEFAULT 'pt' CHECK (language IN ('en', 'pt')),
  consent_given BOOLEAN NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  resend_contact_id TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on newsletter_subscriptions table
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscriptions table
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view subscriptions"
  ON public.newsletter_subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update subscriptions"
  ON public.newsletter_subscriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscribed_at ON public.newsletter_subscriptions(subscribed_at);
CREATE INDEX idx_newsletter_unsubscribed ON public.newsletter_subscriptions(unsubscribed_at);