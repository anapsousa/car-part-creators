import { useState, useMemo } from "react";
import { X, Tag, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTags, useLocalizedTagName, Tag as TagType } from "@/hooks/useTags";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export function TagFilter({ selectedTags, onTagsChange, className }: TagFilterProps) {
  const { content } = useContent("shop");
  const { data: tags, isLoading } = useTags();
  const getTagName = useLocalizedTagName();
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchQuery) return tags;

    const query = searchQuery.toLowerCase();
    return tags.filter(
      (tag) =>
        tag.name_en.toLowerCase().includes(query) ||
        tag.name_pt.toLowerCase().includes(query) ||
        tag.slug.includes(query)
    );
  }, [tags, searchQuery]);

  const handleToggleTag = (slug: string) => {
    if (selectedTags.includes(slug)) {
      onTagsChange(selectedTags.filter((t) => t !== slug));
    } else {
      onTagsChange([...selectedTags, slug]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const selectedTagObjects = useMemo(() => {
    if (!tags) return [];
    return tags.filter((tag) => selectedTags.includes(tag.slug));
  }, [tags, selectedTags]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected Tags Chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {getTagName(tag)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-destructive/20"
                onClick={() => handleToggleTag(tag.slug)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 text-xs text-muted-foreground"
          >
            {content["shop.clearTags"] || "Clear all"}
          </Button>
        </div>
      )}

      {/* Collapsible Tag Selection */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            size="sm"
          >
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {content["shop.filterByTags"] || "Filter by Tags"}
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3">
          {/* Search Tags */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={content["shop.searchTags"] || "Search tags..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tag List */}
          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
            {filteredTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                {content["shop.noTagsFound"] || "No tags found"}
              </p>
            ) : (
              filteredTags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTags.includes(tag.slug)}
                    onCheckedChange={() => handleToggleTag(tag.slug)}
                  />
                  <span className="text-sm">{getTagName(tag)}</span>
                </label>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
