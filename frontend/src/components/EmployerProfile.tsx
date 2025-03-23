"use client";

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
import { ImagePlus, Plus, Minus } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface EmployerProfileDialogProps {
  userDetails?: {
    phone?: string | null;
    address?: string | null;
    bio?: string | null;
    profilePicture?: string | null;
  } | null;
  employerDetails?: {
    worksNeeded?: string[];
  } | null;
  onSave: (basicData: any, employerData: any) => Promise<void>;
}

function EmployerProfileDialog({ 
    userDetails, 
    employerDetails,
    onSave = async () => {} // Correct default value
  }: EmployerProfileDialogProps) {
  const id = useId();
  
  useEffect(() => {
    setPhone(userDetails?.phone || "");
    setAddress(userDetails?.address || "");
    setBio(userDetails?.bio || "");
    setProfilePicture(userDetails?.profilePicture || "");
    setWorksNeeded(employerDetails?.worksNeeded || []);
  }, [userDetails, employerDetails]);

  // Basic details state
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [address, setAddress] = useState(userDetails?.address || "");
  const [bio, setBio] = useState(userDetails?.bio || "");
  const [profilePicture, setProfilePicture] = useState(userDetails?.profilePicture || "");

  // Employer details state
  const [worksNeeded, setWorksNeeded] = useState<string[]>(employerDetails?.worksNeeded || []);
  const [newWork, setNewWork] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const basicData = {
      phone: phone || null,
      address: address || null,
      bio: bio || null,
      profilePicture: profilePicture || null
    };

    const employerData = {
      worksNeeded: worksNeeded.filter(w => w.trim() !== "")
    };

    await onSave(basicData, employerData);
  };

  const handleAddWork = () => {
    if (newWork.trim()) {
      setWorksNeeded([...worksNeeded, newWork.trim()]);
      setNewWork("");
    }
  };

  const handleRemoveWork = (index: number) => {
    setWorksNeeded(worksNeeded.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit Employer Profile
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
                <Label htmlFor={`${id}-bio`}>Company Bio</Label>
                <textarea
                  id={`${id}-bio`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Employer-specific Details */}
              <div className="space-y-2">
                <Label>Works Needed</Label>
                <div className="flex gap-2">
                  <Input
                    value={newWork}
                    onChange={(e) => setNewWork(e.target.value)}
                    placeholder="Add required work"
                  />
                  <Button type="button" onClick={handleAddWork}>
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {worksNeeded.map((work, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <span>{work}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWork(index)}
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

// Reuse the same Avatar component
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

export { EmployerProfileDialog };