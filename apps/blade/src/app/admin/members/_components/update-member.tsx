"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { z } from "zod";

import type { InsertMember } from "@forge/db/schemas/knight-hacks";
import { InsertMemberSchema } from "@forge/db/schemas/knight-hacks";
import { Button } from "@forge/ui/button";
import {
  GENDERS,
  LEVELS_OF_STUDY,
  RACES_OR_ETHNICITIES,
  SCHOOLS,
  SHIRT_SIZES,
} from "@forge/consts/knight-hacks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@forge/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@forge/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@forge/ui/select";
import { ResponsiveComboBox } from "@forge/ui/responsive-combo-box";
import { Input } from "@forge/ui/input";
import { toast } from "@forge/ui/toast";

import { api } from "~/trpc/react";

export default function UpdateMemberButton({
  member,
}: {
  member: InsertMember;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = api.useUtils();

  const updateMember = api.member.updateMember.useMutation({
    onSuccess() {
      toast.success("Member updated successfully!");
      setIsOpen(false);
    },
    onError(opts) {
      toast.error(opts.message);
    },
    async onSettled() {
      await utils.member.invalidate();
      setIsLoading(false);
    },
  });

  const UpdateMemberSchema = InsertMemberSchema.omit({
    userId: true,
    age: true,
    resumeUrl: true,
    discordUser: true,
  }).extend({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email").min(1, "Required"),
    points: z.string().transform((points) => Number(points)),
    phoneNumber: z
      .string()
      .regex(/^\d{10}|\d{3}-\d{3}-\d{4}$|^$/, "Invalid phone number"),
  });

  const form = useForm({
    schema: UpdateMemberSchema,
    defaultValues: {
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      points: (member.points ?? 0).toString(),
      phoneNumber: member.phoneNumber || "",
      dob: member.dob || "",
      gender: member.gender,
      school: member.school,
      gradDate: member.gradDate,
      levelOfStudy: member.levelOfStudy,
      raceOrEthnicity: member.raceOrEthnicity,
      shirtSize: member.shirtSize,
      githubProfileUrl: member.githubProfileUrl ?? "",
      linkedinProfileUrl: member.linkedinProfileUrl ?? "",
      websiteUrl: member.websiteUrl ?? "",
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="overflow-y-auto max-h-screen">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                setIsLoading(true);

                const points = Number(values.points);

                updateMember.mutate({
                  id: member.id,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  points,
                  dob: values.dob,
                  phoneNumber: values.phoneNumber,
                  school: values.school,
                  levelOfStudy: values.levelOfStudy,
                  gender: values.gender,
                  gradDate: values.gradDate,
                  raceOrEthnicity: values.raceOrEthnicity,
                  shirtSize: values.shirtSize,
                  githubProfileUrl: values.githubProfileUrl,
                  linkedinProfileUrl: values.linkedinProfileUrl,
                  websiteUrl: values.websiteUrl,
                });
              })}
            >
              <DialogHeader className="pb-4">
                <DialogTitle>Update Member</DialogTitle>
                <DialogDescription className="whitespace-break-spaces">
                  Update member details.
                  Confirm your changes when you're done.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 mb-6 flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4">
                        <FormLabel className="my-auto whitespace-nowrap">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Lenny" {...field} />
                        </FormControl>
                        <FormMessage className="my-auto whitespace-nowrap" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4">
                        <FormLabel className="my-auto whitespace-nowrap">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Dragonson" {...field} />
                        </FormControl>
                        <FormMessage className="my-auto whitespace-nowrap" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4">
                        <FormLabel className="my-auto whitespace-nowrap">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="tk@knighthacks.org" {...field} />
                        </FormControl>
                        <FormMessage className="my-auto whitespace-nowrap" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4">
                        <FormLabel className="my-auto whitespace-nowrap">
                          Points
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage className="my-auto whitespace-nowrap" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4">
                        <FormLabel className="my-auto whitespace-nowrap">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage className="my-auto whitespace-nowrap" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4">
                        <FormLabel className="my-auto whitespace-nowrap">
                          Date Of Birth
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage className="my-auto whitespace-nowrap" />
                      </div>
                    </FormItem>
                  )}
                />
                              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row gap-4">
                      <FormLabel className="my-auto whitespace-nowrap">
                        Gender
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDERS.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="my-auto whitespace-nowrap" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row gap-4">
                      <FormLabel className="my-auto whitespace-nowrap">
                        School
                      </FormLabel>
                      <FormControl>
                        <ResponsiveComboBox
                          items={SCHOOLS}
                          renderItem={(school) => <div>{school}</div>}
                          getItemValue={(school) => school}
                          getItemLabel={(school) => school}
                          onItemSelect={(school) => field.onChange(school)}
                          buttonPlaceholder={member.school}
                          inputPlaceholder="Search for school"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row gap-4">
                      <FormLabel className="my-auto whitespace-nowrap">
                        Grad Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage className="my-auto whitespace-nowrap" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="levelOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row gap-4">
                      <FormLabel className="my-auto whitespace-nowrap">
                        Level Of Study
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="max-w-[300px] overflow-hidden truncate">
                              <SelectValue placeholder="Select level of study" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LEVELS_OF_STUDY.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="my-auto whitespace-nowrap" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="raceOrEthnicity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row gap-4">
                      <FormLabel className="my-auto whitespace-nowrap">
                        Race/Ethnicity
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="max-w-[300px] overflow-hidden truncate">
                              <SelectValue placeholder="Select race/ethnicity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RACES_OR_ETHNICITIES.map((value) => (
                              <SelectItem
                                key={value}
                                value={value}
                                className="max-w-[300px] overflow-hidden truncate"
                              >
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="my-auto whitespace-nowrap" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shirtSize"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row gap-4">
                      <FormLabel className="my-auto whitespace-nowrap">
                        Shirt Size
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shirt size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SHIRT_SIZES.map((shirt_size) => (
                              <SelectItem key={shirt_size} value={shirt_size}>
                                {shirt_size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="whitespace-nowrap" />
                    </div>
                  </FormItem>
                )}
              />
              </div>
              <DialogFooter className="flex flex-row justify-between">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Update Member"
                )}
              </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
