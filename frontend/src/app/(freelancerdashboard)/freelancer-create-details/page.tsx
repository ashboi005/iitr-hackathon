"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const DoctorCreateDetails = () => {
  const { user } = useUser();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    available_days: "",
    available_time: "",
    clerkid: user?.id || "",
    clinic_address: "",
    consultation_fee: 0,
    department: "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    first_name: user?.firstName || "",
    hospital_id: 4, // Ensuring hospital_id is present
    last_name: user?.lastName || "",
    phone_number: "",
    specialization: "",
    years_of_experience: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📤 Sending doctor details:", JSON.stringify(formData, null, 2));

    try {
      const response = await fetch("https://mediverse-backend.onrender.com/doctor/post-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log("✅ Server Response:", responseData);

      if (response.ok) {
        console.log("🎉 Successfully submitted doctor details!");
        router.push("/doc-dashboard");
      } else {
        console.error("❌ Failed to submit doctor details:", responseData);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-950 text-white">
      <div className="max-w-4xl w-full bg-neutral-900 rounded-xl shadow-lg p-8 border border-neutral-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-neutral-100">
          Complete Your Doctor Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Clinic Address */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Clinic Address</label>
              <input
                type="text"
                name="clinic_address"
                value={formData.clinic_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Consultation Fee</label>
              <input
                type="number"
                name="consultation_fee"
                value={formData.consultation_fee}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>
                      {/* Available Days */}
                      <div>
              <label className="block text-sm font-medium text-neutral-200">Available Days</label>
              <input
                type="text"
                name="available_days"
                placeholder={formData.available_days}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>

            {/* Available Time */}
            <div>
              <label className="block text-sm font-medium text-neutral-200">Available Time</label>
              <input
                type="text"
                name="available_time"
                placeholder={formData.available_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-800 text-neutral-100 rounded-lg border border-neutral-600 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500"
              />
            </div>
          </div>


          {/* Submit Button */}
          <div className="flex justify-center">
           
          <Button type="submit" disabled={false} className=" text-white bg-neutral-950 px-6 py-3 rounded-lg hover:bg-black transition-all duration-300">
              {isSubmitting ? "Submitting..." : "Submit Details"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorCreateDetails;
