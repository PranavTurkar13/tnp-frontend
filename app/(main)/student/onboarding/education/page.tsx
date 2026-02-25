"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRANCHES as branches } from "@/constants/branches";
const surfaceStyles = "rounded-2xl border border-border bg-card p-6 shadow-sm";

interface EducationFormData {
  branch: string;
  admissionType: string;
  enrollmentYear: number;
  passingYear: number;
  cgpa: number;
  tenthPercent: number;
  tenthYear: number;
  twelfthPercent: number;
  twelfthYear: number;
  diplomaPercent: number;
  diplomaYear: number;
  backlogs: number;
}

const initialFormState: EducationFormData = {
  branch: "",
  admissionType: "",
  enrollmentYear: 0,
  passingYear: 0,
  cgpa: 0,
  tenthPercent: 0,
  tenthYear: 0,
  twelfthPercent: 0,
  twelfthYear: 0,
  diplomaPercent: 0,
  diplomaYear: 0,
  backlogs: 0,
};

const BRANCHES = branches; //from constants

const Education = () => {
  const [formData, setFormData] = useState<EducationFormData>(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateField = (
    field: keyof EducationFormData,
    value: string | number,
  ) => {
    setFormData((prev) => {
      if (field === "branch" || field === "admissionType") {
        return { ...prev, [field]: value as string };
      } else {
        const numValue =
          typeof value === "string"
            ? value === ""
              ? 0
              : parseFloat(value)
            : value;
        return { ...prev, [field]: numValue };
      }
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    const isRegular = formData.admissionType === "Regular";
    const isDSE = formData.admissionType === "Direct second year";

    if (!formData.admissionType) {
      setErrorMessage("Please select an admission type.");
      return;
    }

    if (isRegular && (formData.twelfthPercent === 0 || formData.twelfthYear === 0)) {
      setErrorMessage("Please provide 12th details for Regular admission.");
      return;
    }

    if (isDSE && (formData.diplomaPercent === 0 || formData.diplomaYear === 0)) {
      setErrorMessage("Please provide Diploma details for Direct Second Year admission.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/my-proxy/api/v1/student/addEducation",
        formData,
      );

      if (response.status === 200 || response.status === 201) {
        setStatusMessage("Education details saved successfully!");

        router.push("/student/onboarding/internships");
      }
    } catch (error: any) {
      console.log(error.response.data);
      console.log(error.response?.data);
      if (error.response?.status === 409) {
        setErrorMessage(
          "Education details already exist. You cannot submit again.",
        );
        return;
      }
      if (error.response?.data?.needsAuth) {
        alert("Please login first to save your education details");
        window.location.href = error.response.data.loginUrl;
        return;
      }
      setErrorMessage(
        error.response?.data?.error ||
          "Failed to save education details. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-8">
      <div className="w-full max-w-4xl space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">
            Education
          </p>
          <h1 className="text-3xl font-semibold">Academic information</h1>
          <p className="text-sm text-muted-foreground">
            Share the scores requested by your placement cell. Keep values
            accurate; you can update them whenever your record changes.
          </p>
        </header>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className={surfaceStyles}>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Current programme</h2>
              <p className="text-sm text-muted-foreground">
                Snapshot of your degree and backlog status.
              </p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Branch</Label>
                <Select
                  key={formData.branch}
                  value={formData.branch || undefined}
                  onValueChange={(value) => updateField("branch", value)}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Admission Type</Label>
                <Select
                  key={formData.admissionType}
                  value={formData.admissionType || undefined}
                  onValueChange={(value) => updateField("admissionType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select admission type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Direct second year">
                      Direct second year
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentYear">Enrollment Year</Label>
                <Input
                  id="enrollmentYear"
                  type="number"
                  placeholder="Your Enrollment Year"
                  value={formData.enrollmentYear || ""}
                  onChange={(event) => {
                    const year = event.target.value;
                    updateField("enrollmentYear", event.target.value);
                    if (year) {
                      const passingYear = parseInt(year) + 4;
                      updateField("passingYear", passingYear);
                    }
                  }}
                  required
                  min={2022}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="passingYear">Passing Year</Label>
                  <span className="rounded-full border border-border px-2 text-xs font-medium text-muted-foreground">
                    Optional
                  </span>
                </div>
                <Input
                  id="passingYear"
                  type="number"
                  placeholder="Your Passing Year"
                  value={formData.passingYear || ""}
                  onChange={(event) => {
                    const year = event.target.value;
                    updateField("passingYear", event.target.value);
                    if (year) {
                      const enrollmentYear = parseInt(year) - 4;
                      updateField("enrollmentYear", enrollmentYear);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cgpa">Current CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  placeholder="8.45"
                  value={formData.cgpa === 0 ? "0" : formData.cgpa || ""}
                  onChange={(event) => updateField("cgpa", event.target.value)}
                  required
                  min={0}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="backlogs">Backlogs (current / total)</Label>
                <Input
                  id="backlogs"
                  type="number"
                  step={1}
                  placeholder="0"
                  value={
                    formData.backlogs === 0 ? "0" : formData.backlogs || ""
                  }
                  onChange={(event) =>
                    updateField("backlogs", event.target.value)
                  }
                  required
                  min={0}
                />
              </div>
            </div>
          </section>

          <section className={surfaceStyles}>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Schooling & diploma</h2>
              <p className="text-sm text-muted-foreground">
                Enter your secondary education details.
              </p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tenthPercent">10th Percentage</Label>
                <Input
                  id="tenthPercent"
                  type="number"
                  step="0.01"
                  placeholder="Your 10th Percentage"
                  min={0}
                  value={formData.tenthPercent || ""}
                  onChange={(event) =>
                    updateField("tenthPercent", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenthYear">10th Passing Year</Label>
                <Input
                  id="tenthYear"
                  type="number"
                  placeholder="Your 10th Passing Year"
                  min={0}
                  value={formData.tenthYear || ""}
                  onChange={(event) =>
                    updateField("tenthYear", event.target.value)
                  }
                />
              </div>
              {formData.admissionType === "Regular" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="twelfthPercent">12th Percentage</Label>
                    <Input
                      id="twelfthPercent"
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Your 12th Percentage"
                      value={formData.twelfthPercent || ""}
                      onChange={(event) =>
                        updateField("twelfthPercent", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twelfthYear">12th Passing Year</Label>
                    <Input
                      id="twelfthYear"
                      type="number"
                      min={0}
                      placeholder="Your 12th Passing Year"
                      value={formData.twelfthYear || ""}
                      onChange={(event) =>
                        updateField("twelfthYear", event.target.value)
                      }
                    />
                  </div>
                </>
              )}
              {formData.admissionType === "Direct second year" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="diplomaPercent">Diploma Percentage</Label>
                    </div>
                    <Input
                      id="diplomaPercent"
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Your Diploma Percentage"
                      value={formData.diplomaPercent || ""}
                      onChange={(event) =>
                        updateField("diplomaPercent", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diplomaYear">Diploma Passing Year</Label>
                    <Input
                      id="diplomaYear"
                      type="number"
                      min={0}
                      placeholder="Your Diploma Passing Year"
                      value={formData.diplomaYear || ""}
                      onChange={(event) =>
                        updateField("diplomaYear", event.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-3 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {statusMessage && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {statusMessage}
                </p>
              )}
              {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-3 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormData(initialFormState);
                  setStatusMessage("");
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Education Details"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Education;
