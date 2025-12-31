import { useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTags, useLocalizedTagName } from "@/hooks/useTags";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedTagsProps {
  title?: string;
  subtitle?: string;
}

export function FeaturedTags({ title, subtitle }: FeaturedTagsProps) {
  const navigate = useNavigate();
  const { data: tags = [], isLoading } = useTags();
  const getLocalizedName = useLocalizedTagName();
  
  // Filter to only featured tags
  const featuredTags = tags.filter((tag) => tag.is_featured);
  
  const handleTagClick = (slug: string) => {
    navigate(`/shop?tags=${slug}`);
  };
  
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (featuredTags.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-2xl lg:text-3xl font-bold">
              {title || "Browse by "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Category
              </span>
            </h2>
          </div>
          <p className="text-muted-foreground">
            {subtitle || "Explore our curated collections"}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {featuredTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleTagClick(tag.slug)}
            >
              {getLocalizedName(tag)}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
