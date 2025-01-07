"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Pencil } from "lucide-react";
import { z } from "zod";

import type { InsertEvent } from "@forge/db/schemas/knight-hacks";
import { EVENT_TAGS } from "@forge/consts/knight-hacks";
import { InsertEventSchema } from "@forge/db/schemas/knight-hacks";
import { cn } from "@forge/ui";
import { Button } from "@forge/ui/button";
import { Calendar } from "@forge/ui/calendar";
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
import { Input } from "@forge/ui/input";
import { Label } from "@forge/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@forge/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@forge/ui/select";
import { Textarea } from "@forge/ui/textarea";
import { toast } from "@forge/ui/toast";

import { api } from "~/trpc/react";

// 12-hour-based hours (1–12)
const hours = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0"),
);

// Minutes (00, 05, 10, ... , 55)
const minutes = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);

const amPmOptions = ["AM", "PM"] as const;

const UpdateFormSchema = InsertEventSchema.omit({
  start_datetime: true,
  end_datetime: true,
  discordId: true,
  googleId: true,
}).extend({
  date: z.string(),
  startHour: z.string(),
  startMinute: z.string(),
  startAmPm: z.enum(amPmOptions),
  endHour: z.string(),
  endMinute: z.string(),
  endAmPm: z.enum(amPmOptions),
});

function parseDateTime(isoString: string) {
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) {
    return {
      date: "",
      hour: "",
      minute: "",
      amPm: "PM" as const,
    };
  }

  let hour24 = dateObj.getHours();
  const mins = dateObj.getMinutes();
  const amPm = hour24 >= 12 ? "PM" : ("AM" as "AM" | "PM");

  // Convert 24-hour to 12-hour
  if (hour24 === 0) {
    hour24 = 12; // 0 => 12 AM
  } else if (hour24 > 12) {
    hour24 -= 12;
  }

  return {
    date: dateObj.toISOString(),
    hour: hour24.toString().padStart(2, "0"),
    minute: mins.toString().padStart(2, "0"),
    amPm,
  };
}

export function UpdateEventButton({ event }: { event: InsertEvent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TRPC update mutation
  const utils = api.useUtils();
  const updateEvent = api.event.updateEvent.useMutation({
    onSuccess() {
      toast.success("Event updated successfully!");
      setIsOpen(false);
      form.reset();
    },
    onError(opts) {
      toast.error(opts.message);
    },
    async onSettled() {
      await utils.event.invalidate();
      setIsLoading(false);
    },
  });

  // Initialize form
  const form = useForm({
    schema: UpdateFormSchema,
    defaultValues: {
      name: "",
      description: "",
      location: "",
      tag: EVENT_TAGS[0],
      date: "",
      startHour: "",
      startMinute: "",
      startAmPm: "PM",
      endHour: "",
      endMinute: "",
      endAmPm: "PM",
    },
  });

  // On mount or whenever `event` changes, prefill form
  useEffect(() => {
    const {
      date,
      hour: startHour,
      minute: startMinute,
      amPm: startAmPm,
    } = parseDateTime(event.start_datetime.toString());
    const {
      hour: endHour,
      minute: endMinute,
      amPm: endAmPm,
    } = parseDateTime(event.end_datetime.toString());
    form.reset({
      name: event.name,
      description: event.description,
      location: event.location,
      tag: event.tag,
      date,
      startHour,
      startMinute,
      startAmPm,
      endHour,
      endMinute,
      endAmPm,
    });
  }, [event, form]);

  const onSubmit = form.handleSubmit((values) => {
    setIsLoading(true);
    // Convert start date + hour/minute/amPm to a valid Date object
    const finalStartDate = new Date(values.date);
    let hour24 = parseInt(values.startHour, 10) || 0;
    if (values.startAmPm === "PM" && hour24 < 12) {
      hour24 += 12;
    }
    if (values.startAmPm === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    finalStartDate.setHours(hour24, parseInt(values.startMinute, 10) || 0);

    // Convert end date + hour/minute/amPm to a valid Date object
    const finalEndDate = new Date(values.date);
    let endHour24 = parseInt(values.endHour, 10) || 0;
    if (values.endAmPm === "PM" && endHour24 < 12) {
      endHour24 += 12;
    }
    if (values.endAmPm === "AM" && endHour24 === 12) {
      endHour24 = 0;
    }
    finalEndDate.setHours(endHour24, parseInt(values.endMinute, 10) || 0);

    // Ensure the end date is after the start date
    if (finalEndDate <= finalStartDate) {
      toast.error("End date must be after the start date.");
      setIsLoading(false);
      return;
    }

    // Make update call
    updateEvent.mutate({
      id: event.id,
      discordId: event.discordId,
      googleId: event.googleId,
      name: values.name,
      description: values.description,
      location: values.location,
      tag: values.tag,
      start_datetime: finalStartDate,
      end_datetime: finalEndDate,
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Use an icon or text to trigger the dialog */}
        <Button variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Update Event</DialogTitle>
              <DialogDescription>
                Update the details for the new event. Click update when you're
                done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="name" className="text-right">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Enter event name"
                          {...field}
                          className="col-span-3"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tag (enum from EVENT_TAGS) */}
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="tag" className="text-right">
                        Tag
                      </FormLabel>
                      <FormControl>
                        <Select
                          // Use defaultValue if the field already has a value
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a tag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_TAGS.map((tagOption) => (
                              <SelectItem key={tagOption} value={tagOption}>
                                {tagOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date (Calendar popover) */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "col-span-3 justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              // If field.value is an empty string, we pass undefined to Calendar
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(selectedDate) => {
                                // Make sure the selected date is not null
                                if (!selectedDate) {
                                  toast.error("Please select a date.");
                                  return;
                                }

                                // Make sure the selected date is in the future
                                if (selectedDate < new Date()) {
                                  toast.error("Please select a future date.");
                                  return;
                                }

                                // Convert the chosen date to an ISO string
                                field.onChange(selectedDate.toISOString());
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time (Hour, Minute, AM/PM) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Start</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  {/* Hour */}
                  <FormField
                    control={form.control}
                    name="startHour"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="HH" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hours.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span>:</span>

                  {/* Minute */}
                  <FormField
                    control={form.control}
                    name="startMinute"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {minutes.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* AM/PM */}
                  <FormField
                    control={form.control}
                    name="startAmPm"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {amPmOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* End Time (Hour, Minute, AM/PM) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">End</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  {/* Hour */}
                  <FormField
                    control={form.control}
                    name="endHour"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="HH" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hours.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span>:</span>

                  {/* Minute */}
                  <FormField
                    control={form.control}
                    name="endMinute"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {minutes.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* AM/PM */}
                  <FormField
                    control={form.control}
                    name="endAmPm"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="AM/PM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {amPmOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="location" className="text-right">
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="location"
                          placeholder="Enter location"
                          {...field}
                          className="col-span-3"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="description" className="text-right">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Enter description..."
                          rows={4}
                          {...field}
                          className="col-span-3"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-row justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Update Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
