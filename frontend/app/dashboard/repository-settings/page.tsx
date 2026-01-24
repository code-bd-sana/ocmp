"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NavigationCookies } from "@/lib/repository/repository.cookies";
import { NavigationLink } from "@/lib/repository/repository.types";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RepositorySettings() {
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [originalLinks, setOriginalLinks] = useState<NavigationLink[]>([]); // Store original state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<NavigationLink[]>([]); // Store changes before saving

  // Load settings on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Get merged links (ALL_NAVIGATION_LINKS + saved enabled states)
      const mergedLinks = NavigationCookies.getMergedLinks();
      setLinks(mergedLinks);
      setOriginalLinks(mergedLinks); // Save original state
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (linkId: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, enabled: !link.enabled } : link,
      ),
    );
  };

  const handleApply = () => {
    // Store the current changes before showing alert
    setPendingChanges([...links]);
    setShowAlert(true);
  };

  const handleConfirmSave = () => {
    // Actually save to cookies
    NavigationCookies.saveEnabledStates(pendingChanges);
    console.log(
      "Saved enabled states for links:",
      pendingChanges.filter((l) => l.enabled).map((l) => l.id),
    );
    setOriginalLinks(pendingChanges); // Update original state
    setShowAlert(false);
  };

  const handleCancelSave = () => {
    // Revert to original state
    setLinks(originalLinks);
    setShowAlert(false);
  };

  // Get all links to display
  const displayedLinks =
    searchQuery.trim() === ""
      ? links // Show all links when search is empty
      : links.filter((link) =>
          link.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  // Split 2 equal cols
  const halfLength = Math.ceil(displayedLinks.length / 2);
  const leftColumnLinks = displayedLinks.slice(0, halfLength);
  const rightColumnLinks = displayedLinks.slice(halfLength);

  if (links.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading Repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-y-3 md:flex-row md:gap-x-3">
          <h1 className="text-primary mb-2 text-3xl font-bold">Repository</h1>
          <div className="relative flex max-w-xl items-center text-(--input-foreground)">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-(--input-foreground)" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted text-foreground rounded-none pl-10"
            />
          </div>
        </div>
        <p className="text-foreground my-4 text-2xl font-semibold">
          Select Data to Display
        </p>
      </div>

      <Card className="rounded-none border-none shadow-none">
        <CardContent>
          {/* Show message when search has no results */}
          {displayedLinks.length === 0 && searchQuery.trim() !== "" && (
            <div className="text-foreground py-8 text-center">
              No links found for {searchQuery}
            </div>
          )}

          {/* Show grid when there are links to display */}
          {displayedLinks.length > 0 && (
            <div className="text-foreground grid grid-cols-2 gap-x-8 gap-y-2">
              {/* Left Column */}
              <div className="space-y-2">
                {leftColumnLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center space-x-3 py-2"
                  >
                    <Checkbox
                      id={link.id}
                      checked={link.enabled}
                      onCheckedChange={() => handleToggle(link.id)}
                    />
                    <Label
                      htmlFor={link.id}
                      className="text-foreground cursor-pointer text-sm font-normal"
                    >
                      {link.label}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                {rightColumnLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center space-x-3 py-2"
                  >
                    <Checkbox
                      id={link.id}
                      checked={link.enabled}
                      onCheckedChange={() => handleToggle(link.id)}
                    />
                    <Label
                      htmlFor={link.id}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {link.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 border-t pt-6">
            <Button className="rounded-none px-10" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Apply Repository Settings?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Are you sure you want to save these changes to the footer
              navigation? Click Save Changes to apply or Cancel to keep the
              current settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSave}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
