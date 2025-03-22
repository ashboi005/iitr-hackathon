"use client";

import { useCharacterLimit } from "@/components/hooks/use-character-limit";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ImagePlus, X, Plus, Minus } from "lucide-react";
import { useEffect, useId, useState } from "react";
interface FreelancerProfileDialogProps {
    userDetails?: {
      phone?: string | null;
      address?: string | null;
      bio?: string | null;
      profilePicture?: string | null;
    } | null;  // Allow null here
    
    freelancerDetails?: {
      occupation?: string;
      skills?: string[];
      portfolioLinks?: string[];
    } | null;
  onSave: (basicData: any, freelancerData: any) => Promise<void>;
}
function FreelancerProfileDialog({ 
    userDetails, 
    freelancerDetails,
    onSave
  }: FreelancerProfileDialogProps) {
  const id = useId();
  const maxLength = 180;
  useEffect(() => {
    setPhone(userDetails?.phone || "");
    setAddress(userDetails?.address || "");
    setBio(userDetails?.bio || "");
    setProfilePicture(userDetails?.profilePicture || "");
    setOccupation(freelancerDetails?.occupation || "");
    setSkills(freelancerDetails?.skills || []);
    setPortfolioLinks(freelancerDetails?.portfolioLinks || []);
  }, [userDetails, freelancerDetails]);
  // Basic details state
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [address, setAddress] = useState(userDetails?.address || "");
  const [bio, setBio] = useState(userDetails?.bio || "");
  const [profilePicture, setProfilePicture] = useState(userDetails?.profilePicture || "");

  // Freelancer details state
  const [occupation, setOccupation] = useState(freelancerDetails?.occupation || "");
  const [skills, setSkills] = useState<string[]>(freelancerDetails?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(freelancerDetails?.portfolioLinks || []);
  const [newPortfolioLink, setNewPortfolioLink] = useState("");

  const { characterCount, handleChange } = useCharacterLimit({
    maxLength,
    initialValue: bio,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const basicData = {
      phone: phone || null,
      address: address || null,
      bio: bio || null,
      profilePicture: profilePicture || null
    };

    const freelancerData = {
      occupation,
      skills: skills.filter(s => s.trim() !== ""),
      portfolioLinks: portfolioLinks.filter(l => l.trim() !== "")
    };

    await onSave(basicData, freelancerData);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddPortfolioLink = () => {
    if (newPortfolioLink.trim()) {
      setPortfolioLinks([...portfolioLinks, newPortfolioLink.trim()]);
      setNewPortfolioLink("");
    }
  };

  const handleRemovePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto">
          <Avatar 
            defaultImage={profilePicture} 
            onImageUpload={setProfilePicture}
          />
          
          <div className="px-6 pb-6 pt-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Basic Details */}
              <div className="space-y-2">
                <Label htmlFor={`${id}-phone`}>Phone Number</Label>
                <Input
                  id={`${id}-phone`}
                  value={phone || ""}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-address`}>Address</Label>
                <Input
                  id={`${id}-address`}
                  value={address || ""}
                  onChange={(e) => setAddress(e.target.value)}
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`}>Biography</Label>
                <Textarea
                  id={`${id}-bio`}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    handleChange(e);
                  }}
                  maxLength={maxLength}
                  aria-describedby={`${id}-description`}
                />
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {maxLength - characterCount} characters left
                </p>
              </div>

              {/* Freelancer Details */}
              <div className="space-y-2">
                <Label htmlFor={`${id}-occupation`}>Occupation</Label>
                <Input
                  id={`${id}-occupation`}
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add new skill"
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="text-red-500"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Portfolio Links</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPortfolioLink}
                    onChange={(e) => setNewPortfolioLink(e.target.value)}
                    placeholder="Add portfolio link"
                    type="url"
                  />
                  <Button type="button" onClick={handleAddPortfolioLink}>
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {portfolioLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary">
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioLink(index)}
                        className="text-red-500"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="border-t border-border px-0 py-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Modified Avatar component
function Avatar({ 
    defaultImage,
    onImageUpload
  }: { 
    defaultImage?: string | null;
    onImageUpload: (url: string) => void;
  }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload({
    onUpload: onImageUpload
  });

  const currentImage = previewUrl || defaultImage;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm shadow-black/10">
        {currentImage && (
          <img
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          aria-label="Change profile picture"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
}

export { FreelancerProfileDialog };